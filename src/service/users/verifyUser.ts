import { db } from "../../config/dbConnection";
import { users, usersOtp } from "../../db/schema/users";
import { compareData } from '../../utils/auth';
import { eq } from "drizzle-orm";

export const verifyUser = async (email: string, otp: string) => {

    // ── Step 1: Find user by email ────────────────────────
    const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
        throw new Error('User not found. Please register.');
    }

    // ── Step 2: Find OTP record ───────────────────────────
    const otpData = await db.query.usersOtp.findFirst({
        where: eq(usersOtp.userId, user.id),
    });

    if (!otpData) {
        throw new Error('OTP not found. Please register again.');
    }

    // ── Step 3: Check if already verified ────────────────
    if (otpData.isVerified) {
        throw new Error('Account already verified. Please login.');
    }

    // ── Step 4: Check if temporarily blocked ─────────────
    if (otpData.temporaryBlock && otpData.blockedUntil) {
        if (new Date() < otpData.blockedUntil) {
            const minutesLeft = Math.ceil(
                (otpData.blockedUntil.getTime() - Date.now()) / 60000
            );
            throw new Error(`Too many attempts. Try again in ${minutesLeft} minute(s).`);
        }
    }

    // ── Step 5: Check OTP expiry ──────────────────────────
    if (new Date() > otpData.otpExpiry) {
        throw new Error('OTP has expired. Please request a new one.');
    }

    // ── Step 6: Compare OTP ───────────────────────────────
    const isValid = await compareData(otp, otpData.hashedOtp);

    if (!isValid) {
        const newAttempts = otpData.retryAttempts + 1;

        // Block after 5 failed attempts
        if (newAttempts >= 5) {
            await db.update(usersOtp)
                .set({
                    temporaryBlock: true,
                    blockedUntil: new Date(Date.now() + 15 * 60 * 1000),
                    retryAttempts: newAttempts,
                })
                .where(eq(usersOtp.userId, user.id));

            throw new Error('Too many failed attempts. Blocked for 15 minutes.');
        }

        await db.update(usersOtp)
            .set({ retryAttempts: newAttempts })
            .where(eq(usersOtp.userId, user.id));

        throw new Error(`Invalid OTP. ${5 - newAttempts} attempt(s) remaining.`);
    }

    // ── Step 7: Mark as verified ──────────────────────────
    await db.update(usersOtp)
        .set({
            isVerified: true,
            temporaryBlock: false,
            blockedUntil: null,
            retryAttempts: 0,
        })
        .where(eq(usersOtp.userId, user.id));

    const { password: _, ...safeUser } = user;
    return {
        ...safeUser,
        message: 'Account verified successfully.',
    };
};
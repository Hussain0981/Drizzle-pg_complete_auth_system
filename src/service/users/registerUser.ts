import { db } from "../../config/dbConnection";
import { eq } from "drizzle-orm";
import { usersOtp, users } from "../../db/schema/users";
import { User } from '../../types/user';
import { hashData, generateOtp } from '../../utils/auth';
import { sendOtp } from '../../utils/sendOtpToUser';

const getOtpExpiry = () => new Date(Date.now() + 10 * 60 * 1000);

export const createUser = async (payload: User) => {
    const { name, email, password } = payload;
    const emailLower = email.toLowerCase();

    // ── Step 1: Check if user exists ──────────────────────
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, emailLower),
    });

    if (existingUser) {
        const otpData = await db.query.usersOtp.findFirst({
            where: eq(usersOtp.userId, existingUser.id),
        });

        // ✅ OTP record exists + isVerified = true → already verified
        if (otpData?.isVerified) {
            throw new Error('User already exists and is verified. Please login.');
        }

        // ✅ OTP record exists + isVerified = false → resend OTP
        if (otpData && !otpData.isVerified) {
            const rawOtp = generateOtp();
            const hashedOtp = await hashData(rawOtp);

            await db.update(usersOtp)
                .set({
                    hashedOtp,
                    otpExpiry: getOtpExpiry(),
                    retryAttempts: otpData.retryAttempts + 1,
                    temporaryBlock: false,
                    blockedUntil: null,
                })
                .where(eq(usersOtp.userId, existingUser.id));

            await sendOtp(emailLower, rawOtp);

            const { password: _, ...safeUser } = existingUser;
            return {
                ...safeUser,
                message: 'OTP resent to your email. Please verify your account.',
            };
        }
    }

    // ── Step 2: New user registration ─────────────────────
    const hashedPassword = await hashData(password);

    return await db.transaction(async (tx) => {
        const [newUser] = await tx.insert(users).values({
            name,
            email: emailLower,
            password: hashedPassword,
        }).returning();

        const rawOtp = generateOtp();
        const hashedOtp = await hashData(rawOtp);

        await tx.insert(usersOtp).values({
            userId: newUser.id,
            hashedOtp,
            otpExpiry: getOtpExpiry(),
            retryAttempts: 1,
        });

        await sendOtp(emailLower, rawOtp);

        const { password: _, ...safeUser } = newUser;
        return {
            ...safeUser,
            message: 'OTP sent to your email. Please verify your account.',
        };
    });
};
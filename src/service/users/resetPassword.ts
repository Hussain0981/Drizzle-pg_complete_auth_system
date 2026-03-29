import { db } from "../../config/dbConnection";
import { users, usersOtp } from "../../db/schema/users";
import { eq } from "drizzle-orm";
import { hashData } from "../../utils/auth";

export const resetPassword = async (id: number, password: string, confirmPassword: string) => {

    // Check if passwords match
    if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
    }

    const otpRecord = await db.query.usersOtp.findFirst({
        where: eq(usersOtp.userId, id),
    });

    if (!otpRecord) {
        throw new Error('OTP record not found. Please try again.');
    }

    // Check if OTP was verified in previous phase
    if (!otpRecord.isVerified) {
        throw new Error('Please verify your OTP first.');
    }

    // Check if OTP verification is expired (user took too long to reset)
    const now = new Date();
    if (now > otpRecord.otpExpiry) {
        await db.update(usersOtp)
            .set({ isVerified: false })
            .where(eq(usersOtp.userId, id));

        throw new Error('OTP session expired. Please request a new OTP.');
    }

    const hashedPassword = await hashData(password);

    // Update password and reset OTP record in a transaction
    await db.transaction(async (tx) => {
        await tx.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, id));

        await tx.update(usersOtp)
            .set({
                isVerified: true,
                retryAttempts: 0,
                hashedOtp: '',
                otpExpiry: new Date(0), 
                temporaryBlock: false,
                blockedUntil: null,
            })
            .where(eq(usersOtp.userId, id));
    });

    return {
        message: 'Password reset successfully. Please login with your new password.',
    };
};
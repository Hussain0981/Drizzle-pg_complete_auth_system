import { db } from "../../config/dbConnection";
import { users, usersOtp } from "../../db/schema/users";
import { hashData, generateOtp } from '../../utils/auth';
import { sendOtp } from '../../utils/sendOtpToUser'
import { eq } from "drizzle-orm";

const getOtpExpiry = () => new Date(Date.now() + 10 * 60 * 1000);

export const forgotPassword = async (email: string) => {
    const emailLower = email.toLowerCase();

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, emailLower),
    });

    if (!existingUser) {
        throw new Error('No account found with this email.');
    }

    const otpRecord = await db.query.usersOtp.findFirst({
        where: eq(usersOtp.userId, existingUser.id),
    });

    if (!otpRecord) {
        throw new Error('OTP record not found. Please register again.');
    }

    // Check if user is temporarily blocked
    const now = new Date();
    if (otpRecord.temporaryBlock && otpRecord.blockedUntil && now < otpRecord.blockedUntil) {
        throw new Error('You are temporarily blocked. Please try again after 30 minutes.');
    }

    const rawOtp = generateOtp();
    const hashedOtp = await hashData(rawOtp);

    // Bug fix: `.where` was used as a property instead of a method call
    await db.update(usersOtp)
        .set({
            otpExpiry: getOtpExpiry(),
            hashedOtp,
            isVerified: false,
            // Reset block if it has expired
            ...(otpRecord.temporaryBlock && otpRecord.blockedUntil && now > otpRecord.blockedUntil
                ? { temporaryBlock: false, retryAttempts: 0, blockedUntil: null }
                : {}),
        })
        .where(eq(usersOtp.userId, existingUser.id));

    await sendOtp(emailLower, rawOtp);

    return {
        message: 'OTP sent successfully. Please check your email.',
    };
};
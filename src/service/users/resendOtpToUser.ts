import { db } from "../../config/dbConnection";
import { eq } from "drizzle-orm";
import { usersOtp } from "../../db/schema/users";
import { hashData, generateOtp } from '../../utils/auth';
import { sendOtp } from '../../utils/sendOtpToUser';

const MAX_OTP_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 30 * 60 * 1000;
const getOtpExpiry = () => new Date(Date.now() + 10 * 60 * 1000);
const getBlockExpiry = () => new Date(Date.now() + BLOCK_DURATION_MS);

export const resendOtp = async (id: number, email: string) => {

    const otpRecord = await db.query.usersOtp.findFirst({
        where: eq(usersOtp.userId, id),
    });

    if (!otpRecord) {
        throw new Error('OTP record not found. Please register again.');
    }

    const now = new Date();


    // reset all columns when  temporary block  time complete
    if (otpRecord.temporaryBlock && otpRecord.blockedUntil && now > otpRecord.blockedUntil) {
        await db.update(usersOtp)
            .set({
                temporaryBlock: false,
                retryAttempts: 0,
                blockedUntil: null,
            })
            .where(eq(usersOtp.userId, id));

        otpRecord.temporaryBlock = false;
        otpRecord.retryAttempts = 0;
    }

    if (otpRecord.temporaryBlock) {
        throw new Error('You are temporarily blocked. Please try again after 30 minutes.');
    }

    const attempts = otpRecord.retryAttempts + 1;

    // when send otp 5 times
    if (attempts >= MAX_OTP_ATTEMPTS) {
        await db.update(usersOtp)
            .set({
                temporaryBlock: true,
                blockedUntil: getBlockExpiry(),
            })
            .where(eq(usersOtp.userId, id)); 

        throw new Error('Maximum OTP attempts reached. You are temporarily blocked for 30 minutes.');
    }

    const rawOtp = generateOtp();
    const hashedOtp = await hashData(rawOtp);

    await db.update(usersOtp)
        .set({
            retryAttempts: attempts,
            otpExpiry: getOtpExpiry(), 
            hashedOtp,
        })
        .where(eq(usersOtp.userId, id));

    await sendOtp(email, rawOtp);

    return {
        message: 'OTP resent successfully',
    };
};
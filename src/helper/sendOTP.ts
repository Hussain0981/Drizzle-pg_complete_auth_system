import { db } from "../config/dbConnection";
import { usersOtp, users } from "../db/schema/users";
import { hashData, generateOtp } from '../utils/auth';
import { eq } from "drizzle-orm";
const getOtpExpiry = () => new Date(Date.now() + 10 * 60 * 1000);


export const resendOTP = async (email: string) => {

    const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
        with: {
            userOtp: true,
        }

    });
    if (!user) throw new Error('User not found');

    const rawOtp = generateOtp();
    const hashedOtp = await hashData(rawOtp);

    const existingOtp = await db.query.usersOtp.findFirst({
        where: eq(usersOtp.userId, user.id),
    });
    if (existingOtp?.temporaryBlock) {
        throw new Error('Your are temporary blocked please try again later')
    }

    

    let counter;
    if (existingOtp) {
        counter = existingOtp.retryAttempts + 1
    }

    await db.insert(usersOtp).values({
        userId: user.id,
        hashedOtp: hashedOtp,
        otpExpiry: getOtpExpiry(),
        retryAttempts: counter
    });

    return { message: "OTP sent successfully" };
};
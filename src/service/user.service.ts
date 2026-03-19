import { db } from "../config/db";
import { UserOtp, UserTable } from "../db/schema";
import { User, UserLogin } from '../types/user';
import { hashData, compareData, generateOtp } from '../utils/auth';
import { eq } from "drizzle-orm";

const getOtpExpiry = () => new Date(Date.now() + 10 * 60 * 1000);

export const createUser = async (payload: User) => {
    const { name, email, password } = payload;
    const emailLower = email.toLowerCase();

    const existingUser = await db.query.UserTable.findFirst({
        where: eq(UserTable.email, emailLower),
    });

    if (existingUser) throw new Error('User with this email already exists');

    const hashedPassword = await hashData(password);

    return await db.transaction(async (tx) => {
        const [newUser] = await tx.insert(UserTable).values({
            name,
            email: emailLower,
            password: hashedPassword,
        }).returning();

        // 1. OTP generate karein
        const rawOtp = generateOtp();
        const hashedOtp = await hashData(rawOtp);

        // 2. UserOtp table mein save karein
        await tx.insert(UserOtp).values({
            userId: newUser.id, // Schema fix: matching type
            hashedOtp: hashedOtp,
            otpExpiry: getOtpExpiry(),
        });

        // 3. Yahan aap email send karne ka function call kar sakte hain (rawOtp ke saath)
        console.log(`OTP for ${emailLower}: ${rawOtp}`); 

        return newUser;
    });
};

export const login = async (payload: UserLogin) => {
    const { email, password } = payload;
    const user = await db.query.UserTable.findFirst({
        where: eq(UserTable.email, email.toLowerCase()),
    });

    if (!user || !(await compareData(password, user.password))) {
        throw new Error('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

// Resend OTP logic (Separated from createUser)
export const resendOTP = async (email: string) => {
    const user = await db.query.UserTable.findFirst({
        where: eq(UserTable.email, email.toLowerCase()),
    });

    if (!user) throw new Error('User not found');

    const rawOtp = generateOtp();
    const hashedOtp = await hashData(rawOtp);

    await db.insert(UserOtp).values({
        userId: user.id,
        hashedOtp: hashedOtp,
        otpExpiry: getOtpExpiry(),
    });

    return { message: "OTP sent successfully" };
};
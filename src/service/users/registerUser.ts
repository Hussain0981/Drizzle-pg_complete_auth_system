import { db } from "../../config/dbConnection";
import { eq } from "drizzle-orm";
import { usersOtp, users } from "../../db/schema/users";
import { User } from '../../types/user';
import { hashData, generateOtp } from '../../utils/auth';
import { sendOtp } from '../../utils/sendOtpToUser'

const getOtpExpiry = () => new Date(Date.now() + 10 * 60 * 1000);

export const createUser = async (payload: User) => {
    const { name, email, password } = payload;
    const emailLower = email.toLowerCase();

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, emailLower),
    });

    if (existingUser) {
        throw new Error('User with this email already exists. Please try to login.');
    }

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
        return safeUser;
    });
};
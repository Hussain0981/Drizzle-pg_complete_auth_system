import { db } from "../../config/dbConnection";
import { users, usersOtp } from "../../db/schema/users";
import { UserLogin } from '../../types/user';
import { compareData } from '../../utils/auth';
import { eq } from "drizzle-orm";
import jwt from 'jsonwebtoken';

export const login = async (payload: UserLogin) => {
    const { email, password } = payload;

    // ── Step 1: Find user ─────────────────────────────────
    const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
        throw new Error('No account found with this email. Please register.');
    }

    // ── Step 2: Compare password ──────────────────────────
    const isMatch = await compareData(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password.');
    }

    // ── Step 3: Check verification status ─────────────────
    const otpData = await db.query.usersOtp.findFirst({
        where: eq(usersOtp.userId, user.id),
    });

    if (otpData && !otpData.isVerified) {
        throw new Error('Account not verified. Please check your email for OTP.');
    }

    // ── Step 4: Generate JWT token ────────────────────────
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );

    // ── Step 5: Return safe user + token ──────────────────
    const { password: _, ...safeUser } = user;
    return {
        ...safeUser,
        token,
        message: 'Login successful.',
    };
};
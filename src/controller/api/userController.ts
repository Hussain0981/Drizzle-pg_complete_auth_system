import { Request, Response } from "express";
import type { User } from "../../types/user";
import { createUser } from '../../service/users/registerUser'
import { login } from '../../service/users/loginUser'
import { verifyUser } from '../../service/users/verifyUser'
import { successResponse, failureResponse } from "../../helper/sendResponse";
import { forgotPassword } from "../../service/users/forgotPassword";
import { resetPassword } from "../../service/users/resetPassword";
import { resendOtp } from "../../service/users/resendOtpToUser";

export const createController = async (req: Request, res: Response) => {
    try {
        const payload: User = req.body;
        const user = await createUser(payload);
        successResponse(res, user, 'User registered successfully');

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to register user';
        failureResponse(res, errorMessage);
    }
};

export const loginController = async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        const user = await login(payload);
        successResponse(res, user, 'User logged in successfully');

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to login user';
        failureResponse(res, errorMessage);
    }
};

export const verifyUserController = async (req: Request, res: Response) => {
    try {
        const { id, otp } = req.body;
        const user = await verifyUser(id, otp);
        successResponse(res, user, 'User verified successfully');

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to verify user';
        failureResponse(res, errorMessage);
    }
};

export const resendOtpController = async (req: Request, res: Response) => {
    try {
        const { id, email } = req.body;
        const result = await resendOtp(id, email);
        successResponse(res, result, 'OTP resent successfully');

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to resend OTP';
        failureResponse(res, errorMessage);
    }
};

export const forgotPasswordController = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const result = await forgotPassword(email);
        successResponse(res, result, 'OTP sent to your email successfully'); // Bug: was showing wrong message

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to process forgot password';
        failureResponse(res, errorMessage);
    }
};

export const resetPasswordController = async (req: Request, res: Response) => {
    try {
        const { id, password, confirmPassword } = req.body;
        const result = await resetPassword(id, password, confirmPassword);
        successResponse(res, result, 'Password reset successfully'); // Bug: was showing wrong message

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to reset password';
        failureResponse(res, errorMessage);
    }
    
};

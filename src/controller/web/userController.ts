import { Request, Response } from "express";

export const createController = async (req: Request, res: Response) => {
    res.render(`users/register`)
};

export const loginController = async (req: Request, res: Response) => {
    res.render(`users/login`)
};

export const verifyUserController = async (req: Request, res: Response) => {
    const { email } = req.query;
    res.render(`users/verify`, { email })
};

export const resendOtpController = async (req: Request, res: Response) => {
    res.render(`users/resendOtp`)
};

export const forgotPasswordController = async (req: Request, res: Response) => {
    res.render(`users/forgotPassword`)
};

export const resetPasswordController = async (req: Request, res: Response) => {
    res.render(`users/verifyForgotPassword`)

};

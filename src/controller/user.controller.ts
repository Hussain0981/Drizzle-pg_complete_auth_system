import { Request, Response } from "express";
import type { User } from "../types/user";
import { createUser } from '../service/users/registerUser'
import { login } from '../service/users/loginUser'
import { verifyOtp } from '../service/users/verifyUser'

export const create = async (req: Request, res: Response) => {
    try {
        const payload: User = req.body
        const user = await createUser(payload);

        res.status(201).json({
            success: true,
            data: user,
        });
    } catch (e: any) {
        res.status(500).json({
            success: false,
            error: e.message,
        });
    }
};
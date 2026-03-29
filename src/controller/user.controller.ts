import { Request, Response } from "express";
import type { User } from "../types/user";
import { createUser } from '../service/users/registerUser'
import { login } from '../service/users/loginUser'
import { verifyUser } from '../service/users/verifyUser'
import { successResponse, failureResponse } from "../helper/sendResponse";

export const createController = async (req: Request, res: Response) => {
    try {
        const payload: User = req.body
        const user = await createUser(payload);
        successResponse(res, user, 'User successfully created')

    } catch (e) {
        const errorMessage = (`Failed to Register user || ${{ cause: e }}`)
        failureResponse(res, errorMessage)
    }
};
export const loginController = async (req: Request, res: Response) => {
    try {
        const payload = req.body
        const user = await login(payload);
        successResponse(res, user, 'User Login successfully')

    } catch (e) {
        const errorMessage = (`Failed to Login user || ${{ cause: e }}`)
        failureResponse(res, errorMessage)
    }
};
export const verifyController = async (req: Request, res: Response) => {
    try {
        const { id, otp} = req.body
        const user = await verifyUser(id, otp);
        successResponse(res, user, 'User Verified successfully')

    } catch (e) {
        const errorMessage = (`Failed to verify user || ${{ cause: e }}`)
        failureResponse(res, errorMessage)
    }
};
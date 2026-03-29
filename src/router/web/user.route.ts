import express, { Request, Response } from "express";
const router = express.Router();

router.get("/register", (req: Request, res: Response) => res.render(`register`));
router.get("/login", (req: Request, res: Response) => res.render(`login`));
router.get("/verify", (req: Request, res: Response) => res.render(`verify`));
router.get("/resend-otp", (req: Request, res: Response) => res.render(`resendOtp`));
router.get("/forgot-password", (req: Request, res: Response) => res.render(`forgotPassword`));
router.get("/verify-forgot-password", (req: Request, res: Response) => res.render(`verifyForgotPassword`));
router.get("/reset-password", (req: Request, res: Response) => res.render(`resetPassword`));

export default router;
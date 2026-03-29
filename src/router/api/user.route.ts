import express from "express";
import * as controller from "../../controller/user.controller";

const router = express.Router();

router.post("/register", controller.createController);
router.post("/login", controller.loginController);
router.post("/verify", controller.verifyUserController);
router.post("/resend-otp", controller.resendOtpController);
router.post("/forgot-password", controller.forgotPasswordController);
router.post("/reset-password", controller.resetPasswordController);

export default router;
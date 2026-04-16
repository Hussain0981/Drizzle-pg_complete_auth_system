import express from "express";
import userRoutes from "./userRoute";
import { guestMiddleware } from '../../middleware/auth';

const router = express.Router();

router.use("/v1/user", guestMiddleware, userRoutes);
// router.use("/product", productRoutes); // future routes

export default router;
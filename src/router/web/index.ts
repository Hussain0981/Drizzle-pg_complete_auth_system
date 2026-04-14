import express from "express";
import userRoutes from "./userRoute"
const router = express.Router();

router.use("/users", userRoutes);

export default router;
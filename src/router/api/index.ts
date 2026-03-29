import express from "express";
import userRoutes from "./user.route";

const router = express.Router();

router.use("/api/v1/user", userRoutes);
// router.use("/product", productRoutes); // future routes

export default router;
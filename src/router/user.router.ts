import express from "express";
import * as controller from "../controller/user.controller";

const router = express.Router();

router.get("/", controller.createController);
router.get("/", controller.createController);
router.get("/", controller.createController);

export default router;
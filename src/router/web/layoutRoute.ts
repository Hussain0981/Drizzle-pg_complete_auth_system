import express from "express";
import * as controller from "../../controller/web/layoutController";

const router = express.Router();

router.get("/", controller.createController);

export default router;
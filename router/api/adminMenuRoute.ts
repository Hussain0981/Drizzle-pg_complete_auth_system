import express from "express";
import * as controller from "../../controller/adminMenuController";

const router = express.Router();
router.post("/", controller.addController);       // CREATE
router.get("/", controller.getAll);               // GET ALL
router.get("/:id", controller.getById);          // GET ONE
router.put("/:id", controller.updateController); // UPDATE
router.delete("/:id", controller.deleteController); // DELETE

export default router;
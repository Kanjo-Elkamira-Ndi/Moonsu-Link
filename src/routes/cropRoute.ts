import { Router } from "express";
import * as cropController from "../controllers/cropController";
import { authorize } from "../middleware/AuthMiddleware";

const router = Router();

router.post("/", authorize(["admin", "farmer"]), cropController.createCrop);
router.get("/", authorize("All"), cropController.getCrops);
router.get("/:id", authorize(["admin", "farmer"]), cropController.getCropById);

export default router;
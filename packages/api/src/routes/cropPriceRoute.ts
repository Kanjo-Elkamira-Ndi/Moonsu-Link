import { Router } from "express";
import * as cropPriceController from "../controllers/cropPriceController";
import { authorize } from "../middleware/AuthMiddleware";

const router = Router();

router.post("/", authorize("admin"), cropPriceController.createCropPrice);
router.get("/", authorize("all"),cropPriceController.getCropPrices);
router.get("/:id", authorize("all"), cropPriceController.getCropPriceById);
router.get("/crop/:crop_id", authorize("all"), cropPriceController.getCropPricesByCrop);
router.get("/region/:region", authorize("all"), cropPriceController.getCropPricesByRegion);
router.put("/:id", authorize("admin"), cropPriceController.updateCropPrice);
router.delete("/:id", authorize("admin"), cropPriceController.deleteCropPrice);

export default router;
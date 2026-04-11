import { Router } from "express";
import * as alertController from "../controllers/alertController";
import { authorize } from "../middleware/AuthMiddleware";

const router = Router();

router.post("/", authorize("All"), alertController.createAlert);
router.get("/", authorize("All"), alertController.getAlerts);
router.get("/:id", authorize("All"), alertController.getAlertById);
router.get("/user/:user_id", authorize("All"), alertController.getAlertsByUser);
router.put("/:id/publish", authorize("admin"), alertController.publishAlert);
router.put("/:id/dismiss", authorize("admin"), alertController.dismissAlert);
router.put("/:id", authorize("admin"), alertController.updateAlert);
router.delete("/:id", authorize("admin"), alertController.deleteAlert);

export default router;
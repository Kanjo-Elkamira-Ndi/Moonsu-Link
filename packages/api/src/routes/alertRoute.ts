import { Router } from "express";
import * as alertController from "../controllers/alertController";
import { authorize } from "../middleware/AuthMiddleware";

const router = Router();

router.post("/", authorize("all"), alertController.createAlert);
router.get("/", authorize("all"), alertController.getAlerts);
router.get("/:id", authorize("all"), alertController.getAlertById);
router.get("/user/:user_id", authorize("all"), alertController.getAlertsByUser);
router.put("/:id/verify", authorize("admin"), alertController.verifyAlert);
router.put('/:id', authorize("admin"), alertController.updateAlert);

export default router;
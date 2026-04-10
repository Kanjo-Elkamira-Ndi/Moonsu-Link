// routes/user.routes.ts
import { Router } from "express";
import * as userController from "../controllers/userController";
import { authorize } from "../middleware/AuthMiddleware"

const router = Router();

router.post("/", authorize("admin"), userController.createUser);
router.put("/:id", authorize("all"),userController.updateUser);
router.get("/", authorize("admin"), userController.getUsers);
router.get("/:id", authorize("admin"),userController.getUserById);
router.post("/verify/:id", authorize("admin"), userController.verifyUser);
router.get("/platform/:id", authorize("admin"), userController.getUserByPlatformId); 
router.post("/platform/link_account", authorize("all"), userController.linkUserAccount);
export default router; 
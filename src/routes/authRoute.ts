import { Router } from "express";
import * as authController from "../controllers/authController";

const router = Router();

router.post("/user", authController.logUser)
router.post("/admin", authController.loging)
router.post("/register", authController.register)

export default router;
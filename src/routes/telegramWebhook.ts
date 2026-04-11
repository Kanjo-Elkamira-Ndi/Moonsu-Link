import { Router, Request, Response } from "express";
import { handleTelegramUpdate } from "../channels/telegram.channel";
const router = Router();

router.post('/telegram', handleTelegramUpdate);

export default router;
import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import * as authService from "../services/authService";

export const logUser = async (req: Request, res: Response) => {
    try {
        const { identifier } = req.body;
    
        if (!identifier) {
            throw new AppError("Missing required field: identifier", 400);
        }
        const token = await authService.logUser(identifier);
        return res.json({ token });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const loging = async (req: Request, res: Response) => {
    try {
        const {name, email} = req.body;

        if (!name || !email) {
            throw new AppError("Missing required fields: name and email", 400);
        }
        const token = await authService.loging(name, email);
        return res.json({ token });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { name, region, role, lang, platform, phone, telegramId, telegramNumber, whatsappNumber } = req.body;

        if (!name || !platform || !region || !role || !lang) {
            throw new AppError("Missing required fields", 400);
        }

        const user = await authService.register({
            name, region, role, lang, platform,
            phone, telegramId, telegramNumber, whatsappNumber
        });
        return res.status(201).json({ user, token: user.token });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};
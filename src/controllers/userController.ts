import { Request, Response } from "express";
import * as userService from "../services/userService";
import { AppError } from "../utils/AppError";

export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, region, role, lang, platform, phone, telegramId, telegramNumber, whatsappNumber } = req.body;

        if (!name || !platform || !region || !role || !lang) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const user = await userService.createUser({
            name, region, role, lang, platform,
            phone, telegramId, telegramNumber, whatsappNumber
        });
        return res.status(201).json(user);

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { pic_folder } = req.body;
        if (!pic_folder) {
            return res.status(400).json({ message: "Missing required field: pic_folder" });
        }

        const user = await userService.updateUser(id, { pic_folder });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await userService.getUsers();
        return res.status(200).json(users);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const verifyUser = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id as string;
        const user = await userService.verifyUser(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id as string;
        if (!userId) {
            return res.status(400).json({ message: "Missing required parameter: id" });
        }
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getUserByPlatformId = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id as string;
        if (!userId) {
            return res.status(400).json({ message: "Missing required parameter: id" });
        }
        const user = await userService.getUserByPlatformId(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const linkUserAccount = async (req: Request, res: Response) => {
    try {
        const { user_id, platform, identifier } = req.body;

        if (!user_id || !platform || !identifier) {
            return res.status(400).json({
                message: "user_id, platform and identifier are required"
            });
        }

        const allowedPlatforms = ["telegram", "whatsapp", "sms"];
        if (!allowedPlatforms.includes(platform)) {
            return res.status(400).json({
                message: "Invalid platform. Must be telegram, whatsapp or sms"
            });
        }

        const user = await userService.linkUserAccount(user_id, platform, identifier);
        return res.status(200).json(user);

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};
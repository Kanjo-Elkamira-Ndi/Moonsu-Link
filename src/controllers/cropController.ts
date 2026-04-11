import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import * as cropService from "../services/cropService";

export const createCrop = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            throw new AppError("Missing required field: name", 400);
        }
        // Additional validation can be added here (e.g., date format, logical checks)
        const crop = await cropService.createCrop({ name });
        return res.status(201).json(crop);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getCrops = async (req: Request, res: Response) => {
    try {
        const crops = await cropService.getCrops();
        return res.status(200).json(crops);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getCropById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const crop = await cropService.getCropById(id);
        if (!crop) {
            return res.status(404).json({ message: "Crop not found" });
        }
        return res.status(200).json(crop);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};
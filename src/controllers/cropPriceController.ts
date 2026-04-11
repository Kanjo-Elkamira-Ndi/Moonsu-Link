import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import * as cropPriceService from "../services/cropPriceService";

export const createCropPrice = async (req: Request, res: Response) => {
    try {
        const { crop_id, min_price, max_price, region } = req.body;
        if (!crop_id || !min_price || !max_price || !region) {
            throw new AppError("Missing required fields: crop_id, min_price, max_price, region", 400);
        }
        const cropPrice = await cropPriceService.createCropPrice({ crop_id, min_price, max_price, region });
        return res.status(201).json(cropPrice);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    };
};

export const getCropPrices = async (req: Request, res: Response) => {
    try {
        const cropPrices = await cropPriceService.getCropPrices();
        return res.status(200).json(cropPrices);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getCropPriceById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const cropPrice = await cropPriceService.getCropPriceById(Number(id));
        if (!cropPrice) {
            return res.status(404).json({ message: "Crop price not found" });
        }
        return res.status(200).json(cropPrice);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getCropPricesByCrop = async (req: Request, res: Response) => {
    try {
        const crop_id = req.params.crop_id as string;
        const cropPrices = await cropPriceService.getCropPricesByCrop(Number(crop_id));
        return res.status(200).json(cropPrices);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

export const getCropPricesByRegion = async (req: Request, res: Response) => {
    try {
        const region = req.params.region as string;
        const cropPrices = await cropPriceService.getCropPricesByRegion(region);
        return res.status(200).json(cropPrices);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateCropPrice = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { min_price, max_price} = req.body;
        const updatedCropPrice = await cropPriceService.updateCropPrice(Number(id), { min_price, max_price });
        if (!updatedCropPrice) {
            return res.status(404).json({ message: "Crop price not found" });
        }
        return res.status(200).json(updatedCropPrice);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });   
    }
};

export const deleteCropPrice = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await cropPriceService.deleteCropPrice(Number(id));
        return res.status(200).json({ message: "Crop price deleted successfully" });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};
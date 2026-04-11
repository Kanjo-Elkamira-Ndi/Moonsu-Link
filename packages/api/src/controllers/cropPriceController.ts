import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import * as cropPriceService from "../services/cropPriceService";
import * as cropService from "../services/cropService";
import * as notificationService from "../services/notificationService";

export const createCropPrice = async (req: Request, res: Response) => {
    try {
        const { crop_id, crop, min_price, max_price, region } = req.body;
        if ((!crop_id && !crop) || !min_price || !max_price || !region) {
            throw new AppError("Missing required fields: crop or crop_id, min_price, max_price, region", 400);
        }

        let resolvedCropId = crop_id;
        if (!resolvedCropId) {
            const cropName = String(crop).trim();
            const existingCrop = await cropService.getCropByName(cropName);
            if (existingCrop) {
                resolvedCropId = existingCrop.id;
            } else {
                const createdCrop = await cropService.createCrop({ name: cropName });
                resolvedCropId = createdCrop.id;
            }
        }

        const cropPrice = await cropPriceService.createCropPrice({ crop_id: resolvedCropId, min_price, max_price, region });
        await notificationService.broadcastMarketPriceUpdate(cropPrice);
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
        const id = parseInt(req.params.id, 10);
        const cropPrice = await cropPriceService.getCropPriceById(id);
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
        const crop_id = parseInt(req.params.crop_id, 10);
        const cropPrices = await cropPriceService.getCropPricesByCrop(crop_id);
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
        const region = req.params.region;
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
        const id = parseInt(req.params.id, 10);
        const { crop_id, crop, min_price, max_price, region } = req.body;

        let resolvedCropId = crop_id;
        if (!resolvedCropId && crop) {
            const cropName = String(crop).trim();
            const existingCrop = await cropService.getCropByName(cropName);
            if (existingCrop) {
                resolvedCropId = existingCrop.id;
            } else {
                const createdCrop = await cropService.createCrop({ name: cropName });
                resolvedCropId = createdCrop.id;
            }
        }

        const updatedCropPrice = await cropPriceService.updateCropPrice(id, { crop_id: resolvedCropId, min_price, max_price, region });
        if (!updatedCropPrice) {
            return res.status(404).json({ message: "Crop price not found" });
        }
        await notificationService.broadcastMarketPriceUpdate(updatedCropPrice);
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
        const id = parseInt(req.params.id, 10);
        await cropPriceService.deleteCropPrice(id);
        return res.status(200).json({ message: "Crop price deleted successfully" });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};
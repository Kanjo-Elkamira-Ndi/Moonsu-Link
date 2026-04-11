import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import * as listingService from "../services/listingService";

export const createListing = async (req: Request, res: Response) => {
    try {
        const { user_id, crop_id, quantity_kg, price, town, region, image_url } = req.body;
        if (!user_id || !crop_id || !quantity_kg || !price || !town) {
            throw new AppError("Missing required fields", 400);
        }
        const listing = await listingService.createListing({ user_id, crop_id, quantity_kg, price, town, region, image_url });
        return res.status(201).json(listing);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getListings = async (req: Request, res: Response) => {
    try {
        const listings = await listingService.getListings();
        return res.status(200).json(listings);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const deleteListing = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await listingService.deleteListing(parseInt(id));
        return res.status(204).send();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getListingsByUserId = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id as string;
        const listings = await listingService.getListingsByUserId(userId);
        return res.status(200).json(listings);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateListing = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { quantity_kg, price, town, image_url, expiresAt } = req.body;
        const updatedListing = await listingService.updateListing(parseInt(id), { quantity_kg, price, town, image_url, expiresAt });
        return res.status(200).json(updatedListing);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getListingOfVerifyFamers = async (req: Request, res: Response) => {
    try {
        const listings = await listingService.getVerifiedListings();
        return res.status(200).json(listings);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}
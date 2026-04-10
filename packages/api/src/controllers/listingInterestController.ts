import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import * as listinfInterestService from "../services/listingInterestService";

export const createListingInterest = async (req: Request, res: Response) => {
    try {
        const { listing_id, user_id } = req.body;
    
        if (!listing_id || !user_id) {
            throw new AppError("Missing required fields: listing_id, user_id", 400);
        }
        const listingInterest = await listinfInterestService.createListingInterest({ listing_id, user_id });
        return res.status(201).json(listingInterest);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getListingInterests = async (req: Request, res: Response) => {
    try {
        const listingInterests = await listinfInterestService.getListingInterests();
        return res.status(201).json(listingInterests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getListingInterestById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const listingInterest = await listinfInterestService.getListingInterestById(parseInt(id));
        if (!listingInterest) {
            throw new AppError("Listing interest not found", 404);
        }
        return res.status(200).json(listingInterest);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getListingInterestsByListing = async (req: Request, res: Response) => {
    try {
        const { listing_id } = req.params;
        const listingInterests = await listinfInterestService.getListingInterestsByListing(parseInt(listing_id));
        return res.status(200).json(listingInterests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getListingInterestsByUser = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.params;
        const listingInterests = await listinfInterestService.getListingInterestsByUser(parseInt(user_id));
        return res.status(200).json(listingInterests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getListingInterestsByFarmer = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.params;
        const listingInterests = await listinfInterestService.getListingInterestsByFarmer(user_id);
        return res.status(200).json(listingInterests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};
import { ListingInterest } from "../models/listingInterest";
import { pool } from "../db/pool";
import { AppError } from "../utils/AppError";

export const createListingInterest = async (data: Partial<ListingInterest>): Promise<ListingInterest> => {
    try {
        const { listing_id, user_id } = data;

        if (!listing_id || !user_id) {
            throw new AppError("listing_id and user_id are required", 400);
        }

        const result = await pool.query(
            `
            INSERT INTO listing_interests (listing_id, user_id, message)
            SELECT 
                $1,
                $2,
                'Mr/Ms ' || u.name || 
                ' is interested in your listing for ' || c.name || 
                ' at the price of ' || l.price || ' FCFA'
            FROM users u
            JOIN listings l ON l.id = $1
            JOIN crops c ON c.id = l.crop_id
            WHERE u.id = $2
            RETURNING *;
            `,
            [listing_id, user_id]
        );

        return result.rows[0];

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error(error);
        throw new AppError("Failed to create listing interest", 500);
    }
};

export const getListingInterests = async (): Promise<ListingInterest[]> => {
    try {
        const result = await pool.query("SELECT * FROM listing_interests");
        return result.rows;
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to fetch listing interests", 500);
    }
};

export const getListingInterestById = async (id: number): Promise<ListingInterest | null> => {
    try {
        const result = await pool.query("SELECT * FROM listing_interests WHERE id = $1", [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to fetch listing interest", 500);
    }
};

export const getListingInterestsByListing = async (listing_id: number): Promise<ListingInterest[]> => {
    try {
        const result = await pool.query("SELECT * FROM listing_interests WHERE listing_id = $1", [listing_id]);
        return result.rows;
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to fetch listing interests for listing", 500);
    }
};

export const getListingInterestsByUser = async (user_id: number): Promise<ListingInterest[]> => {
    try {
        const result = await pool.query("SELECT * FROM listing_interests WHERE user_id = $1", [user_id]);
        return result.rows;
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to fetch listing interests for user", 500);
    }
};

// so here will will use joins to get all the listing interests a farmer got thank to their id that id present in listing table knowing a famer is a user
export const getListingInterestsByFarmer = async (
    user_id: string
) => {
    try {
        const result = await pool.query(
            `
            SELECT 
                li.id,
                li.message,
                li.created_at,

                u.id AS interested_user_id,
                u.name AS interested_user_name,

                l.id AS listing_id,
                l.price,
                l.town,

                c.name AS crop_name

            FROM listing_interests li

            JOIN listings l ON l.id = li.listing_id
            JOIN users u ON u.id = li.user_id
            JOIN crops c ON c.id = l.crop_id

            WHERE l.user_id = $1

            ORDER BY li.created_at DESC
            `,
            [user_id]
        );

        return result.rows;

    } catch (error) {
        console.error(error);
        throw new AppError("Failed to fetch listing interests for farmer", 500);
    }
};
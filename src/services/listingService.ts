import { Listing } from "../models/listing";
import { pool } from "../db/pool";
import { AppError } from "../utils/AppError";

export const createListing = async (data: Partial<Listing>): Promise<Listing> => {
    try {
        const { user_id, crop_id, quantity_kg, price, town, region, image_url } = data;
        if (!user_id || !crop_id || !quantity_kg || !price || !town) {
            throw new AppError("Missing required fields", 400);
        }

        const result = await pool.query(
            `INSERT INTO listings (user_id, crop_id, quantity_kg, price, town, region, image_url)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [user_id, crop_id, quantity_kg, price, town, region, image_url || null]
        );
        // if sucessfull return the created listing using a join to obtain the userid, username, cropid and cropname
        const listing = result.rows[0];
        const listingWithDetails = await pool.query(
            `SELECT l.id, l.quantity_kg, l.price, l.town, l.image_url, l.expires_at, l.created_at, l.updated_at,
                    u.name as user_name,
                    c.name as crop_name
             FROM listings l
             JOIN users u ON l.user_id = u.id
             JOIN crops c ON l.crop_id = c.id
             WHERE l.id = $1`,
            [listing.id]
        );
        return listingWithDetails.rows[0];
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to create listing", 500);
    }
};

export const getListings = async (): Promise<Listing[]> => {
    try {
        const result = await pool.query(
            `SELECT l.id, l.quantity_kg, l.price, l.town, l.image_url, l.expires_at, l.created_at, l.updated_at,
                    u.name as user_name,
                    c.name as crop_name
             FROM listings l
             JOIN users u ON l.user_id = u.id
             JOIN crops c ON l.crop_id = c.id`
        );
        return result.rows;
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to fetch listings", 500);
    }
};

export const deleteListing = async (id: number): Promise<void> => {
    try {
        await pool.query(`DELETE FROM listings WHERE id = $1`, [id]);
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to delete listing", 500);
    }
};

export const getListingsByUserId = async (user_id: string): Promise<Listing[]> => {
    try {
        const result = await pool.query(
            `SELECT l.id, l.quantity_kg, l.price, l.town, l.image_url, l.expires_at, l.created_at, l.updated_at,
                    u.name as user_name,
                    c.name as crop_name
             FROM listings l
             JOIN users u ON l.user_id = u.id
             JOIN crops c ON l.crop_id = c.id
             WHERE l.user_id = $1`,
            [user_id]
        );
        return result.rows;
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to fetch listings for user", 500);
    }
};

export const updateListing = async (id: number, data: Partial<Listing>): Promise<Listing> => {
    try {
        const { quantity_kg, price, town, image_url, expiresAt } = data;
        const fieldsToUpdate = [];
        const values = [];
        let index = 1;

        if (quantity_kg !== undefined) {
            fieldsToUpdate.push(`quantity_kg = $${index++}`);
            values.push(quantity_kg);
        }
        if (price !== undefined) {
            fieldsToUpdate.push(`price = $${index++}`);
            values.push(price);
        }
        if (town !== undefined) {
            fieldsToUpdate.push(`town = $${index++}`);
            values.push(town);
        }
        if (image_url !== undefined) {
            fieldsToUpdate.push(`image_url = $${index++}`);
            values.push(image_url);
        }
        if (expiresAt !== undefined) {
            fieldsToUpdate.push(`expires_at = $${index++}`);
            values.push(expiresAt);
        }

        if (fieldsToUpdate.length === 0) {
            throw new AppError("No fields to update", 400);
        }

        values.push(id);

        const result = await pool.query(
            `UPDATE listings SET ${fieldsToUpdate.join(", ")}, updated_at = NOW() WHERE id = $${index} RETURNING *`,
            values
        );
        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to update listing", 500);
    }
};

export const getVerifiedListings = async () => {
    try {
        const result = await pool.query(
            `
            SELECT 
                l.id,
                l.quantity_kg,
                l.price,
                l.town,
                l.image_url,
                l.expires_at,
                l.created_at,
                l.updated_at,

                u.name AS user_name,
                c.name AS crop_name

            FROM listings l
            JOIN users u ON l.user_id = u.id
            JOIN crops c ON l.crop_id = c.id

            WHERE u.verified = true
            ORDER BY l.created_at DESC
            `
        );

        return result.rows;

    } catch (error) {
        console.error(error);
        throw new AppError("Failed to fetch verified listings", 500);
    }
};
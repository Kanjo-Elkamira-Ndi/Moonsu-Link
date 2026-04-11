import { CropPrice } from "../routes/models/cropPrice";
import { pool } from "../db/pool";
import { AppError } from "../utils/AppError";

export const createCropPrice = async (data: Partial<CropPrice>): Promise<CropPrice> => {
    try {
        const { crop_id, min_price, max_price, region } = data;

        if (!crop_id || !min_price || !max_price) {
            throw new AppError("crop_id, min_price and max_price are required", 400);
        }

        const result = await pool.query(
            `WITH inserted AS (
                INSERT INTO crop_prices (crop_id, min_price, max_price, region, avg_price)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            )
            SELECT inserted.*, c.name AS crop_name
            FROM inserted
            JOIN crops c ON c.id = inserted.crop_id`,
            [crop_id, min_price, max_price, region, Math.floor((min_price + max_price) / 2)]
        );

        return result.rows[0];

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error(error);
        throw new AppError("Failed to create crop price", 500);
    }
};

export const getCropPrices = async (): Promise<CropPrice[]> => {
    try {
        const result = await pool.query(
            `SELECT cp.*, c.name AS crop_name
             FROM crop_prices cp
             JOIN crops c ON c.id = cp.crop_id`
        );
        return result.rows;
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to retrieve crop prices", 500);
    }
};

export const getCropPriceById = async (id: number): Promise<CropPrice | null> => {
    try {
        const result = await pool.query(
            `SELECT cp.*, c.name AS crop_name
             FROM crop_prices cp
             JOIN crops c ON c.id = cp.crop_id
             WHERE cp.id = $1`,
            [id]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to retrieve crop price", 500);
    }
};

export const getCropPricesByCrop = async (crop_id: number): Promise<CropPrice[]> => {
    try {
        const result = await pool.query(
            `SELECT cp.*, c.name AS crop_name
             FROM crop_prices cp
             JOIN crops c ON c.id = cp.crop_id
             WHERE cp.crop_id = $1`,
            [crop_id]
        );
        return result.rows;
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to retrieve crop prices for the specified crop", 500);
    }
};

export const getCropPricesByRegion = async (region: string): Promise<CropPrice[]> => {
    try {
        const result = await pool.query(
            `SELECT cp.*, c.name AS crop_name
             FROM crop_prices cp
             JOIN crops c ON c.id = cp.crop_id
             WHERE cp.region = $1`,
            [region]
        );
        return result.rows;
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to retrieve crop prices for the specified region", 500);
    }
};

export const updateCropPrice = async (id: number, data: Partial<CropPrice>): Promise<CropPrice> => {
    try {
        const { crop_id, min_price, max_price, region } = data;

        // update only the provided fields and that can be only min_price or max_price or both
        const fieldsToUpdate = [];
        const values = [];
        let index = 1;

        if (crop_id) {
            fieldsToUpdate.push(`crop_id = $${index++}`);
            values.push(crop_id);
        }
        if (min_price) {
            fieldsToUpdate.push(`min_price = $${index++}`);
            values.push(min_price);
        }
        if (max_price) {
            fieldsToUpdate.push(`max_price = $${index++}`);
            values.push(max_price);
        }
        if (region) {
            fieldsToUpdate.push(`region = $${index++}`);
            values.push(region);
        }

        if (fieldsToUpdate.length === 0) {
            throw new AppError("No valid fields provided for update", 400);
        }

        // Recalculate avg_price if min_price or max_price is updated
        let avgPriceClause = "";
        if (min_price || max_price) {
            avgPriceClause = `, avg_price = FLOOR((COALESCE($${index}, min_price) + COALESCE($${index + 1}, max_price)) / 2)`;
            values.push(min_price || null, max_price || null);
            index += 2;
        }

        const result = await pool.query(
            `WITH updated AS (
                UPDATE crop_prices
                SET ${fieldsToUpdate.join(", ")} ${avgPriceClause}
                WHERE id = $${index}
                RETURNING *
            )
            SELECT updated.*, c.name AS crop_name
            FROM updated
            JOIN crops c ON c.id = updated.crop_id`,
            [...values, id]
        );

        if (result.rows.length === 0) {
            throw new AppError("Crop price not found", 404);
        }

        return result.rows[0];

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error(error);
        throw new AppError("Failed to update crop price", 500);
    }
};

export const deleteCropPrice = async (id: number): Promise<void> => {
    try {
        const result = await pool.query(
            `DELETE FROM crop_prices WHERE id = $1 RETURNING *`,
            [id]
        );
        if (result.rows.length === 0) {
            throw new AppError("Crop price not found", 404);
        }
    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error(error);
        throw new AppError("Failed to delete crop price", 500);
    }
};
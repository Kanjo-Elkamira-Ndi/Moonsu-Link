import { Crop } from "../routes/models/crop";
import { pool } from "../db/pool";
import { AppError } from "../utils/AppError";

export const createCrop = async (data: Partial<Crop>): Promise<Crop> => {
    try {
        const { name } = data;
        if (!name) {
            throw new AppError("Crop name is required", 400);
        }
        const result = await pool.query(
            `INSERT INTO crops (name) VALUES ($1) RETURNING *`,
            [name]
        );
        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to create crop", 500);
    }
};

export const getCrops = async (): Promise<Crop[]> => {
    try {
        const result = await pool.query(`SELECT * FROM crops`);
        return result.rows;
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to retrieve crops", 500);
    }
};

export const getCropByName = async (name: string): Promise<Crop | null> => {
    try {
        const result = await pool.query(
            `SELECT * FROM crops WHERE LOWER(name) = LOWER($1)`,
            [name.trim()]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to retrieve crop", 500);
    }
};

export const getCropById = async (id: string): Promise<Crop | null> => {
    try {
        const result = await pool.query(`SELECT * FROM crops WHERE id = $1`, [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to retrieve crop", 500);
    }
};
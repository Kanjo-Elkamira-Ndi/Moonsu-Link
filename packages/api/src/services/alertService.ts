import { Alert } from "../models/alert";
import { pool } from "../db/pool";
import { AppError } from "../utils/AppError";

export const createAlert = async (data: Partial<Alert>): Promise<Alert> => {
    try {
        const { user_id, notice, advice } = data;

        if (!user_id || !notice) {
            throw new AppError("user_id and notice are required", 400);
        }

        const result = await pool.query(
            `
            INSERT INTO alerts (user_id, notice, advice)
            VALUES ($1, $2, $3)
            RETURNING *;
            `,
            [user_id, notice, advice]
        );

        return result.rows[0];

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error(error);
        throw new AppError("Failed to create alert", 500);
    }
};

export const getAlerts = async (): Promise<Alert[]> => {
    try {
        const result = await pool.query("SELECT * FROM alerts");
        return result.rows;
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to fetch alerts", 500);
    }
};

export const getAlertsByUserId = async (user_id: string): Promise<Alert[]> => {
    try {
        const result = await pool.query("SELECT * FROM alerts WHERE user_id = $1", [user_id]);
        return result.rows;
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to fetch alerts", 500);
    }
};

export const getAlertById = async (id: number): Promise<Alert | null> => {
    try {
        const result = await pool.query("SELECT * FROM alerts WHERE id = $1", [id]);
        return result.rows[0] || null;
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to fetch alert", 500);
    }
};

export const verifyAlert = async (id: number): Promise<Alert> => {
    try {
        const result = await pool.query(
            `
            UPDATE alerts
            SET verified = true, updated_at = NOW()
            WHERE id = $1
            RETURNING *;
            `,
            [id]
        );

        if (result.rowCount === 0) {
            throw new AppError("Alert not found", 404);
        }

        return result.rows[0];

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error(error);
        throw new AppError("Failed to verify alert", 500);
    }
};

export const updateAlert = async (id: number, data: Partial<Alert>): Promise<Alert> => {
    try {
        const { notice, advice } = data;

        const result = await pool.query(
            `
            UPDATE alerts
            SET notice = COALESCE($1, notice),
                advice = COALESCE($2, advice),
                updated_at = NOW()
            WHERE id = $3
            RETURNING *;
            `,
            [notice, advice, id]
        );

        if (result.rowCount === 0) {
            throw new AppError("Alert not found", 404);
        }

        return result.rows[0];

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error(error);
        throw new AppError("Failed to update alert", 500);
    }
};
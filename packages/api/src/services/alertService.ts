import { Alert } from "../models/alert";
import { pool } from "../db/pool";
import { AppError } from "../utils/AppError";
import * as notificationService from "./notificationService";

export const createAlert = async (data: Partial<Alert>): Promise<Alert> => {
    try {
        const { user_id, title, message, severity = 'warning', region, submitted_by = 'User' } = data;

        if (!title || !message) {
            throw new AppError("title and message are required", 400);
        }

        const result = await pool.query(
            `
            INSERT INTO alerts (user_id, title, message, severity, region, submitted_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
            `,
            [user_id, title, message, severity, region, submitted_by]
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
        const result = await pool.query(`
            SELECT a.*, u.name as user_name
            FROM alerts a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
        `);
        return result.rows.map(row => ({
            ...row,
            submitted_by: row.submitted_by || row.user_name || 'User'
        }));
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to fetch alerts", 500);
    }
};

export const getAlertsByUserId = async (user_id: string): Promise<Alert[]> => {
    try {
        const result = await pool.query(`
            SELECT a.*, u.name as user_name
            FROM alerts a
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.user_id = $1
            ORDER BY a.created_at DESC
        `, [user_id]);
        return result.rows.map(row => ({
            ...row,
            submitted_by: row.submitted_by || row.user_name || 'User'
        }));
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to fetch alerts", 500);
    }
};

export const getAlertById = async (id: number): Promise<Alert | null> => {
    try {
        const result = await pool.query(`
            SELECT a.*, u.name as user_name
            FROM alerts a
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.id = $1
        `, [id]);

        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return {
            ...row,
            submitted_by: row.submitted_by || row.user_name || 'User'
        };
    } catch (error) {
        console.error(error);
        throw new AppError("Failed to fetch alert", 500);
    }
};

export const publishAlert = async (id: number): Promise<Alert> => {
    try {
        const result = await pool.query(
            `
            UPDATE alerts
            SET status = 'published', published_at = NOW(), updated_at = NOW()
            WHERE id = $1
            RETURNING *;
            `,
            [id]
        );

        if (result.rowCount === 0) {
            throw new AppError("Alert not found", 404);
        }

        const alert = result.rows[0];

        // Broadcast the alert to all users
        await notificationService.broadcastAlert(alert);

        return alert;

    } catch (error) {
        if (error instanceof AppError) throw error;
        console.error(error);
        throw new AppError("Failed to publish alert", 500);
    }
};

export const dismissAlert = async (id: number): Promise<Alert> => {
    try {
        const result = await pool.query(
            `
            UPDATE alerts
            SET status = 'dismissed', updated_at = NOW()
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
        throw new AppError("Failed to dismiss alert", 500);
    }
};

export const updateAlert = async (id: number, data: Partial<Alert>): Promise<Alert> => {
    try {
        const { title, message, severity, region } = data;

        const result = await pool.query(
            `
            UPDATE alerts
            SET title = COALESCE($1, title),
                message = COALESCE($2, message),
                severity = COALESCE($3, severity),
                region = COALESCE($4, region),
                updated_at = NOW()
            WHERE id = $5
            RETURNING *;
            `,
            [title, message, severity, region, id]
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

export const deleteAlert = async (id: number): Promise<boolean> => {
    try {
        const result = await pool.query(
            `DELETE FROM alerts WHERE id = $1`,
            [id]
        );

        return result.rowCount > 0;

    } catch (error) {
        console.error(error);
        throw new AppError("Failed to delete alert", 500);
    }
};
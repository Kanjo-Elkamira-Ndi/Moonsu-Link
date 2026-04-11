import { User } from "../routes/models/user";
import { pool } from "../db/pool";
import { AppError } from "../utils/AppError";

export const createUser = async ( data: Partial<User> & { platform: "telegram" | "whatsapp" | "sms" } ): Promise<User> => {
    try{
		const { name, phone, region, role, lang, platform, telegramId, telegramNumber, whatsappNumber } = data;
		// const id = randomUUID();
		let query: string = "";
		let values: any[] = [];

		if (platform === "telegram") {
			if (!telegramId) throw new AppError("Telegram ID is required for Telegram users", 400);
			query = `INSERT INTO users (name, region, role, lang, telegram_id, telegram_number)
					VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
			values = [name, region, role, lang, telegramId, telegramNumber];

		} else if (platform === "whatsapp") {
			if (!whatsappNumber) throw new AppError("WhatsApp number is required for WhatsApp users", 400);
			query = `INSERT INTO users (name, region, role, lang, whatsapp_number)
					VALUES ($1, $2, $3, $4, $5) RETURNING *`;
			values = [name, region, role, lang, whatsappNumber];

		} else if (platform === "sms") {
			if (!phone) throw new AppError("Phone number is required for SMS users", 400);
			query = `INSERT INTO users (name, region, role, lang, phone)
					VALUES ($1, $2, $3, $4, $5) RETURNING *`;
			values = [name, region, role, lang, phone];

		} else {
			throw new AppError(`Unsupported platform: ${platform}`, 400);
		}

		const result = await pool.query(query, values);
		return result.rows[0];
	} catch (error: any) {
		if (error.code === "23505") { // unique violation
			if (error.constraint.includes("phone")) {
				throw new AppError("Phone number already in use", 400);
			}
			if (error.constraint.includes("telegramId")) {
				throw new AppError("Telegram ID already in use", 400);
			}
			if (error.constraint.includes("telegramNumber")) {
				throw new AppError("Telegram number already in use", 400);
			}
			if (error.constraint.includes("whatsappNumber")) {
				throw new AppError("WhatsApp number already in use", 400);
			}
			if (error.constraint.includes("email")) {
				throw new AppError("Email already in use", 400);
			}
		}

		throw error;
	}
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User | null> => {
	try{
		const { pic_folder } = data;
		const result = await pool.query(
			`UPDATE users SET pic_folder = $1 WHERE id = $2 RETURNING *`,
			[pic_folder, id]
		);
	return result.rows[0] || null;
	} catch (error) {
		throw error;
	}
};

export const getUsers = async (): Promise<User[] > => {
	try{
		const result = await pool.query(`SELECT * FROM users`);
		return result.rows;
	} catch (error) {
		throw error;
	}
};

export const verifyUser = async (id: string): Promise<User | null> => {
	try {
		const result = await pool.query(
			`UPDATE users SET verified = true WHERE id = $1 RETURNING *`,
			[id]
		);
		return result.rows[0] || null;
	} catch (error) {
		throw error;
	}
};

export const getUserByPlatformId = async (id: string): Promise<User | null> => {
	try {		
		const result = await pool.query(`SELECT * FROM users WHERE telegram_id = $1 OR whatsapp_number = $1 OR phone = $1`, [id]);
		return result.rows[0] || null;
	} catch (error) {
		throw error;
	}
}

export const getUserById = async (id: string): Promise<User | null> => {
	try {
		const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
		return result.rows[0] || null;
	} catch (error) {
		throw error;
	}
};

export const linkUserAccount = async (
    userId: string,
    platform: "telegram" | "whatsapp" | "sms",
    identifier: string
): Promise<User> => {
    try {
        let column: string;

        if (platform === "telegram") column = "telegram_id";
        else if (platform === "whatsapp") column = "whatsapp_number";
        else if (platform === "sms") column = "phone";
        else throw new AppError(`Unsupported platform: ${platform}`, 400);

        const result = await pool.query(
            `UPDATE users 
             SET ${column} = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING *`,
            [identifier, userId]
        );

        if (result.rowCount === 0) {
            throw new AppError("User not found", 404);
        }

        return result.rows[0];

    } catch (error: any) {
        if (error.code === "23505") {
            throw new AppError(`${platform} account already linked to another user`, 400);
        }

        throw error;
    }
};

import { t } from '../config/templates';
import type { Lang } from '../config/templates';
import { createAlert } from './alertService';

export const setAlert = async ({ userId, crop, region, lang }: { userId: string; crop: string; region: string; lang: Lang }): Promise<string> => {
    try {
        const notice = `Price alert: ${crop} in ${region}`;
        await createAlert({
            user_id: userId,
            notice,
            advice: `We'll notify you when prices change for ${crop} in ${region}.`,
        });
        return t(lang, 'alert_set', { crop, region });
    } catch (error) {
        console.error('Error setting alert:', error);
        return t(lang, 'error_generic');
    }
};

export const usersService = { setAlert };
		


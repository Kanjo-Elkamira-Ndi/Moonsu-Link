import { User } from "../models/user";
import { pool } from "../db/pool";
import { AppError } from "../utils/AppError";
import { generateToken } from "../utils/JWT";

export const logUser = async (identifier: string): Promise<string> => {
    try {		
		const result = await pool.query(`SELECT * FROM users WHERE telegram_id = $1 OR whatsapp_number = $1 OR phone = $1`, [identifier]);
		let user = result.rows[0];

        // if user exist create his token else return failure
        if (!user) {
            throw new AppError("User not found", 404);
        }
        // Generate token
        const token = generateToken({ id: user.id, email: user.email, role: user.role, isVerified: user.verified });
        return token;

	} catch (error) {
		throw error;
	}
}

export const loging = async (name: string, email: string): Promise<string> => {
    try {
        const result = await pool.query(
            `SELECT * FROM users WHERE name = $1 AND email = $2 AND role = 'admin'`,
            [name, email]
        );
        const user = result.rows[0];
        const token = generateToken({ id: user.id, email: user.email, role: user.role, isVerified: user.verified });
        return token;
    } catch (error) {
        throw error;
    }
};

export const register = async (data: Partial<User> & { platform: "telegram" | "whatsapp" | "sms" }): Promise<{ user: User; token: string }> => {
    try {
        const { name, region, role, lang, platform, phone, telegramId, telegramNumber, whatsappNumber } = data;
        let query: string = "";
		let values: any[] = [];
        let identifier: string = "";
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
        const user = result.rows[0];
        const token = generateToken({ id: user.id, email: user.email, role: user.role, isVerified: user.verified });
        return { user, token };
    } catch (error) {
        if (error instanceof Object && "code" in error && error.code === "23505") { // unique violation
            if ("constraint" in error && typeof error.constraint === "string" && error.constraint.includes("phone")) {
                throw new AppError("Phone number already in use", 400);
            }
            if ("constraint" in error && typeof error.constraint === "string" && error.constraint.includes("telegramId")) {
                throw new AppError("Telegram ID already in use", 400);
            }
            if ("constraint" in error && typeof error.constraint === "string" && error.constraint.includes("telegramNumber")) {
                throw new AppError("Telegram number already in use", 400);
            }
            if ("constraint" in error && typeof error.constraint === "string" && error.constraint.includes("whatsappNumber")) {
                throw new AppError("WhatsApp number already in use", 400);
            }
            if ("constraint" in error && typeof error.constraint === "string" && error.constraint.includes("email")) {
                throw new AppError("Email already in use", 400);
            }
        }
        throw error;
    }
};
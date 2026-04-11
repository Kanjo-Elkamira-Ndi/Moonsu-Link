import { Router, Request, Response } from "express";
import { UnipileClient } from "unipile-node-sdk";
import { pool } from "../db/pool";
import { getUserByPlatformId, createUser } from "../services/userService";
import { AppError } from "../utils/AppError";
import { getGreeting, MAIN_MENU } from "../whatsapp/helpers";
import {
    handleCounter0,
    handleCounter1,
    handleCounter2,
    handleCounter3,
} from "../whatsapp/handlers";

const router = Router();

const client = new UnipileClient(
    process.env.UNIPILE_DSN!,
    process.env.UNIPILE_API_KEY!
);

router.post('/', async (req: Request, res: Response) => {
    try {
        const message = req.body;

        if (message.is_sender) return res.sendStatus(200);

        const chatId: string = message.chat_id;
        const messageId: string = message.message_id;
        const whatsappNumber: string = message.provider_chat_id?.split('@')[0];

        if (!chatId || !whatsappNumber || !messageId) {
            console.log("Missing required identifiers");
            return res.sendStatus(200);
        }

        // ── Resolve user ──────────────────────────────────────────────────────
        let user = await getUserByPlatformId(whatsappNumber);

        if (!user) {
            try {
                user = await createUser({
                    name: message.sender?.attendee_name || "New User",
                    region: 'General',
                    role: 'buyer',
                    lang: 'en',
                    platform: 'whatsapp',
                    whatsappNumber,
                });
            } catch (err: any) {
                if (err.message?.includes("already in use")) {
                    user = await getUserByPlatformId(whatsappNumber);
                } else {
                    throw err;
                }
            }
        }

        if (!user) {
            console.error("Could not resolve user for:", whatsappNumber);
            return res.sendStatus(500);
        }

        // ── Store chat_id if missing ──────────────────────────────────────────
        if (!user.chat_id) {
            user = (await pool.query(
                `UPDATE users SET chat_id = $1 WHERE id = $2 RETURNING *`,
                [chatId, user.id]
            )).rows[0];
        }

        if (!user) {
            console.error("Failed to update user chat_id");
            return res.sendStatus(500);
        }

        // ── Deduplicate messages ──────────────────────────────────────────────
        const insertResult = await pool.query(`
            INSERT INTO processed_messages (user_id, message_id, chat_id)
            VALUES ($1, $2, $3)
            ON CONFLICT (message_id) DO NOTHING
            RETURNING *;
        `, [user.id, messageId, chatId]);

        if (insertResult.rowCount === 0) return res.sendStatus(200);

        // ── Fetch or initialize counter ───────────────────────────────────────
        let counterResult = await pool.query(
            `SELECT * FROM message_counters WHERE user_id = $1`,
            [user.id]
        );

        if (counterResult.rowCount === 0) {
            counterResult = await pool.query(
                `INSERT INTO message_counters (user_id, counter, response) VALUES ($1, 1, 0) RETURNING *`,
                [user.id]
            );
            if (counterResult.rowCount === 0) {
                throw new AppError("Failed to create messaging counter", 500);
            }

            const send = (text: string) => client.messaging.sendMessage({ chat_id: chatId, text });
            await send(`${getGreeting()}, ${user.name}. How may we assist you today?`);
            await send(MAIN_MENU);
            return res.sendStatus(200);
        }

        const counter: number = counterResult.rows[0].counter;
        const responseCode: number = counterResult.rows[0].response;
        const incomingText: string = (message.message ?? "").trim();

        // ── Shared send helper ────────────────────────────────────────────────
        const send = async (text: string): Promise<void> => {
            await client.messaging.sendMessage({ chat_id: chatId, text });
        };

        const ctx = {
            userId: user.id,
            chatId,
            incomingText,
            userName: user.name,
            send,
        };

        // ── Route by counter ──────────────────────────────────────────────────
        if (counter === 0)      await handleCounter0(ctx);
        else if (counter === 1) await handleCounter1(ctx);
        else if (counter === 2) await handleCounter2(ctx, responseCode);
        else if (counter === 3) await handleCounter3(ctx, responseCode);
        else {
            await send("⚠️ *Something went wrong. Returning to main menu.*");
            await pool.query(
                `UPDATE message_counters SET counter = 0, response = 0 WHERE user_id = $1`,
                [user.id]
            );
        }

        res.sendStatus(200);

    } catch (error) {
        console.error("Webhook Error:", error);
        res.sendStatus(500);
    }
});

export default router;
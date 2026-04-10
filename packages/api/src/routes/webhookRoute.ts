import { Router, Request, Response } from "express";
import { UnipileClient } from "unipile-node-sdk";
import { pool } from "../db/pool";

const router = Router();

const client = new UnipileClient(
    process.env.UNIPILE_DSN!,
    process.env.UNIPILE_API_KEY!
);

router.post('/', async (req: Request, res: Response) => {
    try {
        console.log("Incoming message:", req.body);

        const message = req.body;

        // 🚫 ignore bot messages
        if (message.is_sender) {
            return res.sendStatus(200);
        }

        const chatId = message.chat_id;
        const messageId = message.message_id;
        const whatsappNumber = message.provider_chat_id.split('@')[0];

        if (!chatId) {
            console.log("No chat_id found");
            return res.sendStatus(200);
        }

        const result = await pool.query(`
            INSERT INTO processed_messages (user_id, message_id, chat_id)
            VALUES ('dd1e4d39-1c39-4d6e-b85b-63bfbc3ee479' , $1, $2)
            ON CONFLICT (message_id) DO NOTHING
            RETURNING *;
        `, [messageId, chatId]);

        if (result.rowCount === 0) {
            // already processed
            return;
        }

        await client.messaging.sendMessage({
            chat_id: chatId,
            text: `hello world ${whatsappNumber}`, // or message.message
        });

        res.sendStatus(200);
    } catch (error) {
        console.error("Error:", error);
        res.sendStatus(500);
    }
});

export default router;
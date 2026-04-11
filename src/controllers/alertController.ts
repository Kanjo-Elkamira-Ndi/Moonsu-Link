import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import * as alertService from "../services/alertService";
import { UnipileClient } from "unipile-node-sdk"
import { getUserById, getUsers } from "../services/userService";
import { pool } from "../db/pool";

export const createAlert = async (req: Request, res: Response) => {
    try {
        const { user_id, notice, advice } = req.body;
    
        if (!user_id || !notice) {
            throw new AppError("Missing required fields: user_id, notice", 400);
        }
        const alert = await alertService.createAlert({ user_id, notice, advice });
        return res.status(201).json(alert);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getAlerts = async (_req: Request, res: Response) => {
    try {
        const alerts = await alertService.getAlerts();
        return res.json(alerts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getAlertById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const alert = await alertService.getAlertById(Number(id));
        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }
        return res.json(alert);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getAlertsByUser = async (req: Request, res: Response) => {
    try {
        const user_id = req.params.user_id as string;
        const alerts = await alertService.getAlertsByUserId(user_id);
        return res.json(alerts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const verifyAlert = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const alert = await alertService.verifyAlert(Number(id));
        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }
        return res.json(alert);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateAlert = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { notice, advice } = req.body;
        const alert = await alertService.updateAlert(Number(id), { notice, advice });
        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }
        return res.json(alert);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getVerifyAlert = async (req: Request, res: Response) => {
    try {
        const alert = await alertService.getVerifyAlert();
        if (!alert) {
            return res.status(404).json([])
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

const client = new UnipileClient(
    process.env.UNIPILE_DSN!,
    process.env.UNIPILE_API_KEY!
);

export const broadcastAlert = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const alert = await alertService.getAlertById(Number(id));
        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }

        const [users, sender] = await Promise.all([
            getUsers(),
            getUserById(alert.user_id),
        ]);

        const recipients = users.filter(u => u.chat_id);

        // Send to all, collect failures without crashing
        const results = await Promise.allSettled(
            recipients.map(user =>
                client.messaging.sendMessage({
                    chat_id: user.chat_id!,
                    text: `*Notice:* ${alert.notice}\n*Advice:* ${alert.advice}\n~This message was provided by ${sender?.name ?? "Unknown"}~`,
                })
            )
        );

        const failed = results.filter(r => r.status === "rejected");
        if (failed.length > 0) {
            console.error(`Broadcast: ${failed.length}/${recipients.length} messages failed`);
        }

        await pool.query(
            `UPDATE alerts SET broadcasted = true WHERE id = $1`,
            [alert.id]
        );

        res.status(200).json({
            message: "Broadcast complete",
            sent: recipients.length - failed.length,
            failed: failed.length,
        });

    } catch (error) {
        console.error("Broadcast error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
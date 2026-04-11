import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import * as alertService from "../services/alertService";

export const createAlert = async (req: Request, res: Response) => {
    try {
        const { user_id, title, message, severity = 'warning', region, submitted_by = 'Admin' } = req.body;

        if (!title || !message) {
            throw new AppError("Missing required fields: title, message", 400);
        }

        const alert = await alertService.createAlert({
            user_id,
            title,
            message,
            severity,
            region,
            submitted_by
        });

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
        const { user_id } = req.params;
        const alerts = await alertService.getAlertsByUserId(user_id);
        return res.json(alerts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const publishAlert = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const alert = await alertService.publishAlert(Number(id));
        return res.json(alert);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const dismissAlert = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const alert = await alertService.dismissAlert(Number(id));
        return res.json(alert);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateAlert = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, message, severity, region } = req.body;
        const alert = await alertService.updateAlert(Number(id), { title, message, severity, region });
        return res.json(alert);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const deleteAlert = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await alertService.deleteAlert(Number(id));
        if (!deleted) {
            return res.status(404).json({ message: "Alert not found" });
        }
        return res.json({ message: "Alert deleted successfully" });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};
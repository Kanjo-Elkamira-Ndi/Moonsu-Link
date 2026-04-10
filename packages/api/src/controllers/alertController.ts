import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import * as alertService from "../services/alertService";

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
        const { user_id } = req.params;
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
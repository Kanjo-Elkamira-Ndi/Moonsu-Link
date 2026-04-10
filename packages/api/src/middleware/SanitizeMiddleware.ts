import { Request, Response, NextFunction } from "express";
import { sanitizeObject } from "../utils/sanitize";

export const sanitizeRequest = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.body) {
                req.body = sanitizeObject(req.body);
            }

            if (req.query) {
                req.query = sanitizeObject(req.query);
            }

            if (req.params) {
                req.params = sanitizeObject(req.params);
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Error sanitizing request data"
            });
        }
    };
};
import { Request, Response, NextFunction } from "express";
import { sanitizeObject } from "../utils/sanitize";

export const sanitizeRequest = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.body) {
                req.body = sanitizeObject(req.body);
            }

            if (req.query) {
                const sanitizedQuery = sanitizeObject(req.query);
                Object.keys(sanitizedQuery).forEach((key) => {
                    req.query[key] = sanitizedQuery[key];
                });
            }

            if (req.params) {
                const sanitizedParams = sanitizeObject(req.params);
                Object.keys(sanitizedParams).forEach((key) => {
                    req.params[key] = sanitizedParams[key];
                });
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
import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/JWT";
import { AppError } from "../utils/AppError";

type AllowedRoles = string | string[] | "All";

export const authorize = (allowedRoles: AllowedRoles) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new AppError("No token provided", 401);
            }

            const token = authHeader.split(" ")[1];

            const decoded: JwtPayload = verifyToken(token);

            (req as any).user = decoded;

            if (allowedRoles === "All") {
                return next();
            }

            const userRole = decoded.role;

            if (Array.isArray(allowedRoles)) {
                if (!allowedRoles.includes(userRole)) {
                    throw new AppError("Access denied", 403);
                }
                return next();
            }

            if (userRole !== allowedRoles) {
                throw new AppError("Access denied", 403);
            }

            next();

        } catch (error: any) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Token expired" });
            }

            if (error.name === "JsonWebTokenError") {
                return res.status(401).json({ message: "Invalid token" });
            }

            if (error instanceof AppError) {
                return res.status(error.statusCode).json({
                    message: error.message
                });
            }

            console.error(error);
            return res.status(500).json({ message: "Server error" });
        }
    };
};
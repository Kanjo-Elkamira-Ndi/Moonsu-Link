import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

export interface JwtPayload {
  id: string;
  email?: string;
  role: string;
  isVerified: boolean;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: "1d",
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, SECRET_KEY) as JwtPayload;
};
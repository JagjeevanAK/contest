import type { NextFunction, Request, Response } from "express";
import { JWT_SECRATE } from "../config";
import jwt from "jsonwebtoken";
import type { JwtUserPayload } from "../types";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            "success": false,
            "data": null,
            "error": "UNAUTHORIZED"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRATE) as JwtUserPayload;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            "success": false,
            "data": null,
            "error": "UNAUTHORIZED"
        });
    }
}
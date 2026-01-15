import type { NextFunction, Request, Response } from "express";

export type Role = "creator" | "contestee";

export const roleMiddleware = (...allowedRoles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            "success": false,
            "data": null,
            "error": "UNAUTHORIZED"
        });
    }

    const { role } = req.user;

    if (!role) {
        return res.status(400).json({
            "success": false,
            "data": null,
            "error": "INVALID_REQUEST"
        });
    }

    if (!allowedRoles.includes(role.toLowerCase() as Role)) {
      return res.status(403).json({
        success: false,
        data: null,
        error: "FORBIDDEN"
      });
    }
    
    next();
}
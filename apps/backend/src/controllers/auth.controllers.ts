import type { Request, Response } from "express";
import { prisma, Role } from "@repo/db";
import jwt from "jsonwebtoken";
import { JWT_SECRATE } from "../config";

export const signupController = async (req: Request, res: Response) => {
    const { 
        name, 
        email, 
        password, 
        role = "contestee"
    } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "INVALID_REQUEST"
        })
    }

    const roleUpper = role.toUpperCase();
    if (roleUpper !== Role.CREATOR && roleUpper !== Role.CONTESTEE) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "INVALID_REQUEST"
        })
    }
    const userRole = roleUpper as Role;

    if (password.length < 10) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "PASSWORD_LENGTH"
        })
    }

    const isPresent = await prisma.user.findFirst({
        where: { email }
    });

    if (isPresent) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "EMAIL_ALREADY_EXISTS"
        })
    }

    try {
        const data = await prisma.user.create({
            data: {
                name,
                email,
                password,
                role: userRole
            }
        });

        return res.status(201).json({
            success: true,
            data: {
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role.toLowerCase()
            },
            error: null
        });
    } catch (err) {
        console.error("Error while creating user", err)
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
}

export const signinController = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "INVALID_REQUEST"
        });
    }

    try {
        const isPresent = await prisma.user.findFirst({
            where: {
                email,
                password
            }
        });

        if (!isPresent) {
            return res.status(401).json({
                success: false,
                data: null,
                error: "INVALID_CREDENTIALS"
            });
        }

        const userData = await prisma.user.findFirst({
            where: {
                email
            }
        });

        const token = await jwt.sign({
            id: userData?.id,
            email,
            role: userData?.role
        }, JWT_SECRATE);

        res.status(200).json({
            success: true,
            data: {
                token: token
            },
            error: null
        });
    } catch (err) {
        console.error("Error during searching user: ", err);
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER"
        });
    }
}
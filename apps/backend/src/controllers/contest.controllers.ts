import { prisma } from "@repo/db";
import type { Request, Response } from "express"

export const newContestController = async (req: Request, res: Response) => {
    const { 
        title,
        description,
        startTime,
        endTime 
    } = req.body;

    if (!title || !description || !startTime || !endTime) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "INVALID_REQUEST"
        });
    }

    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "INVALID_DATE_FORMAT"
        });
    }

    if (parsedStartTime >= parsedEndTime) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "INVALID_DATE_RANGE"
        });
    }
    
    const { email } = req.user!;

    try {
        const userData = await prisma.user.findFirst({
            where: {
                email
            }
        });

        const contestData = await prisma.contest.create({
            data: {
                title,
                description,
                startTime: parsedStartTime,
                endTime: parsedEndTime,
                user: {
                    connect: {
                        id: userData!.id
                    }
                }
            }
        });

        return res.status(201).json({
            success: true,
            data: {
                id: contestData.id,
                title: contestData.title,
                description: contestData.description,
                creatorID: contestData.creatorID,
                startTime: contestData.startTime,
                endTime: contestData.endTime,
            },
            error: null
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
}

export const getContestController = async (req: Request, res: Response) => {
    const { contestId } = req.params;

    if (!contestId) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "CONTEST_NOT_FOUND"
        });
    }

    try {
        const contestData = await prisma.contest.findFirst({
            where: {
                id: contestId
            }
        });

        if (!contestData){
            return res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: contestData.id,
                title: contestData.title,
                description: contestData.description,
                startTime: contestData.startTime,
                endTime: contestData.endTime,
                creatorId: contestData.creatorId,
                mcqs: [
                    {
                        id: contestData.mcqs.id,
                        questionText: contestData.mcqs.questionText,
                        options: contestData.mcqs.options,
                        points: contestData.mcqs.points
                    }
                ],
                dsaProblems:[
                    {
                        id: contestData.dsaProblems.id,
                        title: contestData.dsaProblems.title,
                        description: contestData.dsaProblems.description,
                        tags: contestData.dsaProblems.tags,
                        points: contestData.dsaProblems.points,
                        timeLimit: contestData.dsaProblems.timeLimit,
                        memoryLimit: contestData.dsaProblems.memoryLimit
                    }
                ]
            },
            error: null
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
}

export const getLeaderboardController = async (req: Request, res: Response) => {
    try {
        const { contestId } = req.params;

        if (!contestId) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST"
            });
        }

        const leaderboardData = await prisma.leaderboard.findMany({
            where: {
                contestId: contestId
            }
        });

        if (!leaderboardData) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "LEADERBOARD_NOT_FOUND"
            });
        }

        return res.status(200).json({
            success: true,
            data: [...leaderboardData],
            error: null
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
}

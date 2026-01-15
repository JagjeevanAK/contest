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
          error: "INVALID_REQUEST",
        });
    }

    if (parsedStartTime >= parsedEndTime) {
        return res.status(400).json({
          success: false,
          data: null,
          error: "INVALID_REQUEST",
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
                creatorId: contestData.creatorID,
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
            },
            include: {
                mcqs: true,
                dsaProblems: true
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
                creatorId: contestData.creatorID,
                mcqs: contestData.mcqs.map(mcq => ({
                    id: mcq.id,
                    questionText: mcq.questionText,
                    options: mcq.options,
                    points: mcq.points
                })),
                dsaProblems: contestData.dsaProblems.map(problem => ({
                    id: problem.id,
                    title: problem.title,
                    description: problem.description,
                    tags: problem.tags,
                    points: problem.points,
                    timeLimit: problem.timeLimit,
                    memoryLimit: problem.memoryLimit
                }))
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

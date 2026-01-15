import { prisma } from "@repo/db";
import type { Response, Request } from "express";

export const addMcqQuestionController = async(req: Request, res: Response) => {
    const { contestId } = req.params;
    const { 
        questionText,
        options,
        correctOptionIndex,
        points
    } = req.body;

    if (!contestId || !questionText || !options || !correctOptionIndex || !points) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "INVALID_REQUEST"
        });
    }

    try {
        const contest = await prisma.contest.findUnique({
            where: {
                id: contestId
            }
        });

        if (!contest) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND"
            });
        }

        const question = await prisma.mcqQuestion.create({
            data: {
                questionText,
                options,
                correctOptionIndex,
                points,
                contestId
            }
        });

        return res.status(201).json({
            success: true,
            data: {
                id: question.id,
                contestId: question.contestId
            },
            error: null
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        });
    }

}

export const submitMcqAnswerController = async(req: Request, res: Response) => {
    const { contestId, questionId } = req.params;
    const { selectedOptionIndex } = req.body;
    const userId = req.user?.id;

    if (!contestId || !questionId || !selectedOptionIndex || !userId) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "INVALID_REQUEST"
        });
    }
    
    try {
        const contest = await prisma.contest.findUnique({
            where: {
                id: contestId
            }
        });

        if (!contest) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND"
            });
        }

        const now = new Date();

        const currentTime = now.toLocaleTimeString()

        if (contest.endTime <= currentTime) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_ACTIVE"
            });
        }

        const question = await prisma.mcqQuestion.findUnique({
            where: {
                id: questionId
            }
        });

        if (!question) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "QUESTION_NOT_FOUND"
            });
        }

        const submissionStatus = await prisma.mcqSubmission.findUnique({
            where: {
                userId,
                questionId
            }
        }); 

        if (submissionStatus) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "ALREADY_SUBMITTED"
            });
        }

        const status = question.correctOptionIndex === selectedOptionIndex;
        const points = status ? question.points : 0;

        const answer = await prisma.mcqSubmission.create({
            data: {
                questionId,
                selectedOptionIndex,
                pointsEarned:points,
            }
        });

        return res.status(201).json({
            success: true,
            data: {
                isCorrect: status,
                pointsEarned: points
            },
            error: null
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
}

export const addDsaQuestionController = async(req: Request, res: Response) => {
    const { contestId } = req.params;
    const {
        title,
        description,
        tags,
        points,
        timeLimit,
        memoryLimit,
        testCases
    } = req.body;

    if (!title || !description || !tags || !points || !timeLimit || !memoryLimit || !testCases || !contestId) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "INVALID_REQUEST"
        });
    }

    try {
        const contest = await prisma.contest.findUnique({
            where: {
                id: contestId
            }
        });

        if (!contest) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND"
            });
        }

        const question = await prisma.dsaProblem.create({
            data: {
                title,
                description,
                tags,
                points,
                timeLimit,
                memoryLimit,
                testCases,
                contestId
            }
        });

        return res.status(201).json({
            success: true,
            data: {
                id: question.id,
                contestId: question.contestId
            },
            error: null
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
}


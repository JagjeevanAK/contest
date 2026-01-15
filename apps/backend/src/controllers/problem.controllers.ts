import { prisma } from "@repo/db";
import type { Request, Response } from "express";

export const DSAQuestionsController = async (req: Request, res: Response) => {
    const { problemId } = req.params;

    if (!problemId) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "INVALID_REQUEST"
        });
    }

    try {
        const problem = await prisma.dsaProblem.findUnique({
            where: {
                id: problemId
            }
        });

        if (!problem) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "PROBLEM_NOT_FOUND"
            });
        }

        return res.status(200).json({
            success: true,
            data: problem,
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

export const submitCodeDSAController = async (req: Request, res: Response) => {
    const { problemId } = req.params;
    const { code, language } = req.body;
    const { id } = req.user!;

    if (!problemId || !code || !language) {
        return res.status(400).json({
            success: false,
            data: null,
            error: "INVALID_REQUEST"
        });
    }

    try {
        const problem = await prisma.dsaProblem.findUnique({
            where: {
                id: problemId
            }
        });

        if (!problem) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "PROBLEM_NOT_FOUND"
            });
        }

        const contest = await prisma.contest.findUnique({
            where: {
                id: problem.contestId
            }
        });

        const now = new Date();

        const time = now.toLocaleTimeString();

        if (time >= contest.endTime || time <= contest.startTime) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_ACTIVE"
            });
        }
        
        const submmitedQuestion = await prisma.dsaSubmission.create({
          data: {
            userId: id,
            code,
            language,
            status: "running"
          },
        });

        return res.status(200).json({
          success: true,
          data: {
            status: submmitedQuestion.status,
            pointsEarned: submmitedQuestion.pointsEarned,
            testCasesPassed: submmitedQuestion.totalCasesPassed,
            totalTestCases: submmitedQuestion.totalTestCases,
          },
          error: null,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            data: null,
            error: "INTERNAL_SERVER_ERROR"
        });
    }
}

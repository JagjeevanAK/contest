import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

async function connectPrismaClient() {
    try {
        await prisma.$connect();
    } catch (error) {
        console.log("PRISMA CLIENT COULD NOT CONNECT", error);
    }
}

connectPrismaClient();

export { Role } from "@prisma/client";
export type { User, Contest, DsaProblem, DsaSubmission, McqQuestion, McqSubmission, TestCase } from "@prisma/client";

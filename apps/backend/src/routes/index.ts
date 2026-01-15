import { Router } from "express";
import auth from "./auth.routes";
import contests from "./constest.routes"
import problems from "./problems.routes"
import { authMiddleware } from "../middleware/auth.middleware";

const router: Router = Router();

router.use("/auth", auth);
router.use("/contests", authMiddleware, contests);
router.use("/problems", authMiddleware, problems);

export default router;
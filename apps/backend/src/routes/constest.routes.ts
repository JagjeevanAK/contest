import { Router } from "express";
import { 
    addDsaQuestionController, 
    addMcqQuestionController, 
    getContestController, 
    getLeaderboardController, 
    newContestController, 
    submitMcqAnswerController 
} from "../controllers";
import { roleMiddleware } from "../middleware";

const router: Router = Router();

router.post("/",roleMiddleware("creator"), newContestController);
router.get("/:contestId",getContestController);
router.post("/:contestId/leaderboard", getLeaderboardController)
router.post("/:contestId/dsa", roleMiddleware("creator"), addDsaQuestionController);
router.post("/:contestId/mcq", roleMiddleware("creator"), addMcqQuestionController);
router.post('/:contestId/mcq/:questionId/submit', roleMiddleware("contestee"), submitMcqAnswerController);

export default router;
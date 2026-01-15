import { Router } from "express";
import { roleMiddleware } from "../middleware";
import { 
    DSAQuestionsController, 
    submitCodeDSAController 
} from "../controllers";

const router: Router = Router();

router.get("/:problemId", DSAQuestionsController);
router.post("/:problemId/submit", roleMiddleware("contestee"), submitCodeDSAController);


export default router;
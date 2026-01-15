import { Router } from "express";
import { signinController, signupController } from "../controllers";

const router: Router = Router();

router.post("/signup", signupController);
router.post("/login", signinController);

export default router;
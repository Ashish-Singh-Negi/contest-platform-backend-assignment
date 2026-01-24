import { Router } from "express";
import { signup } from "../controllers/auth-controllers/signup";
import { login } from "../controllers/auth-controllers/login";
import { createContest } from "../controllers/contest-controllers/createContest";
import { authMiddleware } from "../middleware/authMiddleware";
import { getContest } from "../controllers/contest-controllers/getContest";
import { addMcqQuestion } from "../controllers/contest-controllers/addMcqQuestion";
import { submitMcqAnswer } from "../controllers/contest-controllers/submitMcqAnswer";
import { addDsaProblem } from "../controllers/dsa-problem-controllers/addDsaProblem";
import { getDsaProblem } from "../controllers/dsa-problem-controllers/getDsaProblem";
import { submitDsaSolution } from "../controllers/dsa-problem-controllers/submitDsaSolution";

const router = Router();

// auth controllers
router.post("/auth/signup", signup);
router.post("/auth/login", login);

// contests controllers
router.post("/contests", authMiddleware, createContest);
router.get("/contests/:contestId", authMiddleware, getContest);
router.post("/contests/:contestId/mcq", authMiddleware, addMcqQuestion);
router.post(
  "/contests/:contestId/mcq/:questionId/submit",
  authMiddleware,
  submitMcqAnswer,
);

// dsa problem controllers
router.post("/contests/:contestId/dsa", authMiddleware, addDsaProblem);
router.get("/problems/:problemId", authMiddleware, getDsaProblem);
router.post("/problems/:problemId/submit", authMiddleware, submitDsaSolution);

export default router;

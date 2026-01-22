import { Router } from "express";
import { signup } from "../controllers/auth-controllers/signup";
import { login } from "../controllers/auth-controllers/login";
import { createContest } from "../controllers/contest-controllers/createContest";
import { authMiddleware } from "../middleware/authMiddleware";
import { getContest } from "../controllers/contest-controllers/getContest";
import { addMcqQuestion } from "../controllers/contest-controllers/addMcqQuestion";
import { submitMcqAnswer } from "../controllers/contest-controllers/submitMcqAnswer";
import { addDsaProblem } from "../controllers/contest-controllers/addDsaProblem";

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
router.post("/contests/:contestId/dsa", authMiddleware, addDsaProblem);

export default router;

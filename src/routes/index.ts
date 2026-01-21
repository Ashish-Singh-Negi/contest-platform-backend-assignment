import { Router } from "express";
import { signup } from "../controllers/authController/signup";
import { login } from "../controllers/authController/login";
import { createContest } from "../controllers/contestControllers/createContest";
import { authMiddleware } from "../middleware/authMiddleware";
import { getContest } from "../controllers/contestControllers/getContest";
import { addMcqQuestion } from "../controllers/contestControllers/addMcqQuestion";

const router = Router();

// auth controllers
router.post("/auth/signup", signup);
router.post("/auth/login", login);

// contests controllers
router.post("/contests", authMiddleware, createContest);
router.get("/contests/:contestId", authMiddleware, getContest);
router.post("/contests/:contestId/mcq", authMiddleware, addMcqQuestion);

export default router;

import { Router } from "express";
import { signup } from "../controllers/authController/signup";

const router = Router();

// auth countrollers
router.post("/auth/signup", signup);

export default router;

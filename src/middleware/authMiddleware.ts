import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { errorResponse } from "../utils/responses";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authToken = req.headers.authorization;

  if (!authToken || !authToken.startsWith(`Bearer `)) {
    res.status(401).json(errorResponse("UNAUTHORIZED"));
    return;
  }

  const token = authToken.split(" ")[1] || "";

  try {
    const tokenDecoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as JwtPayload;

    req.user = {
      userId: tokenDecoded.userId,
      email: tokenDecoded.email,
      role: tokenDecoded.role,
    };

    next();
  } catch (error) {
    console.error("Error while authenticating token ", error);
    return res.status(401).json(errorResponse("UNAUTHORIZED"));
  }
}

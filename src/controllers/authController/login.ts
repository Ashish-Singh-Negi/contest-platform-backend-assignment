import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { LoginSchema } from "../../validations/loginZodSchema";
import { errorResponse, successResponse } from "../../utils/responses";
import { prisma } from "../../../lib/prisma";

export async function login(req: Request, res: Response) {
  const data = req.body;

  // validate req body
  const parseResult = LoginSchema.safeParse(data);
  if (!parseResult.success) {
    res.status(400).json(errorResponse("INVALID_REQUEST"));
    return;
  }

  const { email, password } = parseResult.data;

  try {
    const user = await prisma.users.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      res.status(401).json(errorResponse("INVALID_CREDENTIALS"));
      return;
    }

    // compare password with stored in db
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      res.status(401).json(errorResponse("INVALID_CREDENTIALS"));
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
    );

    res.status(200).json(successResponse(token));
  } catch (error) {
    console.error("Error while login user ", error);
    return res.status(500).json(errorResponse("INTERNAL_SERVER_ERROR"));
  }
}

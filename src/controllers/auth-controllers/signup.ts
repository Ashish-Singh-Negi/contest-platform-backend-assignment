import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../../../lib/prisma.js";
import { errorResponse, successResponse } from "../../utils/responses.js";
import {} from "../../validations/userZodSchema.js";
import {
  SignupSchema,
  type SignupSchemaType,
} from "../../validations/signupZodSchema.js";
import {
  EMAIL_ALREADY_EXISTS,
  INTERNAL_SERVER_ERROR,
  INVALID_REQUEST,
} from "../../utils/constants.js";

export async function signup(req: Request, res: Response) {
  const data = req.body as SignupSchemaType;

  // validate req body
  const parsedResult = SignupSchema.safeParse(data);
  if (!parsedResult.success) {
    res.status(400).json(errorResponse(INVALID_REQUEST));
    return;
  }

  const { name, email, password, role } = parsedResult.data;

  try {
    // check if user already exists or not
    const userEmailExists = await prisma.users.findFirst({
      where: {
        email: email,
      },
    });
    if (userEmailExists) {
      res.status(400).json(errorResponse(EMAIL_ALREADY_EXISTS));
      return;
    }

    // hash password before storing to db
    const hashPassword = await bcrypt.hash(password, 12);

    const user = await prisma.users.create({
      data: {
        name: name,
        email: email,
        password: hashPassword,
        role: role,
      },
      omit: {
        password: true,
        created_at: true,
      },
    });

    res.status(201).json(successResponse(user));
  } catch (error) {
    console.error("Error while user signup", error);
    return res.status(500).json(errorResponse(INTERNAL_SERVER_ERROR));
  }
}

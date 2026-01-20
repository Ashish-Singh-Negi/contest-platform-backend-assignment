import type { Request, Response } from "express";
import { prisma } from "../../../lib/prisma.js";
import { errorResponse, successResponse } from "../../utils/responses.js";
import {
  signupSchema,
  type signupSchemaType,
} from "../../validations/signupZod.js";

export async function signup(req: Request, res: Response) {
  const data = req.body as signupSchemaType;

  const parsedResult = signupSchema.safeParse(data);
  if (!parsedResult.success) {
    res.status(400).json(errorResponse(""));
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
      res.status(400).json(errorResponse("EMAIL_ALREADY_EXISTS"));
      return;
    }

    const user = await prisma.users.create({
      data: {
        name: name,
        email: email,
        password: password,
        role: role,
      },
      omit: {
        password: true,
        created_at: true,
      },
    });

    res.status(201).json(successResponse(user));
  } catch (error) {
    console.error("Error in sigup user", error);
    res.status(500);
    return;
  }
}

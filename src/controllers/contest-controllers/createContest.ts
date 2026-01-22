import type { Request, Response } from "express";
import {
  CreateContestSchema,
  type CreateContestSchemaType,
} from "../../validations/createContestZodSchema";
import { errorResponse, successResponse } from "../../utils/responses";
import { prisma } from "../../../lib/prisma";
import {
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  INVALID_REQUEST,
} from "../../utils/constants";

export async function createContest(req: Request, res: Response) {
  const data = req.body as CreateContestSchemaType;

  // check user role
  if (req.user.role !== "creator") {
    res.status(403).json(errorResponse(FORBIDDEN));
    return;
  }

  // validate req body
  const parsedResult = CreateContestSchema.safeParse(data);
  if (!parsedResult.success) {
    res.status(400).json(errorResponse(INVALID_REQUEST));
    return;
  }

  const { title, description, startTime, endTime } = parsedResult.data;

  try {
    const contest = await prisma.contests.create({
      data: {
        title,
        description,
        creator_id: req.user.userId,
        start_time: startTime,
        end_time: endTime,
      },
    });

    res.status(201).json(
      successResponse({
        id: contest.id,
        title: contest.title,
        description: contest.description,
        creatorId: contest.creator_id,
        startTime: contest.start_time,
        endTime: contest.end_time,
      }),
    );
  } catch (error) {
    console.error("Error while create contest ", error);
    return res.status(500).json(errorResponse(INTERNAL_SERVER_ERROR));
  }
}

import type { Request, Response } from "express";
import {
  SubmitDsaSolutionParamsSchema,
  SubmitDsaSolutionSchema,
  type SubmitDsaSolutionParamsSchemaType,
  type SubmitDsaSolutionSchemaType,
} from "../../validations/submitDsaSolutionZodSchema";
import { errorResponse, successResponse } from "../../utils/responses";
import {
  CONTEST_NOT_ACTIVE,
  CONTEST_NOT_FOUND,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  INVALID_REQUEST,
  PROBLEM_NOT_FOUND,
} from "../../utils/constants";
import { prisma } from "../../../lib/prisma";
import { isContestActive } from "../../utils/isContestActive";

export async function submitDsaSolution(req: Request, res: Response) {
  // check user role
  if (req.user.role !== "contestee") {
    res.status(403).json(errorResponse(FORBIDDEN));
    return;
  }

  // validate request params
  const parsed = SubmitDsaSolutionParamsSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json(errorResponse(INVALID_REQUEST));
  }

  const { problemId } = parsed.data;

  // validate request body
  const parsedResult = SubmitDsaSolutionSchema.safeParse(req.body);
  if (!parsedResult.success) {
    res.status(400).json(INVALID_REQUEST);
    return;
  }

  const { code, language } = parsedResult.data;

  try {
    // check dsa problem with problemId exist or not
    const dsaProblemRecord = await prisma.dsaProblems.findFirst({
      where: {
        id: problemId,
      },
    });
    if (!dsaProblemRecord) {
      res.status(404).json(errorResponse(PROBLEM_NOT_FOUND));
      return;
    }

    // check contest with contestId exist or not
    const contestRecord = await prisma.contests.findFirst({
      where: {
        id: dsaProblemRecord.contest_id,
      },
    });
    if (!contestRecord) {
      res.status(404).json(errorResponse(CONTEST_NOT_FOUND));
      return;
    }

    // check contest currently ACTIVE OR NOT
    const isActive = isContestActive(
      contestRecord.start_time,
      contestRecord.end_time,
    );
    if (!isActive) {
      res.status(400).json(errorResponse(CONTEST_NOT_ACTIVE));
      return;
    }

    res.status(201).json(successResponse([]));
  } catch (error) {
    console.error("Error while dsa solution submit ", error);
    return res.status(500).json(errorResponse(INTERNAL_SERVER_ERROR));
  }
}

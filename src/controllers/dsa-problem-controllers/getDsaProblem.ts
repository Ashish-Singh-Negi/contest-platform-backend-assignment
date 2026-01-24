import type { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/responses";
import {
  INTERNAL_SERVER_ERROR,
  INVALID_REQUEST,
  PROBLEM_NOT_FOUND,
} from "../../utils/constants";
import { prisma } from "../../../lib/prisma";
import { DsaProblemParamsSchema } from "../../validations/dsaProblemParamsZodSchema.ts";

export async function getDsaProblem(req: Request, res: Response) {
  // validate req params
  const parsed = DsaProblemParamsSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json(errorResponse(INVALID_REQUEST));
    return;
  }

  const { problemId } = parsed.data;

  try {
    // check problem with problemId exists or not
    const dsaProblemRecord = await prisma.dsaProblems.findFirst({
      where: {
        id: problemId,
      },
      select: {
        id: true,
        contest_id: true,
        title: true,
        description: true,
        tags: true,
        points: true,
        memory_limit: true,
        time_limit: true,
        testCases: {
          where: {
            is_hidden: false,
          },
          select: {
            input: true,
            expected_output: true,
          },
        },
      },
    });
    if (!dsaProblemRecord) {
      res.status(404).json(errorResponse(PROBLEM_NOT_FOUND));
      return;
    }

    res.status(200).json(
      successResponse({
        id: dsaProblemRecord.id,
        contestId: dsaProblemRecord.contest_id,
        title: dsaProblemRecord.title,
        description: dsaProblemRecord.description,
        tags: dsaProblemRecord.tags,
        points: dsaProblemRecord.points,
        timeLimit: dsaProblemRecord.time_limit,
        memoryLimit: dsaProblemRecord.memory_limit,
        visibleTestCases: dsaProblemRecord.testCases,
      }),
    );
  } catch (error) {
    console.log("Error while fetch dsa problem ", error);
    return res.status(500).json(errorResponse(INTERNAL_SERVER_ERROR));
  }
}

import type { Request, Response } from "express";
import {
  AddDsaProblemSchema,
  type AddDsaProblemSchemaType,
} from "../../validations/addDsaProblemZodSchema";
import { errorResponse, successResponse } from "../../utils/responses";
import {
  CONTEST_NOT_FOUND,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  INVALID_REQUEST,
} from "../../utils/constants";
import { prisma } from "../../../lib/prisma";

export async function addDsaProblem(req: Request, res: Response) {
  const contestId = Number(req.params.contestId);
  const data = req.body as AddDsaProblemSchemaType;

  // check user role
  if (req.user.role !== "creator") {
    res.status(403).json(errorResponse(FORBIDDEN));
    return;
  }

  // validations
  const parseResult = AddDsaProblemSchema.safeParse(data);
  if (!parseResult.success) {
    res.status(400).json(errorResponse(INVALID_REQUEST));
    return;
  }

  const {
    title,
    description,
    tags,
    points,
    memoryLimit,
    timeLimit,
    testCases,
  } = parseResult.data;

  try {
    // check contest with contestId exist or not
    const isContestExist = await prisma.contests.findFirst({
      where: {
        id: contestId,
      },
    });
    if (!isContestExist) {
      res.status(404).json(errorResponse(CONTEST_NOT_FOUND));
      return;
    }

    // create Dsa problem in db
    const createDsaProblemRecord = await prisma.dsaProblems.create({
      data: {
        title,
        description,
        tags,
        points,
        time_limit: timeLimit,
        memory_limit: memoryLimit,
        contest_id: contestId,
      },
    });

    const testCasesRecords = testCases.map((testcase) => {
      return {
        input: testcase.input,
        expected_output: testcase.expectedOutput,
        is_hidden: testcase.isHidden,
        problem_id: createDsaProblemRecord.id,
      };
    });

    await prisma.testCases.createMany({
      data: testCasesRecords,
    });

    res.status(201).json(
      successResponse({
        id: createDsaProblemRecord.id,
        contestId: contestId,
      }),
    );
  } catch (error) {
    console.error("Error while adding dsa problem", error);
    return res.status(500).json(errorResponse(INTERNAL_SERVER_ERROR));
  }
}

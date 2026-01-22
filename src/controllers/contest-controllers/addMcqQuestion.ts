import type { Request, Response } from "express";
import {
  AddMcqQuestionSchema,
  type AddMcqQuestionSchemaType,
} from "../../validations/addMcqQuestionZodSchema";
import { errorResponse } from "../../utils/responses";
import { prisma } from "../../../lib/prisma";
import {
  CONTEST_NOT_FOUND,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  INVALID_REQUEST,
} from "../../utils/constants";

export async function addMcqQuestion(req: Request, res: Response) {
  const data = req.body as AddMcqQuestionSchemaType;
  const contestId = Number(req.params.contestId);

  // check user role
  if (req.user.role !== "creator") {
    res.status(403).json(errorResponse(FORBIDDEN));
    return;
  }

  // validate req body
  const parsedResult = AddMcqQuestionSchema.safeParse(data);
  if (!parsedResult.success) {
    res.status(400).json(errorResponse(INVALID_REQUEST));
    return;
  }

  const { questionText, options, points, correctOptionIndex } =
    parsedResult.data;

  try {
    // check contest with contestId exist
    const contest = await prisma.contests.findFirst({
      where: {
        id: contestId,
      },
      select: {
        id: true,
      },
    });
    if (!contest) {
      res.status(404).json(errorResponse(CONTEST_NOT_FOUND));
      return;
    }

    // create mcq question
    const mcqQuestion = await prisma.mcqQuestions.create({
      data: {
        question_text: questionText,
        options: options,
        correct_option_index: correctOptionIndex,
        points: points,
        contest_id: contest.id,
      },
    });

    res.status(201).json({
      id: mcqQuestion.id,
      contestId: contest.id,
    });
  } catch (error) {
    console.error("Error while adding mcq to contest ", error);
    return res.status(500).json(INTERNAL_SERVER_ERROR);
  }
}

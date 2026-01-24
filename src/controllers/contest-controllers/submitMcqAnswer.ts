import type { Request, Response } from "express";
import {
  SubmitMcqAnswerSchema,
  type SubmitMcqAnswerSchemaType,
} from "../../validations/submitMcqAnswerZodSchema";
import { errorResponse, successResponse } from "../../utils/responses";
import { prisma } from "../../../lib/prisma";
import {
  ALREADY_SUBMITTED,
  CONTEST_NOT_ACTIVE,
  CONTEST_NOT_FOUND,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  INVALID_REQUEST,
  QUESTION_NOT_FOUND,
} from "../../utils/constants";
import { isContestActive } from "../../utils/isContestActive";
import { SubmitMcqParamsSchema } from "../../validations/submitMcqParamsZodSchema";

export async function submitMcqAnswer(req: Request, res: Response) {
  // check user role
  if (req.user.role !== "contestee") {
    res.status(403).json(errorResponse(FORBIDDEN));
    return;
  }

  // validate req params
  const parsedParams = SubmitMcqParamsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json(errorResponse(INVALID_REQUEST));
    return;
  }

  const { contestId, questionId } = parsedParams.data;

  // validate req body
  const parsedResult = SubmitMcqAnswerSchema.safeParse(req.body);
  if (!parsedResult.success) {
    res.status(400).json(INVALID_REQUEST);
    return;
  }

  const { selectedOptionIndex } = parsedResult.data;

  try {
    // check contest with contestId exist or not
    const contest = await prisma.contests.findFirst({
      where: {
        id: contestId,
      },
    });
    if (!contest) {
      res.status(404).json(errorResponse(CONTEST_NOT_FOUND));
      return;
    }

    // check contest currently ACTIVE OR NOT
    const isActive = isContestActive(contest.start_time, contest.end_time);
    if (!isActive) {
      res.status(400).json(errorResponse(CONTEST_NOT_ACTIVE));
      return;
    }

    // check answer already submitted or not
    const isSubmitted = await prisma.mcqSubmissions.findFirst({
      where: {
        user_id: req.user.userId,
        question_id: questionId,
      },
    });
    if (isSubmitted) {
      res.status(400).json(errorResponse(ALREADY_SUBMITTED));
      return;
    }

    // check mcq question with questionId exist or not
    const mcqQuestion = await prisma.mcqQuestions.findFirst({
      where: {
        id: questionId,
      },
    });
    if (!mcqQuestion) {
      res.status(400).json(errorResponse(QUESTION_NOT_FOUND));
      return;
    }

    const isCorrect = selectedOptionIndex === mcqQuestion.correct_option_index;
    let pointsEarned = isCorrect ? mcqQuestion.points : 0;

    console.log("🚀 ~ submitMcqAnswer ~ isCorrect:", isCorrect, pointsEarned);
    console.log("🚀 ~ submitMcqAnswer ~ questionid:", questionId);

    const userId = req.user.userId;

    // save submission in db
    const mcqSubmission = await prisma.mcqSubmissions.create({
      data: {
        user_id: userId,
        question_id: questionId,
        is_correct: isCorrect,
        points_earned: pointsEarned,
        selected_option_index: selectedOptionIndex,
      },
    });

    res.status(201).json(
      successResponse({
        isCorrect: mcqSubmission.is_correct,
        pointsEarned: mcqSubmission.points_earned,
      }),
    );
  } catch (error) {
    console.error("Error while mcq answer submit ", error);
    return res.status(500).json(errorResponse(INTERNAL_SERVER_ERROR));
  }
}

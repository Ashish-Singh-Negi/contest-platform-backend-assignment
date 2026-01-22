import type { Request, Response } from "express";
import {
  SubmitMcqAnswerSchema,
  type SubmitMcqAnswerSchemaType,
} from "../../validations/submitMcqAnswerZodSchema";
import { errorResponse, successResponse } from "../../utils/responses";
import { prisma } from "../../../lib/prisma";

export async function submitMcqAnswer(req: Request, res: Response) {
  if (req.user.role !== "contestee") {
    res.status(403).json(errorResponse("FORBIDDEN"));
    return;
  }

  const contestId = Number(req.params.contestId);
  const questionId = Number(req.params.questionId);
  const data = req.body as SubmitMcqAnswerSchemaType;

  const parsedResult = SubmitMcqAnswerSchema.safeParse(data);
  if (!parsedResult.success) {
    res.status(400).json("INVALID_REQUEST");
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
      res.status(404).json(errorResponse("CONTEST_NOT_FOUND"));
      return;
    }

    // check contest currently ACTIVE OR NOT
    const currentTime = new Date().getTime();
    const contestStartTime = new Date(contest.start_time).getTime();
    const contestEndTime = new Date(contest.end_time).getTime();
    const isActive =
      currentTime > contestStartTime && currentTime < contestEndTime;
    if (!isActive) {
      res.status(400).json(errorResponse("CONTEST_NOT_ACTIVE"));
      return;
    }

    // check answer already submitted or not
    const isMcqSubmission = await prisma.mcqSubmissions.findFirst({
      where: {
        user_id: req.user.userId,
        question_id: questionId,
      },
    });
    if (isMcqSubmission) {
      res.status(400).json(errorResponse("ALREADY_SUBMITTED"));
      return;
    }

    // check mcq question with questionId exist or not
    const mcqQuestion = await prisma.mcqQuestions.findFirst({
      where: {
        id: questionId,
      },
    });
    if (!mcqQuestion) {
      res.status(400).json(errorResponse("QUESTION_NOT_FOUND"));
    }

    const isCorrect = selectedOptionIndex === mcqQuestion?.correct_option_index;
    let points = 0;
    if (isCorrect) {
      points = mcqQuestion.points;
    }

    // save submission in db
    const mcqSubmission = await prisma.mcqSubmissions.create({
      data: {
        user_id: req.user.userId,
        question_id: questionId,
        is_correct: isCorrect,
        points_earned: points,
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
    return res.status(500).json(errorResponse(""));
  }
}

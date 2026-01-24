import type { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/responses";
import { prisma } from "../../../lib/prisma";
import {
  CONTEST_NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  INVALID_REQUEST,
} from "../../utils/constants";
import { ContestParamsSchema } from "../../validations/contestParamsZodSchema";

export async function getContest(req: Request, res: Response) {
  const parsed = ContestParamsSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(404).json(errorResponse(CONTEST_NOT_FOUND));
  }

  const { contestId } = parsed.data;

  console.log("Contest id ", contestId);

  try {
    // find contest with contestId
    const contestRecord = await prisma.contests.findFirst({
      where: {
        id: contestId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        start_time: true,
        end_time: true,
        creator_id: true,
        mcqs: {
          select: {
            id: true,
            question_text: true,
            options: true,
            points: true,
          },
        },
        dsaProblems: {
          select: {
            id: true,
            title: true,
            description: true,
            tags: true,
            points: true,
            time_limit: true,
            memory_limit: true,
          },
        },
      },
    });
    if (!contestRecord) {
      res.status(404).json(errorResponse(CONTEST_NOT_FOUND));
      return;
    }

    res.status(200).json(
      successResponse({
        id: contestRecord.id,
        title: contestRecord.title,
        description: contestRecord.description,
        startTime: contestRecord.start_time,
        endTime: contestRecord.start_time,
        creatorId: contestRecord.creator_id,
        mcqs: contestRecord.mcqs,
        dsaProblems: contestRecord.dsaProblems,
      }),
    );
  } catch (error) {
    console.error(`Error while fetch contest ${contestId}`, error);
    return res.status(500).json(errorResponse(INTERNAL_SERVER_ERROR));
  }
}

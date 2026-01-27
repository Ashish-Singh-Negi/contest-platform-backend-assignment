import type { Request, Response } from "express";
import {
  SubmitDsaSolutionParamsSchema,
  SubmitDsaSolutionSchema,
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
import { runCodeWithTestcases } from "../../utils/runCodeWithTestcase";

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
    res.status(400).json(errorResponse(INVALID_REQUEST));
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
    // const isActive = isContestActive(
    //   contestRecord.start_time,
    //   contestRecord.end_time,
    // );
    // if (!isActive) {
    //   res.status(400).json(errorResponse(CONTEST_NOT_ACTIVE));
    //   return;
    // }

    // find all testcases with problemId
    const testcasesRecord = await prisma.testCases.findMany({
      where: {
        problem_id: problemId,
      },
    });

    let totalTestcases = 0;
    let testcasePassed = 0;
    let testcasesResults = [];
    let submissionData: {
      status:
        | "time_limit_exceeded"
        | "runtime_error"
        | "wrong_answer"
        | "accepted";
      pointsEarned: number;
      testCasesPassed: number;
      totalTestCases: number;
      executionTime?: number; // ms
    };

    for (const testcase of testcasesRecord) {
      const totalTestcasesAre = Number(testcase.input.split("\n")[0]);
      const expectedTestcaseOutputs = testcase.expected_output
        .split("\n")
        .map((output) => output.split(" ").map(Number));

      totalTestcases += totalTestcasesAre;

      let outputIndex = 0;
      // runing user code with each testcase
      for (let i = 1; i < totalTestcasesAre * 2; i = i + 2) {
        const testcaseAre = testcase.input.split("\n");

        // extract length and target for problem.input
        const targetElement = Number(testcaseAre[i]?.split(" ")[1]);
        const testcaseArray = testcaseAre[i + 1]?.split(" ").map(Number);

        const result = await runCodeWithTestcases(
          code,
          testcaseArray!,
          targetElement,
          expectedTestcaseOutputs[outputIndex++],
        );

        testcasesResults.push(result);

        if (
          result.status === "runtime_error" ||
          result.status === "time_limit_exceeded"
        ) {
          break;
        }
      }
    }

    let executionTime = 0;
    let fatalStatus: "time_limit_exceeded" | "runtime_error" | null = null;

    for (const result of testcasesResults) {
      executionTime += result.executionTime;

      if (result.success == true) {
        testcasePassed++;
        continue;
      } else if (result.status === "runtime_error") {
        fatalStatus = "runtime_error";
        break;
      } else if (result.status === "time_limit_exceeded") {
        fatalStatus = "time_limit_exceeded";
        break;
      }

      // status = wrong_answer then keep iterating
    }

    const averageExecutionTime =
      testcasesResults.length > 0 ? executionTime / testcasesResults.length : 0;

    if (fatalStatus) {
      submissionData = {
        status: fatalStatus,
        pointsEarned: 0,
        testCasesPassed: testcasePassed,
        totalTestCases: totalTestcases,
        executionTime: averageExecutionTime,
      };
    } else if (testcasePassed === totalTestcases) {
      submissionData = {
        status: "accepted",
        pointsEarned: dsaProblemRecord.points,
        testCasesPassed: testcasePassed,
        totalTestCases: totalTestcases,
        executionTime: averageExecutionTime,
      };
    } else {
      // calculate points earned
      const pointsEarned = Math.floor(
        (testcasePassed / totalTestcases) * dsaProblemRecord.points,
      );

      submissionData = {
        status: "wrong_answer",
        pointsEarned,
        testCasesPassed: testcasePassed,
        totalTestCases: totalTestcases,
        executionTime: averageExecutionTime,
      };
    }

    await prisma.dsaSubmissions.create({
      data: {
        problem_id: problemId,
        user_id: req.user.userId,
        code: code,
        language: language,
        status: submissionData.status,
        points_earned: submissionData.pointsEarned,
        test_cases_passed: submissionData.testCasesPassed,
        total_test_cases: submissionData.totalTestCases,
        execution_time: averageExecutionTime,
      },
    });

    res.status(201).json(successResponse(submissionData!));
  } catch (error) {
    console.error("Error while dsa solution submit ", error);
    return res.status(500).json(errorResponse(INTERNAL_SERVER_ERROR));
  }
}

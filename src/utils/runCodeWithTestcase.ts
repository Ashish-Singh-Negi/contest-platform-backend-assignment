import { execFile } from "node:child_process";
import { writeFile } from "node:fs/promises";

type RunResult =
  | { success: true; status: "accepted"; executionTime: number }
  | {
      success: false;
      status: "time_limit_exceeded" | "runtime_error" | "wrong_answer";
      executionTime: number;
    };

async function runCodeWithTestcases(
  code: string,
  input: number[],
  target: number,
  expectedOutput?: number[],
): Promise<RunResult> {
  const fileName = `./testcases/solution_${Date.now()}_${Math.random()}.js`;

  await writeFile(
    fileName,
    `${code}\nconsole.log(JSON.stringify(twoSum(${JSON.stringify(input)}, ${target})));`,
    "utf-8",
  );

  return new Promise<RunResult>((resolve) => {
    const start = process.hrtime.bigint();

    execFile("node", [fileName], { timeout: 100 }, (error, stdout) => {
      const end = process.hrtime.bigint();
      const executionTimeMs = Number(end - start) / 1e6;

      if (error) {
        if (error.killed && error.signal === "SIGTERM") {
          resolve({
            success: false,
            status: "time_limit_exceeded",
            executionTime: executionTimeMs,
          });
        } else {
          resolve({
            success: false,
            status: "runtime_error",
            executionTime: executionTimeMs,
          });
        }
        return;
      }

      const actualOutput = stdout.trim();

      if (expectedOutput) {
        const expected = JSON.stringify(expectedOutput);

        if (actualOutput === expected) {
          resolve({
            success: true,
            status: "accepted",
            executionTime: executionTimeMs,
          });
        } else {
          resolve({
            success: false,
            status: "wrong_answer",
            executionTime: executionTimeMs,
          });
        }
      } else {
        resolve({
          success: true,
          status: "accepted",
          executionTime: executionTimeMs,
        });
      }
    });
  });
}

export { runCodeWithTestcases };

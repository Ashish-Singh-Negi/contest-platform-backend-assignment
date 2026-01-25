import { execFile } from "node:child_process";
import { writeFile } from "node:fs/promises";

// child process
async function runCodeWithTestcases(
  code: string,
  input: number[],
  target: number,
  expectedOutput?: number[],
) {
  const fileName = `solution_${Date.now()}_${Math.random()}.js`;

  await writeFile(
    fileName,
    `${code} console.log(JSON.stringify(twoSum(${JSON.stringify(input)}, ${target})));`,
    "utf-8",
  );

  return new Promise<void>((resolve) => {
    execFile("node", [fileName], { timeout: 1000 }, (error, stdout, stderr) => {
      if (error) {
        console.error("Execution failed:", error.message);
        resolve();
        return;
      }

      const actualOutput = stdout.trim();

      if (expectedOutput) {
        const expected = JSON.stringify(expectedOutput);
        console.log(
          actualOutput === expected ? "✅ PASS" : "❌ FAIL",
          "Expected:",
          expected,
          "Got:",
          actualOutput,
        );
      } else {
        console.log("Output:", actualOutput);
      }

      resolve();
    });
  });
}

export { runCodeWithTestcases };

import z from "zod";

const SubmitMcqAnswerSchema = z
  .object({
    selectedOptionIndex: z.coerce.number().int().nonnegative(),
  })
  .strict();

export { SubmitMcqAnswerSchema };

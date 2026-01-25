import z from "zod";

const SubmitMcqAnswerSchema = z
  .object({
    selectedOptionIndex: z.number().nonnegative(),
  })
  .strict();

type SubmitMcqAnswerSchemaType = z.infer<typeof SubmitMcqAnswerSchema>;

export { SubmitMcqAnswerSchema, type SubmitMcqAnswerSchemaType };

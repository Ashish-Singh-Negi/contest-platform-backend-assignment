import z from "zod";

const SubmitMcqAnswerSchema = z
  .object({
    selectedOptionIndex: z.number().nonnegative(),
  })
  .required();

type SubmitMcqAnswerSchemaType = z.infer<typeof SubmitMcqAnswerSchema>;

export { SubmitMcqAnswerSchema, type SubmitMcqAnswerSchemaType };

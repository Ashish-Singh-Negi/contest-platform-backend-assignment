import z from "zod";

const AddMcqQuestionSchema = z
  .object({
    questionText: z.string().trim(),
    options: z.array(z.string()).nonempty().length(4),
    correctOptionIndex: z.number().min(0).max(4),
    points: z.number().nonnegative(),
  })
  .strict();

type AddMcqQuestionSchemaType = z.infer<typeof AddMcqQuestionSchema>;

export { AddMcqQuestionSchema, type AddMcqQuestionSchemaType };

import z from "zod";

const AddMcqQuestionSchema = z
  .object({
    questionText: z.string().trim(),
    options: z.array(z.string()).nonempty(), // TODO specify array length
    correctOptionIndex: z.number().nonnegative(),
    points: z.number().nonnegative(),
  })
  .required();

type AddMcqQuestionSchemaType = z.infer<typeof AddMcqQuestionSchema>;

export { AddMcqQuestionSchema, type AddMcqQuestionSchemaType };

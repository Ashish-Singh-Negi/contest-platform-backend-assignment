import z from "zod";

const SubmitMcqParamsSchema = z
  .object({
    contestId: z.coerce.number().int().positive(),
    questionId: z.coerce.number().int().positive(),
  })
  .strict();

type SubmitMcqParamsSchemaType = z.infer<typeof SubmitMcqParamsSchema>;

export { SubmitMcqParamsSchema, type SubmitMcqParamsSchemaType };

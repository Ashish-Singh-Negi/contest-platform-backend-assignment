import { z } from "zod";

const ContestParamsSchema = z.object({
  contestId: z.coerce.number().int().positive(),
});

type ContestParamsSchemaType = z.infer<typeof ContestParamsSchema>;

export { ContestParamsSchema, type ContestParamsSchemaType };

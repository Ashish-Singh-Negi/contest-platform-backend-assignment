import { z } from "zod";

const DsaProblemParamsSchema = z.object({
  problemId: z.coerce.number().int().positive(),
});

type DsaProblemParamsSchemaType = z.infer<typeof DsaProblemParamsSchema>;

export { DsaProblemParamsSchema, type DsaProblemParamsSchemaType };

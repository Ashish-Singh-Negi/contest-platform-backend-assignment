import z from "zod";

const SubmitDsaSolutionParamsSchema = z.object({
  problemId: z.coerce.number().int().positive(),
});

type SubmitDsaSolutionParamsSchemaType = z.infer<
  typeof SubmitDsaSolutionParamsSchema
>;

const SubmitDsaSolutionSchema = z
  .object({
    code: z.string().trim(),
    language: z.string().trim(),
  })
  .required();

type SubmitDsaSolutionSchemaType = z.infer<typeof SubmitDsaSolutionSchema>;

export {
  SubmitDsaSolutionSchema,
  type SubmitDsaSolutionSchemaType,
  SubmitDsaSolutionParamsSchema,
  type SubmitDsaSolutionParamsSchemaType,
};

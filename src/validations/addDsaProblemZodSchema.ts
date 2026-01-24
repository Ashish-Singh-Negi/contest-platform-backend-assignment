import z from "zod";

const AddDsaProblemSchema = z
  .object({
    title: z.string().trim(),
    description: z.string().trim(),
    tags: z.array(z.string()).nonempty(),
    points: z.number().nonnegative(),
    timeLimit: z.number().nonnegative(),
    memoryLimit: z.number().nonnegative(),
    testCases: z
      .array(
        z
          .object({
            input: z.string().trim(),
            expectedOutput: z.string().trim(),
            isHidden: z.boolean(),
          })
          .required(),
      )
      .nonempty(),
  })
  .required();

type AddDsaProblemSchemaType = z.infer<typeof AddDsaProblemSchema>;

export { AddDsaProblemSchema, type AddDsaProblemSchemaType };

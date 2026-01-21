import z from "zod";

const CreateContestSchema = z.object({
  title: z.string().trim(),
  description: z.string().trim(),
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
});

type CreateContestSchemaType = z.infer<typeof CreateContestSchema>;

export { CreateContestSchema, type CreateContestSchemaType };

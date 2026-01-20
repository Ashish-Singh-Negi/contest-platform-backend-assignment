import { z } from "zod";

export const userRole = z.enum(["creator", "contestee"]);
export const signupSchema = z
  .object({
    name: z.string().trim(),
    email: z.email().trim(),
    password: z.string().trim(),
    role: userRole.default("contestee"),
  })
  .required();

export type signupSchemaType = z.infer<typeof signupSchema>;

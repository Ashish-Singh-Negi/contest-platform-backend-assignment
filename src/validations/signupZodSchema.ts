import type z from "zod";
import { UserRole, UserSchema } from "./userZodSchema";

const SignupSchema = UserSchema.omit({
  id: true,
  role: true,
})
  .extend({
    role: UserRole.default("contestee"),
  })
  .strict();

type SignupSchemaType = z.infer<typeof SignupSchema>;

export { SignupSchema };

export type { SignupSchemaType };

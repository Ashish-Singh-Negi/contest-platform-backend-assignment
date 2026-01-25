import type z from "zod";
import { UserSchema } from "./userZodSchema";

const LoginSchema = UserSchema.omit({
  id: true,
  role: true,
  name: true,
}).strict();

type LoginSchemaType = z.infer<typeof LoginSchema>;

export { LoginSchema };

export type { LoginSchemaType };

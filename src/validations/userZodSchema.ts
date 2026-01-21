import { z } from "zod";

const UserRole = z.enum(["creator", "contestee"]);
const UserSchema = z.object({
  id: z.number(),
  name: z.string().trim(),
  email: z.email().trim(),
  password: z.string().trim(),
  role: UserRole,
});

export { UserSchema, UserRole };

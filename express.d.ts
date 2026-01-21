import type { UserRole } from "./src/validations/userZodSchema";

declare global {
  declare namespace Express {
    export interface Request {
      user: {
        userId: number;
        email: string;
        role: "creator" | "contestee";
      };
    }
  }
}

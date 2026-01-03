import type { AuthenticateUserSchema, UserSessionSchema } from "@/schemas/auth";
import type z from "zod";

export type AuthenticateUserI = z.infer<typeof AuthenticateUserSchema>;
export type UserSessionI = z.infer<typeof UserSessionSchema>;

import { z } from "zod";

// Zod `message` values are i18n keys under the `validation` namespace; they
// are translated at the form render site via next-intl (useTranslations).

// Login schema
export const LoginSchema = z.object({
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
  password: z.string().min(6, "passwordMin"),
});

// Register schema
export const RegisterSchema = z.object({
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
  password: z.string().min(6, "passwordMin"),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "passwordsNoMatch",
  path: ["confirmPassword"],
});

// Password reset request schema
const PasswordResetRequestSchema = z.object({
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
});

// Password reset confirm schema
export const PasswordResetConfirmSchema = z.object({
  password: z.string().min(6, "passwordMin"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "passwordsNoMatch",
  path: ["confirmPassword"],
});

// Update profile schema
const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, "firstNameEmpty").optional(),
  lastName: z.string().min(1, "lastNameEmpty").optional(),
  avatarUrl: z.string().url("urlInvalid").or(z.literal("")).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Update password schema
export const UpdatePasswordSchema = z.object({
  password: z.string().min(6, "passwordMin"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "passwordsNoMatch",
  path: ["confirmPassword"],
});

// Export inferred types
export type LoginI = z.infer<typeof LoginSchema>;
export type RegisterI = z.infer<typeof RegisterSchema>;
export type PasswordResetRequestI = z.infer<typeof PasswordResetRequestSchema>;
export type PasswordResetConfirmI = z.infer<typeof PasswordResetConfirmSchema>;
export type UpdateProfileI = z.infer<typeof UpdateProfileSchema>;
type UpdatePasswordI = z.infer<typeof UpdatePasswordSchema>;
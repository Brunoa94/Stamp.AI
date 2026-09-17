import { z } from "zod";

// Zod `message` values are i18n keys under the `validation` namespace; they
// are translated at the form render site via next-intl (useTranslations).

// Minimum length for a NEW password; mirrors minimum_password_length in
// supabase/config.toml. Login only checks presence so accounts created under
// the previous minimum can still sign in (and rotate their password).
export const PASSWORD_MIN_LENGTH = 8;

// Login schema (client-side form validation)
export const LoginSchema = z.object({
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
  password: z.string().min(1, "passwordRequired"),
});

// Login API request schema (server-side validation)
export const LoginRequestSchema = z.object({
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
  password: z.string().min(1, "passwordRequired"),
  captchaToken: z.string().min(1).nullable().optional(),
});

// Register schema
export const RegisterSchema = z.object({
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Signup starts email verification. The password is chosen only after the
// email owner follows the confirmation link.
export const SignupRequestSchema = z.object({
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  captchaToken: z.string().min(1).nullable().optional(),
});

// Resend confirmation API request schema
export const ResendConfirmationSchema = z.object({
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
  captchaToken: z.string().min(1).nullable().optional(),
});

export const UnconfirmedAuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string().nullable(),
});

// Password reset request schema
const PasswordResetRequestSchema = z.object({
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
});

// Password reset confirm schema
export const PasswordResetConfirmSchema = z.object({
  password: z.string().min(PASSWORD_MIN_LENGTH, "passwordMin"),
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
  password: z.string().min(PASSWORD_MIN_LENGTH, "passwordMin"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "passwordsNoMatch",
  path: ["confirmPassword"],
});

// Export inferred types
export type LoginI = z.infer<typeof LoginSchema>;
export type LoginRequestI = z.infer<typeof LoginRequestSchema>;
export type RegisterI = z.infer<typeof RegisterSchema>;
export type SignupRequestI = z.infer<typeof SignupRequestSchema>;
export type PasswordResetRequestI = z.infer<typeof PasswordResetRequestSchema>;
export type PasswordResetConfirmI = z.infer<typeof PasswordResetConfirmSchema>;
export type UpdateProfileI = z.infer<typeof UpdateProfileSchema>;
type UpdatePasswordI = z.infer<typeof UpdatePasswordSchema>;

import { z } from "zod";

// Login schema
export const LoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Register schema
export const RegisterSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Password reset request schema
export const PasswordResetRequestSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

// Password reset confirm schema
export const PasswordResetConfirmSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Update profile schema
export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, "First name cannot be empty").optional(),
  lastName: z.string().min(1, "Last name cannot be empty").optional(),
  avatarUrl: z.string().url("Invalid URL format").or(z.literal("")).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Update password schema
export const UpdatePasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Export inferred types
export type LoginI = z.infer<typeof LoginSchema>;
export type RegisterI = z.infer<typeof RegisterSchema>;
export type PasswordResetRequestI = z.infer<typeof PasswordResetRequestSchema>;
export type PasswordResetConfirmI = z.infer<typeof PasswordResetConfirmSchema>;
export type UpdateProfileI = z.infer<typeof UpdateProfileSchema>;
export type UpdatePasswordI = z.infer<typeof UpdatePasswordSchema>;
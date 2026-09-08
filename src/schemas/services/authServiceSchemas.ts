import { z } from "zod";

/**
 * Auth Service Schemas
 * Validation schemas for authentication service operations with Supabase Auth
 */

/**
 * Schema for Supabase User metadata
 */
const SupabaseUserMetadataSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
}).passthrough(); // Allow additional metadata fields

/**
 * Schema for Supabase User object
 */
const SupabaseUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  user_metadata: SupabaseUserMetadataSchema.optional(),
  app_metadata: z.record(z.string(), z.any()).optional(),
  aud: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  confirmed_at: z.string().optional(),
  email_confirmed_at: z.string().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
});

/**
 * Schema for Supabase Session object
 */
const SupabaseSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  expires_at: z.number().optional(),
  token_type: z.string(),
  user: SupabaseUserSchema,
});

/**
 * Schema for Supabase Auth Response (login/register)
 */
export const SupabaseAuthResponseSchema = z.object({
  user: SupabaseUserSchema.nullable(),
  session: SupabaseSessionSchema.nullable(),
});

/**
 * Schema for getUser response
 */
export const GetUserResponseSchema = z.object({
  user: SupabaseUserSchema.nullable(),
});

/**
 * Schema for getSession response
 */
export const GetSessionResponseSchema = z.object({
  session: SupabaseSessionSchema.nullable(),
});

/**
 * Schema for updateUser response
 */
export const UpdateUserResponseSchema = z.object({
  user: SupabaseUserSchema,
});

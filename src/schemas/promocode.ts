import { z } from "zod";

/**
 * Zod schema for a promo code record from the database
 */
export const PromoCodeSchema = z.object({
  promocode_id: z.string(),
  code: z.string(),
  type: z.enum(["percentage", "numeric"]),
  value: z.number(),
  created_at: z.string().nullable(),
});

/**
 * Zod schema for the validated/applied promo code
 */
export const AppliedPromoCodeSchema = z.object({
  code: z.string(),
  type: z.enum(["percentage", "numeric"]),
  value: z.number(),
  discountValue: z.number(),
});

/**
 * Zod schema for the promo code validation payload
 */
export const ValidatePromoCodePayloadSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().positive(),
});

/**
 * Zod schema for the promo code validation result
 */
export const PromoCodeValidationResultSchema = z.object({
  isValid: z.boolean(),
  message: z.string(),
  appliedPromo: AppliedPromoCodeSchema.nullable(),
});

/**
 * Inferred TypeScript types from Zod schemas
 */
export type PromoCodeTypeT = z.infer<typeof PromoCodeSchema>["type"];
export type PromoCodeT = z.infer<typeof PromoCodeSchema>;
export type AppliedPromoCodeI = z.infer<typeof AppliedPromoCodeSchema>;
export type ValidatePromoCodePayload = z.infer<typeof ValidatePromoCodePayloadSchema>;
export type PromoCodeValidationResult = z.infer<typeof PromoCodeValidationResultSchema>;

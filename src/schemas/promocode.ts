import { z } from "zod";

/**
 * Zod schema for a promo code record from the database.
 *
 * Types: "percentage" takes value% off the subtotal, "numeric" takes a
 * fixed value (euros) off, and "fixed_total" sets the final
 * all-inclusive order total (shipping included) to value euros.
 */
export const PromoCodeSchema = z.object({
  promocode_id: z.string(),
  code: z.string(),
  type: z.enum(["percentage", "numeric", "fixed_total"]),
  value: z.number(),
  created_at: z.string().nullable(),
});

/**
 * Zod schema for the validated/applied promo code
 */
const AppliedPromoCodeSchema = z.object({
  code: z.string(),
  type: z.enum(["percentage", "numeric", "fixed_total"]),
  value: z.number(),
  discountValue: z.number(),
});

/**
 * Zod schema for the promo code validation result
 */
const PromoCodeValidationResultSchema = z.object({
  isValid: z.boolean(),
  message: z.string(),
  appliedPromo: AppliedPromoCodeSchema.nullable(),
});

/**
 * Zod schema for validating promo code input
 */
const ValidatePromoCodePayloadSchema = z.object({
  code: z.string(),
  subtotal: z.number(),
});

/**
 * Inferred TypeScript types from Zod schemas
 */
type PromoCodeTypeT = z.infer<typeof PromoCodeSchema>["type"];
export type PromoCodeT = z.infer<typeof PromoCodeSchema>;
type AppliedPromoCodeI = z.infer<typeof AppliedPromoCodeSchema>;
export type ValidatePromoCodePayload = z.infer<typeof ValidatePromoCodePayloadSchema>;
export type PromoCodeValidationResult = z.infer<typeof PromoCodeValidationResultSchema>;

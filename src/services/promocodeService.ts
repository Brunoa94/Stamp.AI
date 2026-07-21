import { createClient } from "@/lib/supabase/client";
import {
  PromoCodeValidationResult,
  ValidatePromoCodePayload,
  PromoCodeT,
  PromoCodeSchema,
} from "@/schemas/promocode";

export class PromoCodeService {
  private static getSupabase() {
    return createClient();
  }

  static async getAvailablePromoCodes(): Promise<PromoCodeT[]> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from("promocodes")
      .select("promocode_id, code, type, value, created_at")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data
      .map((item) => PromoCodeSchema.safeParse(item))
      .filter((result) => result.success)
      .map((result) => result.data);
  }

  static async validatePromoCode({
    code,
    subtotal,
  }: ValidatePromoCodePayload): Promise<PromoCodeValidationResult> {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      return {
        isValid: false,
        message: "Please enter a promo code.",
        appliedPromo: null,
      };
    }

    if (subtotal <= 0) {
      return {
        isValid: false,
        message: "Your cart total must be greater than 0.",
        appliedPromo: null,
      };
    }

    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from("promocodes")
      .select("promocode_id, code, type, value, created_at")
      .eq("code", normalizedCode)
      .single();

    if (error || !data) {
      return {
        isValid: false,
        message: "Invalid promo code.",
        appliedPromo: null,
      };
    }

    const promo = data as PromoCodeT;

    const discountRaw =
      promo.type === "percentage"
        ? subtotal * (promo.value / 100)
        : promo.value;

    const discountValue = Math.max(0, Math.min(discountRaw, subtotal));

    return {
      isValid: true,
      message: "Promo code applied.",
      appliedPromo: {
        code: promo.code,
        type: promo.type,
        value: promo.value,
        discountValue,
      },
    };
  }
}

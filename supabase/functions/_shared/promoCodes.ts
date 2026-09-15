import { supabaseRest } from "./supabase.ts";

/** A `promocodes` row as needed for discount calculation. */
export interface PromoCodeRowI {
  code: string;
  type: string;
  value: number;
}

/**
 * Load a promo code rule from the database (service role). Returns null when
 * the code does not exist. The caller must pass a normalised code
 * (see `normalizePromoCode`).
 */
export async function fetchPromoCodeRule(code: string): Promise<PromoCodeRowI | null> {
  const result = await supabaseRest<PromoCodeRowI[]>(
    `promocodes?code=eq.${encodeURIComponent(code)}&select=code,type,value&limit=1`,
    "GET",
  );
  if (result.error) {
    throw new Error("Failed to load promo code");
  }
  const row = result.data?.[0];
  return row ? { code: row.code, type: row.type, value: Number(row.value) } : null;
}

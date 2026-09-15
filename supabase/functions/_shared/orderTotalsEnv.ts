import { resolveOrderTotalsConfig, type OrderTotalsConfigI } from "./orderTotals.ts";

/** Order totals configuration from the edge function environment. */
export function getOrderTotalsConfig(): OrderTotalsConfigI {
  return resolveOrderTotalsConfig({
    ORDER_CURRENCY: Deno.env.get("ORDER_CURRENCY"),
    ORDER_VAT_RATE_BPS: Deno.env.get("ORDER_VAT_RATE_BPS"),
    ORDER_SHIPPING_COST_CENTS: Deno.env.get("ORDER_SHIPPING_COST_CENTS"),
    ORDER_FREE_SHIPPING_THRESHOLD_CENTS: Deno.env.get("ORDER_FREE_SHIPPING_THRESHOLD_CENTS"),
  });
}

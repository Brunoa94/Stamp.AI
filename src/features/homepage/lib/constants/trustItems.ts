/**
 * Trust Items
 *
 * Trust indicators displayed in the hero promo banner.
 * Values are derived from the shared trust metrics constants.
 */

import { Lock, type LucideIcon, Shield, Truck } from "lucide-react";
import { TRUST_GUARANTEE_METRICS } from "@/shared/constants/trustMetrics";

/** `id` names the `home.heroTrust.<id>Label` / `<id>Sublabel` messages */
export interface TrustItem {
  id: "moneyBack" | "freeShipping" | "secure";
  icon: LucideIcon;
}

export const TRUST_ITEMS: TrustItem[] = [
  { id: "moneyBack", icon: Shield },
  { id: "freeShipping", icon: Truck },
  { id: "secure", icon: Lock },
];

/** Values interpolated into the trust badge messages */
export const TRUST_ITEM_VALUES = {
  days: TRUST_GUARANTEE_METRICS.guaranteeDays,
  threshold: TRUST_GUARANTEE_METRICS.freeShippingThreshold,
};

/**
 * Trust Items
 *
 * Trust indicators displayed in the hero promo banner.
 * Values are derived from the shared trust metrics constants.
 */

import { Lock, type LucideIcon, Shield, Truck } from "lucide-react";
import { TRUST_GUARANTEE_METRICS } from "@/shared/constants/trustMetrics";

export interface TrustItem {
  icon: LucideIcon;
  label: string;
  sublabel: string;
}

export const TRUST_ITEMS: TrustItem[] = [
  {
    icon: Shield,
    label: `${TRUST_GUARANTEE_METRICS.guaranteeDays}-Day`,
    sublabel: "Money Back",
  },
  {
    icon: Truck,
    label: "Free Shipping",
    sublabel: `Orders €${TRUST_GUARANTEE_METRICS.freeShippingThreshold}+`,
  },
  {
    icon: Lock,
    label: "Secure",
    sublabel: "Checkout",
  },
];

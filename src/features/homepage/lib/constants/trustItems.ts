/**
 * Trust Items
 *
 * Trust indicators displayed in the hero promo banner.
 */

import { Lock, type LucideIcon, Shield, Star, Truck } from "lucide-react";

export interface TrustItem {
  icon: LucideIcon;
  label: string;
  sublabel: string;
}

export const TRUST_ITEMS: TrustItem[] = [
  {
    icon: Shield,
    label: "30-Day",
    sublabel: "Money Back",
  },
  {
    icon: Truck,
    label: "Free Shipping",
    sublabel: "Orders €60+",
  },
  {
    icon: Lock,
    label: "Secure",
    sublabel: "Checkout",
  },
];

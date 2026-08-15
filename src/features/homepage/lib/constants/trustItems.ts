/**
 * Trust Items
 *
 * Trust indicators displayed in the hero promo banner.
 */

import { Gift, Shield, Truck, Star, Lock, type LucideIcon } from "lucide-react";

export interface TrustItem {
  icon: LucideIcon;
  label: string;
  sublabel: string;
}

export const TRUST_ITEMS: TrustItem[] = [
  {
    icon: Gift,
    label: "5 Free Designs",
    sublabel: "Daily",
  },
  {
    icon: Star,
    label: "4.8 Rating",
    sublabel: "1,200+ Reviews",
  },
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

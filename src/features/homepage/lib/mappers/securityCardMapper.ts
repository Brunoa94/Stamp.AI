import { CreditCard, Wallet } from "lucide-react";
import {
  FaApplePay,
  FaCcMastercard,
  FaCcVisa,
  FaCreditCard,
  FaPaypal,
} from "react-icons/fa";
import type { ComponentType } from "react";

interface SecurityCardTheme {
  gradient: string;
  border: string;
  bar: string;
  iconColor: string;
  badgeBorder: string;
  badgeIcon: string;
}

interface SecurityMethodIcon {
  icon: ComponentType<{ className?: string }>;
  label: string;
}

interface SecurityPaymentMethodVisual {
  cardTheme: SecurityCardTheme;
  methodIcons: SecurityMethodIcon[];
}

const SECURITY_CARD_THEMES: SecurityCardTheme[] = [
  {
    gradient: "from-[#635BFF]/22 via-white/95 to-[#7C3AED]/18",
    border: "border-[#635BFF]/40",
    bar: "from-[#635BFF] to-[#7C3AED]",
    iconColor: "text-[#635BFF]",
    badgeBorder: "border-[#635BFF]/30",
    badgeIcon: "text-[#635BFF]",
  },
  {
    gradient: "from-[#003087]/18 via-white/95 to-[#009CDE]/22",
    border: "border-[#009CDE]/40",
    bar: "from-[#003087] to-[#009CDE]",
    iconColor: "text-[#009CDE]",
    badgeBorder: "border-[#009CDE]/30",
    badgeIcon: "text-[#009CDE]",
  },
  {
    gradient: "from-[#FF8C42]/22 via-white/95 to-[#D946EF]/18",
    border: "border-[#FF8C42]/40",
    bar: "from-[#FF8C42] to-[#D946EF]",
    iconColor: "text-[#FF8C42]",
    badgeBorder: "border-[#FF8C42]/30",
    badgeIcon: "text-[#FF8C42]",
  },
];

const SECURITY_METHOD_ICONS: SecurityMethodIcon[][] = [
  [
    { icon: FaCcVisa, label: "Visa" },
    { icon: FaCcMastercard, label: "Mastercard" },
    { icon: FaApplePay, label: "Apple Pay" },
  ],
  [
    { icon: FaPaypal, label: "PayPal" },
    { icon: FaCreditCard, label: "Cards" },
  ],
  [
    { icon: FaCreditCard, label: "Cards" },
    { icon: CreditCard, label: "iDEAL" },
    { icon: Wallet, label: "Klarna" },
  ],
];

export function mapPaymentMethodIndexToVisual(
  index: number,
): SecurityPaymentMethodVisual {
  const safeIndex = ((index % SECURITY_CARD_THEMES.length) + SECURITY_CARD_THEMES.length) %
    SECURITY_CARD_THEMES.length;

  return {
    cardTheme: SECURITY_CARD_THEMES[safeIndex],
    methodIcons: SECURITY_METHOD_ICONS[safeIndex],
  };
}

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";
import { PAYMENT_LOGOS, type PaymentLogoIdT } from "@/shared/constants/paymentLogos";

/**
 * PaymentLogo
 *
 * A payment brand's full-colour logo on a small white card-shaped chip, so
 * every brand reads at the same size whatever its artwork's proportions.
 */

interface PaymentLogoProps {
  id: PaymentLogoIdT;
  className?: string;
}

export function PaymentLogo({ id, className }: PaymentLogoProps) {
  const logo = PAYMENT_LOGOS[id];

  return (
    <Span
      unstyled
      className={cn(
        "relative inline-flex h-7 w-11 shrink-0 items-center justify-center rounded-sm border border-(--color-stamp-divider) bg-(--color-stamp-white) px-1",
        className,
      )}
    >
      <Image
        src={logo.src}
        alt={logo.label}
        width={logo.width}
        height={logo.height}
        sizes="44px"
        className="max-h-5 w-auto object-contain"
      />
    </Span>
  );
}

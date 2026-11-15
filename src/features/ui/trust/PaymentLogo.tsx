import Image from "next/image";
import { cn } from "@/lib/utils";
import type { PaymentLogoT } from "@/shared/types/payment";

/**
 * PaymentLogo
 *
 * Full-colour payment brand logo on a white tile, sized like a card-network
 * acceptance mark. Pass `decorative` when a visible label already names the
 * brand, so screen readers don't hear it twice.
 */

interface PaymentLogoProps {
  logo: PaymentLogoT;
  decorative?: boolean;
  className?: string;
}

export function PaymentLogo({ logo, decorative = false, className }: PaymentLogoProps) {
  return (
    <span
      className={cn(
        "flex h-8 w-12 shrink-0 items-center justify-center border border-(--color-stamp-divider) bg-(--color-stamp-white) px-1",
        className
      )}
    >
      <Image
        src={logo.src}
        alt={decorative ? "" : logo.label}
        aria-hidden={decorative || undefined}
        width={logo.width}
        height={logo.height}
        className="h-6 w-auto max-w-10 object-contain"
      />
    </span>
  );
}

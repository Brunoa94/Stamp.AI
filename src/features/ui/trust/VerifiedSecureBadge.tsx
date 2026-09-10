import { Shield, Lock, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";

/**
 * VerifiedSecureBadge
 *
 * Norton/McAfee-style security verification badge.
 * Displays a prominent security seal with verification status.
 * Can be used in checkout, footer, or anywhere trust needs reinforcement.
 */

interface VerifiedSecureBadgeProps {
  className?: string;
  variant?: "default" | "compact" | "prominent";
}

export function VerifiedSecureBadge({
  className,
  variant = "default",
}: VerifiedSecureBadgeProps) {
  const t = useTranslations("trust.verification");

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 border border-(--color-stamp-success)/30 bg-(--color-stamp-success)/5 px-3 py-1.5",
          className
        )}
      >
        <Shield className="h-4 w-4 text-(--color-stamp-success)" aria-hidden="true" />
        <div className="flex flex-col">
          <Span variant="micro" className="text-[9px] font-bold uppercase tracking-wider text-(--color-stamp-success)">
            {t("verified")}
          </Span>
          <Span variant="micro" className="text-[8px] tracking-wider text-(--color-stamp-chocolate)/50">
            {t("secure")}
          </Span>
        </div>
      </div>
    );
  }

  if (variant === "prominent") {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-2 border-2 border-(--color-stamp-success)/30 bg-gradient-to-b from-(--color-stamp-success)/5 to-(--color-stamp-success)/10 p-4",
          className
        )}
      >
        <div className="relative">
          <Shield className="h-10 w-10 text-(--color-stamp-success)" aria-hidden="true" />
          <CheckCircle2
            className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full bg-(--color-stamp-white) text-(--color-stamp-success)"
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col items-center gap-0.5 text-center">
          <Span variant="sm" className="font-bold uppercase tracking-wider text-(--color-stamp-success)">
            {t("verified")} {t("secure")}
          </Span>
          <Span variant="micro" className="text-[9px] tracking-wider text-(--color-stamp-chocolate)/50">
            {t("siteVerified")}
          </Span>
        </div>
        <div className="flex items-center gap-1.5 border-t border-(--color-stamp-divider) pt-2">
          <Lock className="h-3 w-3 text-(--color-stamp-gold)" aria-hidden="true" />
          <Span variant="micro" className="text-[9px] tracking-wider text-(--color-stamp-chocolate)/60">
            {t("encryption")}
          </Span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 border border-(--color-stamp-success)/20 bg-(--color-stamp-success)/5 px-4 py-2",
        className
      )}
    >
      <div className="relative flex-shrink-0">
        <Shield className="h-7 w-7 text-(--color-stamp-success)" aria-hidden="true" />
        <CheckCircle2
          className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full bg-(--color-stamp-white) text-(--color-stamp-success)"
          aria-hidden="true"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <Span variant="micro" className="text-[10px] font-bold uppercase tracking-wider text-(--color-stamp-success)">
            {t("verified")} {t("secure")}
          </Span>
        </div>
        <div className="flex items-center gap-1">
          <Lock className="h-2.5 w-2.5 text-(--color-stamp-gold)" aria-hidden="true" />
          <Span variant="micro" className="text-[8px] tracking-wider text-(--color-stamp-chocolate)/50">
            {t("encryption")}
          </Span>
        </div>
      </div>
    </div>
  );
}

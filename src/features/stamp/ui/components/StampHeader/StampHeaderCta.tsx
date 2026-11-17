"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { stampNavCtaVariants } from "@/features/stamp/lib/variants/stampNavVariants";

interface PropsI {
  size?: "default" | "lg";
  className?: string;
  onNavigate: () => void;
}

/** "Stamp it!" pill that opens the studio; the arrow nudges forward on hover. */
export function StampHeaderCta({ size, className, onNavigate }: PropsI) {
  const t = useTranslations("stamp.header");

  return (
    <Link
      href="/stamp"
      onClick={onNavigate}
      aria-label={t("stampAria")}
      className={cn(stampNavCtaVariants({ size }), className)}
    >
      {t("stamp")}
      <ArrowRight
        className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}

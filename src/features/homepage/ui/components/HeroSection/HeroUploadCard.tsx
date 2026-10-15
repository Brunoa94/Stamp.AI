"use client";

import Link from "next/link";
import { ImagePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";

/**
 * HeroUploadCard
 *
 * Dashed "drop a photo" card in the hero that opens the creator — the first
 * step of the flow, right where visitors start reading.
 */
export function HeroUploadCard() {
  const t = useTranslations("home.hero.upload");

  return (
    <Link
      href="/stamp"
      className="group flex w-full max-w-xl items-center gap-4 rounded-md border-2 border-dashed border-(--color-stamp-gold) bg-(--color-stamp-white) p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-solid hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold) focus-visible:ring-offset-2"
    >
      <Span unstyled className="flex size-14 shrink-0 items-center justify-center rounded-md bg-(--color-stamp-cream) transition-colors duration-300 group-hover:bg-(--color-stamp-gold)/15">
        <ImagePlus className="size-6 animate-[float_3s_ease-in-out_infinite] text-(--color-stamp-taupe)" />
      </Span>
      <Span unstyled className="flex min-w-0 flex-1 flex-col gap-1">
        <Span unstyled className="font-body text-base font-semibold text-(--color-stamp-chocolate)">
          {t("title")}
        </Span>
        <Span variant="pill" className="font-semibold tracking-widest text-(--color-stamp-taupe)">
          {t("hint")}
        </Span>
      </Span>
      <Span variant="script" className="hidden shrink-0 text-2xl text-(--color-stamp-taupe) sm:block">
        {t("step")}
      </Span>
    </Link>
  );
}

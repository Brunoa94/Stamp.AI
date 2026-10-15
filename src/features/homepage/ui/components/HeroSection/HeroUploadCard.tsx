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
      className="group flex w-full max-w-xl items-center gap-5 rounded-lg border-3 border-dashed border-(--color-stamp-gold) bg-(--color-stamp-gold)/10 p-5 text-left shadow-lg ring-6 ring-(--color-stamp-gold)/20 transition-all duration-300 hover:-translate-y-1 hover:border-solid hover:bg-(--color-stamp-white) hover:shadow-xl hover:ring-(--color-stamp-gold)/35 focus-visible:outline-none focus-visible:ring-(--color-stamp-gold)/50 sm:p-6"
    >
      <Span unstyled className="flex size-16 shrink-0 items-center justify-center rounded-md bg-(--color-stamp-gold) transition-colors duration-300 group-hover:bg-(--color-stamp-chocolate)">
        <ImagePlus className="size-7 animate-[float_3s_ease-in-out_infinite] text-(--color-stamp-chocolate) transition-colors duration-300 group-hover:text-(--color-stamp-white)" />
      </Span>
      <Span unstyled className="flex min-w-0 flex-1 flex-col gap-1">
        <Span unstyled className="font-body text-lg font-bold text-(--color-stamp-chocolate) sm:text-xl">
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

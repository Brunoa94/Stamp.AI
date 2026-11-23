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
      className="group flex w-full max-w-xl items-center gap-5 rounded-xl border-2 border-dashed border-(--color-stamp-gold) bg-(--color-stamp-cream) p-5 text-left shadow-(--shadow-stamp-card) text-shadow-none transition-all duration-300 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-solid hover:bg-(--color-stamp-white) hover:shadow-(--shadow-stamp-card-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-off-white) sm:p-6"
    >
      <Span unstyled className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-(--color-stamp-gold) transition-colors duration-300 group-hover:bg-(--color-stamp-chocolate)">
        {/* The float runs on this wrapper: an animated <svg> transform repaints every frame, an HTML one stays on the compositor */}
        <Span unstyled className="flex animate-[float_3s_ease-in-out_infinite]">
          <ImagePlus className="size-7 text-(--color-stamp-chocolate) transition-colors duration-300 group-hover:text-(--color-stamp-white)" />
        </Span>
      </Span>
      <Span unstyled className="flex min-w-0 flex-1 flex-col gap-1">
        <Span unstyled className="font-body text-lg font-bold text-(--color-stamp-chocolate) sm:text-xl">
          {t("title")}
        </Span>
        <Span variant="label" className="text-(--color-stamp-taupe)">
          {t("hint")}
        </Span>
      </Span>
      <Span variant="script" className="hidden shrink-0 text-2xl text-(--color-stamp-taupe) sm:block">
        {t("step")}
      </Span>
    </Link>
  );
}

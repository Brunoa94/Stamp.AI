"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ImagePlus, Sparkles } from "lucide-react";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import {
  stampNavPromptBarVariants,
  stampNavPromptButtonVariants,
  stampNavPromptIconVariants,
} from "@/features/stamp/lib/variants/stampNavVariants";

interface PropsI {
  className?: string;
}

/**
 * StampHeaderPromptBar
 *
 * A search-style field in the header that opens the design studio. Where a
 * marketplace puts its search field, Stamp puts the start of a new design:
 * an upload tile, the "describe an idea" placeholder and "Stamp it!".
 */
export function StampHeaderPromptBar({ className }: PropsI) {
  const t = useTranslations("stamp.header");

  return (
    <Link
      href="/stamp"
      aria-label={t("stampAria")}
      className={cn(stampNavPromptBarVariants(), className)}
    >
      <Span unstyled aria-hidden className={stampNavPromptIconVariants()}>
        <ImagePlus className="size-4" strokeWidth={2} />
      </Span>
      <Span unstyled className="truncate text-sm text-(--color-stamp-taupe)">
        {t("promptPlaceholder")}
      </Span>
      <Span unstyled aria-hidden className={stampNavPromptButtonVariants()}>
        <Sparkles className="size-4" strokeWidth={2} />
        <Span unstyled className="hidden sm:inline">
          {t("stamp")}
        </Span>
      </Span>
    </Link>
  );
}

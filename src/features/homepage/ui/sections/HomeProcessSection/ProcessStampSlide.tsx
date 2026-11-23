/**
 * ProcessStampSlide
 *
 * The last slide of "The Process" carousel: the step where the visitor
 * stamps their own idea, with the CTA into the Stamp flow. The CTA reports
 * keyboard focus so the carousel can bring this slide into view, since the
 * page scroll (not the browser's focus scrolling) moves the track.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { ProcessSlideEmphasisT } from "@/features/homepage/lib/helpers/processCarousel";

interface PropsI {
  number: string;
  emphasis: ProcessSlideEmphasisT;
  onCtaFocus: () => void;
}

export function ProcessStampSlide({ number, emphasis, onCtaFocus }: PropsI) {
  const t = useTranslations("home.process");

  return (
    <li
      className="flex w-[min(22.5rem,calc(100vw-3rem))] shrink-0 snap-start origin-center flex-col justify-between rounded-lg bg-(--color-stamp-chocolate) p-5 short:p-4 shadow-lg sm:w-106 lg:w-216 lg:flex-row lg:items-center lg:gap-10 lg:p-8"
      style={{ opacity: emphasis.opacity, transform: `scale(${emphasis.scale})` }}
    >
      {/* Postmark-style frame around the step number, the same size as the other slides' demo screen */}
      <div className="mb-5 flex h-74 shrink-0 items-center justify-center rounded-md border-3 border-dashed border-(--color-stamp-gold)/70 sm:h-89 lg:mb-0 lg:w-96 short:mb-3 short:h-52 sm:short:h-52">
        <Span
          variant="script"
          aria-hidden="true"
          className="-rotate-6 rounded-lg border-4 border-(--color-stamp-gold) px-6 py-3 text-6xl text-(--color-stamp-gold) lg:text-8xl short:text-5xl"
        >
          {number}
        </Span>
      </div>

      <div>
        <Span
          variant="badge"
          className="mb-3 inline-block rounded-full bg-(--color-stamp-gold) px-3 py-1 text-(--color-stamp-chocolate) shadow-sm"
        >
          {t("stepBadge", { number })}
        </Span>

        <Heading as="h3" variant="section" className="mb-2 text-(--color-stamp-off-white)">
          {t("stamp.title")}
        </Heading>

        <Paragraph
          variant="loose"
          className="mb-6 text-sm leading-relaxed short:mb-3 text-(--color-stamp-off-white)/80 sm:text-base"
        >
          {t("stamp.description")}
        </Paragraph>

        <Link
          href="/stamp"
          onFocus={onCtaFocus}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-(--color-stamp-gold) px-6 py-4 short:py-3 text-sm font-semibold uppercase tracking-wider text-(--color-stamp-chocolate) shadow-md transition-all duration-300 hover:bg-(--color-stamp-off-white) active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-gold) md:text-base"
        >
          {t("stamp.cta")}
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </li>
  );
}

/**
 * HeroContent
 *
 * Hero text column: eyebrow, animated punchy headline, tagline, a
 * checkmark list of value props and the primary/secondary CTAs.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { HOME_HERO_HIGHLIGHTS } from "../../../lib/constants/homepageContent";
import { HeroAnimatedTitle } from "./HeroAnimatedTitle";

export function HeroContent() {
  const t = useTranslations("home.hero");

  return (
    <div className="text-center lg:text-left">
      <div className="mb-8 flex items-center justify-center gap-4 lg:justify-start">
        <div className="h-1.5 w-12 bg-(--color-stamp-gold)" />
        <Span
          variant="micro"
          className="uppercase tracking-widest text-(--color-stamp-taupe)"
        >
          {t("eyebrow")}
        </Span>
      </div>

      <HeroAnimatedTitle>
        <Heading
          as="h1"
          variant="title"
          className="mb-8 text-5xl text-(--color-stamp-chocolate) md:text-6xl xl:text-7xl"
        >
          {t.rich("title", {
            accent: (chunks) => (
              <Span
                variant="serif"
                className="text-5xl text-(--color-stamp-taupe) md:text-6xl xl:text-7xl"
              >
                {chunks}
              </Span>
            ),
          })}
        </Heading>
      </HeroAnimatedTitle>

      <Paragraph
        variant="heroTagline"
        className="mx-auto mb-10 max-w-xl text-(--color-stamp-chocolate)/80 lg:mx-0"
      >
        {t("tagline")}
      </Paragraph>

      <ul className="mx-auto mb-12 grid max-w-xl grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:mx-0">
        {HOME_HERO_HIGHLIGHTS.map((id) => (
          <li key={id} className="flex items-center gap-3">
            <Check
              aria-hidden
              className="h-4 w-4 flex-none text-(--color-stamp-gold)"
            />
            <Span variant="sm" className="text-(--color-stamp-chocolate)/80">
              {t(`highlights.${id}`)}
            </Span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
        <Button asChild variant="cta" className="group">
          <Link href="/stamp">
            {t("ctaPrimary")}
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="text-lg text-(--color-stamp-taupe) hover:bg-transparent hover:text-(--color-stamp-gold)"
          onClick={() => {
            document
              .getElementById("products")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          {t("ctaSecondary")}
        </Button>
      </div>
    </div>
  );
}

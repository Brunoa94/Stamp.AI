"use client";

/**
 * HeroContent
 *
 * Hero section text content with animated title, tagline, and CTAs.
 * Designed to be sticky at the top while products bubble up below.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { HeroAnimatedTitle } from "./HeroAnimatedTitle";
import { HeroSecurityBadge } from "@/features/ui/trust/HeroSecurityBadge";
import { OrdersFulfilledCounter } from "@/features/ui/trust/OrdersFulfilledCounter";
import { TrustpilotWidget } from "@/features/ui/trust/TrustpilotWidget";
import Image from "next/image";

export function HeroContent() {
  const t = useTranslations("home.hero");

  return (
    <div className="bg-(--color-stamp-off-white)/95 backdrop-blur-sm rounded-3xl sm:p-8 flex justify-center flex-col items-center">
      <div className="flex items-center">
        <Image
          src="/logo.png"
          alt="Stamp.AI"
          width={96}
          height={96}
          className="object-contain mb-8"
          priority
        />
        <HeroAnimatedTitle>
          <Heading
            as="h1"
            variant="title"
            className="mb-6 text-5xl text-(--color-stamp-chocolate) sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {t.rich("title", {
              accent: (chunks) => (
                <Span
                  variant="serif"
                  className="relative inline-block text-5xl text-(--color-stamp-taupe) sm:text-6xl md:text-7xl lg:text-8xl -ml-4 lg:-ml-8 pt-2"
                >
                  {chunks}
                </Span>
              ),
            })}
          </Heading>
        </HeroAnimatedTitle>
      </div>
      <Paragraph
        variant="heroTagline"
        className="mx-auto mb-6 sm:mb-8 text-(--color-stamp-chocolate)/80"
      >
        {t("tagline")}
      </Paragraph>

      <div className="flex flex-col justify-center gap-3 sm:flex-row items-center">
        <Button asChild variant="cta" className="group">
          <Link href="/stamp">
            {t("ctaPrimary")}
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="text-lg text-(--color-stamp-taupe) hover:text-(--color-stamp-gold) hover:bg-transparent"
          onClick={() => {
            document
              .getElementById("products")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          {t("ctaSecondary")}
        </Button>
      </div>

      {/* Free credits highlight */}
      <Span
        as="p"
        variant="serif"
        className="mt-6 sm:mt-12 text-center text-2xl text-(--color-stamp-taupe) sm:text-3xl lg:text-4xl"
      >
        {t.rich("freeCredits", {
          signUp: (chunks) => (
            <Button
              variant="link"
              className="inline p-0 h-auto font-serif italic lowercase text-(--color-stamp-gold) hover:text-(--color-stamp-chocolate)! sm:text-3xl lg:text-4xl font-bold"
              onClick={() => {
                document.dispatchEvent(new CustomEvent("open-auth-modal"));
              }}
            >
              {chunks}
            </Button>
          ),
        })}
      </Span>

      {/* Trust signals - above fold */}
      <div className="mt-5 sm:mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        <HeroSecurityBadge />
        <OrdersFulfilledCounter variant="default" count={10000} />
        <TrustpilotWidget variant="compact" />
      </div>
    </div>
  );
}

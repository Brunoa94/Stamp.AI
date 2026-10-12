"use client";

import { Paragraph } from "@/features/ui/paragraph";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function LaunchPromotionBanner() {
  const t = useTranslations("promotions");
  return <aside aria-label={t("title")} className="relative mt-24 border-y border-(--color-stamp-gold)/40 bg-(--color-stamp-cream) px-6 py-3 text-(--color-stamp-chocolate)">
    <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-center gap-x-6 gap-y-1 text-center text-sm">
      <Paragraph unstyled>{t("banner")}</Paragraph>
      <Link href="/#launch-offers" className="font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">{t("cta")}</Link>
    </div>
  </aside>;
}

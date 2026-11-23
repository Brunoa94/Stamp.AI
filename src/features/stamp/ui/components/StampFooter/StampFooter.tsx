"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Leaf } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { SOCIAL_PROFILES } from "@/features/seo/lib/constants/social";
import { LEGAL_ENTITY } from "@/features/legal/lib/constants/legalEntity";
import { FooterPaymentIcons } from "@/features/ui/trust/FooterPaymentIcons";
import { CookieSettingsButton } from "@/features/analytics/ui/components/CookieSettingsButton";
import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";
import {
  FooterLinkColumn,
  type FooterColumnKeyType,
  type FooterLinkType,
} from "./FooterLinkColumn";

/**
 * StampFooter
 *
 * Global footer: an amber promise strip over a cream area with the brand,
 * payment marks and four link columns, the faint "Stamp" wordmark, and a
 * bottom bar with the copyright line and cookie settings. Uses the page
 * gutter (px-4 sm:px-6 lg:px-12) and max-w-screen-2xl like every section.
 */

const FOOTER_COLUMNS: { key: FooterColumnKeyType; links: FooterLinkType[] }[] =
  [
    {
      key: "create",
      links: [
        { id: "footer-studio", href: "/stamp" },
        { id: "footer-catalog", href: "/catalog" },
        { id: "footer-cart", href: "/cart" },
        { id: "footer-orders", href: "/orders" },
      ],
    },
    {
      key: "support",
      links: [
        { id: "footer-faq", href: "/faq" },
        { id: "footer-shipping", href: "/shipping" },
        { id: "footer-returns", href: "/returns" },
        { id: "footer-contact", href: `mailto:${LEGAL_ENTITY.supportEmail}` },
      ],
    },
    {
      key: "legal",
      links: [
        { id: "footer-terms", href: "/terms" },
        { id: "footer-privacy", href: "/privacy" },
        { id: "footer-cookies", href: "/cookies" },
        { id: "footer-security", href: "/security" },
      ],
    },
    {
      key: "social",
      links: [
        { id: "footer-instagram", href: SOCIAL_PROFILES.instagram, external: true },
        { id: "footer-twitter", href: SOCIAL_PROFILES.twitter, external: true },
        { id: "footer-tiktok", href: SOCIAL_PROFILES.tiktok, external: true },
        { id: "footer-linkedin", href: SOCIAL_PROFILES.linkedin, external: true },
      ],
    },
  ];

export function StampFooter() {
  const t = useTranslations("layout.stampFooter");
  const year = new Date().getFullYear();

  return (
    <footer>
      {/* Amber promise strip */}
      <div className="flex items-center justify-center gap-2 bg-(--color-stamp-gold) px-6 py-3 text-center">
        <Leaf className="size-4 shrink-0 text-(--color-stamp-chocolate)" aria-hidden />
        <Paragraph variant="xs" className="font-medium text-(--color-stamp-chocolate)">
          {t("strip")}
        </Paragraph>
      </div>

      {/* Cream link area */}
      <div className="bg-(--color-stamp-cream) px-4 pt-16 pb-10 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-screen-2xl">
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-6 md:gap-12">
            <div className="col-span-2 space-y-5">
              <Link
                href="/"
                className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-stamp-chocolate)"
              >
                <Image
                  src={staticAssetUrl("/logo.png")}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 rounded-lg"
                />
                <Heading as="div" variant="card" className="text-(--color-stamp-chocolate)">
                  {t("logoAlt")}
                </Heading>
              </Link>
              <div aria-hidden className="h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
              <Paragraph variant="xs" className="max-w-xs text-(--color-stamp-taupe)">
                {t("mission")}
              </Paragraph>
              <FooterPaymentIcons />
            </div>

            {FOOTER_COLUMNS.map((column) => (
              <FooterLinkColumn
                key={column.key}
                columnKey={column.key}
                links={column.links}
                t={t}
              />
            ))}
          </div>

          {/* Decorative wordmark */}
          <div aria-hidden className="pointer-events-none mt-16 select-none overflow-hidden">
            <Heading as="div" variant="display" className="text-center text-(--color-stamp-chocolate)/5">
              {t("wordmark")}
            </Heading>
          </div>

          {/* Bottom bar: legal line and cookie settings */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-(--color-stamp-divider) pt-8 md:flex-row">
            <Span variant="micro" className="text-(--color-stamp-taupe)">
              {t("copyright", { year })}
            </Span>
            <CookieSettingsButton />
            <Span variant="micro" className="text-(--color-stamp-taupe)">
              {t("tagline")}
            </Span>
          </div>
        </div>
      </div>
    </footer>
  );
}

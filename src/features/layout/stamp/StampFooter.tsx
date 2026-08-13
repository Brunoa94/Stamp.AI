"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { List } from "@/features/ui/list";
import { Paragraph } from "@/features/ui/paragraph";
import { Separator } from "@/features/ui/separator";
import { Span } from "@/features/ui/span";
import { SOCIAL_PROFILES } from "@/features/seo/config/social";

/**
 * StampFooter
 *
 * Global footer on the stamp luxury palette, matching StampHeader's link
 * treatment and the homepage section rhythm (px-6 lg:px-12 xl:px-24,
 * max-w-screen-2xl). Four link columns over a decorative wordmark and a
 * copyright bar.
 */

type FooterColumnKeyType = "create" | "support" | "legal" | "social";

type FooterLinkType = {
  id: string;
  href: string;
  external?: boolean;
};

const FOOTER_COLUMNS: { key: FooterColumnKeyType; links: FooterLinkType[] }[] =
  [
    {
      key: "create",
      links: [
        { id: "footer-studio", href: "/stamp" },
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

const linkClass =
  "text-xs font-semibold uppercase tracking-[0.15em] text-(--color-stamp-chocolate)/60 transition-colors hover:text-(--color-stamp-gold) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-gold)";

interface FooterLinkColumnPropsI {
  columnKey: FooterColumnKeyType;
  links: FooterLinkType[];
  t: ReturnType<typeof useTranslations<"layout.stampFooter">>;
}

function FooterLinkColumn({ columnKey, links, t }: FooterLinkColumnPropsI) {
  return (
    <nav aria-label={t(`columns.${columnKey}`)}>
      <Span as="div" variant="label" className="text-(--color-stamp-taupe)">
        {t(`columns.${columnKey}`)}
      </Span>
      <List className="mt-6 space-y-3">
        {links.map((link) => (
          <li key={link.id}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {t(`links.${link.id}`)}
              </a>
            ) : (
              <Link href={link.href} className={linkClass}>
                {t(`links.${link.id}`)}
              </Link>
            )}
          </li>
        ))}
      </List>
    </nav>
  );
}

export function StampFooter() {
  const t = useTranslations("layout.stampFooter");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-(--color-stamp-divider) bg-(--color-stamp-cream) px-6 pt-24 pb-12 lg:px-12 xl:px-24">
      <div className="mx-auto max-w-screen-2xl">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-6 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 space-y-6">
            <Link href="/" className="inline-block">
              <Image
                src="/assets/brand/logo.png"
                alt={t("logoAlt")}
                width={280}
                height={80}
                className="h-16 w-auto"
              />
            </Link>
            <div className="h-1.5 w-20 bg-(--color-stamp-gold)" />
            <Paragraph
              variant="sm"
              className="max-w-xs text-(--color-stamp-chocolate)/60"
            >
              {t("mission")}
            </Paragraph>
          </div>

          {/* Link columns */}
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
        <div
          aria-hidden
          className="pointer-events-none mt-20 select-none overflow-hidden"
        >
          <Heading
            as="div"
            variant="display"
            className="text-center text-(--color-stamp-chocolate)/5"
          >
            {t("wordmark")}
          </Heading>
        </div>

        <Separator className="my-12 bg-(--color-stamp-divider)" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Span variant="micro" className="text-(--color-stamp-chocolate)/50">
            {t("copyright", { year })}
          </Span>
          <Span variant="micro" className="text-(--color-stamp-chocolate)/50">
            {t("tagline")}
          </Span>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Separator } from "@/features/ui/separator";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { List } from "@/features/ui/list";
import { footerTheme } from "@/theme/components";
import { cn } from "@/lib/utils";

/**
 * Brutalist Footer Component
 *
 * Features:
 * - Grid layout with logo/mission + link columns
 * - Massive background "STAMP" text (text-[28vw])
 * - Copyright overlay at bottom
 */

type FooterColumnKey = "product" | "protocol" | "support" | "network";

interface FooterLink {
  id: string;
  href: string;
}

const FOOTER_LINKS: Record<FooterColumnKey, FooterLink[]> = {
  product: [
    { id: "footer-custom-tee", href: "#" },
    { id: "footer-hoodies", href: "#" },
    { id: "footer-caps", href: "#" },
  ],
  protocol: [
    { id: "footer-manifesto", href: "#" },
    { id: "footer-careers", href: "#" },
    { id: "footer-press", href: "#" },
  ],
  support: [
    { id: "footer-help", href: "#" },
    { id: "footer-track", href: "#" },
    { id: "footer-shipping", href: "#" },
  ],
  network: [
    { id: "footer-ig", href: "#" },
    { id: "footer-tw", href: "#" },
    { id: "footer-tt", href: "#" },
  ],
};

const COLUMN_ORDER: FooterColumnKey[] = [
  "product",
  "protocol",
  "support",
  "network",
];

interface FooterLinkColumnProps {
  columnKey: FooterColumnKey;
  links: FooterLink[];
  t: ReturnType<typeof useTranslations<"layout.brutalistFooter">>;
}

function FooterLinkColumn({ columnKey, links, t }: FooterLinkColumnProps) {
  const hoverColor = footerTheme.linkHoverColors[columnKey];

  return (
    <div className={footerTheme.linkColumn.container}>
      <div className={footerTheme.linkColumn.inner}>
        <Span as="h6" variant="sm" className={footerTheme.linkColumn.heading}>
          {t(`columns.${columnKey}`)}
        </Span>
        <List className={footerTheme.linkColumn.list}>
          {links.map((link) => (
            <li key={link.id}>
              <Link
                href={link.href}
                id={link.id}
                className={cn(footerTheme.linkColumn.link, hoverColor)}
              >
                {t(`links.${link.id}`)}
              </Link>
            </li>
          ))}
        </List>
      </div>
    </div>
  );
}

export function BrutalistFooter() {
  const t = useTranslations("layout.brutalistFooter");

  return (
    <footer className={cn("brutalist-footer", footerTheme.root)}>
      {/* Decorative blur blob */}
      <div className={footerTheme.decorativeBlob} />

      {/* Top section: Logo + link columns */}
      <div className={footerTheme.grid}>
        {/* Logo + Mission */}
        <div className={footerTheme.brand.container}>
          <Link href="/" className="block">
            <Image
              src="/assets/brand/logo.png"
              alt="Stamp.AI"
              width={280}
              height={80}
              className="h-20 w-auto"
            />
          </Link>
          <Paragraph variant="sm" className={footerTheme.brand.mission}>
            {t("mission")}
          </Paragraph>
        </div>

        {/* Link Columns */}
        {COLUMN_ORDER.map((columnKey) => (
          <FooterLinkColumn
            key={columnKey}
            columnKey={columnKey}
            links={FOOTER_LINKS[columnKey]}
            t={t}
          />
        ))}
      </div>

      {/* Divider */}
      <Separator className={footerTheme.divider} />

      {/* Bottom section with massive text */}
      <div className={footerTheme.bottom.container}>
        {/* Massive background text */}
        <Heading
          as="h2"
          variant="sectionDisplay"
          className={footerTheme.bottom.bgText}
        >
          {t("bgText")}
        </Heading>

        {/* Copyright overlay */}
        <div className={footerTheme.bottom.copyright.container}>
          <Span variant="micro" className={footerTheme.bottom.copyright.text}>
            {t("copyrightLeft")}
          </Span>
          <Span
            variant="micro"
            className={footerTheme.bottom.copyright.centerText}
          >
            {t("copyrightCenter")}
          </Span>
          <Span variant="micro" className={footerTheme.bottom.copyright.text}>
            {t("copyrightRight")}
          </Span>
        </div>
      </div>
    </footer>
  );
}

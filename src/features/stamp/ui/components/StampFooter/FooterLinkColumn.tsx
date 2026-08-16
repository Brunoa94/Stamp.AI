"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { List } from "@/features/ui/list";
import { Span } from "@/features/ui/span";

/**
 * FooterLinkColumn
 *
 * A single navigation column in the footer with a heading and list of links.
 */

type FooterColumnKeyType = "create" | "support" | "legal" | "social";

type FooterLinkType = {
  id: string;
  href: string;
  external?: boolean;
};

interface PropsI {
  columnKey: FooterColumnKeyType;
  links: FooterLinkType[];
  t: ReturnType<typeof useTranslations<"layout.stampFooter">>;
}

const linkClass =
  "text-xs font-semibold uppercase tracking-[0.15em] text-(--color-stamp-chocolate)/60 transition-colors hover:text-(--color-stamp-gold) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-gold)";

export function FooterLinkColumn({ columnKey, links, t }: PropsI) {
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

export type { FooterColumnKeyType, FooterLinkType };

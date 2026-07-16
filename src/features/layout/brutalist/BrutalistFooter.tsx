"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Separator } from "@/features/ui/separator";
import { AnimatedLogoDot } from "./AnimatedLogoDot";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { List } from "@/features/ui/list";

/**
 * Brutalist Footer Component
 *
 * Features:
 * - Grid layout with logo/mission + link columns
 * - Massive background "STAMP" text (text-[28vw])
 * - Copyright overlay at bottom
 */

const FOOTER_LINKS = {
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

export function BrutalistFooter() {
  const t = useTranslations("layout.brutalistFooter");

  return (
    <footer className="brutalist-footer bg-ink text-white pt-48 pb-12 px-8 relative overflow-hidden border-t border-white/10 transition-colors duration-300">
      {/* Decorative blur blob */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-brandPurple/5 blur-[150px] rounded-full" />

      {/* Top section: Logo + link columns */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-16 relative z-10 mb-48">
        {/* Logo + Mission */}
        <div className="col-span-2">
          <Link
            href="/"
            className="font-anton text-4xl md:text-6xl leading-none uppercase tracking-tighter mb-8 flex items-center hover:opacity-80 transition-opacity"
          >
            {t.rich("brand", {
              stamp: (chunks) => <Span>{chunks}</Span>,
              dot: () => (
                <AnimatedLogoDot size="md" className="mx-1.5 md:mx-2" />
              ),
              ai: (chunks) => <Span>{chunks}</Span>,
            })}
          </Link>
          <Paragraph
            variant="sm"
            className="opacity-40 max-w-xs leading-loose font-bold tracking-widest"
          >
            {t("mission")}
          </Paragraph>
        </div>

        {/* Product Links */}
        <div className="flex flex-col gap-8">
          <div>
            <Span as="h6" variant="sm" className="opacity-20 mb-8">
              {t("columns.product")}
            </Span>
            <List className="space-y-4">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    id={link.id}
                    className="text-xs uppercase font-bold hover:text-brandPurple transition-colors duration-300 font-space"
                  >
                    {t(`links.${link.id}`)}
                  </Link>
                </li>
              ))}
            </List>
          </div>
        </div>

        {/* Protocol Links */}
        <div className="flex flex-col gap-8">
          <div>
            <Span as="h6" variant="sm" className="opacity-20 mb-8">
              {t("columns.protocol")}
            </Span>
            <List className="space-y-4">
              {FOOTER_LINKS.protocol.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    id={link.id}
                    className="text-xs uppercase font-bold hover:text-brandCyan transition-colors duration-300 font-space"
                  >
                    {t(`links.${link.id}`)}
                  </Link>
                </li>
              ))}
            </List>
          </div>
        </div>

        {/* Support Links */}
        <div className="flex flex-col gap-8">
          <div>
            <Span as="h6" variant="sm" className="opacity-20 mb-8">
              {t("columns.support")}
            </Span>
            <List className="space-y-4">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    id={link.id}
                    className="text-xs uppercase font-bold hover:text-brandOrange transition-colors duration-300 font-space"
                  >
                    {t(`links.${link.id}`)}
                  </Link>
                </li>
              ))}
            </List>
          </div>
        </div>

        {/* Network Links */}
        <div className="flex flex-col gap-8">
          <div>
            <Span as="h6" variant="sm" className="opacity-20 mb-8">
              {t("columns.network")}
            </Span>
            <List className="space-y-4">
              {FOOTER_LINKS.network.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    id={link.id}
                    className="text-xs uppercase font-bold hover:text-brandPurple transition-colors duration-300 font-space"
                  >
                    {t(`links.${link.id}`)}
                  </Link>
                </li>
              ))}
            </List>
          </div>
        </div>
      </div>

      {/* Divider */}
      <Separator className="w-full bg-linear-to-r from-transparent via-white/10 to-transparent mb-12" />

      {/* Bottom section with massive text */}
      <div className="relative flex justify-center py-20">
        {/* Massive background text */}
        <h2 className="font-anton text-[28vw] leading-none text-white opacity-[0.03] uppercase tracking-tighter pointer-events-none select-none">
          {t("bgText")}
        </h2>

        {/* Copyright overlay */}
        <div className="absolute bottom-0 w-full flex flex-col md:flex-row justify-between items-center gap-4 opacity-30">
          <Span variant="micro" className="tracking-[0.4em]">
            {t("copyrightLeft")}
          </Span>
          <Span variant="micro" className="hidden md:inline tracking-[0.4em]">
            {t("copyrightCenter")}
          </Span>
          <Span variant="micro" className="tracking-[0.4em]">
            {t("copyrightRight")}
          </Span>
        </div>
      </div>
    </footer>
  );
}

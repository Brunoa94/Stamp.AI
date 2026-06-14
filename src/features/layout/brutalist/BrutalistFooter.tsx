"use client";

import Link from "next/link";
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
    { id: "footer-custom-tee-v2", href: "#", label: "Custom Essentials" },
    { id: "footer-hoodies-v2", href: "#", label: "Archival Hoodies" },
    { id: "footer-caps-v2", href: "#", label: "Precision Caps" },
  ],
  protocol: [
    { id: "footer-manifesto-v2", href: "#", label: "Manifesto" },
    { id: "footer-careers-v2", href: "#", label: "Terminal Hub" },
    { id: "footer-press-v2", href: "#", label: "Public Keys" },
  ],
  support: [
    { id: "footer-help-v2", href: "#", label: "Operations" },
    { id: "footer-track-v2", href: "#", label: "Track Assets" },
    { id: "footer-shipping-v2", href: "#", label: "Logistics" },
  ],
  network: [
    { id: "footer-ig-v2", href: "#", label: "Instagram" },
    { id: "footer-tw-v2", href: "#", label: "X / Twitter" },
    { id: "footer-tt-v2", href: "#", label: "Discord" },
  ],
};

export function BrutalistFooter() {
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
            <Span>STAMP</Span>
            <AnimatedLogoDot size="md" className="mx-1.5 md:mx-2" />
            <Span>AI</Span>
          </Link>
          <Paragraph
            variant="sm"
            className="opacity-40 max-w-xs leading-loose font-bold tracking-widest"
          >
            Democratizing design precision through AI synthesis. Engineered for
            the creative elite who demand archival textile quality.
          </Paragraph>
        </div>

        {/* Product Links */}
        <div className="flex flex-col gap-8">
          <div>
            <Span as="h6" variant="sm" className="opacity-20 mb-8">
              Product
            </Span>
            <List className="space-y-4">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    id={link.id}
                    className="text-xs uppercase font-bold hover:text-brandPurple transition-colors duration-300 font-space"
                  >
                    {link.label}
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
              Protocol
            </Span>
            <List className="space-y-4">
              {FOOTER_LINKS.protocol.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    id={link.id}
                    className="text-xs uppercase font-bold hover:text-brandCyan transition-colors duration-300 font-space"
                  >
                    {link.label}
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
              Support
            </Span>
            <List className="space-y-4">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    id={link.id}
                    className="text-xs uppercase font-bold hover:text-brandOrange transition-colors duration-300 font-space"
                  >
                    {link.label}
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
              Network
            </Span>
            <List className="space-y-4">
              {FOOTER_LINKS.network.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    id={link.id}
                    className="text-xs uppercase font-bold hover:text-brandPurple transition-colors duration-300 font-space"
                  >
                    {link.label}
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
          STAMP
        </h2>

        {/* Copyright overlay */}
        <div className="absolute bottom-0 w-full flex flex-col md:flex-row justify-between items-center gap-4 opacity-30">
          <Span variant="micro" className="tracking-[0.4em]">
            STAMP.AI © 2024 / ARCHIVE
          </Span>
          <Span variant="micro" className="hidden md:inline tracking-[0.4em]">
            Privacy Protocols / Terms of Service
          </Span>
          <Span variant="micro" className="tracking-[0.4em]">
            EST. NYC TERMINAL
          </Span>
        </div>
      </div>
    </footer>
  );
}

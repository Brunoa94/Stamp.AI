"use client";

import Link from "next/link";
import { Separator } from "@/features/ui/separator";
import { AnimatedLogoDot } from "./AnimatedLogoDot";

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
    <footer className="bg-ink text-white pt-48 pb-12 px-8 relative overflow-hidden border-t border-white/10">
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
            <span>STAMP</span>
            <AnimatedLogoDot size="md" className="mx-1.5 md:mx-2" />
            <span>AI</span>
          </Link>
          <p className="text-[10px] opacity-40 uppercase max-w-xs leading-loose font-bold tracking-widest font-space">
            Democratizing design precision through AI synthesis. Engineered for
            the creative elite who demand archival textile quality.
          </p>
        </div>

        {/* Product Links */}
        <div className="flex flex-col gap-8">
          <div>
            <h6 className="text-[11px] font-bold tracking-[0.4em] uppercase opacity-20 mb-8 font-space">
              Product
            </h6>
            <ul className="space-y-4">
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
            </ul>
          </div>
        </div>

        {/* Protocol Links */}
        <div className="flex flex-col gap-8">
          <div>
            <h6 className="text-[11px] font-bold tracking-[0.4em] uppercase opacity-20 mb-8 font-space">
              Protocol
            </h6>
            <ul className="space-y-4">
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
            </ul>
          </div>
        </div>

        {/* Support Links */}
        <div className="flex flex-col gap-8">
          <div>
            <h6 className="text-[11px] font-bold tracking-[0.4em] uppercase opacity-20 mb-8 font-space">
              Support
            </h6>
            <ul className="space-y-4">
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
            </ul>
          </div>
        </div>

        {/* Network Links */}
        <div className="flex flex-col gap-8">
          <div>
            <h6 className="text-[11px] font-bold tracking-[0.4em] uppercase opacity-20 mb-8 font-space">
              Network
            </h6>
            <ul className="space-y-4">
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
            </ul>
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
        <div className="absolute bottom-0 w-full flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-bold tracking-[0.4em] opacity-30 uppercase font-space">
          <span>STAMP.AI © 2024 / ARCHIVE</span>
          <span className="hidden md:inline">
            Privacy Protocols / Terms of Service
          </span>
          <span>EST. NYC TERMINAL</span>
        </div>
      </div>
    </footer>
  );
}

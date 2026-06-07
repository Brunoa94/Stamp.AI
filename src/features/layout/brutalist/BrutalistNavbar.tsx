"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/features/ui/button";
import { AnimatedLogoDot } from "./AnimatedLogoDot";
import { Span } from "@/features/ui/span";
import { List } from "@/features/ui/list";

/**
 * Brutalist Navbar Component
 *
 * Fixed header with three-column layout:
 * - Left: Logo with animated dot + subtitle
 * - Center: "STAMP IT" CTA with gradient border
 * - Right: Navigation menu + cart dropdown + login button
 */

const NAV_LINKS = [
  { id: "nav-home-link", href: "#", label: "Home" },
  { id: "nav-products-link", href: "#pricing", label: "Products" },
  { id: "nav-gallery-link", href: "#", label: "Gallery" },
  { id: "nav-about-link", href: "#about", label: "About" },
];

const CART_ITEMS = [
  {
    name: "Essential Box Tee",
    details: "Size M / Qty 1 / $48.00",
  },
  {
    name: "Archival Black Tee",
    details: "Size L / Qty 2 / $104.00",
  },
  {
    name: "Concrete Hoodie",
    details: "Size M / Qty 1 / $85.00",
  },
];

export function BrutalistNavbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-40 px-8 py-4 flex items-center justify-between text-ink bg-concrete/80 backdrop-blur-sm">
      {/* Left: Logo with animated dot */}
      <div className="flex-1 flex justify-start items-center">
        <div className="flex flex-col">
          <Link
            href="/"
            id="header-logo-redesign"
            className="flex items-center font-anton text-4xl md:text-6xl leading-none tracking-tighter uppercase hover:opacity-80 transition-opacity"
          >
            <Span unstyled>STAMP</Span>
            <AnimatedLogoDot size="md" className="mx-1.5" />
            <Span unstyled>AI</Span>
          </Link>
          <Span variant="micro" className="mt-1 opacity-60">
            Est. 2024 / NYC
          </Span>
        </div>
      </div>

      {/* Center: "STAMP IT" CTA */}
      <div className="flex-1 flex justify-center items-center">
        <Button
          asChild
          variant="default"
          className="cta-gradient-border h-auto rounded-none bg-ink px-8 md:px-12 py-2.5 md:py-3.5 font-anton text-base md:text-xl tracking-widest uppercase hover:scale-110 transition-all duration-300 shadow-[8px_8px_0px_rgba(10,10,10,0.1)] text-white"
        >
          <Link href="/create" id="header-center-cta">
            STAMP IT
          </Link>
        </Button>
      </div>

      {/* Right: Navigation + Cart + Login */}
      <div className="flex-1 flex justify-end items-center mr-0 md:mr-16 relative">
        {/* Navigation menu (desktop only, positioned below header) */}
        <nav className="hidden lg:block absolute top-full right-0 mt-10">
          <List className="flex flex-col items-end gap-2">
            {NAV_LINKS.map((link) => (
              <li key={link.id} className="overflow-hidden">
                <Link
                  href={link.href}
                  id={link.id}
                  className="nav-link uppercase text-[10px] font-bold tracking-widest font-space hover:text-brandPurple transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </List>
        </nav>

        <div className="flex items-center gap-3 md:gap-6">
          {/* Cart dropdown (desktop only XL) */}
          <div className="hidden xl:block relative group/cart">
            <Button
              variant="ghost"
              className="h-auto rounded-none border border-ink/10 px-4 py-2 hover:border-brandCyan hover:bg-transparent transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-ink" />
              <Span variant="default" className="tracking-widest">
                Cart ({CART_ITEMS.length})
              </Span>
            </Button>

            {/* Cart preview dropdown */}
            <div className="absolute top-full right-0 mt-4 w-80 bg-white border border-ink/10 p-6 shadow-[8px_8px_0px_rgba(10,10,10,0.05)] opacity-0 translate-y-2 pointer-events-none group-hover/cart:opacity-100 group-hover/cart:translate-y-0 group-hover/cart:pointer-events-auto transition-all duration-300 z-50">
              <div className="flex flex-col gap-3">
                {CART_ITEMS.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-1 hover:bg-concrete/30 p-2 -m-2 rounded transition-colors"
                  >
                    <Span className="font-anton text-sm uppercase tracking-tight text-ink">
                      {item.name}
                    </Span>
                    <Span
                      variant="micro"
                      className="opacity-60 tracking-widest text-ink"
                    >
                      {item.details}
                    </Span>
                  </div>
                ))}
              </div>

              <div className="border-t border-ink/10 pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <Span
                    variant="default"
                    className="opacity-40 tracking-widest"
                  >
                    Subtotal
                  </Span>
                  <Span className="text-[10px] font-anton text-ink tracking-normal">
                    $237.00 TOTAL
                  </Span>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  className="h-auto w-full rounded-none flex items-center justify-center gap-2 text-brandCyan font-bold text-[10px] tracking-widest uppercase hover:text-brandRed hover:bg-transparent transition-colors border border-brandCyan/20 py-2 font-space"
                >
                  <Link href="/cart" id="header-cart-preview-link">
                    <ShoppingBag className="w-3 h-3" />
                    View Full Cart
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Login button */}
          <Button
            asChild
            variant="outline"
            className="h-auto rounded-none border border-ink/20 px-4 md:px-6 py-2 font-bold text-[10px] tracking-widest uppercase hover:text-brandRed hover:border-brandRed transition-all duration-300 whitespace-nowrap font-space"
          >
            <Link href="/auth/login" id="nav-login-btn-header">
              LOGIN
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

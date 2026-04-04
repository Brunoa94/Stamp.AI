"use client";

import { useState } from "react";
import { MobileNavbarSidebar } from "./MobileNavbarSidebar";
import { MobileNavbarHeader } from "./MobileNavbarHeader";
import { useScrolled } from "@/hooks/useScrolled";
import { useCartSummary } from "@/queries/cartQueries";
import { cn } from "@/lib/utils";

const navbarStyles = {
  header:
    "md:hidden sticky top-0 z-50 w-full pt-safe transition-[background-color,backdrop-filter,border-color,box-shadow] duration-500",
  scrolled:
    "bg-white dark:bg-gray-900 backdrop-blur-md border-b border-[#E8E0F0] dark:border-gray-700/30 shadow-sm",
  top: "bg-transparent border-b border-transparent shadow-none",
};

export function MobileNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScrolled(50);
  const { itemCount } = useCartSummary();

  return (
    <>
      <header
        className={cn(
          navbarStyles.header,
          isScrolled ? navbarStyles.scrolled : navbarStyles.top,
        )}
      >
        <MobileNavbarHeader
          itemCount={itemCount}
          isMenuOpen={isMenuOpen}
          onOpenMenu={() => setIsMenuOpen(true)}
        />
      </header>

      <MobileNavbarSidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
}

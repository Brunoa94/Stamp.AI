import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * SectionCard - Consistent wrapper for checkout sections
 * Uses cart-style container matching profile page design
 */
export function SectionCard({ children, className }: SectionCardProps) {
  return (
    <section className={cn("bg-white border border-ink/10 p-8 lg:p-12 shadow-[0_2px_15px_rgba(0,0,0,0.02)] space-y-6", className)}>
      {children}
    </section>
  );
}

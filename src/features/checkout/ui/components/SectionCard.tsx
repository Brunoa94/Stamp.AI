import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * SectionCard - Consistent wrapper for checkout sections
 * Provides glass-card styling with consistent padding and spacing
 */
export function SectionCard({ children, className }: SectionCardProps) {
  return (
    <section className={cn("glass-card p-8 rounded-none space-y-6", className)}>
      {children}
    </section>
  );
}

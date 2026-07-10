/**
 * DashboardCard
 *
 * Standard luxury card surface: white background, hairline divider border,
 * gold hover accent with a subtle lift. Optional uppercase label row.
 */

import { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";

interface DashboardCardPropsI extends PropsWithChildren {
  label?: string;
  icon?: ReactNode;
  className?: string;
}

export function DashboardCard({
  label,
  icon,
  className,
  children,
}: DashboardCardPropsI) {
  return (
    <section
      className={cn(
        "border border-(--color-stamp-divider) bg-(--color-stamp-white) p-8 transition-all duration-500 hover:-translate-y-1 hover:border-(--color-stamp-gold) hover:shadow-(--shadow-stamp-card-hover) lg:p-10",
        className,
      )}
    >
      {label && (
        <div className="mb-6 flex items-center justify-between gap-4">
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            {label}
          </Span>
          {icon}
        </div>
      )}
      {children}
    </section>
  );
}

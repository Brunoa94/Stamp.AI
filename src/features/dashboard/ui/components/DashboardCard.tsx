/**
 * DashboardCard
 *
 * Standard card surface: white rounded-xl card with a divider border and a
 * soft resting shadow. Optional uppercase amber eyebrow row with an icon.
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
        "rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-6 shadow-(--shadow-stamp-card) lg:p-8",
        className,
      )}
    >
      {label && (
        <div className="mb-6 flex items-center justify-between gap-4">
          <Span variant="label" className="text-(--color-stamp-gold-text)">
            {label}
          </Span>
          {icon}
        </div>
      )}
      {children}
    </section>
  );
}

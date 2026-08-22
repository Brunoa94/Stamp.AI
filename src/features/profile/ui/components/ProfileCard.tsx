/**
 * ProfileCard
 *
 * Luxury card surface for profile sections matching orders/cart design:
 * - White background with border and shadow
 * - Consistent padding and hover effects
 * - Section header with edit action
 */

import { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Button } from "@/features/ui/button";

interface ProfileCardProps extends PropsWithChildren {
  label?: string;
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: string;
  editLabel?: string;
  onEdit?: () => void;
  showEditButton?: boolean;
  className?: string;
}

export function ProfileCard({
  label,
  icon,
  title,
  subtitle,
  editLabel,
  onEdit,
  showEditButton = true,
  className,
  children,
}: ProfileCardProps) {
  return (
    <section
      className={cn(
        "border-2 border-(--color-stamp-chocolate)/15 bg-(--color-stamp-white) p-6 md:p-8 shadow-(--shadow-stamp-card) transition-all duration-500 hover:-translate-y-1 hover:border-(--color-stamp-gold) hover:shadow-(--shadow-stamp-card-hover)",
        className,
      )}
    >
      {/* Section Header */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between mb-6 md:mb-8">
        <div className="space-y-2">
          <Heading
            as="h2"
            variant="panelTitleCompact"
            className="text-(--color-stamp-chocolate)"
          >
            {title}
          </Heading>
          {subtitle && (
            <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
              {subtitle}
            </Paragraph>
          )}
        </div>
        {showEditButton && onEdit && editLabel && (
          <Button
            onClick={onEdit}
            className="bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-6 py-3 text-[10px] font-bold tracking-[0.15em] uppercase"
          >
            {editLabel}
          </Button>
        )}
      </div>

      {children}
    </section>
  );
}

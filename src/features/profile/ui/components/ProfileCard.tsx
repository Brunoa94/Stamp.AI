/**
 * ProfileCard
 *
 * Standard luxury card surface for profile sections: white background,
 * hairline divider border, gold hover accent with a subtle lift.
 * Includes section header with icon and optional edit action.
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
  title: string;
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
        "border-2 border-(--color-stamp-chocolate)/15 bg-(--color-stamp-white) p-8 shadow-(--shadow-stamp-card) transition-all duration-500 hover:-translate-y-1 hover:border-(--color-stamp-gold) hover:shadow-(--shadow-stamp-card-hover) lg:p-10",
        className,
      )}
    >
      {/* Label Row */}
      {label && (
        <div className="mb-6 flex items-center justify-between gap-4">
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            {label}
          </Span>
          {icon && (
            <div className="text-(--color-stamp-taupe)">{icon}</div>
          )}
        </div>
      )}

      {/* Section Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-1">
          <Heading
            as="h2"
            variant="cardCompact"
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
            variant="ghost-stamp"
            className="text-[10px] px-4 py-2"
          >
            {editLabel}
          </Button>
        )}
      </div>

      {children}
    </section>
  );
}

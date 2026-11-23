/**
 * ProfileCard
 *
 * Card surface for a profile section: a white rounded-xl card with a divider
 * border and soft shadow. Its header follows the shared section-header order
 * (amber eyebrow, title with a handwritten accent word, subtitle) with the
 * edit action aligned right on wider screens.
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
        "rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-6 shadow-(--shadow-stamp-card) md:p-8",
        className,
      )}
    >
      {/* Section Header */}
      <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-8">
        <div className="space-y-2">
          {label && (
            <Span as="p" variant="label" className="text-(--color-stamp-gold-text)">
              {label}
            </Span>
          )}
          <Heading
            as="h2"
            variant="panelTitleCompact"
            className="text-(--color-stamp-chocolate)"
          >
            {title}
          </Heading>
          {subtitle && (
            <Paragraph variant="xs" className="text-(--color-stamp-taupe)">
              {subtitle}
            </Paragraph>
          )}
        </div>
        {showEditButton && onEdit && editLabel && (
          <Button onClick={onEdit} variant="secondary-compact">
            {editLabel}
          </Button>
        )}
      </div>

      {children}
    </section>
  );
}

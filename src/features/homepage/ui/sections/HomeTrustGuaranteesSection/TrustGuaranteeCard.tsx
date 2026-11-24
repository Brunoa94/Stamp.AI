/**
 * TrustGuaranteeCard
 *
 * Individual trust guarantee card with icon, title, and description.
 * Uses CSS-based staggered reveal animation.
 */

import { cn } from "@/lib/utils";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { GUARANTEE_ICON_MAP } from "../../../lib/constants/guaranteeIcons";

interface TrustGuaranteeCardProps {
  icon: string;
  title: string;
  description: string;
  isVisible: boolean;
}

export function TrustGuaranteeCard({
  icon,
  title,
  description,
  isVisible,
}: TrustGuaranteeCardProps) {
  const Icon = GUARANTEE_ICON_MAP[icon];

  return (
    <article
      className={cn(
        "flex flex-col items-center rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-8 text-center shadow-(--shadow-stamp-card) transition-all duration-500",
        "process-card-reveal process-card-reveal--mobile",
        isVisible && "process-card-reveal--visible",
      )}
    >
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-(--color-stamp-peach)">
        {Icon && <Icon aria-hidden className="h-6 w-6 text-(--color-stamp-gold-text)" />}
      </div>
      <Heading
        as="h3"
        variant="item"
        className="mb-2 text-(--color-stamp-chocolate)"
      >
        {title}
      </Heading>
      <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
        {description}
      </Paragraph>
    </article>
  );
}

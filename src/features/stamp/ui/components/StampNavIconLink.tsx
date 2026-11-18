"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Span } from "@/features/ui/span";
import { stampNavIconLinkVariants } from "@/features/stamp/lib/variants/stampNavVariants";

interface PropsI {
  href: string;
  icon: LucideIcon;
  label: string;
  /** Hide the label visually; it stays the link's accessible name. */
  iconOnly?: boolean;
  /** Show only the icon below `xl`, where the full nav is too wide. */
  compact?: boolean;
}

/** Desktop header link: icon plus label, or a round icon-only button. */
export function StampNavIconLink({
  href,
  icon: Icon,
  label,
  iconOnly = false,
  compact = false,
}: PropsI) {
  const labelHidden = iconOnly || compact;

  return (
    <Link
      href={href}
      aria-label={labelHidden ? label : undefined}
      title={labelHidden ? label : undefined}
      className={stampNavIconLinkVariants({ iconOnly })}
    >
      <Icon className="size-5" strokeWidth={1.75} aria-hidden />
      {!iconOnly && (
        <Span unstyled className={compact ? "hidden xl:inline" : undefined}>
          {label}
        </Span>
      )}
    </Link>
  );
}

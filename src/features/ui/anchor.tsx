import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Anchor
 *
 * Typography atom for links and anchors.
 * Encapsulates: font-family, font-weight, text-decoration, underline-offset.
 * All other styling (color, font-size) must come from the caller via `className`.
 *
 * Variants:
 * - default     Standard link with underline
 * - subtle      No underline, underline on hover
 * - bold        Bold link with underline
 */

const anchorVariants = {
  default: "font-body font-normal underline underline-offset-2 hover:opacity-80 transition-opacity",
  subtle: "font-body font-normal no-underline hover:underline underline-offset-2 transition-all",
  bold: "font-body font-bold underline underline-offset-2 hover:opacity-80 transition-opacity",
} as const;

type AnchorVariant = keyof typeof anchorVariants;

interface AnchorProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  variant?: AnchorVariant;
  external?: boolean;
}

export function Anchor({
  href,
  variant = "default",
  external,
  className,
  children,
  ...props
}: AnchorProps) {
  // Auto-detect external links
  const isExternal = external ?? (href.startsWith("http") || href.startsWith("//"));

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(anchorVariants[variant], className)}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={cn(anchorVariants[variant], className)}
      {...props}
    >
      {children}
    </Link>
  );
}

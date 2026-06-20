import { cn } from "@/lib/utils";

/**
 * List
 *
 * Semantic atom for unordered lists.
 * Strips default list styling. Layout (spacing, direction) must come from the caller via `className`.
 * Item content typography should use Span or Paragraph inside each <li>.
 */

interface ListProps {
  className?: string;
  children: React.ReactNode;
}

export function List({ className, children }: ListProps) {
  return <ul className={cn("list-none", className)}>{children}</ul>;
}

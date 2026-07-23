import { cn } from "@/lib/utils";

/**
 * List
 *
 * Semantic atom for unordered lists.
 * Strips default list styling. Layout (spacing, direction) must come from the caller via `className`.
 * Item content typography should use Span or Paragraph inside each <li>.
 */

interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
  children: React.ReactNode;
}

export function List({ className, children, ...props }: ListProps) {
  return (
    <ul className={cn("list-none", className)} {...props}>
      {children}
    </ul>
  );
}

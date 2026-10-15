import { cn } from "@/lib/utils";

/**
 * List
 *
 * Semantic atom for unordered and ordered lists (`as="ol"` for sequences such as steps).
 * Strips default list styling. Layout (spacing, direction) must come from the caller via `className`.
 * Item content typography should use Span or Paragraph inside each <li>.
 */

interface ListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  as?: "ul" | "ol";
  className?: string;
  children: React.ReactNode;
}

export function List({ as: Tag = "ul", className, children, ...props }: ListProps) {
  return (
    <Tag className={cn("list-none", className)} {...props}>
      {children}
    </Tag>
  );
}

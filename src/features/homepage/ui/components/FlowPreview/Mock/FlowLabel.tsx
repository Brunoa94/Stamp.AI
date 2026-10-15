import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import type { FlowLabelSizeType } from "@/features/homepage/lib/types/flowPreview";

const sizeClasses: Record<FlowLabelSizeType, string> = {
  sm: "text-3xs",
  md: "text-2xs",
};

interface PropsI {
  size?: FlowLabelSizeType;
  className?: string;
  children: React.ReactNode;
}

/**
 * FlowLabel
 *
 * Uppercase field label inside the flow demo's mock screens.
 */
export function FlowLabel({ size = "md", className, children }: PropsI) {
  return (
    <Span
      unstyled
      className={cn(
        "font-body font-bold uppercase tracking-widest text-(--color-stamp-chocolate)/80",
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </Span>
  );
}

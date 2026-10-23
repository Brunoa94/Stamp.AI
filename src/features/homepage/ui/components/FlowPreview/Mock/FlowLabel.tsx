import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { flowLabelVariants } from "@/features/homepage/lib/variants/flowLabelVariants";
import type { FlowLabelSizeType } from "@/features/homepage/lib/types/flowPreview";

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
    <Span unstyled className={cn(flowLabelVariants({ size }), className)}>
      {children}
    </Span>
  );
}

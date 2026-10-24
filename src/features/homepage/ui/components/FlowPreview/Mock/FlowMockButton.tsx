import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { flowMockButtonVariants } from "@/features/homepage/lib/variants/flowMockButtonVariants";
import type { FlowMockButtonToneType } from "@/features/homepage/lib/types/flowPreview";

interface PropsI {
  tone: FlowMockButtonToneType;
  className?: string;
  children: React.ReactNode;
}

/**
 * FlowMockButton
 *
 * Non-interactive picture of a button inside the flow demo. The scripted
 * "user" presses it by switching tone, so it is a span, not a <button>.
 */
export function FlowMockButton({ tone, className, children }: PropsI) {
  return (
    <Span unstyled className={cn(flowMockButtonVariants({ tone }), className)}>
      {children}
    </Span>
  );
}

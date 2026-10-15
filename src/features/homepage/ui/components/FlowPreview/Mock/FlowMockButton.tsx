import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import type { FlowMockButtonToneType } from "@/features/homepage/lib/types/flowPreview";

const toneClasses: Record<FlowMockButtonToneType, string> = {
  dark: "bg-(--color-stamp-chocolate) text-(--color-stamp-white)",
  gold: "bg-(--color-stamp-gold) text-(--color-stamp-chocolate)",
  muted: "bg-(--color-stamp-chocolate)/40 text-(--color-stamp-white)",
  pressed: "bg-(--color-stamp-chocolate)/80 text-(--color-stamp-white)",
  outline:
    "border border-(--color-stamp-chocolate)/15 bg-(--color-stamp-white) text-(--color-stamp-chocolate)",
};

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
    <Span
      unstyled
      className={cn(
        "flex h-11 items-center justify-center gap-2 rounded-xs px-3 text-2xs font-bold uppercase tracking-ultra transition-colors duration-300",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </Span>
  );
}

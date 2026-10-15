import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import type { FlowRailStatusType } from "@/features/homepage/lib/types/flowPreview";

const dotClasses: Record<FlowRailStatusType, string> = {
  active: "bg-(--color-stamp-gold) animate-flow-pulse",
  done: "bg-(--color-stamp-chocolate)/40",
  upcoming: "bg-(--color-stamp-chocolate)/10",
};

const labelClasses: Record<FlowRailStatusType, string> = {
  active: "font-semibold text-(--color-stamp-chocolate)",
  done: "text-(--color-stamp-taupe)",
  upcoming: "text-(--color-stamp-chocolate)/60",
};

interface PropsI {
  label: string;
  status: FlowRailStatusType;
  onSelect: () => void;
}

/**
 * FlowRailItem
 *
 * One entry in the flow demo's step list: a status dot and a label that
 * jumps the demo to that step.
 */
export function FlowRailItem({ label, status, onSelect }: PropsI) {
  return (
    <li className="flex items-center gap-3.5">
      <Span unstyled className={cn("size-1.75 shrink-0 rounded-full", dotClasses[status])} aria-hidden="true" />
      <Button
        variant="unstyled"
        onClick={onSelect}
        aria-current={status === "active" ? "step" : undefined}
        className={cn(
          "min-h-8 cursor-pointer rounded-sm text-left font-body text-xs uppercase tracking-wide hover:text-(--color-stamp-gold) focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold)",
          labelClasses[status],
        )}
      >
        {label}
      </Button>
    </li>
  );
}

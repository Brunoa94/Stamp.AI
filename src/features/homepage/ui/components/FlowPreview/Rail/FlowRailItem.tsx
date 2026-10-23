import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import {
  flowRailDotVariants,
  flowRailLabelVariants,
} from "@/features/homepage/lib/variants/flowRailItemVariants";
import type { FlowRailStatusType } from "@/features/homepage/lib/types/flowPreview";

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
      <Span unstyled className={flowRailDotVariants({ status })} aria-hidden="true" />
      <Button
        variant="unstyled"
        onClick={onSelect}
        aria-current={status === "active" ? "step" : undefined}
        className={flowRailLabelVariants({ status })}
      >
        {label}
      </Button>
    </li>
  );
}

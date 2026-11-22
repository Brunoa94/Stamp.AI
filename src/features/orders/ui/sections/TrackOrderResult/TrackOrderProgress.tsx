import { useTranslations } from "next-intl";
import { AlertTriangle, Check, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { List } from "@/features/ui/list";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import {
  TRACKING_STAGES,
  type TrackingProgressT,
} from "@/features/orders/lib/helpers/trackingStages";

/**
 * TrackOrderProgress
 *
 * Where the order stands: four stages from placing it to delivery, with the
 * current one marked, or a note when the order left that path (cancelled,
 * or a production problem).
 */

interface PropsI {
  progress: TrackingProgressT;
}

export function TrackOrderProgress({ progress }: PropsI) {
  const t = useTranslations("orders.track");

  if (progress.kind !== "active") {
    const isCancelled = progress.kind === "cancelled";
    const Icon = isCancelled ? XCircle : AlertTriangle;

    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-lg border border-(--color-stamp-error)/30 bg-(--color-stamp-error)/5 p-4"
      >
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-(--color-stamp-error)" aria-hidden="true" />
        <Paragraph unstyled className="text-sm text-(--color-stamp-chocolate)">
          {t(isCancelled ? "result.cancelled" : "result.hasIssues")}
        </Paragraph>
      </div>
    );
  }

  return (
    <List as="ol" className="grid grid-cols-4 gap-2">
      {TRACKING_STAGES.map((stage, index) => (
        <li
          key={stage}
          aria-current={index === progress.stageIndex ? "step" : undefined}
          className="flex flex-col items-center gap-2 text-center"
        >
          <Span
            unstyled
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold",
              index <= progress.stageIndex
                ? "border-(--color-stamp-gold) bg-(--color-stamp-gold) text-(--color-stamp-chocolate)"
                : "border-(--color-stamp-divider) bg-(--color-stamp-white) text-(--color-stamp-taupe)",
              index === progress.stageIndex && "ring-4 ring-(--color-stamp-gold)/25",
            )}
          >
            {index < progress.stageIndex ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
          </Span>
          <Span
            variant="micro"
            className={cn(
              index <= progress.stageIndex ? "text-(--color-stamp-chocolate)" : "text-(--color-stamp-taupe)",
            )}
          >
            {t(`stages.${stage}`)}
          </Span>
        </li>
      ))}
    </List>
  );
}

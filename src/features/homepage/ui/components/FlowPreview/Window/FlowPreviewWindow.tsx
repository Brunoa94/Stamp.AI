import { ArrowLeft } from "lucide-react";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";

interface PropsI {
  /** Accessible name for the whole demo */
  label: string;
  /** "Step 04 / Results" */
  stepTag: string;
  /** Extra classes for the window, e.g. to stretch it to fill its parent */
  className?: string;
  children: React.ReactNode;
}

/**
 * FlowPreviewWindow
 *
 * Browser-window chrome around the creation-flow demo: traffic-light dots,
 * the current step tag and a fixed-height stage for the step screens. The
 * stage grows past that height only when the window is stretched by its parent.
 * The stage is decorative (it re-animates every few seconds), so it is hidden
 * from assistive tech; the step rail beside it carries the same information.
 */
export function FlowPreviewWindow({ label, stepTag, className, children }: PropsI) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative flex w-full max-w-160 flex-col overflow-hidden rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-cream) shadow-(--shadow-stamp-card-hover)",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-(--color-stamp-divider) bg-(--color-stamp-white) px-4 py-3">
        <Span unstyled className="size-2.5 rounded-full bg-(--color-stamp-chocolate)/10" />
        <Span unstyled className="size-2.5 rounded-full bg-(--color-stamp-chocolate)/10" />
        <Span unstyled className="size-2.5 rounded-full bg-(--color-stamp-chocolate)/10" />
        <Span
          variant="pill"
          className="ml-2.5 inline-flex items-center gap-1.5 rounded-md border border-(--color-stamp-divider) px-2 py-1 tracking-widest text-(--color-stamp-chocolate)"
        >
          <ArrowLeft className="size-3" strokeWidth={2.4} />
          {stepTag}
        </Span>
      </div>
      <div className="relative h-135 grow overflow-hidden" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}

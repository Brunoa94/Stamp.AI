import { ArrowLeft } from "lucide-react";
import { Span } from "@/features/ui/span";

interface PropsI {
  /** Accessible name for the whole demo */
  label: string;
  /** "Step 04 / Results" */
  stepTag: string;
  children: React.ReactNode;
}

/**
 * FlowPreviewWindow
 *
 * Browser-window chrome around the creation-flow demo: traffic-light dots,
 * the current step tag and a fixed-height stage for the step screens.
 * The stage is decorative (it re-animates every few seconds), so it is hidden
 * from assistive tech; the step rail beside it carries the same information.
 */
export function FlowPreviewWindow({ label, stepTag, children }: PropsI) {
  return (
    <div
      role="img"
      aria-label={label}
      className="relative w-full max-w-160 overflow-hidden rounded-lg border border-(--color-stamp-chocolate)/10 bg-(--color-stamp-cream) shadow-2xl shadow-(--color-stamp-chocolate)/15"
    >
      <div className="flex items-center gap-2 border-b border-(--color-stamp-chocolate)/10 bg-(--color-stamp-white) px-4 py-3">
        <Span unstyled className="size-2.5 rounded-full bg-(--color-stamp-chocolate)/10" />
        <Span unstyled className="size-2.5 rounded-full bg-(--color-stamp-chocolate)/10" />
        <Span unstyled className="size-2.5 rounded-full bg-(--color-stamp-chocolate)/10" />
        <Span
          variant="pill"
          className="ml-2.5 inline-flex items-center gap-1.5 border border-(--color-stamp-chocolate)/10 px-2 py-1 tracking-widest text-(--color-stamp-chocolate)"
        >
          <ArrowLeft className="size-3" strokeWidth={2.4} />
          {stepTag}
        </Span>
      </div>
      <div className="relative h-135 overflow-hidden" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}

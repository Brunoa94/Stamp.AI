"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
  Children,
  isValidElement,
  cloneElement,
  ReactElement,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";

/**
 * ExpandablePicker
 *
 * A reusable expandable picker component for mobile views.
 * Shows initial items with a "Show more" button that expands as an overlay.
 * Auto-collapses when scrolled past a configurable threshold.
 *
 * Usage:
 * <ExpandablePicker
 *   initialCount={4}
 *   showMoreLabel="Show {count} more"
 *   showLessLabel="Show less"
 *   columns={2}
 * >
 *   {items.map(item => <ItemCard key={item.id} {...item} />)}
 * </ExpandablePicker>
 */

// Threshold for auto-collapse (percentage from top of viewport)
const AUTO_COLLAPSE_THRESHOLD = 0.4;

interface PropsI {
  /** Number of items to show initially before expanding */
  initialCount: number;
  /** Label for the "Show more" button. Use {count} as placeholder for remaining count */
  showMoreLabel: string;
  /** Label for the "Show less" button */
  showLessLabel: string;
  /** Number of grid columns (default: 2) */
  columns?: 2 | 3 | 4;
  /** Gap between grid items (default: 3 = gap-3) */
  gap?: number;
  /** Optional header to render above the grid */
  header?: ReactNode;
  /** Optional className for the container */
  className?: string;
  /** The items to render */
  children: ReactNode;
}

export function ExpandablePicker({
  initialCount,
  showMoreLabel,
  showLessLabel,
  columns = 2,
  gap = 3,
  header,
  className,
  children,
}: PropsI) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const showLessButtonRef = useRef<HTMLButtonElement>(null);

  // Convert children to array for slicing
  const childArray = Children.toArray(children).filter(isValidElement);
  const totalCount = childArray.length;
  const visibleChildren = childArray.slice(0, initialCount);
  const hiddenChildren = childArray.slice(initialCount);
  const remainingCount = hiddenChildren.length;

  // Auto-collapse when "Show less" button scrolls past threshold
  const handleScroll = useCallback(() => {
    if (!expanded || !showLessButtonRef.current) return;

    const rect = showLessButtonRef.current.getBoundingClientRect();
    const threshold = window.innerHeight * AUTO_COLLAPSE_THRESHOLD;

    if (rect.top < threshold) {
      setExpanded(false);
    }
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;

    // Find the scrollable parent (the stamp section container)
    const scrollParent =
      containerRef.current?.closest("[id^='step-']") ??
      containerRef.current?.closest(".overflow-y-auto") ??
      window;

    const target = scrollParent === window ? window : scrollParent;
    target.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      target.removeEventListener("scroll", handleScroll);
    };
  }, [expanded, handleScroll]);

  // Grid column classes
  const gridColsClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 3
        ? "grid-cols-3"
        : "grid-cols-4";
  const gapClass = `gap-${gap}`;

  // Format label with count placeholder
  const formatLabel = (label: string, count: number) =>
    label.replace("{count}", String(count));

  // If all items fit in initial view, just render them
  if (totalCount <= initialCount) {
    return (
      <div ref={containerRef} className={className}>
        {header}
        <div className={cn("grid", gridColsClass, gapClass)}>{children}</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      {header}

      <div className="relative">
        {/* Initial items - always visible */}
        <div className={cn("grid", gridColsClass, gapClass)}>
          {visibleChildren}
        </div>

        {/* Expanded overlay with remaining items */}
        {expanded && (
          <div className="absolute left-0 right-0 top-full z-10 bg-white pt-3 shadow-lg border-x border-b border-(--color-stamp-divider) pb-40 md:pb-0">
            <div className={cn("grid", gridColsClass, gapClass, "px-0")}>
              {hiddenChildren}
            </div>

            {/* Show less button */}
            <Button
              ref={showLessButtonRef}
              type="button"
              variant="ghost"
              onClick={() => setExpanded(false)}
              className="w-full flex items-center justify-center gap-2 py-3 mt-3 text-(--color-stamp-taupe) hover:text-(--color-stamp-chocolate) hover:bg-(--color-stamp-off-white) transition-colors"
            >
              <Span variant="micro" className="tracking-widest">
                {showLessLabel}
              </Span>
              <ChevronDown
                aria-hidden="true"
                className={cn("h-4 w-4 rotate-180")}
              />
            </Button>
          </div>
        )}
      </div>

      {/* Show more button - visible when collapsed */}
      {!expanded && remainingCount > 0 && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setExpanded(true)}
          className="w-full flex items-center justify-center gap-2 py-3 mt-3 text-(--color-stamp-taupe) hover:text-(--color-stamp-chocolate) hover:bg-(--color-stamp-off-white) transition-colors"
        >
          <Span variant="micro" className="tracking-widest">
            {formatLabel(showMoreLabel, remainingCount)}
          </Span>
          <ChevronDown aria-hidden="true" className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

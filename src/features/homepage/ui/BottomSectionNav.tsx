"use client";

import { Button } from "@/features/ui/button";
import clsx from "clsx";
import { ArrowDownToLine, ChevronDown } from "lucide-react";

interface BottomSectionNavProps {
  sectionIds: readonly string[];
  sectionLabels: Record<string, string>;
  currentSectionIndex: number;
  isAtFooter: boolean;
  isHidden: boolean;
  onScrollToSection: (index: number) => void;
  onScrollToFooter: () => void;
}

export function BottomSectionNav({
  sectionIds,
  sectionLabels,
  currentSectionIndex,
  isAtFooter,
  isHidden,
  onScrollToSection,
  onScrollToFooter,
}: BottomSectionNavProps) {
  return (
    <div
      className={clsx(
        "fixed inset-x-0 bottom-0 z-50 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] transition-all duration-500 ease-out md:px-4",
        isHidden
          ? "translate-y-[115%] opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100",
      )}
    >
      <nav
        aria-label="Bottom section navigation"
        className="glass-card w-full overflow-x-auto rounded-t-2xl border border-white/60 bg-white/55 px-2 py-2 shadow-2xl"
      >
        <div className="flex min-w-max items-center gap-1.5 md:justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              onScrollToSection(
                Math.min(sectionIds.length - 1, currentSectionIndex + 1),
              )
            }
            aria-label="Go to next section"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/75 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700 hover:bg-white md:px-4 md:text-xs"
          >
            <span>Stamp.AI</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>

          {sectionIds.map((id, index) => (
            <Button
              key={`bottom-nav-${id}`}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onScrollToSection(index)}
              aria-label={`Go to ${sectionLabels[id]} section`}
              aria-current={currentSectionIndex === index ? "true" : undefined}
              className={clsx(
                "rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] md:px-4 md:text-xs",
                {
                  "bg-linear-to-r from-[#7C3AED] via-[#FF8C42] to-[#06B6D4] text-white shadow-lg shadow-purple-500/25 hover:text-white":
                    currentSectionIndex === index,
                  "text-slate-600 hover:bg-white/70 hover:text-slate-900":
                    currentSectionIndex !== index,
                },
              )}
            >
              {sectionLabels[id]}
            </Button>
          ))}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onScrollToFooter}
            aria-label="Go to footer"
            aria-current={isAtFooter ? "true" : undefined}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] md:px-4 md:text-xs",
              {
                "border border-[#7C3AED]/70 text-[#7C3AED] shadow-sm hover:text-[#7C3AED]":
                  isAtFooter,
                "border border-[#06B6D4]/55 text-slate-600 hover:border-[#7C3AED]/70 hover:text-slate-900":
                  !isAtFooter,
              },
            )}
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
            <span>Footer</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}

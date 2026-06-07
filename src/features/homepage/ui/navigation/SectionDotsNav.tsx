"use client";

import clsx from "clsx";
import { Button } from "@/features/ui/button";

interface SectionDotsNavProps {
  sectionIds: readonly string[];
  currentSectionIndex: number;
  onScrollToSection: (index: number) => void;
}

export function SectionDotsNav({
  sectionIds,
  currentSectionIndex,
  onScrollToSection,
}: SectionDotsNavProps) {
  return (
    <nav
      className="fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3 md:flex"
      aria-label="Section navigation"
    >
      {sectionIds.map((id, index) => (
        <Button
          key={id}
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onScrollToSection(index)}
          className={clsx(
            "group relative h-3 w-3 rounded-full border-2 p-0 transition-all duration-300",
            {
              "border-[#7C3AED] bg-[#7C3AED] scale-125":
                currentSectionIndex === index,
              "border-slate-300 bg-transparent hover:border-[#7C3AED] hover:scale-110":
                currentSectionIndex !== index,
            },
          )}
          aria-label={`Go to ${id.replace("-", " ")} section`}
          aria-current={currentSectionIndex === index ? "true" : undefined}
        >
          <span className="absolute right-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 transition-opacity group-hover:opacity-100">
            {id.replace("-", " ")}
          </span>
        </Button>
      ))}
    </nav>
  );
}

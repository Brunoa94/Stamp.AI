"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, Clock3, History } from "lucide-react";
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import { CreateProductSelectors } from "@/features/stamp/CreateProduct/lib/context/selectors";
import { useCreateProductSubscriberActions } from "@/features/stamp/CreateProduct/lib/context/actions";
import type { GeneratedHistoryItem } from "@/features/stamp/CreateProduct/lib/context/types";

function mapTimestampToLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface GeneratedHistoryItemCardProps {
  item: GeneratedHistoryItem;
  isSelected: boolean;
  onSelect: (item: GeneratedHistoryItem) => void;
}

function GeneratedHistoryItemCard({
  item,
  isSelected,
  onSelect,
}: GeneratedHistoryItemCardProps) {
  const timeLabel = mapTimestampToLabel(item.createdAt);

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onSelect(item)}
      className={cn(
        "group relative h-auto shrink-0 rounded-xl border p-1.5 text-left transition-all duration-200",
        isSelected
          ? "border-violet-500 bg-violet-50 shadow-sm"
          : "border-slate-200/80 bg-white/80 hover:border-violet-300 hover:bg-violet-50/50",
      )}
      aria-label={`Use generated image from ${timeLabel}`}
    >
      <div className="relative h-22 w-22 overflow-hidden rounded-lg bg-slate-100">
        <Image
          src={item.imageUrl}
          alt="Generated result"
          fill
          className="object-cover"
          sizes="88px"
        />
      </div>

      <div className="mt-2 flex items-center gap-1.5 px-1">
        <Clock3 className="h-3 w-3 text-slate-400" />
        <span className="text-[10px] font-medium text-slate-500">
          {timeLabel}
        </span>
      </div>
    </Button>
  );
}

export function GeneratedHistoryRail() {
  const [isOpen, setIsOpen] = useState(false);
  const generatedHistory = CreateProductSelectors.generatedHistory();
  const generatedResult = CreateProductSelectors.generatedResult();
  const { handleSelectGeneratedResult } = useCreateProductSubscriberActions();

  if (!generatedHistory.length) {
    return null;
  }

  return (
    <aside className="relative z-30 mb-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-expanded={isOpen}
          className="h-auto w-full justify-between px-0 py-0 text-left hover:bg-transparent"
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-violet-500" />
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
              Previous Generations
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {generatedHistory.length} saved
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-slate-400 transition-transform duration-200",
                isOpen ? "rotate-180" : "rotate-0",
              )}
            />
          </div>
        </Button>
      </div>

      {isOpen && (
        <div className="absolute inset-x-0 top-full mt-2 flex gap-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3 pb-2 shadow-xl sm:p-4">
          {generatedHistory.map((item) => {
            const isSelected = generatedResult?.imageUrl === item.imageUrl;

            return (
              <GeneratedHistoryItemCard
                key={item.id}
                item={item}
                isSelected={isSelected}
                onSelect={handleSelectGeneratedResult}
              />
            );
          })}
        </div>
      )}
    </aside>
  );
}

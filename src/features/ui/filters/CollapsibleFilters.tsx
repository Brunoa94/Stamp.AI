"use client";

import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CollapsibleFiltersProps {
  isOpen: boolean;
  onToggle: () => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  toggleLabel?: string;
  clearLabel?: string;
  children: ReactNode;
}

export function CollapsibleFilters({
  isOpen,
  onToggle,
  onClearFilters,
  hasActiveFilters = false,
  toggleLabel,
  clearLabel,
  children,
}: CollapsibleFiltersProps) {
  const t = useTranslations("ui.collapsibleFilters");
  const resolvedToggleLabel = toggleLabel ?? t("toggle");
  const resolvedClearLabel = clearLabel ?? t("clear");
  return (
    <div className="w-full space-y-4">
      {/* Toggle Button Row */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onToggle}
          variant="outline"
          className={cn(
            "flex items-center gap-2 border-gray-300 text-slate-700 hover:bg-gray-50",
            isOpen && "bg-gray-50 border-gray-400",
          )}
        >
          <Filter className="w-4 h-4" />
          <span>{resolvedToggleLabel}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 ml-1 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1 text-slate-400" />
          )}
        </Button>

        {hasActiveFilters && onClearFilters && (
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            {resolvedClearLabel}
          </Button>
        )}
      </div>

      {/* Collapsible Filter Content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

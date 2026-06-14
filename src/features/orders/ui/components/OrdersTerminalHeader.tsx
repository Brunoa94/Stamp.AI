/**
 * Orders Terminal Header Component
 *
 * Displays the terminal-style header with title and view mode toggles.
 * Follows FSD pattern and design system guidelines.
 */

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { OrdersViewModeType } from "../../types/orders-terminal";

interface PropsI {
  viewMode: OrdersViewModeType;
  activeCount: number;
  onViewModeChange: (mode: OrdersViewModeType) => void;
}

/**
 * Header component for the Orders Terminal feature
 * Displays title, active count, and view mode toggles
 */
export function OrdersTerminalHeader({
  viewMode,
  activeCount,
  onViewModeChange,
}: PropsI) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
      {/* LEFT: Title Section */}
      <div className="space-y-4">
        <div className="h-1.5 w-20 bg-purple" />
        <Heading
          as="h1"
          variant="title"
          className="text-7xl md:text-8xl lg:text-8xl"
        >
          MY{" "}
          <Span as="span" unstyled className="text-purple">
            ORDERS
          </Span>
        </Heading>
        <Span as="p" variant="default" className="tracking-[0.5em] text-ink/40">
          Archives v4.2 / Synthesis Records
        </Span>
      </div>

      {/* RIGHT: Controls Section */}
      <div className="flex flex-wrap items-center gap-4">
        {/* View Toggle Buttons */}
        <div className="flex border border-ink/10 p-1 bg-white">
          <Button
            onClick={() => onViewModeChange("list")}
            variant="ghost"
            size="icon"
            className={cn(
              "w-12 h-12 flex items-center justify-center transition-all hover:bg-purple! hover:text-white!",
              viewMode === "list"
                ? "bg-purple text-white"
                : "bg-concrete text-ink hover:bg-ink/5",
            )}
            aria-label="List view"
          >
            <List className="text-xl" />
          </Button>
          <Button
            onClick={() => onViewModeChange("grid")}
            variant="ghost"
            size="icon"
            className={cn(
              "w-12 h-12 flex items-center justify-center transition-all hover:bg-purple! hover:text-white!",
              viewMode === "grid"
                ? "bg-purple text-white"
                : "bg-concrete text-ink hover:bg-ink/5",
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="text-xl" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Orders Terminal Header Component
 *
 * Displays the terminal-style header with title and view mode toggles.
 * Follows FSD pattern and design system guidelines.
 */

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/features/ui/button";
import { PageHeader } from "@/shared/ui/PageHeader";
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
      <PageHeader
        title="My"
        highlightedWord="Orders"
        subtitle={`${activeCount} ${activeCount === 1 ? "Order" : "Orders"} in archives`}
      />

      {/* RIGHT: Controls Section */}
      <div className="flex flex-wrap items-center gap-4">
        {/* View Toggle Buttons */}
        <div className="flex border border-ink/10 p-1 bg-white">
          <Button
            onClick={() => onViewModeChange("list")}
            variant={viewMode === "list" ? "toggle-active" : "toggle"}
            size="icon-xl"
            aria-label="List view"
          >
            <List className="text-xl" />
          </Button>
          <Button
            onClick={() => onViewModeChange("grid")}
            variant={viewMode === "grid" ? "toggle-active" : "toggle"}
            size="icon-xl"
            aria-label="Grid view"
          >
            <LayoutGrid className="text-xl" />
          </Button>
        </div>
      </div>
    </div>
  );
}

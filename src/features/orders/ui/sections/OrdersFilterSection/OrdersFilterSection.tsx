import type {
  OrdersFilterPillType,
  OrdersStatusFilterType,
  OrdersTimeFilterType,
} from "../../../lib/types/filters";
import type { OrdersViewModeType } from "../../../lib/types/viewMode";
import { OrdersFilterControls } from "./OrdersFilterControls";
import { OrdersFilterPills } from "./OrdersFilterPills";
import { OrdersFilterSummary } from "./OrdersFilterSummary";

interface PropsI {
  viewMode: OrdersViewModeType;
  onViewModeChange: (mode: OrdersViewModeType) => void;
  statusFilter: OrdersStatusFilterType;
  onStatusFilterChange: (status: OrdersStatusFilterType) => void;
  timeFilter: OrdersTimeFilterType;
  onTimeFilterChange: (time: OrdersTimeFilterType) => void;
  onClearFilters: () => void;
  activePills: OrdersFilterPillType[];
  total: number;
}

export function OrdersFilterSection({
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
  timeFilter,
  onTimeFilterChange,
  onClearFilters,
  activePills,
  total,
}: PropsI) {
  return (
    <section className="mb-12">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <OrdersFilterControls
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          timeFilter={timeFilter}
          onTimeFilterChange={onTimeFilterChange}
          onClearFilters={onClearFilters}
        />
        <OrdersFilterSummary total={total} />
      </div>

      <OrdersFilterPills pills={activePills} />
    </section>
  );
}

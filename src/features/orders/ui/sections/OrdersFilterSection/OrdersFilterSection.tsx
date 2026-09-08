import type {
  OrdersFilterPillType,
  OrdersStatusFilterType,
  OrdersTimeFilterType,
} from "../../../lib/types/filters";
import type { OrdersViewModeType } from "../../../lib/types/viewMode";
import { OrdersFilterControls } from "./OrdersFilterControls";
import { OrdersFilterPills } from "./OrdersFilterPills";

interface PropsI {
  viewMode: OrdersViewModeType;
  onViewModeChange: (mode: OrdersViewModeType) => void;
  statusFilter: OrdersStatusFilterType;
  onStatusFilterChange: (status: OrdersStatusFilterType) => void;
  timeFilter: OrdersTimeFilterType;
  onTimeFilterChange: (time: OrdersTimeFilterType) => void;
  onClearFilters: () => void;
  activePills: OrdersFilterPillType[];
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
}: PropsI) {
  return (
    <section className="mb-12">
      <div className="mb-6">
        <OrdersFilterControls
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          timeFilter={timeFilter}
          onTimeFilterChange={onTimeFilterChange}
          onClearFilters={onClearFilters}
        />
      </div>

      <OrdersFilterPills pills={activePills} />
    </section>
  );
}

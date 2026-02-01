import { useState, useMemo } from "react";
import { OrderWithItemsT } from "@/types/order";

type SortBy = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

interface Filters {
  status: string | null;
  paymentStatus: string | null;
  sortBy: SortBy;
}

export function useOrderFilters(orders: OrderWithItemsT[] | undefined) {
  const [filters, setFilters] = useState<Filters>({
    status: null,
    paymentStatus: null,
    sortBy: "date-desc",
  });

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let result = [...orders];

    // Filter by order status
    if (filters.status) {
      result = result.filter(
        (order) => order.status?.toLowerCase() === filters.status?.toLowerCase()
      );
    }

    // Filter by payment status
    if (filters.paymentStatus) {
      result = result.filter(
        (order) =>
          order.payment_status?.toLowerCase() === filters.paymentStatus?.toLowerCase()
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "date-desc":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case "date-asc":
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case "amount-desc":
          return (b.total_amount || 0) - (a.total_amount || 0);
        case "amount-asc":
          return (a.total_amount || 0) - (b.total_amount || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [orders, filters]);

  const setFilter = (key: keyof Filters, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const setSortBy = (sortBy: SortBy) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const clearFilters = () => {
    setFilters({
      status: null,
      paymentStatus: null,
      sortBy: "date-desc",
    });
  };

  const hasActiveFilters =
    filters.status !== null ||
    filters.paymentStatus !== null ||
    filters.sortBy !== "date-desc";

  return {
    filteredOrders,
    filters,
    setFilter,
    setSortBy,
    clearFilters,
    hasActiveFilters,
  };
}

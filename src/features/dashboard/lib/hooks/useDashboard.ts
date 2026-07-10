"use client";

import { useUser } from "@/hooks/useAuth";
import { useOrders } from "@/queries/orderQueries";
import { RECENT_ORDERS_LIMIT } from "../constants/dashboard";

/**
 * useDashboard
 *
 * Orchestration hook for the dashboard: resolves the authenticated user
 * and their orders, and derives the data each section needs.
 */
export function useDashboard() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    isError,
    refetch,
  } = useOrders(user?.id);

  const recentOrders = orders.slice(0, RECENT_ORDERS_LIMIT);

  return {
    user,
    orders,
    recentOrders,
    ordersPlaced: orders.length,
    isLoading: isUserLoading || isOrdersLoading,
    isError,
    refetch,
  };
}

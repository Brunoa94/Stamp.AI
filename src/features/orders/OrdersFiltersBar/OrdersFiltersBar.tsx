"use client";

import { OrdersFiltersDesktop } from "./OrdersFiltersDesktop";
import { OrdersFiltersMobile } from "../mobile/OrdersFiltersMobile";
import { OrdersFiltersBarProps } from "./types";

export function OrdersFiltersBar(props: OrdersFiltersBarProps) {
  return (
    <>
      <OrdersFiltersMobile {...props} />
      <OrdersFiltersDesktop {...props} />
    </>
  );
}

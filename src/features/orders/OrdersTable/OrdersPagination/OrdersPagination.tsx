"use client";

import { OrdersPaginationDesktop } from "./OrdersPaginationDesktop";
import { OrdersPaginationMobile } from "../../mobile/OrdersPaginationMobile";
import { OrdersPaginationProps } from "./types";

export function OrdersPagination(props: OrdersPaginationProps) {
  const visiblePages = Array.from(
    { length: Math.min(3, props.totalPages) },
    (_, i) => i + 1,
  );

  return (
    <>
      <OrdersPaginationMobile {...props} visiblePages={visiblePages} />
      <OrdersPaginationDesktop {...props} visiblePages={visiblePages} />
    </>
  );
}

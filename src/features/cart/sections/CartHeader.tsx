"use client";

import { PageHeader } from "@/features/ui/page-header";

interface CartHeaderProps {
  itemCount: number;
}

export function CartHeader({ itemCount }: CartHeaderProps) {
  return (
    <PageHeader
      title="Shopping Cart"
      description={`${itemCount} ${itemCount === 1 ? "item" : "items"} ready for production`}
      align="left"
      showGradient={false}
      className="mb-10"
    />
  );
}

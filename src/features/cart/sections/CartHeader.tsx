"use client";

import { ShoppingCart } from "lucide-react";
import { PageHeader } from "@/features/ui/page-header";

export function CartHeader() {
  return (
    <PageHeader
      title="Shopping Cart"
      subtitle="Review your items and proceed to checkout when ready"
      icon={ShoppingCart}
      align="left"
      variant="default"
    />
  );
}

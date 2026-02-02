import { Package } from "lucide-react";
import { PageHeader } from "@/features/ui/page-header";

export function OrdersHeader() {
  return (
    <PageHeader
      title="My Orders"
      subtitle="View and track your order history"
      icon={Package}
      align="left"
      variant="default"
    />
  );
}

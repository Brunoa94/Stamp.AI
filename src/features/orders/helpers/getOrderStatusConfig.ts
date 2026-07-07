import { CheckCircle, Clock, Settings, Truck, XCircle } from "lucide-react";
import {
  OrderStatusConfigType,
  OrderStatusType,
} from "../types/orders-terminal";

export function getOrderStatusConfig(
  status: OrderStatusType,
): OrderStatusConfigType {
  switch (status) {
    case "delivered":
      return {
        badgeClass: "bg-green/10 border-green/20 text-green",
        hoverBg: "hover:bg-cyan",
        icon: CheckCircle,
        label: "Delivered",
      };
    case "shipped":
      return {
        badgeClass: "bg-cyan/10 border-cyan/20 text-cyan",
        hoverBg: "hover:bg-purple",
        icon: Truck,
        label: "Shipped",
      };
    case "processing":
      return {
        badgeClass: "bg-orange/10 border-orange/20 text-orange",
        hoverBg: "hover:bg-orange",
        icon: Settings,
        label: "Processing",
      };
    case "cancelled":
      return {
        badgeClass: "bg-ink/5 border-ink/10 text-ink/40",
        hoverBg: "hover:bg-ink/80",
        icon: XCircle,
        label: "Cancelled",
      };
    default:
      return {
        badgeClass: "bg-purple/10 border-purple/20 text-purple",
        hoverBg: "hover:bg-purple",
        icon: Clock,
        label: "Pending",
      };
  }
}

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
                color: "green-600",
                bgColor: "green-600/10",
                borderColor: "green-600/20",
                hoverBg: "hover:bg-cyan",
                icon: CheckCircle,
                label: "Delivered",
            };
        case "shipped":
            return {
                color: "cyan",
                bgColor: "cyan/10",
                borderColor: "cyan/20",
                hoverBg: "hover:bg-purple",
                icon: Truck,
                label: "Shipped",
            };
        case "processing":
            return {
                color: "orange",
                bgColor: "orange/10",
                borderColor: "orange/20",
                hoverBg: "hover:bg-orange",
                icon: Settings,
                label: "Processing",
            };
        case "cancelled":
            return {
                color: "ink/40",
                bgColor: "ink/5",
                borderColor: "ink/10",
                hoverBg: "hover:bg-ink/80",
                icon: XCircle,
                label: "Cancelled",
            };
        default:
            return {
                color: "purple",
                bgColor: "purple/10",
                borderColor: "purple/20",
                hoverBg: "hover:bg-purple",
                icon: Clock,
                label: "Pending",
            };
    }
}

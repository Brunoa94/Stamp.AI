import { ordersCardTheme } from "../styles/ordersTheme";

export function getOrderCardStatusClass(status?: string | null): string {
    const normalized = status?.toLowerCase() || "processing";

    if (normalized.includes("delivered")) {
        return ordersCardTheme.statusDelivered;
    }
    if (normalized.includes("shipped")) {
        return ordersCardTheme.statusShipped;
    }
    if (normalized.includes("cancel")) {
        return ordersCardTheme.statusCancelled;
    }

    return ordersCardTheme.statusProcessing;
}

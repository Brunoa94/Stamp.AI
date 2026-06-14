import { dashboardTheme } from "@/theme/components";

export function getOrderCardStatusClass(status?: string | null): string {
    const normalized = status?.toLowerCase() || "processing";

    if (normalized.includes("delivered")) {
        return dashboardTheme.orders.statusDelivered;
    }
    if (normalized.includes("shipped")) {
        return dashboardTheme.orders.statusShipped;
    }
    if (normalized.includes("cancel")) {
        return dashboardTheme.orders.statusCancelled;
    }

    return dashboardTheme.orders.statusProcessing;
}

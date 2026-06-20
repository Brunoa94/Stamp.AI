import { OrderTimeframeType } from "../types/order-filters";

export function mapTimeframeToThreshold(
    timeframe: OrderTimeframeType,
): Date | null {
    const now = new Date();

    switch (timeframe) {
        case "last-30": {
            const threshold = new Date(now);
            threshold.setDate(now.getDate() - 30);
            return threshold;
        }
        case "last-90": {
            const threshold = new Date(now);
            threshold.setDate(now.getDate() - 90);
            return threshold;
        }
        case "2023":
            return new Date("2023-01-01T00:00:00.000Z");
        case "all-time":
        default:
            return null;
    }
}

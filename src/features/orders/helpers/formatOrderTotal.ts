export function formatOrderTotal(amount?: number | null): string {
    if (!amount && amount !== 0) return "$0.00";

    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
    }).format(amount);
}

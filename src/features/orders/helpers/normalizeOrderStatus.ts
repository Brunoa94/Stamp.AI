export function normalizeOrderStatus(value: string | null | undefined): string {
    return (value ?? "").toLowerCase().replace(/[_-]/g, "").trim();
}

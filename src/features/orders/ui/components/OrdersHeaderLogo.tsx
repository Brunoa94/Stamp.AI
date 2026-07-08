import Link from "next/link";

export function OrdersHeaderLogo() {
  return (
    <div className="flex-1">
      <Link
        href="/stamp"
        className="text-2xl font-bold uppercase tracking-tight text-(--color-stamp-chocolate)"
      >
        STAMP IT
      </Link>
    </div>
  );
}

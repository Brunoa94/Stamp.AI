import Link from "next/link";
import { Span } from "@/features/ui/span";

export function OrdersHeaderNav() {
  return (
    <div className="flex flex-1 justify-end">
      <nav
        className="flex items-center gap-6 md:gap-8"
        aria-label="Orders navigation"
      >
        <Link
          href="/dashboard"
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-(--color-stamp-chocolate) transition-colors hover:text-(--color-stamp-gold)"
        >
          Dashboard
        </Link>
        <Span
          unstyled
          className="border-b border-(--color-stamp-gold)/40 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-stamp-gold)"
        >
          Orders
        </Span>
      </nav>
    </div>
  );
}

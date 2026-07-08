import Link from "next/link";
import { Span } from "@/features/ui/span";

export function OrdersHeaderCta() {
  return (
    <div className="flex-none">
      <Link
        href="/stamp"
        className="archive-cta group relative block overflow-hidden p-[1.5px] shadow-lg active:scale-95"
      >
        <Span
          unstyled
          className="archive-cta-inner relative z-10 flex items-center justify-center bg-(--color-stamp-off-white) px-7 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-(--color-stamp-chocolate)"
        >
          Stamp It
        </Span>
      </Link>
    </div>
  );
}

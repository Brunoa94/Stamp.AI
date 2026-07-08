import Link from "next/link";
import { Span } from "@/features/ui/span";

export function OrdersFooterSocial() {
  return (
    <div className="col-span-2 lg:col-span-1">
      <Span
        variant="default"
        className="mb-6 block tracking-[0.2em] text-(--color-stamp-gold)"
      >
        Social
      </Span>
      <div className="flex gap-6 text-(--color-stamp-taupe)">
        <Link
          href="/"
          className="transition-all hover:text-(--color-stamp-gold)"
        >
          Instagram
        </Link>
        <Link
          href="/"
          className="transition-all hover:text-(--color-stamp-gold)"
        >
          Twitter
        </Link>
      </div>
    </div>
  );
}

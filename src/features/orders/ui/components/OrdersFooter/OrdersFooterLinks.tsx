import Link from "next/link";
import { Span } from "@/features/ui/span";

export function OrdersFooterLinks() {
  return (
    <div>
      <Span
        variant="default"
        className="mb-6 block tracking-[0.2em] text-(--color-stamp-gold)"
      >
        Maison
      </Span>
      <ul className="space-y-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-(--color-stamp-taupe)">
        <li>
          <Link
            href="/"
            className="transition-colors hover:text-(--color-stamp-gold)"
          >
            History
          </Link>
        </li>
        <li>
          <Link
            href="/"
            className="transition-colors hover:text-(--color-stamp-gold)"
          >
            Atelier
          </Link>
        </li>
      </ul>
    </div>
  );
}

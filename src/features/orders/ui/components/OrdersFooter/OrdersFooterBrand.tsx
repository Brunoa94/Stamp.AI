import Link from "next/link";
import { Paragraph } from "@/features/ui/paragraph";

export function OrdersFooterBrand() {
  return (
    <div className="max-w-xs">
      <Link
        href="/stamp"
        className="mb-6 block text-2xl font-bold uppercase tracking-tight text-(--color-stamp-chocolate)"
      >
        STAMP IT
      </Link>
      <Paragraph
        variant="sm"
        className="text-xs normal-case tracking-normal text-(--color-stamp-taupe)"
      >
        The world&apos;s first neural atelier. Merging generative intelligence
        with heritage-grade bespoke craftsmanship.
      </Paragraph>
    </div>
  );
}

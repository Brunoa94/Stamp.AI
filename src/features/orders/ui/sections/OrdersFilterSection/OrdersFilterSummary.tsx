import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";

interface PropsI {
  total: number;
}

export function OrdersFilterSummary({ total }: PropsI) {
  return (
    <div className="text-right">
      <Paragraph
        variant="sm"
        className="font-bold uppercase text-lg tracking-[0.2em] text-(--color-stamp-taupe)"
      >
        Total Syntheses
      </Paragraph>
      <div className="flex items-baseline justify-end gap-2">
        <Heading
          as="h2"
          variant="title"
          className="font-black text-6xl tracking-tighter text-(--color-stamp-chocolate)"
        >
          {total}
        </Heading>
        <Span
          unstyled
          className="text-2xl font-bold uppercase tracking-tight text-(--color-stamp-chocolate)"
        >
          Protocol Records
        </Span>
      </div>
    </div>
  );
}

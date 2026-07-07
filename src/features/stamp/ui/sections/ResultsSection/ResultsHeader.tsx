import { Span } from "@/features/ui/span";

/**
 * ResultsHeader
 *
 * Header showing output result number, date, and status badge
 */

interface PropsI {
  outputNumber: string;
  date: string;
}

export function ResultsHeader({ outputNumber, date }: PropsI) {
  return (
    <div className="mb-8 flex justify-between items-end">
      <div>
        <Span variant="sm" className="text-(--color-stamp-taupe) mb-2">
          {outputNumber}
        </Span>
        <Span variant="micro" className="text-(--color-stamp-taupe) block">
          Generated {date}
        </Span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/5 rounded-full">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        <Span variant="micro" className="text-green-600">
          Design saved to history
        </Span>
      </div>
    </div>
  );
}

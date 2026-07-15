import { Sparkles } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

/**
 * ResultsHeader
 *
 * Header showing protocol label, title, output number, and status badge
 */

interface PropsI {
  outputNumber: string;
  date: string;
}

export function ResultsHeader({ outputNumber, date }: PropsI) {
  return (
    <div className="mb-8">
      <Span variant="sm" className="text-(--color-stamp-taupe) mb-6 block">
        Protocol 04 / Output
      </Span>

      <Heading
        as="h2"
        variant="title"
        className="text-(--color-stamp-chocolate) mb-6"
      >
        Your{" "}
        <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
          Creation
        </span>
      </Heading>

      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-(--color-stamp-gold)" />
            <Span variant="sm" className="text-(--color-stamp-chocolate) font-medium">
              {outputNumber}
            </Span>
          </div>
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            Generated {date}
          </Span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/5 rounded-full border border-green-500/10">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <Span variant="micro" className="text-green-600">
            Saved to history
          </Span>
        </div>
      </div>
    </div>
  );
}

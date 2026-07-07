import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";

interface PropsI {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function OrdersTerminalPaginationMobile({
  currentPage,
  totalPages,
  onPageChange,
}: PropsI) {
  const visiblePages = Array.from(
    { length: Math.min(3, totalPages) },
    (_, i) => i + 1,
  );

  return (
    <div className="mt-8 flex items-center justify-between md:hidden">
      <Span as="p" variant="default" className="tracking-[0.28em] text-ink/55">
        {String(currentPage).padStart(2, "0")}/
        {String(totalPages).padStart(2, "0")}
      </Span>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="toggle"
          size="icon"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {visiblePages.map((page) => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={String(page).padStart(2, "0")}
            variant={currentPage === page ? "toggle-active" : "toggle"}
            size="icon"
          >
            {String(page).padStart(2, "0")}
          </Button>
        ))}

        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="toggle"
          size="icon"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

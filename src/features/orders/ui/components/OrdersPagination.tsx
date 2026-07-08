import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";

interface PropsI {
  page: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function OrdersPagination({
  page,
  totalPages,
  totalItems,
  startIndex,
  pageSize,
  onPageChange,
}: PropsI) {
  return (
    <footer className="mt-24 flex flex-col items-center justify-between gap-8 border-t border-(--color-stamp-divider) pt-12 md:flex-row">
      <Span
        variant="default"
        className="text-[10px] tracking-[0.2em] text-(--color-stamp-taupe)"
      >
        Showing {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} of {totalItems} records
      </Span>

      <nav className="flex items-center gap-2" aria-label="Pagination">
        <Button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          variant="outline"
          size="icon"
          className="border-(--color-stamp-divider) transition-all hover:bg-(--color-stamp-chocolate) hover:text-white"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: totalPages }).slice(0, 5).map((_, idx) => {
          const pageNumber = idx + 1;
          const isActive = pageNumber === page;
          return (
            <Button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              variant={isActive ? "default" : "outline"}
              size="icon"
              className={isActive
                ? "border-(--color-stamp-chocolate) bg-(--color-stamp-chocolate) text-[10px] font-bold text-white"
                : "border-(--color-stamp-divider) text-[10px] font-bold hover:bg-(--color-stamp-chocolate) hover:text-white"}
              aria-label={`Go to page ${pageNumber}`}
              aria-current={isActive ? "page" : undefined}
            >
              {String(pageNumber).padStart(2, "0")}
            </Button>
          );
        })}

        <Button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          variant="outline"
          size="icon"
          className="border-(--color-stamp-divider) transition-all hover:bg-(--color-stamp-chocolate) hover:text-white"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </footer>
  );
}

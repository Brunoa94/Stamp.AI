import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/features/ui/button";

interface PropsI {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function OrdersTerminalPaginationDesktop({
  currentPage,
  totalPages,
  onPageChange,
}: PropsI) {
  const visiblePages = Array.from(
    { length: Math.min(3, totalPages) },
    (_, i) => i + 1,
  );

  return (
    <div className="hidden md:flex mt-20 justify-center items-center gap-8">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="toggle"
        size="icon-xl"
        aria-label="Previous page"
      >
        <ChevronLeft className="text-lg" />
      </Button>

      <div className="flex gap-4">
        {visiblePages.map((page) => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={String(page).padStart(2, "0")}
            variant={currentPage === page ? "toggle-active" : "toggle"}
            size="icon-xl"
          >
            {String(page).padStart(2, "0")}
          </Button>
        ))}
      </div>

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="toggle"
        size="icon-xl"
        aria-label="Next page"
      >
        <ChevronRight className="text-lg" />
      </Button>
    </div>
  );
}

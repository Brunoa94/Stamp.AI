import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";

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
        variant="ghost"
        size="icon"
        className={cn(
          "w-12 h-12 border flex items-center justify-center transition-all",
          currentPage === 1
            ? "border-ink/10 bg-white text-ink/30 cursor-not-allowed opacity-30"
            : "border-ink/10 bg-white text-ink hover:bg-purple hover:text-white hover:border-purple",
        )}
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
            variant="ghost"
            size="icon"
            className={cn(
              "w-12 h-12 flex items-center justify-center font-anton text-lg transition-all",
              currentPage === page
                ? "bg-purple text-white"
                : "border border-ink/10 bg-white text-ink hover:text-purple",
            )}
          >
            {String(page).padStart(2, "0")}
          </Button>
        ))}
      </div>

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="ghost"
        size="icon"
        className={cn(
          "w-12 h-12 border flex items-center justify-center transition-all",
          currentPage === totalPages
            ? "border-ink/10 bg-white text-ink/30 cursor-not-allowed opacity-30"
            : "border-ink/10 bg-white text-ink hover:bg-purple hover:text-white hover:border-purple",
        )}
        aria-label="Next page"
      >
        <ChevronRight className="text-lg" />
      </Button>
    </div>
  );
}

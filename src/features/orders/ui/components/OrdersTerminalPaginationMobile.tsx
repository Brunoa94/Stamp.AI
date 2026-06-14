import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";

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
    <div className={cn("mt-8 flex items-center justify-between md:hidden")}>
      <Span
        as="p"
        variant="default"
        className={cn("tracking-[0.28em]", "text-ink/55")}
      >
        {String(currentPage).padStart(2, "0")}/
        {String(totalPages).padStart(2, "0")}
      </Span>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="ghost"
          size="icon-sm"
          className={cn(
            "h-10 w-10 border",
            currentPage === 1
              ? "border-ink/10 bg-white text-ink/30 cursor-not-allowed opacity-30"
              : "border-ink/10 bg-white text-ink hover:bg-purple hover:text-white",
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {visiblePages.map((page) => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            variant="ghost"
            size="sm"
            className={cn(
              "h-10 w-10 text-sm font-anton",
              currentPage === page
                ? "bg-purple text-white"
                : "border border-ink/10 bg-white text-ink hover:text-purple",
            )}
          >
            {String(page).padStart(2, "0")}
          </Button>
        ))}

        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="ghost"
          size="icon-sm"
          className={cn(
            "h-10 w-10 border",
            currentPage === totalPages
              ? "border-ink/10 bg-white text-ink/30 cursor-not-allowed opacity-30"
              : "border-ink/10 bg-white text-ink hover:bg-purple hover:text-white",
          )}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

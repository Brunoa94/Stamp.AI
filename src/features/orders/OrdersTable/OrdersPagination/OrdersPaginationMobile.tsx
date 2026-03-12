import { Button } from "@/features/ui/button";
import { ordersTheme } from "@/theme/components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OrdersPaginationViewProps } from "./types";

export function OrdersPaginationMobile({
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalItems,
  visiblePages,
}: OrdersPaginationViewProps) {
  return (
    <div className={ordersTheme.mobilePagination.container}>
      <p className={ordersTheme.mobilePagination.info}>
        Showing {startIndex + 1}–{Math.min(endIndex, totalItems)} of{" "}
        {totalItems}
      </p>

      <div className={ordersTheme.mobilePagination.controls}>
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="ghost"
          size="icon-sm"
          className={ordersTheme.mobilePagination.navButton}
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
            className={
              currentPage === page
                ? ordersTheme.mobilePagination.pageButtonActive
                : ordersTheme.mobilePagination.pageButton
            }
          >
            {page}
          </Button>
        ))}

        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="ghost"
          size="icon-sm"
          className={ordersTheme.mobilePagination.navButton}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

"use client";

import { ordersTheme } from "@/theme/components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/features/ui/button";

interface OrdersPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export function OrdersPagination({
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalItems,
}: OrdersPaginationProps) {
  const visiblePages = Array.from(
    { length: Math.min(3, totalPages) },
    (_, i) => i + 1,
  );

  return (
    <div className={ordersTheme.pagination.container}>
      <div className={ordersTheme.pagination.info}>
        Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
        {totalItems} orders
      </div>
      <div className={ordersTheme.pagination.controls}>
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="ghost"
          size="icon-sm"
          className={ordersTheme.pagination.button}
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
                ? ordersTheme.pagination.pageButtonActive
                : ordersTheme.pagination.pageButton
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
          className={ordersTheme.pagination.button}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  className?: string;
}

export function Paginator({
  currentPage,
  totalPages,
  onPageChange,
  canGoPrevious,
  canGoNext,
  startIndex,
  endIndex,
  totalItems,
  className,
}: PaginatorProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Maximum number of page buttons to show

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-4",
        className
      )}
    >
      {/* Results info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing <span className="font-medium text-gray-900 dark:text-gray-100">{startIndex}</span> to{" "}
        <span className="font-medium text-gray-900 dark:text-gray-100">{endIndex}</span> of{" "}
        <span className="font-medium text-gray-900 dark:text-gray-100">{totalItems}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          aria-label="Previous page"
          className="border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-gray-500 dark:text-gray-400"
                >
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <Button
                key={pageNumber}
                variant={isActive ? "default" : "outline"}
                size="icon-sm"
                onClick={() => onPageChange(pageNumber)}
                aria-label={`Page ${pageNumber}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md"
                    : "border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300"
                )}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          aria-label="Next page"
          className="border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

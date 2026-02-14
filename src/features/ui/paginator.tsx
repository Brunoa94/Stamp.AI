import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";
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
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

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
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-purple-200 dark:border-purple-700/50 mt-6 w-full",
        className,
      )}
    >
      {/* Results info */}
      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 w-full">
        Showing{" "}
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {startIndex}
        </span>{" "}
        to{" "}
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {endIndex}
        </span>{" "}
        of{" "}
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {totalItems}
        </span>{" "}
        results
      </div>

      {/* Pagination controls */}
      <Pagination className="flex items-center justify-end">
        <PaginationContent>
          {/* Previous button */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
              className={cn(
                "border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20",
                !canGoPrevious && "opacity-50 pointer-events-none",
              )}
            />
          </PaginationItem>

          {/* Page numbers */}
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            const isActive = page === currentPage;

            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={isActive}
                  className={cn(
                    isActive
                      ? "bg-linear-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md border-transparent"
                      : "border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300",
                  )}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {/* Next button */}
          <PaginationItem>
            <PaginationNext
              onClick={() => canGoNext && onPageChange(currentPage + 1)}
              className={cn(
                "border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20",
                !canGoNext && "opacity-50 pointer-events-none",
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

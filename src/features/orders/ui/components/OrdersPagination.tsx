import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { ordersPageButtonVariants } from "../../lib/variants/ordersControlVariants";

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
  const t = useTranslations("orders.pagination");

  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-(--color-stamp-divider) pt-8 md:flex-row">
      <Span variant="default" className="text-(--color-stamp-taupe)">
        {t("showing", {
          start: totalItems === 0 ? 0 : startIndex + 1,
          end: Math.min(startIndex + pageSize, totalItems),
          total: totalItems,
        })}
      </Span>

      <nav className="flex items-center gap-2" aria-label={t("navAriaLabel")}>
        <Button
          onClick={() => handlePageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          variant="unstyled"
          size="icon"
          className={ordersPageButtonVariants()}
          aria-label={t("previousPage")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: totalPages }).slice(0, 5).map((_, idx) => {
          const pageNumber = idx + 1;
          const isActive = pageNumber === page;
          return (
            <Button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              variant="unstyled"
              size="icon"
              className={ordersPageButtonVariants({ active: isActive })}
              aria-label={t("goToPage", { page: pageNumber })}
              aria-current={isActive ? "page" : undefined}
            >
              {String(pageNumber).padStart(2, "0")}
            </Button>
          );
        })}

        <Button
          onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          variant="unstyled"
          size="icon"
          className={ordersPageButtonVariants()}
          aria-label={t("nextPage")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </footer>
  );
}

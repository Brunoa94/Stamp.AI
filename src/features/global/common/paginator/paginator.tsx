import usePaginator from "./usePaginator";
import { MoveLeft, MoveRight } from "lucide-react";
import { Button } from "@/features/ui/button";

interface Props {
  onClick: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

function Paginator({ totalItems, onClick, itemsPerPage }: Props) {
  const {
    currentPage,
    prevDisabled,
    nextDisabled,
    goNextPage,
    goPrevPage,
    maxPages,
  } = usePaginator({ totalItems, itemsPerPage, onClick });

  return (
    <div className="mt-4 flex w-full items-center px-2 md:px-6">
      <Button
        aria-label="Previous page"
        variant="outline"
        size="sm"
        onClick={goPrevPage}
        disabled={prevDisabled}
        className="mr-auto"
      >
        <MoveLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Page</span>
          <span className="text-sm font-medium">{currentPage + 1}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">of</span>
          <span className="text-sm font-medium">{maxPages + 1}</span>
        </div>
      </div>
      <Button
        aria-label="Next page"
        variant="outline"
        size="sm"
        onClick={goNextPage}
        disabled={nextDisabled}
        className="ml-auto"
      >
        <MoveRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default Paginator;

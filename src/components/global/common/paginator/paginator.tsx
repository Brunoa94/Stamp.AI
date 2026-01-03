import { Pagination } from "@/components/ui/pagination";
import usePaginator from "./usePaginator";
import { MoveLeft, MoveRight } from "lucide-react";
import { UButton } from "@/components/ui-elements/buttons/UButton";

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
    <Pagination className="mt-4 flex w-full items-center px-2 md:px-6">
      <UButton.WithVariant
        ariaLabel="Previous page"
        variant="default"
        onClick={goPrevPage}
        disabled={prevDisabled}
        className="mr-auto cursor-pointer"
      >
        <MoveLeft />
      </UButton.WithVariant>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">Page</span>
          <span className="text-md font-bold">{currentPage + 1}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">of</span>
          <span className="text-md font-bold">{maxPages + 1}</span>
        </div>
      </div>
      <UButton.WithVariant
        ariaLabel="Next page"
        variant="default"
        onClick={goNextPage}
        disabled={nextDisabled}
        className="ml-auto cursor-pointer"
      >
        <MoveRight />
      </UButton.WithVariant>
    </Pagination>
  );
}

export default Paginator;

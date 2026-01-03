import { useEffect, useState } from "react";

interface Props {
  totalItems: number;
  itemsPerPage: number;
  onClick: (page: number) => void;
}

function usePaginator({ totalItems, itemsPerPage, onClick }: Props) {
  const maxPages = Math.ceil(totalItems / itemsPerPage) - 1;
  const [currentPage, setCurrentPage] = useState<number>(0);
  const prevDisabled = currentPage === 0;
  const nextDisabled = currentPage === maxPages;
  const [intermediatePages, setIntermediatePages] = useState<number[]>([]);

  const getCurrentPageGroup = () => {
    const maxVisiblePages = 4;
    let minPageLimit =
      Math.floor(currentPage / maxVisiblePages) * maxVisiblePages;

    let maxPageLimit = minPageLimit + maxVisiblePages - 1;

    if (maxPageLimit >= maxPages) {
      maxPageLimit = maxPages - 1;
    }

    const currentPageGroup = [];

    for (let i = minPageLimit; i <= maxPageLimit; i++) {
      currentPageGroup.push(i);
    }
    console.log(currentPageGroup);
    setIntermediatePages(currentPageGroup);
  };

  useEffect(() => {
    console.log("Generating");
    getCurrentPageGroup();
  }, [currentPage]);

  const goNextPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (currentPage >= maxPages) return;
    onClick(currentPage + 1);
    setCurrentPage((prev) => prev + 1);
  };

  const goPrevPage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (currentPage === 0) return;
    onClick(currentPage - 1);
    setCurrentPage((prev) => prev - 1);
  };

  return {
    currentPage,
    prevDisabled,
    nextDisabled,
    goNextPage,
    goPrevPage,
    intermediatePages,
    maxPages,
  };
}

export default usePaginator;

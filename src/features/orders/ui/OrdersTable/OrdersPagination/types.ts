export interface OrdersPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export interface OrdersPaginationViewProps extends OrdersPaginationProps {
  visiblePages: number[];
}

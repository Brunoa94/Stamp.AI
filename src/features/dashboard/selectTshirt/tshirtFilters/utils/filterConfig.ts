import { SortOption } from "../../types";

export const SORT_OPTIONS = [
  { label: "Price (Low to High)", value: "price" as SortOption },
  { label: "Name (A to Z)", value: "name" as SortOption },
];

export const mapToFilterOptions = (items: string[]) => {
  return items.map((item) => ({
    label: item,
    value: item,
  }));
};

export const FILTER_LABELS = {
  material: "Material",
  fit: "Fit",
  sortBy: "Sort By",
} as const;

export const FILTER_PLACEHOLDERS = {
  material: "All Materials",
  fit: "All Fits",
  sortBy: "Select sorting",
} as const;

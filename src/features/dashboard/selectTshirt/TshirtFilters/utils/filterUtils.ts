import { TshirtType } from "@/services/tshirtProductService";
import { SortOption } from "../../types";

interface FilterParams {
  products: TshirtType[];
  material: string;
  fit: string;
  sortBy: SortOption;
}

export const filterAndSortTshirts = ({
  products,
  material,
  fit,
  sortBy,
}: FilterParams): TshirtType[] => {
  let filtered = products;

  // Filter by material
  if (material !== "all") {
    filtered = filtered.filter((t) =>
      t.material.toLowerCase().includes(material.toLowerCase())
    );
  }

  // Filter by fit
  if (fit !== "all") {
    filtered = filtered.filter(
      (t) => t.fit.toLowerCase() === fit.toLowerCase()
    );
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price") {
      return a.price - b.price;
    }
    return a.name.localeCompare(b.name);
  });

  return sorted;
};

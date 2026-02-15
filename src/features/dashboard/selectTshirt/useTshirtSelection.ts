import { useState } from "react";
import { useTshirtProducts, type TshirtType } from "@/queries/productQueries";

interface Props {
  onTshirtSelect?: (tshirt: TshirtType) => void;
  initialSelection?: TshirtType;
}

export type { TshirtType };

export default function useTshirtSelection({ onTshirtSelect, initialSelection }: Props = {}) {
  const { data: tshirtProducts = [], isLoading, error } = useTshirtProducts();

  const [selectedTshirt, setSelectedTshirt] = useState<TshirtType | null>(initialSelection ?? tshirtProducts?.[0] ?? null);

  const handleTshirtSelect = (tshirt: TshirtType) => {
    setSelectedTshirt(tshirt);
    onTshirtSelect?.(tshirt);
  };

  return {
    tshirtProducts,
    selectedTshirt,
    handleTshirtSelect,
    isLoading,
    error,
  };
}
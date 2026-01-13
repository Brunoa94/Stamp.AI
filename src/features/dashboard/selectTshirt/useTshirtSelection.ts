import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TshirtProductService, TshirtType } from "@/services/tshirtProductService";

interface Props {
  onTshirtSelect?: (tshirt: TshirtType) => void;
  initialSelection?: TshirtType;
}

export type { TshirtType };

export default function useTshirtSelection({ onTshirtSelect, initialSelection }: Props = {}) {
  const { data: tshirtProducts = [], isLoading, error } = useQuery({
    queryKey: ["tshirt-products"],
    queryFn: TshirtProductService.fetchTshirtProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

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
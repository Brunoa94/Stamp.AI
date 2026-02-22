"use client";

import { Modal } from "@/features/ui/modal";
import { TshirtType } from "../useTshirtSelection";
import { stripHtmlTags } from "@/utils/htmlUtils";
import { useBlueprintVariants } from "@/features/dashboard/createProduct/hooks/useBlueprintVariants";
import { ProductImage } from "./ProductImage";
import { BrandModel } from "./BrandModel";
import { Price } from "./Price";
import { MaterialFit } from "./MaterialFit";
import { Description } from "./Description";
import { Features } from "./Features";
import { AvailableColors } from "./AvailableColors";

interface Props {
  tshirt: TshirtType | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({
  tshirt,
  isOpen,
  onClose,
}: Props) {
  if (!tshirt) return null;

  const cleanDescription = stripHtmlTags(tshirt.description);

  const { data: variantsData, isLoading: isLoadingVariants } =
    useBlueprintVariants(tshirt.blueprint_id, tshirt.print_provider_id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tshirt.name}
      description={`Product details for ${tshirt.name}`}
      className="max-w-7xl max-h-[85vh] overflow-y-auto bg-linear-to-br from-gray-100 via-slate-100 to-gray-200 dark:from-gray-800 dark:via-slate-900 dark:to-gray-900 p-8 border-2 border-gray-300 dark:border-gray-600"
    >
      <div className="space-y-8">
        <ProductImage src={tshirt.image} alt={tshirt.name} />

        <div className="space-y-6">
          <BrandModel brand={tshirt.brand} model={tshirt.model} />
          <Price price={tshirt.price} />
          <MaterialFit material={tshirt.material} fit={tshirt.fit} />
          <Description description={cleanDescription} />
          <Features features={tshirt.features} />
          <AvailableColors
            colors={variantsData?.colors}
            isLoading={isLoadingVariants}
          />
        </div>
      </div>
    </Modal>
  );
}

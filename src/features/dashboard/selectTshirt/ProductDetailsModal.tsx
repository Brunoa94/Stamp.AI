"use client";

import { Modal } from "@/features/ui/modal";
import { PropertyCard } from "@/features/ui/property-card";
import { TshirtType } from "./useTshirtSelection";
import { stripHtmlTags, mapFeatureToDescription } from "@/utils/htmlUtils";
import { useBlueprintVariants } from "@/features/dashboard/createImage/hooks/useBlueprintVariants";
import { getColorClass } from "@/helpers";
import Image from "next/image";
import clsx from "clsx";

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
      className="max-w-7xl max-h-[85vh] overflow-y-auto bg-linear-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-gray-800 dark:via-purple-900 dark:to-pink-900 p-8 border-2 border-purple-300 dark:border-purple-600"
    >
      <div className="space-y-8">
        {/* Product Image */}
        <div className="w-full aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border-2 border-purple-200 dark:border-purple-700 p-4">
          <Image
            src={tshirt.image}
            alt={tshirt.name}
            width={800}
            height={800}
            className="w-full h-full object-contain"
          />
        </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand & Model */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{tshirt.brand}</span>
              <span>•</span>
              <span>{tshirt.model}</span>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ${tshirt.price.toFixed(2)}
            </div>

            {/* Material & Fit */}
            <div className="flex gap-4">
              <PropertyCard label="Material" value={tshirt.material} variant="purple" />
              <PropertyCard label="Fit" value={tshirt.fit} variant="pink" />
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                Description
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {cleanDescription}
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">
                Print Areas
              </h3>
              <div className="flex flex-wrap gap-2">
                {tshirt.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-linear-to-r from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-700 text-purple-800 dark:text-purple-100 rounded-lg text-sm font-medium border border-purple-300 dark:border-purple-600"
                  >
                    {mapFeatureToDescription(feature)}
                  </span>
                ))}
              </div>
            </div>

            {/* Available Colors */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">
                Available Colors
              </h3>
              {isLoadingVariants ? (
                <div className="flex gap-2 animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              ) : variantsData?.colors && variantsData.colors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {variantsData.colors.map((color, index) => {
                    const colorClass = getColorClass(color);
                    return (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border-2 border-gray-300 dark:border-gray-600 capitalize flex items-center gap-2"
                      >
                        {colorClass && (
                          <span
                            className={clsx(
                              "w-4 h-4 rounded-full border-2 border-gray-300 inline-block",
                              colorClass
                            )}
                          />
                        )}
                        {color}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No color information available
                </p>
              )}
            </div>
          </div>
      </div>
    </Modal>
  );
}

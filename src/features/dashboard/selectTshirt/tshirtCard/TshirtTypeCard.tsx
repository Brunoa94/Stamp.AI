"use client";

import { useState } from "react";
import TshirtImage from "./TshirtImage";
import TshirtInfo from "./TshirtInfo";
import TshirtFeatures from "./TshirtFeatures";
import TshirtPrice from "./TshirtPrice";
import { TshirtType } from "../useTshirtSelection";
import ProductDetailsModal from "../ProductDetailsModal";
import { Button } from "@/features/ui/button";

interface Props {
  tshirt: TshirtType;
  isSelected: boolean;
  onSelect: (tshirt: TshirtType) => void;
}

export default function TshirtTypeCard({
  tshirt,
  isSelected,
  onSelect,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    onSelect(tshirt);
  };

  const handleShowDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <article
        onClick={handleCardClick}
        className={`cursor-pointer border-2 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 ${
          isSelected
            ? "border-purple-500 ring-2 ring-purple-200 bg-linear-to-br from-purple-50/50 via-purple-100/40 to-pink-50/50 dark:from-purple-900/20 dark:via-purple-800/30 dark:to-pink-800/30 shadow-lg shadow-purple-500/20"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg hover:shadow-purple-500/10"
        }`}
      >
        <TshirtImage
          src={tshirt.image}
          alt={tshirt.name}
          isSelected={isSelected}
        />

        <div className="space-y-3">
          <TshirtInfo name={tshirt.name} description={tshirt.description} />

          <TshirtFeatures features={tshirt.features} />

          <TshirtPrice price={tshirt.price} />

          <Button
            type="button"
            onClick={handleShowDetails}
            variant="outline"
            className="w-full mt-2 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"
          >
            Show Details
          </Button>
        </div>
      </article>

      <ProductDetailsModal
        tshirt={tshirt}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

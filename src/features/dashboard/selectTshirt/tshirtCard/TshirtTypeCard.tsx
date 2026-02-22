"use client";

import { useState } from "react";
import { TshirtType } from "../useTshirtSelection";
import ProductDetailsModal from "../ProductDetailsModal";
import { Button } from "@/features/ui/button";
import TshirtImage from "./TshirtImage";
import TshirtInfo from "./TshirtInfo";
import TshirtFeatures from "./TshirtFeatures";
import TshirtPrice from "./TshirtPrice";

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
            ? "border-slate-600 ring-2 ring-slate-200 bg-linear-to-br from-gray-50/50 via-slate-100/40 to-gray-100/50 dark:from-gray-900/20 dark:via-slate-800/30 dark:to-gray-800/30 shadow-lg shadow-slate-500/20"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:shadow-slate-500/10"
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
            className="w-full mt-2 border-gray-300 text-slate-700 hover:bg-gray-50 dark:border-gray-600 dark:text-slate-300 dark:hover:bg-gray-900/20"
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

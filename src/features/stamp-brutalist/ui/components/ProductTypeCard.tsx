"use client";

import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { Shirt, ShoppingBag, Image as ImageIcon } from "lucide-react";
import type { ProductTypeIdTypes } from "../../lib/types/stampTypes";

const PRODUCT_ICONS = {
  tee: Shirt,
  hoodie: Shirt,
  tote: ShoppingBag,
  poster: ImageIcon,
};

interface PropsI {
  number: string;
  type: ProductTypeIdTypes;
  name: string;
  specs: string;
  price: number;
  icon: string;
  hoverColor: string;
  isSelected: boolean;
  onClick: () => void;
}

export function ProductTypeCard({
  number,
  type,
  name,
  specs,
  price,
  hoverColor,
  isSelected,
  onClick,
}: PropsI) {
  const Icon = PRODUCT_ICONS[type];

  return (
    <Button
      type="button"
      onClick={onClick}
      className={cn(
        "group bg-ink border border-white/5 p-10 min-h-75 flex flex-col justify-between transition-colors cursor-pointer h-auto rounded-none",
        hoverColor,
        isSelected && "ring-4 ring-brandCyan",
      )}
    >
      <Span className="font-anton text-4xl text-white opacity-20 group-hover:opacity-100 transition-opacity">
        {number}
      </Span>

      <div className="relative z-10 flex flex-col items-center">
        <Icon className="w-32 h-32 text-white opacity-10 group-hover:opacity-30 transition-opacity mb-4" />
        <div className="text-center">
          <Heading variant="card" className="text-white mb-2">
            {name}
          </Heading>
          <Paragraph variant="sm" className="opacity-80 text-white">
            {specs}
          </Paragraph>
        </div>
      </div>

      <Span className="font-anton text-2xl text-white mt-8">
        ${price.toFixed(2)}+
      </Span>
    </Button>
  );
}

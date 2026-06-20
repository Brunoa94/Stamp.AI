"use client";

import Image from "next/image";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import { useStampFlowStore } from "../../lib/context/StampFormContext";

interface PropsI {
  productImage?: string;
  productTitle: string;
  productPrice: number;
  variantInfo?: string;
  onBagIt: () => void;
  onBuyNow: () => void;
}

export function FinalReviewCard({
  productImage,
  productTitle,
  productPrice,
  variantInfo,
  onBagIt,
  onBuyNow,
}: PropsI) {
  const mockupImageUrl = useStampFlowStore((s) => s.mockupImageUrl);
  const selectedImageUrl = useStampFlowStore((s) => s.selectedImageUrl);

  // Display priority: mockup image from creation > productImage prop > selectedImageUrl (fallback)
  const displayImage = mockupImageUrl || productImage || selectedImageUrl;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-18">
      <div className="lg:col-span-7">
        <div className="aspect-square bg-[#e5e7eb] border-2 border-ink shadow-[60px_60px_0px_rgba(251,146,60,0.15)] relative overflow-hidden">
          {displayImage ? (
            <>
              <Image
                src={displayImage}
                alt="Product mockup"
                fill
                className="object-contain"
                unoptimized
              />
              <Span
                variant="sm"
                className="absolute bottom-8 left-8 bg-ink text-white px-5 py-2"
              >
                {mockupImageUrl ? "MOCKUP PREVIEW" : "DESIGN PREVIEW"}
              </Span>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Span className="opacity-40">No preview available</Span>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-5 py-6">
        <div className="space-y-8">
          <Heading variant="title" className="leading-tight">
            {productTitle}
          </Heading>

          {variantInfo && (
            <Span variant="default" className="opacity-60">
              {variantInfo}
            </Span>
          )}

          <Heading variant="title" className="text-brandOrange">
            ${productPrice.toFixed(2)}
          </Heading>

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={onBagIt}
              variant="outline"
              className="flex-1 h-auto rounded-none border-4 border-ink py-6 font-anton text-2xl tracking-widest uppercase hover:bg-ink hover:text-white transition-all"
            >
              BAG IT
            </Button>

            <Button
              type="button"
              onClick={onBuyNow}
              className="flex-1 h-auto rounded-none bg-brandCyan text-ink py-6 font-anton text-2xl tracking-widest uppercase hover:scale-105 transition-transform shadow-xl"
            >
              BUY NOW
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

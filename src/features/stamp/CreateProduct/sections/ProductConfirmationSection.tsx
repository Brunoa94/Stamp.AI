"use client";

import { RefObject } from "react";
import Image from "next/image";
import { Button } from "@/features/ui/button";
import {
  ShoppingCartIcon,
  ArrowRightIcon,
  CreditCardIcon,
} from "@/theme/icons";
import { productConfirmationTheme } from "@/theme/components";
import { ProductDetailsSummary } from "./ProductDetailsSummary";
import { useProductConfirmation } from "../steps/SizingStep/useProductConfirmation";

interface PropsI {
  sectionRef: RefObject<HTMLElement | null>;
  isAddedToCart: boolean;
  isPending: boolean;
}

export function ProductConfirmationSection({
  sectionRef,
  isAddedToCart,
  isPending,
}: PropsI) {
  const { product, displayImage, variantPrice, firstEnabledVariant } =
    useProductConfirmation();

  if (!product) return null;

  return (
    <section
      ref={sectionRef}
      className={productConfirmationTheme.section}
      aria-label="Product confirmation"
    >
      {/* Product Preview */}
      <div className={productConfirmationTheme.imageContainer}>
        {displayImage && (
          <div className={productConfirmationTheme.imageWrapper}>
            <Image
              src={displayImage}
              alt={product.title}
              width={800}
              height={800}
              className={productConfirmationTheme.image}
              priority
            />
          </div>
        )}
      </div>

      {/* Product Details */}
      <ProductDetailsSummary
        productTitle={product.title}
        priceLabel={`$${(variantPrice / 100).toFixed(2)}`}
        variantTitle={firstEnabledVariant?.title}
      />

      {/* Action Buttons */}
      <div className={productConfirmationTheme.buttonsContainer}>
        <div className={productConfirmationTheme.buttonsGrid}>
          {/* Add to Cart Button */}
          <Button
            type="submit"
            value="add_to_cart"
            disabled={isPending || isAddedToCart}
            size="lg"
            variant={isAddedToCart ? "secondary" : "outline"}
            className={productConfirmationTheme.button}
          >
            <ShoppingCartIcon className={productConfirmationTheme.icon} />
            {isAddedToCart
              ? "Added to Cart"
              : isPending
                ? "Adding..."
                : "Add to Cart"}
          </Button>

          {/* Proceed to Checkout Button */}
          <Button
            id="proceed-to-checkout-button"
            type="submit"
            value="proceed_to_checkout"
            disabled={isPending}
            size="lg"
            variant="default"
            className={productConfirmationTheme.checkoutButton}
          >
            <CreditCardIcon className={productConfirmationTheme.icon} />
            {isPending && !isAddedToCart
              ? "Adding to Cart..."
              : "Proceed to Checkout"}
            <ArrowRightIcon className={productConfirmationTheme.icon} />
          </Button>
        </div>
      </div>
    </section>
  );
}

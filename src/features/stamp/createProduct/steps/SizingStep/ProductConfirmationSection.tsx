"use client";

import { Button } from "@/features/ui/button";
import { ShoppingCartIcon, ArrowRight, CreditCard } from "lucide-react";
import Image from "next/image";
import { CreateProductSelectors } from "../../context/selectors";
import { useAddToCart } from "@/queries";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { RefObject, useState } from "react";
import { ProductDetailsSummary } from "./ProductDetailsSummary";
import { mapCreateProductToCartInput } from "@/mappers/createProductToCartMapper";

interface ProductConfirmationSectionProps {
  sectionRef: RefObject<HTMLElement | null>;
}

export function ProductConfirmationSection({
  sectionRef,
}: ProductConfirmationSectionProps) {
  const product = CreateProductSelectors.createdProduct();
  const generatedResult = CreateProductSelectors.generatedResult();
  const addToCart = useAddToCart();
  const router = useRouter();
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  if (!product) return null;

  const displayImage = product.images?.[0]?.src || generatedResult?.imageUrl;
  const firstEnabledVariant =
    product.variants?.find((v) => v.is_enabled) || product.variants?.[0];
  const variantPrice = firstEnabledVariant?.price || 25.0;
  const addToCartPayload = mapCreateProductToCartInput({
    productId: product.id,
    productTitle: product.title,
    variantPrice,
    imageUrl: generatedResult?.imageUrl,
    variantId: firstEnabledVariant?.id,
  });

  const handleAddToCart = () => {
    addToCart.mutate(addToCartPayload, {
      onSuccess: () => {
        setIsAddedToCart(true);
        toast.success("Added to cart", {
          description: "Your custom design has been added to your cart.",
        });
      },
      onError: (error) => {
        toast.error("Failed to add to cart", {
          description: error.message,
        });
      },
    });
  };

  const handleProceedToCheckout = () => {
    if (!isAddedToCart) {
      // Add to cart first, then redirect
      addToCart.mutate(addToCartPayload, {
        onSuccess: () => {
          toast.success("Added to cart", {
            description: "Redirecting to checkout...",
          });
          setTimeout(() => {
            router.push("/cart");
          }, 1000);
        },
        onError: (error) => {
          toast.error("Failed to add to cart", {
            description: error.message,
          });
        },
      });
    } else {
      // Already in cart, just redirect
      router.push("/cart");
    }
  };

  return (
    <section
      ref={sectionRef}
      className="space-y-8 animate-[slideInUp_1s_ease-out]"
      aria-label="Product confirmation"
    >
      {/* Product Preview */}
      <div className="max-w-2xl mx-auto">
        {displayImage && (
          <div className="bg-linear-to-br from-gray-50/50 via-slate-50/50 to-gray-100/50 dark:from-gray-800/80 dark:via-slate-800/30 dark:to-gray-800/30 backdrop-blur-sm border border-gray-200 dark:border-gray-800/30 rounded-2xl overflow-hidden shadow-2xl shadow-slate-500/20 dark:shadow-slate-500/10">
            <Image
              src={displayImage}
              alt={product.title}
              width={800}
              height={800}
              className="w-full h-auto object-contain"
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
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={addToCart.isPending || isAddedToCart}
            size="lg"
            variant={isAddedToCart ? "secondary" : "outline"}
            className="w-full h-14 text-lg font-semibold"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            {isAddedToCart
              ? "Added to Cart"
              : addToCart.isPending
                ? "Adding..."
                : "Add to Cart"}
          </Button>

          {/* Proceed to Checkout Button */}
          <Button
            onClick={handleProceedToCheckout}
            disabled={addToCart.isPending}
            size="lg"
            variant="default"
            className="w-full h-14 text-lg font-semibold shadow-xl shadow-purple-500/40 hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300"
          >
            <CreditCard className="w-5 h-5" />
            {addToCart.isPending && !isAddedToCart
              ? "Adding to Cart..."
              : "Proceed to Checkout"}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

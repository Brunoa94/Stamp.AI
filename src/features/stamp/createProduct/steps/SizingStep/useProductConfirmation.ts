import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAddToCart } from "@/queries";
import { mapCreateProductToCartInput } from "@/mappers/createProductToCartMapper";
import { CreateProductSelectors } from "../../context/selectors";

export function useProductConfirmation() {
  const product = CreateProductSelectors.createdProduct();
  const generatedResult = CreateProductSelectors.generatedResult();
  const addToCart = useAddToCart();
  const router = useRouter();
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  if (!product) {
    return {
      product: null,
      displayImage: null,
      variantPrice: 0,
      firstEnabledVariant: null,
      isAddedToCart: false,
      isPending: false,
      handleAddToCart: () => {},
      handleProceedToCheckout: () => {},
    };
  }

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

  return {
    product,
    displayImage,
    variantPrice,
    firstEnabledVariant,
    isAddedToCart,
    isPending: addToCart.isPending,
    handleAddToCart,
    handleProceedToCheckout,
  };
}

import { useCreateCustomProduct, useAddToCart } from "@/queries";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreateProductPayloadT } from "@/types/customProduct";

export { useCreateCustomProduct } from "@/queries";

export function useCreateProductAndAddToCart() {
  const { mutate: createProduct, ...createProductResult } = useCreateCustomProduct();
  const addToCart = useAddToCart();
  const router = useRouter();

  const createAndAddToCart = ({
    blueprintId,
    printProviderId,
    imageUrl,
    tshirtName,
    userId,
    userEmail,
  }: {
    blueprintId: number;
    printProviderId: number;
    imageUrl: string;
    tshirtName: string;
    userId: string;
    userEmail: string;
  }) => {
    // Default price for custom t-shirt (in dollars, will be converted to cents)
    const defaultPrice = 25.0;

    const productPayload: CreateProductPayloadT = {
      blueprint_id: blueprintId,
      print_provider_id: printProviderId,
      image_url: imageUrl,
      title: `${tshirtName} - Custom Design`,
      description: `Custom designed ${tshirtName} with your unique artwork`,
      user_id: userId,
      customer_email: userEmail,
    };

    createProduct(productPayload, {
      onSuccess: async (product) => {
        // Get the first enabled variant (or first variant) for the cart
        const firstEnabledVariant = product.variants?.find(v => v.is_enabled) || product.variants?.[0];
        const variantPriceInDollars = firstEnabledVariant?.price || defaultPrice;

        // Convert price from dollars to cents for database storage
        const variantPriceInCents = Math.round(variantPriceInDollars * 100);

        addToCart.mutate(
          {
            product_id: product.id, // Printify product ID (now saved to database)
            product_name: product.title || `${tshirtName} - Custom Design`,
            quantity: 1,
            unit_price: variantPriceInCents,
            custom_image_url: product.uploaded_image_preview_url || imageUrl,
            variant_id: firstEnabledVariant?.id?.toString() || null,
          },
          {
            onSuccess: () => {
              toast.success("Added to cart", {
                description: "Your custom design has been added to your cart.",
              });

              setTimeout(() => {
                router.push("/cart")
              }, 2000)
            },
            onError: (error) => {
              toast.error("Failed to add to cart", {
                description: error.message,
              });
            },
          }
        );
      },
    });
  };

  return {
    createAndAddToCart,
    isCreatingProduct: createProductResult.isPending,
    isProductCreated: createProductResult.isSuccess,
    createdProduct: createProductResult.data,
  };
}

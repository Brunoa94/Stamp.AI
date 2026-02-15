import { useMutation } from "@tanstack/react-query";
import { CustomProductService, CreateProductPayload, CreatedProduct } from "@/services/customProductService";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useCartMutations } from "@/hooks/useCart";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useCreateCustomProduct() {
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: (payload: CreateProductPayload): Promise<CreatedProduct> => {
      return CustomProductService.createCustomProduct(payload);
    },
    onError: (error: Error) => {
      handleError({
        message: error.message,
        error: "CUSTOM_PRODUCT_CREATION_FAILED",
      });
    },
  });
}

export function useCreateProductAndAddToCart() {
  const { mutate: createProduct, ...createProductResult } = useCreateCustomProduct();
  const { addToCart } = useCartMutations();
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
    // Default price for custom t-shirt
    const defaultPrice = 25.0;

    const productPayload: CreateProductPayload = {
      blueprint_id: blueprintId,
      print_provider_id: printProviderId,
      image_url: imageUrl,
      title: `${tshirtName} - Custom Design`,
      description: `Custom designed ${tshirtName} with your unique artwork`,
      user_id: userId,
      customer_email: userEmail,
      
    };

    createProduct(productPayload, {
      onSuccess: () => {
        addToCart.mutate(
          {
            product_id: null, // Custom product (Printify), so no internal product ID yet
            quantity: 1,
            unit_price: defaultPrice,
            custom_image_url: imageUrl,
            // We can't set variant_id yet as we don't have internal variants
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

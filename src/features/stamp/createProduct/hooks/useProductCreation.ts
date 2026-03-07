import { useUser } from "@/hooks/useAuth";
import { useCreateCustomProduct } from "@/queries";
import type { TshirtType } from "@/queries/productQueries";
import { useCreateProductSubscriberActions } from "../context/actions";
import { IImageGenerationResult } from "@/schemas/productCreateSchema";

/**
 * Hook to handle product creation logic
 */
export function useProductCreation() {
  const { data: user } = useUser();
  const { mutate: createProduct } = useCreateCustomProduct();
  const {
    handleProductCreationStart,
    handleProductCreationSuccess,
    handleProductCreationError,
  } = useCreateProductSubscriberActions();

  const handleCreateProduct = (
    generatedResult: IImageGenerationResult | null,
    selectedTshirt: TshirtType | null
  ) => {
    if (!generatedResult?.imageUrl || !selectedTshirt || !user) {
      return;
    }

    handleProductCreationStart();

    const productPayload = {
      blueprint_id: selectedTshirt.blueprint_id,
      print_provider_id: selectedTshirt.print_provider_id,
      image_url: generatedResult.imageUrl,
      title: `${selectedTshirt.name} - Custom Design`,
      description: `Custom designed ${selectedTshirt.name} with your unique artwork`,
      user_id: user.id,
      customer_email: user.email,
    };

    createProduct(productPayload, {
      onSuccess: (product) => {
        handleProductCreationSuccess(product);
      },
      onError: (error) => {
        handleProductCreationError();
        console.error("Failed to create product:", error);
      },
    });
  };

  return { handleCreateProduct };
}

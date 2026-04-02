import { useContext } from "react";
import { useUser } from "@/hooks/useAuth";
import { useCreateCustomProduct } from "@/queries";
import type { TshirtType } from "@/queries/productQueries";
import { useCreateProductSubscriberActions } from "../context/actions";
import { IImageGenerationResult } from "@/schemas/productCreateSchema";
import { FormSubscriberContext } from "../context/CreateProductContextSubscriber";

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

  // Access the store directly to avoid stale closure issues
  const formStore = useContext(FormSubscriberContext);

  const handleCreateProduct = (
    generatedResult: IImageGenerationResult | null,
    selectedTshirt: TshirtType | null
  ) => {
    if (!generatedResult?.imageUrl || !selectedTshirt || !user) {
      return;
    }

    // Get the latest color and size from the store at call time
    // This avoids stale closure issues where the values were captured at render time
    const formState = formStore?.getState();
    const selectedColor = formState?.selectedColor ?? null;
    const selectedSize = formState?.selectedSize ?? null;

    console.log("🎨 Creating product with color:", selectedColor, "size:", selectedSize);

    handleProductCreationStart();

    const productPayload = {
      blueprint_id: selectedTshirt.blueprint_id,
      print_provider_id: selectedTshirt.print_provider_id,
      image_url: generatedResult.imageUrl,
      title: `${selectedTshirt.name} - Custom Design`,
      description: `Custom designed ${selectedTshirt.name} with your unique artwork`,
      user_id: user.id,
      customer_email: user.email,
      selected_color: selectedColor,
      selected_size: selectedSize,
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

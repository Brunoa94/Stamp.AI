import { useMutation } from "@tanstack/react-query";
import { CustomProductService, CreateProductPayload, CreatedProduct } from "@/services/customProductService";
import { useErrorHandler } from "@/hooks/useErrorHandler";

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

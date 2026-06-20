import { CreateProductSelectors } from "@/features/stamp/CreateProduct/lib/context/selectors";

export function useProductConfirmation() {
  const product = CreateProductSelectors.createdProduct();
  const generatedResult = CreateProductSelectors.generatedResult();

  if (!product) {
    return {
      product: null,
      displayImage: null,
      variantPrice: 0,
      firstEnabledVariant: null,
    };
  }

  const displayImage = product.images?.[0]?.src || generatedResult?.imageUrl;
  const firstEnabledVariant =
    product.variants?.find((v) => v.is_enabled) || product.variants?.[0];
  const variantPrice = firstEnabledVariant?.price || 25.0;

  return {
    product,
    displayImage,
    variantPrice,
    firstEnabledVariant,
  };
}

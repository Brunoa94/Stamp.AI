import { useProductOfMonth } from "@/shared/queries/catalogQueries";
import { useProductText } from "@/shared/queries/productTextQueries";
import { mapProductOfMonth } from "../mappers/productCardMapper";

/** The Product of the Month, with its title and description in the visitor's language */
export function useLocalizedProductOfMonth() {
  const productText = useProductText();
  const { data: product, isLoading } = useProductOfMonth();

  return {
    product,
    isLoading,
    text: product ? mapProductOfMonth(product, productText) : null,
  };
}

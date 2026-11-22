import { localizeProductText } from "@/shared/helpers/localizeProduct";
import { useProductLabel } from "@/shared/hooks/useProductLabel";
import { useProductText } from "@/shared/queries/productTextQueries";
import { useStampCustomization, useStampProductSelection } from "./useStampSelectors";

/** Shown when no colour is selected, as Final Review always did */
const DEFAULT_COLOR = "Black";

/**
 * The selected product's title, description and colour in the visitor's
 * language, for Final Review. The store keeps the English values.
 */
export function useLocalizedSelectedProduct() {
  const text = useProductText();
  const label = useProductLabel();
  const { blueprintId, selectedProductTitle, selectedProductDescription } = useStampProductSelection();
  const { selectedColor } = useStampCustomization();

  const english = {
    title: selectedProductTitle ?? "",
    description: selectedProductDescription ?? null,
    specs: [],
  };
  const localized = blueprintId === undefined ? english : localizeProductText(text, blueprintId, english);

  return {
    displayName: localized.title || undefined,
    displayDescription: localized.description,
    // Also covers paper types, which arrive in the colour option
    colorLabel: label("color", selectedColor || DEFAULT_COLOR),
  };
}

import { localizeProductLabel } from "@/shared/helpers/localizeProduct";
import { useProductText } from "@/shared/queries/productTextQueries";
import type { ProductLabelKindT } from "@/shared/types/productText";

/** Translates colour and paper-type names for display; the English value stays the selection key */
export function useProductLabel() {
  const text = useProductText();

  return (kind: ProductLabelKindT, englishValue: string) => localizeProductLabel(text, kind, englishValue);
}

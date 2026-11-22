import { useTranslations } from "next-intl";
import { formatSizeForDisplay, formatVariantForDisplay } from "../helpers/sizeDisplayMapper";
import { translateSizeWords, type SizeWordsT } from "../helpers/sizeWords";

/** Formats a size or variant name for display, in the visitor's language */
export function useSizeLabel() {
  const t = useTranslations("productSizes");
  const words: SizeWordsT = { oneSize: t("oneSize"), vertical: t("vertical"), horizontal: t("horizontal") };

  return {
    formatSize: (size: string) => translateSizeWords(formatSizeForDisplay(size), words),
    formatVariant: (variantName: string) =>
      formatVariantForDisplay(variantName)
        .split(" / ")
        .map((part) => translateSizeWords(part, words))
        .join(" / "),
  };
}

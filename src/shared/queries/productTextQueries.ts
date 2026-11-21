import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { isTranslatedLocale, loadProductText } from "@/shared/constants/productText/loadProductText";
import type { ProductTextT } from "@/shared/types/productText";

/**
 * The visitor's product text on the client, loaded once per language and
 * kept for the session. Null for English, and null until the file arrives,
 * so product names show in English for a moment on the first load.
 */
export function useProductText(): ProductTextT | null {
  const locale = useLocale();
  const { data } = useQuery({
    queryKey: ["productText", locale],
    queryFn: () => loadProductText(locale),
    enabled: isTranslatedLocale(locale),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return data ?? null;
}

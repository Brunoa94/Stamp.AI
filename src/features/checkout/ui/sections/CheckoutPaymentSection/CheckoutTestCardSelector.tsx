/**
 * CheckoutTestCardSelector
 *
 * Dropdown for selecting test card payment methods, styled to the luxury
 * brutalist system (taupe label, chocolate/cream Select). Used only in test
 * mode. Groups mirror the shared TestCardSelector's scenarios.
 */

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";
import { Span } from "@/features/ui/span";
import { TEST_CARD_GROUPS } from "../../../lib/constants/testCards";

interface CheckoutTestCardSelectorPropsI {
  value: string;
  onChange: (value: string) => void;
}

export function CheckoutTestCardSelector({
  value,
  onChange,
}: CheckoutTestCardSelectorPropsI) {
  const t = useTranslations("checkout.testCards");
  return (
    <div className="space-y-3">
      <label htmlFor="test-card-select">
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("selectorLabel")}
        </Span>
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id="test-card-select"
          className="h-12 w-full rounded-none border-(--color-stamp-divider) bg-(--color-stamp-white) text-sm uppercase tracking-[0.05em] text-(--color-stamp-chocolate) focus:ring-2 focus:ring-(--color-stamp-gold)/30"
        >
          <SelectValue placeholder={t("selectorPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          {TEST_CARD_GROUPS.map((group, groupIndex) => (
            <SelectGroup key={group.id}>
              <SelectLabel>{t(`groups.${group.id}.label`)}</SelectLabel>
              {group.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(`options.${option.value}`)}
                </SelectItem>
              ))}
              {groupIndex < TEST_CARD_GROUPS.length - 1 && <SelectSeparator />}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

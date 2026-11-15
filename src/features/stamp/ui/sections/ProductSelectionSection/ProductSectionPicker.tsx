import { useTranslations } from "next-intl";
import { ProductSectionOption } from "./ProductSectionOption";
import type { ProductSectionIdT, ProductSectionT } from "../../../lib/types/stampTypes";

/**
 * ProductSectionPicker
 *
 * The options at the top of the product step: one card per section
 * (apparel, accessories). The grid below shows the active section.
 */

interface PropsI {
  sections: ProductSectionT[];
  activeSectionId: ProductSectionIdT;
  onSectionChange: (sectionId: ProductSectionIdT) => void;
}

export function ProductSectionPicker({ sections, activeSectionId, onSectionChange }: PropsI) {
  const t = useTranslations("stamp.productSelection");

  return (
    <div role="group" aria-label={t("sectionPickerAria")} className="grid grid-cols-2 gap-3">
      {sections.map((section) => (
        <ProductSectionOption
          key={section.id}
          section={section}
          isActive={section.id === activeSectionId}
          onSelect={() => onSectionChange(section.id)}
        />
      ))}
    </div>
  );
}

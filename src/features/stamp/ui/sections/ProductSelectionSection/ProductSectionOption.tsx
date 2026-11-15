import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import type { ProductSectionT } from "../../../lib/types/stampTypes";

/**
 * ProductSectionOption
 *
 * One card of the product step's section picker, in the catalog showcase
 * style: a product photo beside the section name and its product count.
 */

interface PropsI {
  section: ProductSectionT;
  isActive: boolean;
  onSelect: () => void;
}

export function ProductSectionOption({ section, isActive, onSelect }: PropsI) {
  const t = useTranslations("stamp.productSelection");
  const label = t(section.id);

  return (
    <Button
      type="button"
      variant="unstyled"
      onClick={onSelect}
      aria-pressed={isActive}
      className={cn(
        "group flex w-full items-center gap-3 overflow-hidden rounded-lg border bg-(--color-stamp-white) p-2 text-left transition-colors duration-300",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-gold)",
        isActive
          ? "border-2 border-(--color-stamp-gold) bg-(--color-stamp-gold)/5 md:bg-(--color-stamp-cream)"
          : "border-(--color-stamp-divider) hover:border-(--color-stamp-gold)",
      )}
    >
      <Span unstyled className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-(--color-stamp-cream)/40 md:bg-(--color-stamp-cream) lg:h-16 lg:w-16">
        {section.imageUrl && (
          <Image
            src={section.imageUrl}
            alt=""
            fill
            sizes="64px"
            className="object-contain p-1 transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </Span>
      <Span unstyled className="flex min-w-0 flex-col gap-0.5">
        <Span variant="label" className="text-(--color-stamp-chocolate)">
          {label}
        </Span>
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("sectionCount", { count: section.products.length })}
        </Span>
      </Span>
    </Button>
  );
}

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

interface PropsI {
  onInitiate: () => void;
}

export function OrdersEmptySection({ onInitiate }: PropsI) {
  const t = useTranslations("orders.empty");

  return (
    <section
      className="flex flex-col items-center py-32 text-center"
      aria-label={t("ariaLabel")}
    >
      <div className="mb-12 flex h-48 w-48 rotate-3 items-center justify-center border border-(--color-stamp-divider) bg-(--color-stamp-cream)">
        <ShoppingBag className="h-16 w-16 text-(--color-stamp-taupe)/30" />
      </div>
      <Heading as="h2" variant="title" className="text-4xl">
        {t("title")}
      </Heading>
      <Paragraph
        variant="sm"
        className="mb-12 mt-4 text-[10px] tracking-[0.2em] text-(--color-stamp-taupe)"
      >
        {t("description")}
      </Paragraph>
      <Button
        type="button"
        onClick={onInitiate}
        variant="cta"
      >
        {t("initiate")}
      </Button>
    </section>
  );
}

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
      className="flex flex-col items-center rounded-2xl bg-(--color-stamp-cream) px-6 py-16 text-center"
      aria-label={t("ariaLabel")}
    >
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) shadow-(--shadow-stamp-card)">
        <ShoppingBag aria-hidden className="h-10 w-10 text-(--color-stamp-gold-text)" />
      </div>
      <Heading as="h2" variant="card" className="text-(--color-stamp-chocolate)">
        {t("title")}
      </Heading>
      <Paragraph variant="xs" className="mb-8 mt-3 text-(--color-stamp-taupe)">
        {t("description")}
      </Paragraph>
      <Button type="button" onClick={onInitiate} variant="primary">
        {t("initiate")}
      </Button>
    </section>
  );
}

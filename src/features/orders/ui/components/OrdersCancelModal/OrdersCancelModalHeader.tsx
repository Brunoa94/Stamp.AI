import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

export function OrdersCancelModalHeader() {
  const t = useTranslations("orders.cancelModal");

  return (
    <>
      <Heading as="h3" variant="card" className="mb-4 text-2xl tracking-tight">
        {t("title")}
      </Heading>
      <Paragraph
        variant="sm"
        className="mb-10 text-lg tracking-[0.15em] text-(--color-stamp-taupe)"
      >
        {t("description")}
      </Paragraph>
    </>
  );
}

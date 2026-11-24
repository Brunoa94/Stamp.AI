import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

export function OrdersCancelModalHeader() {
  const t = useTranslations("orders.cancelModal");

  return (
    <>
      <Heading
        as="h3"
        variant="cardCompact"
        className="mb-2 text-2xl text-(--color-stamp-chocolate)"
      >
        {t("title")}
      </Heading>
      <Paragraph variant="xs" className="mb-8 text-(--color-stamp-taupe)">
        {t("description")}
      </Paragraph>
    </>
  );
}

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

/**
 * TrackOrderHeader
 *
 * Title on the /track-order header band, styled like the orders page's.
 */
export function TrackOrderHeader() {
  const t = useTranslations("orders.track");

  return (
    <header className="hero-copy space-y-4">
      <div className="h-1.5 w-20 bg-(--color-stamp-gold)" />
      <Heading as="h1" variant="title" className="text-(--color-stamp-off-white)">
        {t("title")}{" "}
        <Span variant="serif" className="text-(--color-stamp-gold-light)">
          {t("accent")}
        </Span>
      </Heading>
    </header>
  );
}

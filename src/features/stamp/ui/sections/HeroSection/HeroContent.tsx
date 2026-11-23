import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";

/**
 * HeroContent
 *
 * The studio's entry copy in the Stamp section-header order (accent bar,
 * eyebrow, title with a handwritten accent word, supporting line) and the
 * call to action. The title uses the page-title scale, which stays inside the
 * narrow right column at 1024px.
 */

interface PropsI {
  onBegin: () => void;
}

export function HeroContent({ onBegin }: PropsI) {
  const t = useTranslations("stamp.hero");

  return (
    <div className="flex flex-col justify-center p-6 md:p-12 lg:p-16 xl:p-24">
      <div aria-hidden="true" className="mb-4 h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
      <Span as="p" variant="label" className="mb-3 text-(--color-stamp-gold-text)">
        {t("eyebrow")}
      </Span>
      <Heading
        as="h1"
        variant="title"
        className="text-(--color-stamp-chocolate) mb-6 md:mb-8"
      >
        {t.rich("title", {
          accent: (chunks) => (
            <Span variant="serif" className="text-(--color-stamp-gold-text)">
              {chunks}
            </Span>
          ),
        })}
      </Heading>

      <Paragraph
        variant="sm"
        className="text-(--color-stamp-taupe) mb-8 md:mb-10 max-w-lg"
      >
        {t("description")}
      </Paragraph>

      <div>
        <Button variant="cta" onClick={onBegin} aria-label={t("ctaAria")}>
          {t("cta")}
        </Button>
      </div>
    </div>
  );
}

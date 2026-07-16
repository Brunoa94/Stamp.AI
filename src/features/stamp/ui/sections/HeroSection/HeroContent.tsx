import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";

/**
 * HeroContent
 *
 * Displays the hero text content and call-to-action button
 */

interface PropsI {
  onBegin: () => void;
}

export function HeroContent({ onBegin }: PropsI) {
  const t = useTranslations("stamp.hero");

  return (
    <div className="flex flex-col justify-center p-12 lg:p-24">
      <Span
        variant="sm"
        className="text-(--color-stamp-taupe) mb-8 block"
      >
        {t("eyebrow")}
      </Span>

      <Heading
        as="h1"
        variant="display"
        className="text-(--color-stamp-chocolate) mb-10"
      >
        {t.rich("title", {
          br: () => <br />,
          accent: (chunks) => (
            <span className="text-(--color-stamp-taupe) italic font-serif lowercase">
              {chunks}
            </span>
          ),
        })}
      </Heading>

      <Paragraph
        variant="lead"
        className="text-(--color-stamp-taupe) mb-12 max-w-lg font-light"
      >
        {t("description")}
      </Paragraph>

      <div>
        <Button
          onClick={onBegin}
          className="bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase"
          aria-label={t("ctaAria")}
        >
          {t("cta")}
        </Button>
      </div>
    </div>
  );
}

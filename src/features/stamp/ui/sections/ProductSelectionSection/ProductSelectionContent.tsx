import { Info, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";

/**
 * ProductSelectionContent
 *
 * Left panel with description and continue button
 */

interface PropsI {
  canProceed: boolean;
  onContinue: () => void;
}

export function ProductSelectionContent({ canProceed, onContinue }: PropsI) {
  const t = useTranslations("stamp.productSelection");

  return (
    <div className="h-full p-12 lg:p-24 flex flex-col justify-between border-r border-(--color-stamp-divider)">
      <div>
        <Span variant="sm" className="text-(--color-stamp-taupe) mb-6">
          {t("protocol")}
        </Span>

        <Heading
          as="h2"
          variant="title"
          className="text-(--color-stamp-chocolate) mb-6"
        >
          {t.rich("title", {
            accent: (chunks) => (
              <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
                {chunks}
              </span>
            ),
          })}
        </Heading>

        <Paragraph
          variant="card"
          className="text-(--color-stamp-taupe) mb-12 max-w-sm"
        >
          {t("description")}
        </Paragraph>

        <div className="flex items-center gap-3 p-4 bg-(--color-stamp-cream)/40 border border-(--color-stamp-divider)">
          <Info className="text-(--color-stamp-gold) w-5 h-5 shrink-0" />
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            {t("pricingNote")}
          </Span>
        </div>
      </div>

      <Button
        onClick={onContinue}
        disabled={!canProceed}
        className="w-full mt-12 bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t("continue")}
        <ArrowRight className="w-5 h-5" />
      </Button>
    </div>
  );
}

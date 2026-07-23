import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
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

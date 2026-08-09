/**
 * ProfileHeader
 *
 * Stamp-styled page header matching panelTitle pattern:
 * - Large heading with serif accent
 * - Taupe subtitle text
 */

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { Paragraph } from "@/features/ui/paragraph";

export function ProfileHeader() {
  const t = useTranslations("profile.header");

  return (
    <header>
      <Heading
        as="h1"
        variant="panelTitle"
        className="text-(--color-stamp-chocolate) mb-4"
      >
        {t.rich("title", {
          accent: (chunks) => (
            <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
              {chunks}
            </span>
          ),
        })}
      </Heading>
      <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
        {t("subtitle")}
      </Paragraph>
    </header>
  );
}

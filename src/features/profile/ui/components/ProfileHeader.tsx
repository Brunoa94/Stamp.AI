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
    <header className="hero-copy">
      <Heading
        as="h1"
        variant="panelTitle"
        className="text-(--color-stamp-off-white) mb-4"
      >
        {t.rich("title", {
          accent: (chunks) => (
            <Span variant="serif" className="text-(--color-stamp-gold-light)">
              {chunks}
            </Span>
          ),
        })}
      </Heading>
      <Paragraph variant="sm" className="text-(--color-stamp-cream)">
        {t("subtitle")}
      </Paragraph>
    </header>
  );
}

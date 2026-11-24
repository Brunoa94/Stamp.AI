/**
 * ProfileHeader
 *
 * Page header inside the photo band, in the shared section-header order:
 * amber accent bar, the page title with a handwritten accent word, and a
 * one-line subtitle. Light colours because the copy sits on the photo.
 */

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { Paragraph } from "@/features/ui/paragraph";

export function ProfileHeader() {
  const t = useTranslations("profile.header");

  return (
    <header className="hero-copy space-y-4">
      <div aria-hidden className="h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
      <Heading
        as="h1"
        variant="title"
        className="text-(--color-stamp-off-white)"
      >
        {t.rich("title", {
          accent: (chunks) => (
            <Span variant="serif" className="text-(--color-stamp-gold-light)">
              {chunks}
            </Span>
          ),
        })}
      </Heading>
      <Paragraph variant="xs" className="text-(--color-stamp-cream) md:text-lg">
        {t("subtitle")}
      </Paragraph>
    </header>
  );
}

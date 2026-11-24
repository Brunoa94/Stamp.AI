/**
 * DashboardHeader
 *
 * Page header in the shared section-header order: amber accent bar, the
 * slab-serif title with a handwritten accent word, and a personalized
 * taupe subtitle.
 */

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { UserI } from "../../../../../supabase/types";
import { getDisplayName } from "../../lib/helpers/userPresentation";

interface DashboardHeaderPropsI {
  user?: UserI | null;
}

export function DashboardHeader({ user }: DashboardHeaderPropsI) {
  const t = useTranslations("dashboard.header");

  return (
    <header className="max-w-3xl space-y-3">
      <div aria-hidden className="h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
      <Heading
        as="h1"
        variant="title"
        className="text-(--color-stamp-chocolate)"
      >
        {t.rich("title", {
          accent: (chunks) => (
            <Span variant="serif" className="text-(--color-stamp-gold-text)">
              {chunks}
            </Span>
          ),
        })}
      </Heading>
      <Paragraph variant="xs" className="text-(--color-stamp-taupe) md:text-lg">
        {t("subtitle", { name: getDisplayName(user) })}
      </Paragraph>
    </header>
  );
}

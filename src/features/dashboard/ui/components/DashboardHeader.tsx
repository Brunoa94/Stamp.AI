/**
 * DashboardHeader
 *
 * Luxury page header: gold accent bar, Anton title with a serif-italic
 * accent word, and a personalized taupe subtitle.
 */

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import type { UserI } from "@/types/auth";
import { getDisplayName } from "../../lib/helpers/userPresentation";

interface DashboardHeaderPropsI {
  user?: UserI | null;
}

export function DashboardHeader({ user }: DashboardHeaderPropsI) {
  const t = useTranslations("dashboard.header");

  return (
    <header className="space-y-4">
      <div className="h-1.5 w-20 bg-(--color-stamp-gold)" />
      <Heading
        as="h1"
        variant="title"
        className="text-(--color-stamp-chocolate)"
      >
        {t.rich("title", {
          accent: (chunks) => (
            <Span variant="serif" className="text-(--color-stamp-taupe)">
              {chunks}
            </Span>
          ),
        })}
      </Heading>
      <Span variant="default" className="text-(--color-stamp-taupe)">
        {t("subtitle", { name: getDisplayName(user) })}
      </Span>
    </header>
  );
}

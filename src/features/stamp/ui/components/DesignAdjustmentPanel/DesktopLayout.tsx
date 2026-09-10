"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";

/**
 * DesktopLayout
 *
 * Desktop (lg+) layout for DesignAdjustmentPanel.
 * Shows position selector and preview in a grid, with adjuster controls below.
 */

interface PropsI {
  positionSelector: ReactNode;
  preview: ReactNode;
  adjuster: ReactNode;
  supportsAdjustment: boolean;
}

export function DesktopLayout({
  positionSelector,
  preview,
  adjuster,
  supportsAdjustment,
}: PropsI) {
  const t = useTranslations("stamp.adjust");

  return (
    <>
      <div className={supportsAdjustment ? "grid gap-6 lg:grid-cols-2 items-start" : undefined}>
        {positionSelector}
        {supportsAdjustment && preview}
      </div>
      {supportsAdjustment && (
        <>
          <Span
            variant="micro"
            className="block text-(--color-stamp-taupe) tracking-widest"
          >
            {t("adjustToggle")}
          </Span>
          {adjuster}
        </>
      )}
    </>
  );
}

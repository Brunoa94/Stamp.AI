"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Disclosure } from "../Disclosure/Disclosure";

/**
 * TabletLayout
 *
 * Tablet (md to lg) layout for DesignAdjustmentPanel.
 * Shows position selector and preview side by side, adjuster controls folded.
 */

interface PropsI {
  positionSelector: ReactNode;
  preview: ReactNode;
  adjuster: ReactNode;
  supportsAdjustment: boolean;
}

export function TabletLayout({
  positionSelector,
  preview,
  adjuster,
  supportsAdjustment,
}: PropsI) {
  const t = useTranslations("stamp.adjust");

  return (
    <>
      <div className={supportsAdjustment ? "grid gap-6 md:grid-cols-2 items-center" : undefined}>
        {positionSelector}
        {supportsAdjustment && preview}
      </div>
      {supportsAdjustment && (
        <Disclosure label={t("adjustToggle")}>
          {adjuster}
        </Disclosure>
      )}
    </>
  );
}

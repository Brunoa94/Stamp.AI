"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Disclosure } from "../Disclosure/Disclosure";

/**
 * MobileLayout
 *
 * Mobile (<md) layout for DesignAdjustmentPanel.
 * Everything folded in Disclosures so the step fits the screen.
 */

interface PropsI {
  positionSelector: ReactNode;
  preview: ReactNode;
  adjuster: ReactNode;
  supportsAdjustment: boolean;
}

export function MobileLayout({
  positionSelector,
  preview,
  adjuster,
  supportsAdjustment,
}: PropsI) {
  const t = useTranslations("stamp.adjust");

  return (
    <>
      <Disclosure label={t("positionsTitle")}>{positionSelector}</Disclosure>
      {supportsAdjustment && (
        <Disclosure label={t("previewToggle")}>
          {preview}
          <div className="mt-6">{adjuster}</div>
        </Disclosure>
      )}
    </>
  );
}

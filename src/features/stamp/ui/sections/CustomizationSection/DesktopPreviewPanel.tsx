"use client";

import {
  useStampFinalization,
  useStampSelectedImage,
} from "../../../lib/hooks/useStampSelectors";
import { DesignAdjustmentPanel } from "../../components/DesignAdjustmentPanel/DesignAdjustmentPanel";
import { EmptyDesignState } from "./EmptyDesignState";

/**
 * DesktopPreviewPanel
 *
 * Desktop layout for Step 6 left panel. Shows the design adjustment panel
 * or an empty state when no design is selected.
 */

export function DesktopPreviewPanel() {
  const { selectedImageUrl } = useStampSelectedImage();
  const { isFinalizing } = useStampFinalization();

  return (
    <div className="p-6 pt-16 md:p-10 md:pt-16 lg:p-16 lg:pt-16 xl:p-24 xl:px-16 flex flex-col items-center bg-white border-r border-(--color-stamp-divider)">
      {selectedImageUrl ? (
        <div className="my-auto w-full">
          <DesignAdjustmentPanel
            imageUrl={selectedImageUrl}
            disabled={isFinalizing}
          />
        </div>
      ) : (
        <EmptyDesignState className="my-auto w-full max-w-sm" />
      )}
    </div>
  );
}

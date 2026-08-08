"use client";

import { DesktopPreviewPanel } from "./DesktopPreviewPanel";
import { MobilePreviewPanel } from "./MobilePreviewPanel";

/**
 * CustomizationPreview
 *
 * Left panel of Step 6. Interactive design adjustment: print positions,
 * live placement preview, and move/size/rotation controls. Falls back to an
 * empty state when no design has been selected yet.
 *
 * On mobile flow: Shows as a separate step with title, preview/adjuster only,
 * and create button in sticky footer (no position selector - that's in CustomizationControls).
 */

interface PropsI {
  // Mobile flow props
  isMobileFlow?: boolean;
  canCreate?: boolean;
  isFinalizing?: boolean;
  onCreateProduct?: () => void;
}

export function CustomizationPreview({
  isMobileFlow = false,
  canCreate = false,
  isFinalizing = false,
  onCreateProduct,
}: PropsI) {
  if (!isMobileFlow) {
    return <DesktopPreviewPanel />;
  }

  return (
    <MobilePreviewPanel
      canCreate={canCreate}
      isFinalizing={isFinalizing}
      onCreateProduct={onCreateProduct ?? (() => {})}
    />
  );
}

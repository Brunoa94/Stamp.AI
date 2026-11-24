/**
 * CartLayout
 *
 * Cart page shell:
 * - Header band: the shared diagonal photo backdrop, mirrored (photo on the
 *   right) compared with the Orders and Profile pages; the checkout reuses it
 * - Off-white page with chocolate text, below the fixed h-24 header
 * - Content in the page gutter (px-4 sm:px-6 lg:px-12, max-w-screen-2xl)
 * - 12-column responsive grid (8-col items / 4-col summary)
 */

import { ReactNode } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeaderBand } from "@/shared/ui/PageHeaderBand";
import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";

interface CartLayoutPropsI {
  header: ReactNode;
  children: ReactNode;
}

export function CartLayout({ header, children }: CartLayoutPropsI) {
  return (
    <div className="min-h-screen bg-(--color-stamp-off-white) text-(--color-stamp-chocolate) pt-24">
      <PageHeaderBand
        src={staticAssetUrl("/backdrops/mug-kitchen.jpg")}
        imageClassName="object-[center_40%]"
        mirrored
      >
        {header}
      </PageHeaderBand>
      <div className="px-4 py-16 sm:px-6 lg:px-12">
        <PageContainer className="mx-auto max-w-screen-2xl">
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12 xl:gap-12">
            {children}
          </div>
        </PageContainer>
      </div>
    </div>
  );
}

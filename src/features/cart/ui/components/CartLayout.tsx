/**
 * CartLayout
 *
 * Page shell for the luxury brutalist cart:
 * - Header band: the shared diagonal photo backdrop, mirrored (photo on the
 *   right) compared with the Orders and Profile pages
 * - Off-white surface with heading font family and chocolate text
 * - 12-column responsive grid (8-col items / 4-col summary)
 * - Consistent page padding matching the orders/stamp pages
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
      <div className="px-6 pb-24 pt-12 lg:px-12 xl:px-24">
        <PageContainer className="mx-auto max-w-screen-2xl">
          <div className="grid grid-cols-1 gap-12 xl:grid-cols-12">
            {children}
          </div>
        </PageContainer>
      </div>
    </div>
  );
}

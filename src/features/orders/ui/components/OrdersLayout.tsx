/**
 * OrdersLayout
 *
 * Page shell for the orders page:
 * - Header band: the shared diagonal photo backdrop behind the title
 * - Off-white surface with chocolate text for the filters and orders below
 */

import { PropsWithChildren, ReactNode } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeaderBand } from "@/shared/ui/PageHeaderBand";
import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";

interface OrdersLayoutPropsI extends PropsWithChildren {
  header: ReactNode;
}

export function OrdersLayout({ header, children }: OrdersLayoutPropsI) {
  return (
    <div className="min-h-screen bg-(--color-stamp-off-white) text-(--color-stamp-chocolate) pt-24">
      <PageHeaderBand src={staticAssetUrl("/backdrops/orders-unboxing.jpg")} imageClassName="object-[center_60%]">
        {header}
      </PageHeaderBand>
      <div className="px-4 py-16 sm:px-6 lg:px-12">
        <PageContainer className="mx-auto max-w-screen-2xl">
          {children}
        </PageContainer>
      </div>
    </div>
  );
}

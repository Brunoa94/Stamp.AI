/**
 * CheckoutLayout
 *
 * Checkout page shell, the same as the cart's so the two read as one flow:
 * - Header band: the shared diagonal photo backdrop, mirrored, with the
 *   cart's photo
 * - Off-white page with chocolate text, below the fixed h-24 header
 * - Content in the page gutter (px-4 sm:px-6 lg:px-12, max-w-screen-2xl)
 * - Two columns: forms (left) and the sticky order summary (right)
 */

import { ReactNode } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeaderBand } from "@/shared/ui/PageHeaderBand";
import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";

interface CheckoutLayoutPropsI {
  header: ReactNode;
  forms: ReactNode;
  summary: ReactNode;
}

export function CheckoutLayout({
  header,
  forms,
  summary,
}: CheckoutLayoutPropsI) {
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="space-y-6 lg:col-span-7">{forms}</div>
            <aside className="lg:col-span-5">{summary}</aside>
          </div>
        </PageContainer>
      </div>
    </div>
  );
}

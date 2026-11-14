/**
 * ProfileLayout
 *
 * Page shell for the profile page, matching the orders layout:
 * - Header band: the shared diagonal photo backdrop behind the title
 * - Off-white surface with chocolate text for the sections below
 * - Uses PageContainer for consistent width with other pages
 */

import { PropsWithChildren, ReactNode } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeaderBand } from "@/shared/ui/PageHeaderBand";

interface ProfileLayoutProps extends PropsWithChildren {
  header: ReactNode;
}

export function ProfileLayout({ header, children }: ProfileLayoutProps) {
  return (
    <div className="min-h-screen bg-(--color-stamp-off-white) text-(--color-stamp-chocolate) pt-24">
      <PageHeaderBand src="/backdrops/coat-cathedral.jpg" imageClassName="object-[center_15%]">
        {header}
      </PageHeaderBand>
      <div className="px-6 pb-24 pt-12 lg:px-12 xl:px-24">
        <PageContainer className="mx-auto max-w-screen-2xl">
          <div className="space-y-6">{children}</div>
        </PageContainer>
      </div>
    </div>
  );
}

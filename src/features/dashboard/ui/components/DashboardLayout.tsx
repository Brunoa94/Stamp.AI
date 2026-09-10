/**
 * DashboardLayout
 *
 * Page shell for the luxury dashboard:
 * - Off-white surface, heading font family, chocolate text
 * - Header on top, dashboard grid below
 */

import { PropsWithChildren, ReactNode } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";

interface DashboardLayoutPropsI extends PropsWithChildren {
  header: ReactNode;
}

export function DashboardLayout({ header, children }: DashboardLayoutPropsI) {
  return (
    <div className="min-h-screen bg-(--color-stamp-off-white) text-(--color-stamp-chocolate) pt-24">
      <div className="px-6 pb-24 pt-12 lg:px-12 xl:px-24">
        <PageContainer className="mx-auto max-w-screen-2xl">
          {header}
          <div className="mt-12">{children}</div>
        </PageContainer>
      </div>
    </div>
  );
}

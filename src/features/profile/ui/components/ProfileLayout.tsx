/**
 * ProfileLayout
 *
 * Page shell for the luxury profile page:
 * - Off-white surface, heading font family, chocolate text
 * - Header on top, profile sections below
 */

import { PropsWithChildren, ReactNode } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";

interface ProfileLayoutProps extends PropsWithChildren {
  header: ReactNode;
}

export function ProfileLayout({ header, children }: ProfileLayoutProps) {
  return (
    <div className="min-h-screen bg-(--color-stamp-off-white) font-heading text-(--color-stamp-chocolate) pt-24">
      <div className="px-6 pb-24 pt-12 lg:px-12 xl:px-24">
        <PageContainer>
          {header}
          <div className="mt-12 space-y-8">{children}</div>
        </PageContainer>
      </div>
    </div>
  );
}

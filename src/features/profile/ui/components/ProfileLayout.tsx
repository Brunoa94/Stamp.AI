/**
 * ProfileLayout
 *
 * Page shell for the luxury profile page matching orders layout:
 * - Off-white surface, heading font family, chocolate text
 * - Uses PageContainer for consistent width with other pages
 */

import { PropsWithChildren, ReactNode } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";

interface ProfileLayoutProps extends PropsWithChildren {
  header: ReactNode;
}

export function ProfileLayout({ header, children }: ProfileLayoutProps) {
  return (
    <div className="min-h-screen bg-(--color-stamp-off-white) text-(--color-stamp-chocolate) pt-24">
      <div className="px-6 pb-24 pt-12 lg:px-12 xl:px-24">
        <PageContainer>
          {header}
          <div className="mt-8 space-y-6">
            {children}
          </div>
        </PageContainer>
      </div>
    </div>
  );
}

/**
 * CartV2Layout
 *
 * Page shell for the luxury brutalist cart:
 * - Off-white surface with Outfit body font and chocolate text
 * - 12-column responsive grid (8-col items / 4-col summary)
 * - Consistent page padding matching the orders/stamp pages
 */

import { ReactNode } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";

interface CartV2LayoutPropsI {
  children: ReactNode;
}

export function CartV2Layout({ children }: CartV2LayoutPropsI) {
  return (
    <div className="min-h-screen bg-(--color-stamp-off-white) font-(--font-outfit) text-(--color-stamp-chocolate)">
      <div className="px-6 pb-24 pt-12 lg:px-12 xl:px-24">
        <PageContainer>
          <div className="grid grid-cols-1 gap-12 xl:grid-cols-12 xl:gap-20">
            {children}
          </div>
        </PageContainer>
      </div>
    </div>
  );
}

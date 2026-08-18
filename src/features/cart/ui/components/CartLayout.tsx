/**
 * CartLayout
 *
 * Page shell for the luxury brutalist cart:
 * - Off-white surface with heading font family and chocolate text
 * - 12-column responsive grid (8-col items / 4-col summary)
 * - Consistent page padding matching the orders/stamp pages
 */

import { ReactNode } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";

interface CartLayoutPropsI {
  children: ReactNode;
}

export function CartLayout({ children }: CartLayoutPropsI) {
  return (
    <div className="min-h-screen bg-(--color-stamp-off-white) text-(--color-stamp-chocolate) pt-24">
      <div className="px-6 pb-24 pt-12 lg:px-12 xl:px-24">
        <PageContainer>
          <div className="grid grid-cols-1 gap-12 xl:grid-cols-12">
            {children}
          </div>
        </PageContainer>
      </div>
    </div>
  );
}

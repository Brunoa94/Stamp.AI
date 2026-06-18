/**
 * Cart Layout Component
 *
 * Provides the main layout structure for the cart page:
 * - Min-height screen with flex column
 * - Concrete background
 * - 12-column responsive grid (8-col items, 4-col summary)
 * - Proper spacing and max-width container
 * - Uses PageContainer for consistent width across all pages
 */

import { ReactNode } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";

interface CartLayoutPropsI {
  children: ReactNode;
}

export function CartLayout({ children }: CartLayoutPropsI) {
  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <div className="flex-1 px-6 lg:px-12 xl:px-24">
        <PageContainer>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-20">
            {children}
          </div>
        </PageContainer>
      </div>
    </div>
  );
}

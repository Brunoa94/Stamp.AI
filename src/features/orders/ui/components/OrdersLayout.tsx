/**
 * OrdersLayout
 *
 * Page shell for the luxury brutalist checkout:
 * - Off-white surface, heading font family, chocolate text
 * - Two-column layout: forms (left) and sticky order summary (right)
 */

import { PropsWithChildren, ReactNode } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";

interface OrdersLayoutPropsI extends PropsWithChildren {
  header: ReactNode;
}

export function OrdersLayout({ header, children }: OrdersLayoutPropsI) {
  return (
    <div className="min-h-screen bg-(--color-stamp-off-white) font-heading text-(--color-stamp-chocolate)">
      <div className="px-6 pb-24 pt-12 lg:px-12 xl:px-24">
        <PageContainer>
          {header}
          <div className="mt-4 gap-12 lg:gap-16">{children}</div>
        </PageContainer>
      </div>
    </div>
  );
}

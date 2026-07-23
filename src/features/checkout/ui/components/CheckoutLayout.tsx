/**
 * CheckoutLayout
 *
 * Page shell for the luxury brutalist checkout:
 * - Off-white surface, heading font family, chocolate text
 * - Two-column layout: forms (left) and sticky order summary (right)
 */

import { ReactNode } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";

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
    <div className="min-h-screen bg-(--color-stamp-off-white) font-heading text-(--color-stamp-chocolate) pt-24">
      <div className="px-6 pb-24 pt-12 lg:px-12 xl:px-24">
        <PageContainer>
          {header}
          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-8 lg:col-span-7">{forms}</div>
            <aside className="lg:col-span-5">{summary}</aside>
          </div>
        </PageContainer>
      </div>
    </div>
  );
}

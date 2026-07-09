/**
 * CheckoutV2Layout
 *
 * Page shell for the luxury brutalist checkout:
 * - Off-white surface, Outfit body font, chocolate text
 * - Two-column layout: forms (left) and sticky order summary (right)
 */

import { ReactNode } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";

interface CheckoutV2LayoutPropsI {
  header: ReactNode;
  forms: ReactNode;
  summary: ReactNode;
}

export function CheckoutV2Layout({
  header,
  forms,
  summary,
}: CheckoutV2LayoutPropsI) {
  return (
    <div className="min-h-screen bg-(--color-stamp-off-white) font-(--font-outfit) text-(--color-stamp-chocolate)">
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

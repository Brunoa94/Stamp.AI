/**
 * DashboardRecentOrdersSection
 *
 * Recent orders card: header with record count and archive link, then a
 * divided list of order rows or the empty state.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import type { OrderWithItemsT } from "@/types/order";
import { DashboardRecentOrderItem } from "./DashboardRecentOrderItem";
import { DashboardRecentOrdersEmpty } from "./DashboardRecentOrdersEmpty";

interface DashboardRecentOrdersSectionPropsI {
  orders: OrderWithItemsT[];
  totalOrders: number;
  onOpenDetails: (order: OrderWithItemsT) => void;
}

export function DashboardRecentOrdersSection({
  orders,
  totalOrders,
  onOpenDetails,
}: DashboardRecentOrdersSectionPropsI) {
  const t = useTranslations("dashboard.recentOrders");

  return (
    <section className="border border-(--color-stamp-divider) bg-(--color-stamp-white) p-8 transition-all duration-500 hover:border-(--color-stamp-gold) hover:shadow-(--shadow-stamp-card-hover) lg:p-10">
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-(--color-stamp-divider) pb-6">
        <div className="space-y-2">
          <Heading as="h2" variant="card">
            {t("title")}
          </Heading>
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            {t("recordsOnFile", { count: totalOrders })}
          </Span>
        </div>
        <Link
          href="/orders"
          className="group inline-flex items-center gap-2 text-(--color-stamp-taupe) transition-colors duration-300 hover:text-(--color-stamp-gold)"
        >
          <Span variant="default">{t("viewArchive")}</Span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <DashboardRecentOrdersEmpty />
      ) : (
        <ul className="divide-y divide-(--color-stamp-divider)">
          {orders.map((order) => (
            <DashboardRecentOrderItem
              key={order.id}
              order={order}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * DashboardRecentOrdersSection
 *
 * Recent orders card: header with record count and archive link, then a
 * divided list of order rows or the empty state.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { List } from "@/features/ui/list";
import { Span } from "@/features/ui/span";
import type { OrderWithItemsT } from "@/shared/types/order";
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
    <section className="rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-6 shadow-(--shadow-stamp-card) lg:p-8">
      <div className="mb-4 flex flex-col gap-4 border-b border-(--color-stamp-divider) pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Heading as="h2" variant="card" className="text-(--color-stamp-chocolate)">
            {t("title")}
          </Heading>
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            {t("recordsOnFile", { count: totalOrders })}
          </Span>
        </div>
        <Button asChild variant="ghost-stamp" className="group self-start px-3 md:px-3 sm:self-auto">
          <Link href="/orders">
            {t("viewArchive")}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <DashboardRecentOrdersEmpty />
      ) : (
        <List className="divide-y divide-(--color-stamp-divider)">
          {orders.map((order) => (
            <DashboardRecentOrderItem
              key={order.id}
              order={order}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </List>
      )}
    </section>
  );
}

/**
 * DashboardRecentOrdersEmpty
 *
 * Empty state for the recent orders list: cream icon tile and a
 * link into the stamp flow.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

export function DashboardRecentOrdersEmpty() {
  const t = useTranslations("dashboard.recentOrders");

  return (
    <div role="status" className="flex flex-col items-center py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-xl bg-(--color-stamp-cream)">
        <ShoppingBag aria-hidden className="h-8 w-8 text-(--color-stamp-gold-text)" />
      </div>
      <Heading as="h3" variant="cardCompact" className="text-(--color-stamp-chocolate)">
        {t("emptyTitle")}
      </Heading>
      <Span
        as="p"
        variant="micro"
        className="mb-8 mt-3 text-(--color-stamp-taupe)"
      >
        {t("emptyDescription")}
      </Span>
      <Button asChild variant="primary">
        <Link href="/stamp">{t("emptyCta")}</Link>
      </Button>
    </div>
  );
}

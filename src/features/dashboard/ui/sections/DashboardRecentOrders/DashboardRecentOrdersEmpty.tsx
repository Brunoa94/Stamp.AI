/**
 * DashboardRecentOrdersEmpty
 *
 * Empty state for the recent orders list: tilted cream icon plate and a
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
      <div className="mb-8 flex h-24 w-24 rotate-3 items-center justify-center border border-(--color-stamp-divider) bg-(--color-stamp-cream)">
        <ShoppingBag className="h-8 w-8 text-(--color-stamp-taupe)/30" />
      </div>
      <Heading as="h3" variant="question">
        {t("emptyTitle")}
      </Heading>
      <Span
        as="p"
        variant="micro"
        className="mb-8 mt-3 text-(--color-stamp-taupe)"
      >
        {t("emptyDescription")}
      </Span>
      <Button asChild variant="secondary-brown">
        <Link href="/stamp">{t("emptyCta")}</Link>
      </Button>
    </div>
  );
}

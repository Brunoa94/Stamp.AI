"use client";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Box, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/shared/queries/authQueries";
import { Span } from "@/features/ui/span";
import { DashboardCard } from "../components/DashboardCard";

export function DashboardMetricsSection({ ordersPlaced }: { ordersPlaced: number }) {
  const t = useTranslations("dashboard.metrics");
  const { data: user } = useUser();
  const { data: designs, isError, isLoading } = useQuery({
    queryKey: ["dashboard-products", user?.id], enabled: Boolean(user?.id),
    queryFn: async () => {
      const { count, error } = await createClient().from("products").select("id", { count: "exact", head: true }).eq("user_id", user!.id);
      if (error) throw error;
      return count ?? 0;
    },
  });
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <DashboardCard label={t("ordersLabel")} icon={<TrendingUp className="h-4 w-4 text-(--color-stamp-taupe)" />}>
        <Span as="p" variant="metric">{ordersPlaced.toLocaleString()}</Span>
        <Span as="p" variant="micro" className="mt-2 text-(--color-stamp-taupe)">{t("ordersCaption")}</Span>
      </DashboardCard>
      <DashboardCard label={t("designsLabel")} icon={<Box className="h-4 w-4 text-(--color-stamp-taupe)" />}>
        <Span as="p" variant="metric">{isError || isLoading ? "—" : designs?.toLocaleString() ?? "—"}</Span>
        <Span as="p" variant="micro" className="mt-2 text-(--color-stamp-taupe)">{t("designsCaption")}</Span>
      </DashboardCard>
    </div>
  );
}

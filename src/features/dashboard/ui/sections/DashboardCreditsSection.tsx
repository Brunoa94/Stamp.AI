"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Coins } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { Paragraph } from "@/features/ui/paragraph";
import { useUserCoins, coinsKeys } from "@/shared/queries/coinsQueries";
import { DashboardCard } from "../components/DashboardCard";

const BuyCreditsDialog = dynamic(() => import("@/features/buy-credits/ui/BuyCreditsDialog").then(mod => mod.BuyCreditsDialog), { ssr: false });

export function DashboardCreditsSection() {
  const t = useTranslations("dashboard.credits");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useUserCoins();
  const queryClient = useQueryClient();
  return (
    <DashboardCard label={t("label")} icon={<Coins className="h-4 w-4 text-(--color-stamp-gold-text)" />}>
      <Span as="p" variant="metric" className="text-(--color-stamp-chocolate)" aria-live="polite">
        {isLoading || isError ? "—" : data?.coins.toLocaleString() ?? "—"}
      </Span>
      <Paragraph variant="sm" className="mt-4 text-(--color-stamp-taupe)">{t("allowance")}</Paragraph>
      {isError && <Button variant="secondary-compact" onClick={() => refetch()}>{t("retry")}</Button>}
      <Button type="button" variant="primary" className="mt-8 w-full" onClick={() => setIsDialogOpen(true)}>{t("buyMore")}</Button>
      {isDialogOpen && <BuyCreditsDialog isOpen onClose={() => setIsDialogOpen(false)} onSuccess={() => { void queryClient.invalidateQueries({ queryKey: coinsKeys.all }); }} />}
    </DashboardCard>
  );
}

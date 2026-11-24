/**
 * DashboardQuickAccessSection
 *
 * Two shortcut tiles: account settings and the order archive.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Compass, Package, Settings } from "lucide-react";
import { Span } from "@/features/ui/span";
import { DashboardCard } from "../components/DashboardCard";

const QUICK_LINKS = [
  { id: "account", href: "/profile", Icon: Settings },
  { id: "archive", href: "/orders", Icon: Package },
] as const;

export function DashboardQuickAccessSection() {
  const t = useTranslations("dashboard.quickAccess");

  return (
    <DashboardCard
      label={t("label")}
      icon={<Compass className="h-4 w-4 text-(--color-stamp-taupe)" />}
    >
      <nav aria-label={t("label")} className="grid grid-cols-2 gap-4">
        {QUICK_LINKS.map(({ id, href, Icon }) => (
          <Link
            key={id}
            href={href}
            className="group flex flex-col items-center gap-3 rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-cream) p-5 transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-(--color-stamp-chocolate)/30 hover:bg-(--color-stamp-white) hover:shadow-(--shadow-stamp-card-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)"
          >
            <Icon className="h-5 w-5 text-(--color-stamp-taupe) transition-colors duration-200 group-hover:text-(--color-stamp-gold-text)" />
            <Span variant="default" className="text-(--color-stamp-chocolate)">
              {t(`links.${id}`)}
            </Span>
          </Link>
        ))}
      </nav>
    </DashboardCard>
  );
}

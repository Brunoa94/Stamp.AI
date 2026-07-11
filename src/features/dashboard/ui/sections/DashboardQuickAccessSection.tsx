/**
 * DashboardQuickAccessSection
 *
 * Two shortcut tiles: account settings and the order archive.
 */

import Link from "next/link";
import { Compass, Package, Settings } from "lucide-react";
import { Span } from "@/features/ui/span";
import { DashboardCard } from "../components/DashboardCard";

const QUICK_LINKS = [
  { href: "/profile", label: "Account", Icon: Settings },
  { href: "/orders", label: "Archive", Icon: Package },
] as const;

export function DashboardQuickAccessSection() {
  return (
    <DashboardCard
      label="Quick access"
      icon={<Compass className="h-4 w-4 text-(--color-stamp-taupe)" />}
    >
      <nav aria-label="Quick access" className="grid grid-cols-2 gap-4">
        {QUICK_LINKS.map(({ href, label, Icon }) => (
          <Link
            key={label}
            href={href}
            className="group flex flex-col items-center gap-3 border border-(--color-stamp-divider) bg-(--color-stamp-cream) p-6 transition-all duration-300 hover:border-(--color-stamp-gold) hover:bg-(--color-stamp-white)"
          >
            <Icon className="h-5 w-5 text-(--color-stamp-taupe) transition-colors duration-300 group-hover:text-(--color-stamp-gold)" />
            <Span variant="micro" className="text-(--color-stamp-chocolate)">
              {label}
            </Span>
          </Link>
        ))}
      </nav>
    </DashboardCard>
  );
}

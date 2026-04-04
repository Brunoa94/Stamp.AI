import Link from "next/link";
import { CreditCard, User } from "lucide-react";
import { dashboardTheme } from "@/theme/components";

export function QuickAccessCard() {
  return (
    <section className={dashboardTheme.card.base}>
      <h4 className={`${dashboardTheme.card.title} mb-4`}>Quick Access</h4>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/profile" className={dashboardTheme.quickAccess.item}>
          <User className={dashboardTheme.quickAccess.itemIcon} />
          <span className={dashboardTheme.quickAccess.itemLabel}>Account</span>
        </Link>
        <Link href="/profile" className={dashboardTheme.quickAccess.item}>
          <CreditCard className={dashboardTheme.quickAccess.itemIcon} />
          <span className={dashboardTheme.quickAccess.itemLabel}>Billing</span>
        </Link>
      </div>
    </section>
  );
}

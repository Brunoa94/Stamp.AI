import Link from "next/link";
import { CreditCard, Settings } from "lucide-react";
import { dashboardTheme } from "@/theme/components";
import { Span } from "@/features/ui/span";
import { BrutalistCard } from "./BrutalistCard";

export function QuickAccessCard() {
  return (
    <BrutalistCard accentColor="orange">
      <Span variant="micro" className={dashboardTheme.card.subtitle}>
        QUICK ACCESS LINKS
      </Span>

      <div className={dashboardTheme.quickAccess.grid}>
        <Link href="/profile" className={dashboardTheme.quickAccess.item}>
          <Settings className={dashboardTheme.quickAccess.itemIcon} />
          <Span variant="micro" className={dashboardTheme.quickAccess.itemLabel}>
            ACCOUNT
          </Span>
        </Link>

        <Link href="/profile" className={dashboardTheme.quickAccess.item}>
          <CreditCard className={dashboardTheme.quickAccess.itemIcon} />
          <Span variant="micro" className={dashboardTheme.quickAccess.itemLabel}>
            BILLING
          </Span>
        </Link>
      </div>
    </BrutalistCard>
  );
}

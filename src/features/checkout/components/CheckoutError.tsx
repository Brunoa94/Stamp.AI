import { componentThemes } from "@/theme/components";
import { Button } from "@/features/ui/button";
import Link from "next/link";

interface Props {
  error: Error;
}

/**
 * Error display component for checkout page
 * Shows user-friendly error message with action to return to dashboard
 */
export const CheckoutError = ({ error }: Props) => {
  return (
    <div className={`${componentThemes.container.page} py-8`}>
      <div className="max-w-2xl mx-auto px-4">
        <div className="glass-card border border-red-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-heading font-bold uppercase tracking-tight text-red-800 mb-2">
            Failed to Load Order
          </h2>
          <p className="text-slate-600 mb-6">{error.message}</p>
          <Button variant="destructive" asChild>
            <Link href="/stamp">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

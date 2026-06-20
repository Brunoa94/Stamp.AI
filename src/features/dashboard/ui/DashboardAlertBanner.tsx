"use client";

import { AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import Link from "next/link";

interface PropsI {
  message?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function DashboardAlertBanner({
  message = "PENDING PAYMENT DETECTED: ORDER #9901-NYC REQUIRES RECONCILIATION",
  actionLabel = "RESOLVE NOW",
  actionHref = "/orders/9901-nyc",
}: PropsI) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bg-orange border-b border-orange/20 z-40 px-6 md:px-12 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-ink shrink-0" />
        <Span variant="sm" className="text-ink">
          {message}
        </Span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href={actionHref}
          className="px-4 py-1.5 bg-ink text-white font-anton text-[10px] uppercase tracking-widest hover:bg-ink/90 transition-colors shrink-0"
        >
          {actionLabel}
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsVisible(false)}
          className="text-ink hover:text-ink/70 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

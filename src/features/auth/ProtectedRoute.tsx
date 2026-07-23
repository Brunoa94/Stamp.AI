"use client";

import { useIsAuthenticated } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { animations } from "@/theme/animations";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  redirectTo = "/",
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const router = useRouter();
  const t = useTranslations("auth.protectedRoute");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div
            className={`w-full max-w-md rounded-2xl border border-white/40 bg-white/70 p-10 text-center shadow-[0_12px_32px_rgba(26,35,64,0.12)] backdrop-blur-xl transform-gpu ${animations.fadeIn}`}
            role="status"
            aria-live="polite"
            aria-label={t("authenticating")}
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#7B5CF5]/10 text-[#7B5CF5]">
              <Loader2 className="h-8 w-8 animate-[spin_1.35s_linear_infinite]" />
            </div>

            <div>
              <p className="text-base font-semibold font-heading uppercase tracking-wide text-[#1A2340]">
                {t("authenticating")}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {t("checkingSession")}
              </p>
            </div>
          </div>
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">{t("redirecting")}</div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

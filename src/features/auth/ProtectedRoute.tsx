"use client";

import { useIsAuthenticated } from "@/shared/queries/authQueries";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Paragraph } from "@/features/ui/paragraph";

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
        <div className="flex min-h-screen items-center justify-center px-4 pt-24 sm:px-6 lg:px-12">
          <div
            className="w-full max-w-md rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-10 text-center shadow-(--shadow-stamp-card) animate-in fade-in duration-500"
            role="status"
            aria-live="polite"
            aria-label={t("authenticating")}
          >
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-(--color-stamp-cream) text-(--color-stamp-gold-text)">
              <Loader2 aria-hidden className="size-8 animate-spin" />
            </div>

            <div>
              <Paragraph variant="xs" className="font-heading text-xl text-(--color-stamp-chocolate)">
                {t("authenticating")}
              </Paragraph>
              <Paragraph variant="xs" className="mt-1 text-(--color-stamp-taupe)">
                {t("checkingSession")}
              </Paragraph>
            </div>
          </div>
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center px-4 pt-24">
          <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
            {t("redirecting")}
          </Paragraph>
        </div>
      )
    );
  }

  return <>{children}</>;
}

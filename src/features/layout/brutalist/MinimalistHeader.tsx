"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useUser } from "@/hooks/useAuth";
import { Span } from "@/features/ui/span";

export function MinimalistHeader() {
  const t = useTranslations("layout.minimalistHeader");
  const { data: user } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-concrete border-b border-ink/5 z-50 px-8 flex items-center justify-between">
      {/* Logo */}
      <div className="flex-1">
        <Link href="/" className="flex items-center gap-1 group">
          <Span
            variant="sm"
            className="font-heading text-4xl leading-none tracking-tighter"
          >
            {t.rich("brand", {
              accent: (chunks) => (
                <Span unstyled className="text-brandCyan">
                  {chunks}
                </Span>
              ),
            })}
          </Span>
        </Link>
      </div>

      {/* Account Link */}
      <div className="flex-1 flex justify-end">
        <Link
          href={user ? "/dashboard" : "/auth"}
          className="text-ink/40 hover:text-ink transition-opacity"
        >
          <Span variant="label">{user ? t("accountTerminal") : t("login")}</Span>
        </Link>
      </div>
    </header>
  );
}

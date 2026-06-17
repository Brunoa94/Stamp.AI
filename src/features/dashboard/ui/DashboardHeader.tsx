import { Zap } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import type { UserI } from "@/types/auth";
import { formatLastLogin } from "../lib/helpers/formatLastLogin";

interface PropsI {
  user?: UserI | null;
}

export function DashboardHeader({ user }: PropsI) {
  const firstName = user?.user_metadata?.first_name;
  const fallbackName = user?.email?.split("@")[0];
  const displayName = firstName || fallbackName || "ALEX";
  const lastLogin = formatLastLogin(user?.last_sign_in_at);

  return (
    <header className="mb-10 md:mb-12">
      {/* Purple Accent Bar */}
      <div className="h-1 w-20 md:w-24 bg-purple mb-6" />

      {/* Hero Row */}
      <div className="flex items-start justify-between gap-8 mb-4">
        {/* Welcome Title */}
        <Heading as="h1" variant="title" className="text-ink">
          WELCOME, <span className="text-purple">{displayName.toUpperCase()}</span>
        </Heading>

        {/* Pro Artist Badge (Desktop Only) */}
        <div className="hidden lg:flex flex-col items-end gap-2">
          <Span variant="micro" className="text-ink/30">
            USER PRIVILEGE TIER
          </Span>
          <div className="flex items-center gap-2 px-4 py-2 border-2 border-ink/10 bg-white">
            <Zap className="w-4 h-4 text-purple fill-purple" />
            <Span variant="default" className="font-anton text-sm tracking-tight text-ink">
              PRO ARTIST
            </Span>
          </div>
        </div>
      </div>

      {/* Metadata Row */}
      <div className="flex flex-wrap items-center gap-3">
        <Span variant="default" className="flex items-center gap-1 text-ink/30">
          <span className="w-1.5 h-1.5 rounded-full bg-ink/30" />
          LAST SYNC: {lastLogin}
        </Span>
        <Span variant="default" className="flex items-center gap-1 text-ink/30">
          <span className="w-1.5 h-1.5 rounded-full bg-ink/30" />
          PROTOCOL V2.4 ACTIVE
        </Span>
      </div>
    </header>
  );
}

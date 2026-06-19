import { Zap, Clock, ShieldCheck } from "lucide-react";
import type { UserI } from "@/types/auth";
import { formatLastLogin } from "../lib/helpers/formatLastLogin";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Span } from "@/features/ui/span";

interface PropsI {
  user?: UserI | null;
}

export function DashboardHeader({ user }: PropsI) {
  const firstName = user?.user_metadata?.first_name;
  const fallbackName = user?.email?.split("@")[0];
  const displayName = firstName || fallbackName || "ALEX";
  const lastLogin = formatLastLogin(user?.last_sign_in_at);

  return (
    <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
      <PageHeader
        title="Dash"
        highlightedWord="board"
        subtitle={
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Span variant="default" className="opacity-40 tracking-[0.5em] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-brandPurple" />
              Last sync: {lastLogin}
            </Span>
            <Span variant="default" className="hidden sm:flex opacity-40 tracking-[0.5em] items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brandCyan" />
              Protocol v2.4 active
            </Span>
          </div>
        }
      />

      {/* Pro Artist Badge (Desktop Only) */}
      <div className="hidden lg:block bg-white border border-purple/20 border-l-4 border-l-purple px-6 py-4 shadow-sm hover:shadow-purple/5 transition-all">
        <span className="block text-[9px] font-bold opacity-30 uppercase tracking-[0.4em] mb-1 text-ink">
          USER PRIVILEGE TIER
        </span>
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-purple" />
          <span className="font-anton text-2xl tracking-widest uppercase text-ink">
            PRO ARTIST
          </span>
        </div>
      </div>
    </header>
  );
}

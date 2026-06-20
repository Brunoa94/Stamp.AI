import Link from "next/link";
import { User } from "lucide-react";
import { Span } from "@/features/ui/span";
import type { UserI } from "@/types/auth";

interface PropsI {
  user?: UserI | null;
}

export function DashboardTopNav({ user }: PropsI) {
  const displayName =
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "ALEX RIVET";

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#1e3a8a] border-b border-white/10 z-50 px-6 md:px-12 flex items-center justify-between">
      {/* Logo */}
      <Link
        href="/"
        className="text-white font-anton text-2xl uppercase tracking-tighter hover:opacity-80 transition-opacity"
      >
        STAMP · AI
      </Link>

      {/* Center CTA Button */}
      <Link
        href="/stamp"
        className="px-8 py-2 border-2 border-white bg-transparent text-white font-anton text-sm uppercase tracking-widest hover:bg-white hover:text-[#1e3a8a] transition-colors"
      >
        STAMP IT
      </Link>

      {/* User Terminal */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden md:block">
          <Span variant="micro" className="text-white/50">
            USER TERMINAL
          </Span>
          <Span variant="sm" className="text-white">
            {displayName.toUpperCase()}
          </Span>
        </div>
        <Link
          href="/profile"
          className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <User className="w-5 h-5 text-white" />
        </Link>
      </div>
    </nav>
  );
}

"use client";

import { createContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AnalyticsService } from "@/shared/services/analyticsService";
import type { User, Session } from "@supabase/supabase-js";

/**
 * /auth/callback flags a completed OAuth login with `auth_event=login` and
 * `auth_method=<provider>`. Report it once and remove the flag from the URL.
 */
function reportFlaggedOAuthLogin(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (url.searchParams.get("auth_event") !== "login") return;
  const method = url.searchParams.get("auth_method") ?? "oauth";
  url.searchParams.delete("auth_event");
  url.searchParams.delete("auth_method");
  window.history.replaceState(window.history.state, "", url.toString());
  AnalyticsService.track("login", { method });
}

interface SupabaseAuthContextI {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextI>({
  user: null,
  session: null,
  loading: true,
});

export function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    reportFlaggedOAuthLogin();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <SupabaseAuthContext.Provider value={{ user, session, loading }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}


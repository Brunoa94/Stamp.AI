"use client";

import { createContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { syncPrivateBrowserStateOwner } from "@/shared/services/privateBrowserState";
import { GuestClaimStorageService } from "@/shared/services/guestClaimStorageService";
import type { User, Session } from "@supabase/supabase-js";

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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      syncPrivateBrowserStateOwner(event, session?.user ?? null);
      // A guest who registered keeps their anonymous session until the
      // confirmation link is opened; the saved claim follows its refreshes.
      if (event === "TOKEN_REFRESHED" && session?.user.is_anonymous) {
        GuestClaimStorageService.updateTokens({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          userId: session.user.id,
          expiresAt: (session.expires_at ?? 0) * 1000,
        });
      }
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


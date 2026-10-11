"use client";

import { createContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { clearPrivateBrowserState } from "@/shared/services/privateBrowserState";
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      try {
        const previousOwner = window.localStorage.getItem("stamp:storage-owner");
        const nextOwner = session?.user.id ?? null;
        if (_event === "SIGNED_OUT" || (nextOwner && !previousOwner) || (previousOwner && previousOwner !== nextOwner)) {
          clearPrivateBrowserState();
        }
        if (nextOwner) window.localStorage.setItem("stamp:storage-owner", nextOwner);
        else window.localStorage.removeItem("stamp:storage-owner");
      } catch { /* Storage may be unavailable. */ }
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


"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/supabaseClient";
import { ProfileRow } from "@/types/supabase";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;
  status: AuthStatus;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string | null) {
  if (!userId) {
    return null;
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;

    async function loadSession() {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      setSession(currentSession);

      if (!currentSession?.user) {
        setProfile(null);
        setStatus("unauthenticated");
        return;
      }

      setStatus("loading");
      const nextProfile = await fetchProfile(currentSession.user.id);

      if (!active) {
        return;
      }

      setProfile(nextProfile);
      setStatus("authenticated");
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (!nextSession?.user) {
        setProfile(null);
        setStatus("unauthenticated");
        startTransition(() => {
          router.refresh();
        });
        return;
      }

      setStatus("loading");
      void fetchProfile(nextSession.user.id).then((nextProfile) => {
        if (!active) {
          return;
        }

        setProfile(nextProfile);
        setStatus("authenticated");
        startTransition(() => {
          router.refresh();
        });
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      status,
      refreshProfile: async () => {
        const nextProfile = await fetchProfile(session?.user.id ?? null);
        setProfile(nextProfile);
        setStatus(session?.user ? "authenticated" : "unauthenticated");
      },
    }),
    [profile, session, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
}

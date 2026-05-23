"use client";

import { useMemo } from "react";
import { useAuthContext } from "@/context/AuthContext";
import {
  signInWithGoogle,
  signInWithPassword,
  signOutUser,
  signUpWithPassword,
} from "@/lib/services/auth-service";

export function useAuth() {
  const auth = useAuthContext();

  return useMemo(
    () => ({
      ...auth,
      isLoading: auth.status === "loading",
      isAuthenticated: auth.status === "authenticated",
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      signOut: signOutUser,
    }),
    [auth],
  );
}

import {
  AuthResponse,
  AuthTokenResponsePassword,
  OAuthResponse,
} from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/supabaseClient";

export async function signInWithPassword(email: string, password: string) {
  const supabase = getSupabaseBrowserClient();
  const response = await supabase.auth.signInWithPassword({ email, password });

  if (response.error) {
    throw response.error;
  }

  return response as AuthTokenResponsePassword;
}

export async function signUpWithPassword(args: {
  email: string;
  password: string;
  username: string;
  displayName: string;
}) {
  const supabase = getSupabaseBrowserClient();
  const redirectTo =
    typeof window === "undefined"
      ? undefined
      : `${window.location.origin}/auth/callback`;

  const response = await supabase.auth.signUp({
    email: args.email,
    password: args.password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        username: args.username,
        display_name: args.displayName,
        full_name: args.displayName,
      },
    },
  });

  if (response.error) {
    throw response.error;
  }

  return response as AuthResponse;
}

export async function signInWithGoogle() {
  const supabase = getSupabaseBrowserClient();
  const redirectTo =
    typeof window === "undefined"
      ? undefined
      : `${window.location.origin}/auth/callback`;

  const response = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (response.error) {
    throw response.error;
  }

  return response as OAuthResponse;
}

export async function signOutUser() {
  const supabase = getSupabaseBrowserClient();
  const response = await supabase.auth.signOut();

  if (response.error) {
    throw response.error;
  }
}

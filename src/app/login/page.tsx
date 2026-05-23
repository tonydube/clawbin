"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithGoogle, signInWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = searchParams.get("next") ?? "/";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signInWithPassword(email, password);
      router.replace(next);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to sign in.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setSubmitting(true);

    try {
      await signInWithGoogle();
    } catch (oauthError) {
      setError(
        oauthError instanceof Error
          ? oauthError.message
          : "Unable to start Google sign-in.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-bg-elevated p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-light mb-2">
            Clawbin
          </p>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">
            Sign in
          </h1>
          <p className="text-sm text-text-secondary">
            Access your prompts, bookmarks, votes, and profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-11 w-full rounded-xl border border-border-subtle bg-bg-surface px-4 text-sm text-text-primary focus:border-accent/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="h-11 w-full rounded-xl border border-border-subtle bg-bg-surface px-4 text-sm text-text-primary focus:border-accent/50 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={clsx(
              "mt-2 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all",
              submitting
                ? "bg-accent/60 cursor-not-allowed"
                : "bg-accent hover:bg-accent-hover active:scale-[0.98]",
            )}
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogIn size={16} />
            )}
            Continue
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-text-muted">
          <div className="h-px flex-1 bg-border-subtle" />
          or
          <div className="h-px flex-1 bg-border-subtle" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={submitting}
          className="flex h-11 w-full items-center justify-center rounded-xl border border-border-default bg-bg-surface text-sm font-medium text-text-primary transition-all hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          Continue with Google
        </button>

        <p className="mt-5 text-sm text-text-secondary">
          New here?{" "}
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="text-accent-light hover:text-text-primary"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

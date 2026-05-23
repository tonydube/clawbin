"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/hooks/useAuth";

function normalizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_");
}

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUpWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const next = searchParams.get("next") ?? "/";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const normalizedUsername = normalizeUsername(username);
      const response = await signUpWithPassword({
        email,
        password,
        username: normalizedUsername,
        displayName,
      });

      if (response.data.session) {
        router.replace(next);
        router.refresh();
        return;
      }

      setMessage("Account created. Check your email to complete sign-in.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to sign up.",
      );
    } finally {
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
            Create your account
          </h1>
          <p className="text-sm text-text-secondary">
            Publish prompts, save favorites, and build your profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              required
              minLength={2}
              className="h-11 w-full rounded-xl border border-border-subtle bg-bg-surface px-4 text-sm text-text-primary focus:border-accent/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(normalizeUsername(event.target.value))
              }
              required
              minLength={3}
              maxLength={32}
              className="h-11 w-full rounded-xl border border-border-subtle bg-bg-surface px-4 text-sm text-text-primary focus:border-accent/50 focus:outline-none"
            />
          </div>

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
              minLength={8}
              className="h-11 w-full rounded-xl border border-border-subtle bg-bg-surface px-4 text-sm text-text-primary focus:border-accent/50 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {message}
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
              <UserPlus size={16} />
            )}
            Create account
          </button>
        </form>

        <p className="mt-5 text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="text-accent-light hover:text-text-primary"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

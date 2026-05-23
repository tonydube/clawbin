"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, LogOut, Save } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile } from "@/lib/services/prompt-service";

function normalizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_");
}

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, refreshProfile, signOut } = useAuth();
  const [draft, setDraft] = useState<{
    displayName: string;
    username: string;
    bio: string;
    avatarUrl: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formState = useMemo(
    () =>
      draft ?? {
        displayName: profile?.display_name ?? "",
        username: profile?.username ?? "",
        bio: profile?.bio ?? "",
        avatarUrl: profile?.avatar_url ?? "",
      },
    [draft, profile],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!profile) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateProfile({
        id: profile.id,
        username: normalizeUsername(formState.username),
        displayName: formState.displayName,
        bio: formState.bio,
        avatarUrl: formState.avatarUrl,
      });
      await refreshProfile();
      setDraft(null);
      router.push(`/profile/${normalizeUsername(formState.username)}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated text-text-secondary hover:text-text-primary"
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg border border-border-default bg-bg-elevated px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:text-text-primary"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-text-primary mb-1">
            Edit profile
          </h1>
          <p className="text-sm text-text-secondary">
            Update the public profile shown alongside your prompts.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-2xl border border-border-subtle bg-bg-elevated p-5"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Display name
            </label>
            <input
              type="text"
              value={formState.displayName}
              onChange={(event) =>
                setDraft({ ...formState, displayName: event.target.value })
              }
              className="h-11 w-full rounded-xl border border-border-subtle bg-bg-surface px-4 text-sm text-text-primary focus:border-accent/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Username
            </label>
            <input
              type="text"
              value={formState.username}
              onChange={(event) =>
                setDraft({
                  ...formState,
                  username: normalizeUsername(event.target.value),
                })
              }
              className="h-11 w-full rounded-xl border border-border-subtle bg-bg-surface px-4 text-sm text-text-primary focus:border-accent/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Avatar URL
            </label>
            <input
              type="url"
              value={formState.avatarUrl}
              onChange={(event) =>
                setDraft({ ...formState, avatarUrl: event.target.value })
              }
              className="h-11 w-full rounded-xl border border-border-subtle bg-bg-surface px-4 text-sm text-text-primary focus:border-accent/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Bio
            </label>
            <textarea
              value={formState.bio}
              onChange={(event) =>
                setDraft({ ...formState, bio: event.target.value })
              }
              rows={4}
              className="w-full rounded-xl border border-border-subtle bg-bg-surface px-4 py-3 text-sm text-text-primary focus:border-accent/50 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className={clsx(
              "flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all",
              saving
                ? "bg-accent/60 cursor-not-allowed"
                : "bg-accent hover:bg-accent-hover active:scale-[0.98]",
            )}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}

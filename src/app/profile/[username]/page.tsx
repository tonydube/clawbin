"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import {
  FileText,
  Play,
  ThumbsUp,
  Star,
  Settings,
  Edit3,
  Bookmark,
} from "lucide-react";
import Avatar from "@/components/Avatar";
import ModelBadge from "@/components/ModelBadge";
import TagBadge from "@/components/TagBadge";
import { useAuth } from "@/hooks/useAuth";
import { usePrompts } from "@/hooks/usePrompts";
import {
  fetchProfileByUsername,
  fetchPrompts,
  fetchUserRuns,
} from "@/lib/services/prompt-service";
import { mapProfileToAuthor, mapPromptRunRow } from "@/lib/utils";
import { Prompt, PromptRun } from "@/types";
import { ProfileRow } from "@/types/supabase";
import { clsx } from "clsx";

type ProfileTab = "prompts" | "runs" | "bookmarks";

interface Props {
  params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: Props) {
  const { username } = use(params);
  const router = useRouter();
  const { profile: currentProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("prompts");
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [runs, setRuns] = useState<
    Array<PromptRun & { prompt: Pick<Prompt, "id" | "title"> | null }>
  >([]);

  const {
    prompts: userPrompts,
    promptStates,
    togglePromptBookmark,
  } = usePrompts({
    username,
    sortBy: "latest",
  });
  const { prompts: bookmarkedPrompts } = usePrompts({
    bookmarkedOnly: true,
    sortBy: "latest",
    enabled: currentProfile?.username === username && activeTab === "bookmarks",
  });

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setProfileLoading(true);

      try {
        const nextProfile = await fetchProfileByUsername(username);
        if (!active) return;
        setProfile(nextProfile);
      } catch {
        if (!active) return;
        setProfile(null);
      } finally {
        if (active) setProfileLoading(false);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [username]);

  useEffect(() => {
    let active = true;

    async function loadRuns() {
      if (
        !currentProfile ||
        currentProfile.username !== username ||
        activeTab !== "runs"
      ) {
        setRuns([]);
        return;
      }

      const runRows = await fetchUserRuns(currentProfile.id);
      const promptIds = Array.from(
        new Set(runRows.map((run) => run.prompt_id)),
      );
      const promptRows =
        promptIds.length > 0
          ? await fetchPrompts({
              promptIds,
              page: 0,
              pageSize: promptIds.length,
            })
          : [];

      if (!active) return;

      const promptMap = new Map(
        promptRows.map((prompt) => [
          prompt.id,
          { id: prompt.id, title: prompt.title },
        ]),
      );

      const author = mapProfileToAuthor({
        id: currentProfile.id,
        username: currentProfile.username,
        display_name: currentProfile.display_name,
        avatar_url: currentProfile.avatar_url,
      });

      setRuns(
        runRows.map((run) => ({
          ...mapPromptRunRow(run, author),
          prompt: promptMap.get(run.prompt_id) ?? null,
        })),
      );
    }

    void loadRuns();

    return () => {
      active = false;
    };
  }, [activeTab, currentProfile, username]);

  if (!profileLoading && !profile) {
    notFound();
  }

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-secondary">
        Loading profile…
      </div>
    );
  }

  const author = mapProfileToAuthor({
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
  });
  const isCurrentUser = currentProfile?.id === profile.id;
  const totalUpvotes = userPrompts.reduce(
    (sum, prompt) => sum + (promptStates[prompt.id]?.upvotes ?? prompt.upvotes),
    0,
  );
  const totalRuns = userPrompts.reduce(
    (sum, prompt) =>
      sum + (promptStates[prompt.id]?.runsCount ?? prompt.runsCount),
    0,
  );
  const displayList =
    activeTab === "prompts"
      ? userPrompts
      : activeTab === "bookmarks" && isCurrentUser
        ? bookmarkedPrompts
        : [];

  const tabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: "prompts", label: "Prompts", icon: <FileText size={13} /> },
    { id: "runs", label: "Runs", icon: <Play size={13} /> },
    ...(isCurrentUser
      ? [
          {
            id: "bookmarks" as ProfileTab,
            label: "Bookmarks",
            icon: <Bookmark size={13} />,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex items-start gap-4 mb-8">
          <Avatar author={author} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-text-primary">
                {author.name}
              </h1>
              {isCurrentUser && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/15 text-accent-light border border-accent/30 font-medium">
                  You
                </span>
              )}
            </div>
            <p className="text-sm text-text-muted mb-2">@{author.username}</p>
            {profile.bio && (
              <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                {profile.bio}
              </p>
            )}
            {isCurrentUser && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/create")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-default text-xs font-medium text-text-secondary hover:text-text-primary hover:border-border-strong transition-all"
                >
                  <Edit3 size={12} />
                  New Prompt
                </button>
                <button
                  onClick={() => router.push("/profile/edit")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-default text-xs font-medium text-text-secondary hover:text-text-primary hover:border-border-strong transition-all"
                >
                  <Settings size={12} />
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard
            icon={<FileText size={13} />}
            value={userPrompts.length}
            label="Prompts"
          />
          <StatCard
            icon={<ThumbsUp size={13} />}
            value={totalUpvotes}
            label="Votes"
          />
          <StatCard
            icon={<Play size={13} />}
            value={
              totalRuns >= 1000
                ? `${(totalRuns / 1000).toFixed(1)}k`
                : totalRuns
            }
            label="Runs"
          />
        </div>

        <div className="flex gap-1 bg-bg-elevated border border-border-subtle rounded-xl p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all",
                activeTab === tab.id
                  ? "bg-bg-active text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover",
              )}
            >
              <span
                className={
                  activeTab === tab.id ? "text-accent-light" : "text-text-muted"
                }
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "runs" ? (
          <div className="flex flex-col gap-3">
            {runs.length === 0 ? (
              <EmptyTabState
                icon={<Play size={20} />}
                message={
                  isCurrentUser ? "No runs yet." : "Run history is private."
                }
              />
            ) : (
              runs.map((run) => (
                <div
                  key={run.id}
                  onClick={() =>
                    run.prompt && router.push(`/prompt/${run.prompt.id}`)
                  }
                  className="rounded-xl border border-border-subtle bg-bg-elevated p-4 cursor-pointer hover:border-border-default transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {run.prompt?.title ?? "Prompt unavailable"}
                    </p>
                    <ModelBadge model={run.model} />
                  </div>
                  <p className="text-xs text-text-muted">{run.runAt}</p>
                </div>
              ))
            )}
          </div>
        ) : displayList.length === 0 ? (
          <EmptyTabState
            icon={
              activeTab === "bookmarks" ? (
                <Bookmark size={20} />
              ) : (
                <FileText size={20} />
              )
            }
            message={
              activeTab === "bookmarks"
                ? "No saved prompts yet."
                : isCurrentUser
                  ? "You haven't published any prompts yet."
                  : "No prompts published yet."
            }
            action={
              isCurrentUser && activeTab === "prompts"
                ? {
                    label: "Create your first prompt",
                    onClick: () => router.push("/create"),
                  }
                : undefined
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {displayList.map((prompt) => {
              const state = promptStates[prompt.id];
              return (
                <div
                  key={prompt.id}
                  onClick={() => router.push(`/prompt/${prompt.id}`)}
                  className="rounded-xl border border-border-subtle bg-bg-elevated p-4 cursor-pointer hover:border-border-default transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-text-primary leading-snug">
                      {prompt.title}
                    </h3>
                    {activeTab === "bookmarks" && isCurrentUser && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          void togglePromptBookmark(prompt.id);
                        }}
                        aria-label="Remove bookmark"
                        className="flex-shrink-0 p-1.5 rounded-lg text-accent-light hover:bg-accent/10 transition-colors"
                      >
                        <Bookmark size={13} className="fill-current" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary leading-snug mb-3 line-clamp-2">
                    {prompt.description}
                  </p>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex flex-wrap gap-1">
                      {prompt.tags.slice(0, 3).map((tag) => (
                        <TagBadge key={tag} tag={tag} size="sm" />
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-text-muted flex-shrink-0">
                      <span className="flex items-center gap-1">
                        <ThumbsUp size={10} />
                        {state?.upvotes ?? prompt.upvotes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Play size={9} />
                        {state?.runsCount ?? prompt.runsCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={9} />
                        {prompt.rating}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-4 px-3 rounded-xl bg-bg-elevated border border-border-subtle">
      <span className="text-text-muted">{icon}</span>
      <span className="text-xl font-bold text-text-primary tabular-nums">
        {value}
      </span>
      <span className="text-[11px] text-text-muted">{label}</span>
    </div>
  );
}

function EmptyTabState({
  icon,
  message,
  action,
}: {
  icon: React.ReactNode;
  message: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-bg-elevated border border-border-default flex items-center justify-center mb-4 text-text-muted">
        {icon}
      </div>
      <p className="text-sm text-text-muted mb-3">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-all active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

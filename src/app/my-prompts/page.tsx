"use client";
import { useRouter } from "next/navigation";
import { FileText, Play, ThumbsUp, Plus } from "lucide-react";
import TagBadge from "@/components/TagBadge";
import { useAuth } from "@/hooks/useAuth";
import { usePrompts } from "@/hooks/usePrompts";

export default function MyPromptsPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const {
    prompts: myPrompts,
    promptStates,
    loading,
    error,
  } = usePrompts({
    username: profile?.username,
    sortBy: "latest",
    enabled: Boolean(profile?.username),
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-text-primary tracking-tight mb-0.5">
              My Prompts
            </h1>
            <p className="text-sm text-text-secondary">
              Prompts you have created and published.
            </p>
          </div>
          <button
            onClick={() => router.push("/create")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-all active:scale-95 shadow-[0_0_14px_rgba(124,58,237,0.3)]"
          >
            <Plus size={15} strokeWidth={2.5} />
            New
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-text-secondary">
            Loading your prompts…
          </div>
        ) : error ? (
          <div className="py-20 text-center text-sm text-red-300">{error}</div>
        ) : myPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-bg-elevated border border-border-default flex items-center justify-center mb-5">
              <FileText size={22} className="text-text-muted" />
            </div>
            <p className="text-base font-semibold text-text-primary mb-2">
              No prompts yet
            </p>
            <p className="text-sm text-text-muted max-w-xs leading-relaxed mb-5">
              Share your best prompts and get upvotes from the community.
            </p>
            <button
              onClick={() => router.push("/create")}
              className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-all active:scale-95 shadow-[0_0_14px_rgba(124,58,237,0.3)]"
            >
              Create your first prompt
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] text-text-muted mb-1">
              {myPrompts.length} prompt{myPrompts.length !== 1 ? "s" : ""}
            </p>
            {myPrompts.map((prompt) => {
              const state = promptStates[prompt.id];
              return (
                <div
                  key={prompt.id}
                  onClick={() => router.push(`/prompt/${prompt.id}`)}
                  className="rounded-xl border border-border-subtle bg-bg-elevated p-4 cursor-pointer hover:border-border-default transition-all"
                >
                  <h3 className="text-sm font-semibold text-text-primary leading-snug mb-1.5">
                    {prompt.title}
                  </h3>
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

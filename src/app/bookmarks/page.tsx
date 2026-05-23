"use client";
import { useRouter } from "next/navigation";
import { Bookmark, Play, ThumbsUp } from "lucide-react";
import TagBadge from "@/components/TagBadge";
import { usePrompts } from "@/hooks/usePrompts";

export default function BookmarksPage() {
  const router = useRouter();
  const {
    prompts: bookmarked,
    promptStates,
    loading,
    error,
    togglePromptBookmark,
  } = usePrompts({ bookmarkedOnly: true, sortBy: "latest" });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-text-primary tracking-tight mb-0.5">
            Bookmarks
          </h1>
          <p className="text-sm text-text-secondary">
            Prompts you have saved for quick access.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-text-secondary">
            Loading your bookmarks…
          </div>
        ) : error ? (
          <div className="py-20 text-center text-sm text-red-300">{error}</div>
        ) : bookmarked.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-bg-elevated border border-border-default flex items-center justify-center mb-5">
              <Bookmark size={22} className="text-text-muted" />
            </div>
            <p className="text-base font-semibold text-text-primary mb-2">
              No bookmarks yet
            </p>
            <p className="text-sm text-text-muted max-w-xs leading-relaxed mb-5">
              Tap the bookmark icon on any prompt to save it here for easy
              access.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-all active:scale-95 shadow-[0_0_14px_rgba(124,58,237,0.3)]"
            >
              Browse Prompts
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] text-text-muted mb-1">
              {bookmarked.length} saved prompt
              {bookmarked.length !== 1 ? "s" : ""}
            </p>
            {bookmarked.map((prompt) => {
              const state = promptStates[prompt.id];
              return (
                <div
                  key={prompt.id}
                  onClick={() => router.push(`/prompt/${prompt.id}`)}
                  className="rounded-xl border border-border-subtle bg-bg-elevated p-4 cursor-pointer hover:border-border-default transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-text-primary leading-snug">
                      {prompt.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void togglePromptBookmark(prompt.id);
                      }}
                      aria-label="Remove bookmark"
                      className="flex-shrink-0 p-1.5 rounded-lg text-accent-light hover:bg-accent/10 transition-colors"
                    >
                      <Bookmark size={13} className="fill-current" />
                    </button>
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

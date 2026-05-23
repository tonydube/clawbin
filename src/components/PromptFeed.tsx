"use client";
import { Flame, Clock, Star, Tag, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Prompt, PromptState } from "@/types";
import PromptCard from "./PromptCard";
import { clsx } from "clsx";

type FilterTab = "trending" | "latest" | "top-rated";

const FILTER_TABS: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
  { id: "trending", label: "Trending", icon: <Flame size={13} /> },
  { id: "latest", label: "Latest", icon: <Clock size={13} /> },
  { id: "top-rated", label: "Top Rated", icon: <Star size={13} /> },
];

interface PromptFeedProps {
  prompts: Prompt[];
  promptStates: Record<string, PromptState>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onBookmark: (id: string) => void;
  filterTab: FilterTab;
  onFilterChange: (tab: FilterTab) => void;
  activeTag: string | null;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export default function PromptFeed({
  prompts,
  promptStates,
  selectedId,
  onSelect,
  onUpvote,
  onDownvote,
  onBookmark,
  filterTab,
  onFilterChange,
  activeTag,
  title = "Explore Prompts",
  subtitle = "Discover and run the best prompts, shared by the community.",
  loading = false,
  error = null,
  hasMore = false,
  onLoadMore,
}: PromptFeedProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col h-full">
      {/* Feed header */}
      <div className="flex-shrink-0 px-4 pt-5 pb-3">
        <h1 className="text-xl font-semibold text-text-primary tracking-tight mb-0.5">
          {activeTag ? (
            <span className="flex items-center gap-2">
              <Tag size={18} className="text-accent-light" />
              {activeTag}
            </span>
          ) : (
            title
          )}
        </h1>
        <p className="text-sm text-text-secondary">
          {activeTag ? `Browsing prompts tagged with "${activeTag}"` : subtitle}
        </p>
      </div>

      {/* Filter tabs + tag dropdown — horizontally scrollable on mobile */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 pb-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 bg-bg-elevated border border-border-subtle rounded-lg p-1 flex-shrink-0">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-2 lg:py-1.5 rounded-md text-xs font-medium transition-all duration-150 whitespace-nowrap",
                filterTab === tab.id
                  ? "bg-bg-active text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover",
              )}
            >
              <span
                className={
                  filterTab === tab.id ? "text-accent-light" : "text-text-muted"
                }
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => router.push("/search")}
          className="flex items-center gap-1.5 px-3 py-2 lg:py-1.5 rounded-lg bg-bg-elevated border border-border-subtle text-xs font-medium text-text-secondary hover:text-text-primary hover:border-border-default transition-all flex-shrink-0 whitespace-nowrap"
        >
          <Tag size={12} />
          All Tags
          <ChevronDown size={12} />
        </button>
      </div>

      {/* Result count */}
      {prompts.length > 0 && (
        <div className="flex-shrink-0 px-5 pb-2">
          <p className="text-[11px] text-text-muted">
            {prompts.length} prompt{prompts.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Scrollable card list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading && prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-2xl border border-border-default border-t-accent animate-spin" />
            <p className="mt-4 text-sm text-text-secondary">Loading prompts…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm font-medium text-text-primary mb-1">
              Unable to load prompts
            </p>
            <p className="text-xs text-text-muted max-w-[220px]">{error}</p>
          </div>
        ) : prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-2xl bg-bg-elevated border border-border-default flex items-center justify-center mb-4">
              <Tag size={20} className="text-text-muted" />
            </div>
            <p className="text-sm font-medium text-text-primary mb-1">
              No prompts found
            </p>
            <p className="text-xs text-text-muted max-w-[180px]">
              Try a different filter, tag, or search term.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                state={promptStates[prompt.id]}
                isSelected={selectedId === prompt.id}
                onSelect={() => onSelect(prompt.id)}
                onUpvote={() => onUpvote(prompt.id)}
                onDownvote={() => onDownvote(prompt.id)}
                onBookmark={() => onBookmark(prompt.id)}
              />
            ))}
            {hasMore && onLoadMore && (
              <button
                onClick={onLoadMore}
                className="mt-2 rounded-xl border border-border-default bg-bg-elevated px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:text-text-primary hover:bg-bg-hover"
              >
                {loading ? "Loading…" : "Load more"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

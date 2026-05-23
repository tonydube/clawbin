"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X, Tag, ChevronDown, Flame, Clock, Star } from "lucide-react";
import PromptCard from "@/components/PromptCard";
import { clsx } from "clsx";
import { usePrompts } from "@/hooks/usePrompts";
import { useTagStats } from "@/hooks/useTagStats";

type SortOption = "trending" | "latest" | "top-rated";

const SORT_OPTIONS: { id: SortOption; label: string; icon: React.ReactNode }[] =
  [
    { id: "trending", label: "Trending", icon: <Flame size={13} /> },
    { id: "latest", label: "Latest", icon: <Clock size={13} /> },
    { id: "top-rated", label: "Top Rated", icon: <Star size={13} /> },
  ];

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tags = useTagStats();

  const initialQuery = searchParams.get("q") ?? "";
  const initialTag = searchParams.get("tag") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedTag, setSelectedTag] = useState<string>(initialTag);
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [showAllTags, setShowAllTags] = useState(false);
  const {
    prompts: results,
    promptStates,
    loading,
    hasMore,
    loadMore,
    setPromptVote,
    togglePromptBookmark,
  } = usePrompts({
    query,
    tag: selectedTag || undefined,
    sortBy,
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedTag) params.set("tag", selectedTag);
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }

  function toggleTag(tag: string) {
    const next = selectedTag === tag ? "" : tag;
    setSelectedTag(next);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (next) params.set("tag", next);
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }

  function clearSearch() {
    setQuery("");
    setSelectedTag("");
    router.replace("/search", { scroll: false });
  }

  const visibleTags = showAllTags ? tags : tags.slice(0, 6);
  const hasFilters = query.trim() || selectedTag;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Search header */}
        <div className="flex-shrink-0 px-4 pt-5 pb-4 border-b border-border-subtle">
          {/* Search form */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search prompts, tags, models, authors..."
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-bg-elevated border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:bg-bg-hover transition-all"
            />
            {(query || selectedTag) && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-text-muted hover:text-text-secondary transition-colors"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* Tag filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {visibleTags.map((t) => (
              <button
                key={t.label}
                onClick={() => toggleTag(t.label)}
                className={clsx(
                  "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  selectedTag === t.label
                    ? "bg-accent/20 text-accent-light border-accent/40"
                    : "bg-bg-elevated text-text-secondary border-border-subtle hover:border-border-default hover:text-text-primary",
                )}
              >
                <Tag size={9} />
                {t.label}
              </button>
            ))}
            <button
              onClick={() => setShowAllTags((v) => !v)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-text-muted border border-border-subtle hover:text-text-secondary hover:border-border-default transition-all"
            >
              {showAllTags ? "Less" : "More"}
              <ChevronDown
                size={10}
                className={clsx(
                  "transition-transform",
                  showAllTags && "rotate-180",
                )}
              />
            </button>
          </div>
        </div>

        {/* Results header + sort */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <p className="text-sm text-text-secondary">
            {hasFilters ? (
              <span>
                <span className="font-medium text-text-primary">
                  {results.length}
                </span>{" "}
                result{results.length !== 1 ? "s" : ""}
                {selectedTag && (
                  <span>
                    {" "}
                    in{" "}
                    <span className="text-accent-light font-medium">
                      {selectedTag}
                    </span>
                  </span>
                )}
                {query && (
                  <span>
                    {" "}
                    for{" "}
                    <span className="font-medium text-text-primary">
                      &quot;{query}&quot;
                    </span>
                  </span>
                )}
              </span>
            ) : (
              <span>Browse all prompts</span>
            )}
          </p>

          {/* Sort tabs */}
          <div className="flex items-center gap-1 bg-bg-elevated border border-border-subtle rounded-lg p-0.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                className={clsx(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
                  sortBy === opt.id
                    ? "bg-bg-active text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover",
                )}
              >
                <span
                  className={
                    sortBy === opt.id ? "text-accent-light" : "text-text-muted"
                  }
                >
                  {opt.icon}
                </span>
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-bg-elevated border border-border-default flex items-center justify-center mb-5">
                <Search size={22} className="text-text-muted" />
              </div>
              <p className="text-base font-semibold text-text-primary mb-2">
                No prompts found
              </p>
              <p className="text-sm text-text-muted max-w-xs leading-relaxed">
                {hasFilters
                  ? "Try adjusting your search or removing filters."
                  : "No prompts available yet."}
              </p>
              {hasFilters && (
                <button
                  onClick={clearSearch}
                  className="mt-4 px-4 py-2 rounded-lg bg-bg-elevated border border-border-default text-sm text-text-secondary hover:text-text-primary hover:border-border-strong transition-all"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-w-2xl mx-auto">
              {results.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  state={promptStates[prompt.id]}
                  isSelected={false}
                  onSelect={() => router.push(`/prompt/${prompt.id}`)}
                  onUpvote={() => void setPromptVote(prompt.id, 1)}
                  onDownvote={() => void setPromptVote(prompt.id, -1)}
                  onBookmark={() => void togglePromptBookmark(prompt.id)}
                />
              ))}
              {hasMore && (
                <button
                  onClick={loadMore}
                  className="rounded-xl border border-border-default bg-bg-elevated px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:text-text-primary hover:bg-bg-hover"
                >
                  {loading ? "Loading…" : "Load more"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tag sidebar — desktop only */}
      <div className="hidden xl:flex flex-col w-56 flex-shrink-0 border-l border-border-subtle px-4 py-5 overflow-y-auto gap-5">
        <div>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
            Browse by Tag
          </p>
          <div className="flex flex-col gap-0.5">
            {tags.map((t) => (
              <button
                key={t.label}
                onClick={() => toggleTag(t.label)}
                className={clsx(
                  "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all",
                  selectedTag === t.label
                    ? "bg-bg-active text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover",
                )}
              >
                <span className="font-medium">{t.label}</span>
                <span className="text-[11px] text-text-muted">{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
            Popular Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["Marketing", "Coding", "Writing", "AI", "SEO"].map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={clsx(
                  "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium transition-all border",
                  selectedTag === tag
                    ? "bg-accent/20 text-accent-light border-accent/40"
                    : "bg-bg-elevated text-text-secondary border-border-subtle hover:border-border-default hover:text-text-primary",
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

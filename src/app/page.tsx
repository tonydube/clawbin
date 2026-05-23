"use client";
import { useMemo, useState } from "react";
import PromptFeed from "@/components/PromptFeed";
import PromptDetail from "@/components/PromptDetail";
import { clsx } from "clsx";
import { usePrompt, usePrompts } from "@/hooks/usePrompts";

type FilterTab = "trending" | "latest" | "top-rated";

export default function HomePage() {
  const [filterTab, setFilterTab] = useState<FilterTab>("trending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const {
    prompts,
    promptStates,
    loading,
    error,
    hasMore,
    loadMore,
    setPromptVote,
    togglePromptBookmark,
  } = usePrompts({ sortBy: filterTab });

  function handleCardSelect(id: string) {
    setSelectedId(id);
    setMobileShowDetail(true);
  }

  const resolvedSelectedId =
    selectedId && prompts.some((prompt) => prompt.id === selectedId)
      ? selectedId
      : (prompts[0]?.id ?? null);
  const selectedPromptDetail = usePrompt(resolvedSelectedId);

  const selectedPrompt = useMemo(() => {
    return (
      selectedPromptDetail.prompt ??
      prompts.find((prompt) => prompt.id === resolvedSelectedId) ??
      null
    );
  }, [prompts, resolvedSelectedId, selectedPromptDetail.prompt]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Feed panel:
          Mobile — full width, hidden when detail is open
          Desktop — fixed 420px column with right border */}
      <div
        className={clsx(
          "overflow-hidden flex-col",
          "lg:flex lg:w-[420px] lg:flex-shrink-0 lg:border-r lg:border-border-subtle",
          mobileShowDetail ? "hidden" : "flex w-full",
        )}
      >
        <PromptFeed
          prompts={prompts}
          promptStates={promptStates}
          selectedId={resolvedSelectedId}
          onSelect={handleCardSelect}
          onUpvote={(id) => void setPromptVote(id, 1)}
          onDownvote={(id) => void setPromptVote(id, -1)}
          onBookmark={(id) => void togglePromptBookmark(id)}
          filterTab={filterTab}
          onFilterChange={(tab) => setFilterTab(tab as FilterTab)}
          activeTag={null}
          title="Explore Prompts"
          subtitle="Discover and run the best prompts, shared by the community."
          loading={loading}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>

      {/* Detail panel:
          Mobile — full width, only visible when a card is selected
          Desktop — fills remaining space */}
      <div
        className={clsx(
          "flex-col flex-1 min-w-0 overflow-hidden",
          mobileShowDetail ? "flex" : "hidden lg:flex",
        )}
      >
        {selectedPrompt && resolvedSelectedId && selectedPromptDetail.state ? (
          <PromptDetail
            key={resolvedSelectedId}
            prompt={selectedPrompt}
            state={selectedPromptDetail.state}
            onUpvote={() => void selectedPromptDetail.setPromptVote(1)}
            onBookmark={() => void selectedPromptDetail.togglePromptBookmark()}
            onRun={() => void selectedPromptDetail.runPrompt()}
            onBack={() => setMobileShowDetail(false)}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <div>
              <p className="text-base font-semibold text-text-primary mb-2">
                No prompt selected
              </p>
              <p className="text-sm text-text-muted">
                Choose a prompt from the feed to see the full details.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

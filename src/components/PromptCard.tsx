"use client";
import {
  ChevronUp,
  ChevronDown,
  Play,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { Prompt, PromptState } from "@/types";
import Avatar from "./Avatar";
import TagBadge from "./TagBadge";
import ModelBadge from "./ModelBadge";
import { clsx } from "clsx";

interface PromptCardProps {
  prompt: Prompt;
  state: PromptState;
  isSelected: boolean;
  onSelect: () => void;
  onUpvote: () => void;
  onDownvote: () => void;
  onBookmark: () => void;
}

function formatRuns(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export default function PromptCard({
  prompt,
  state,
  isSelected,
  onSelect,
  onUpvote,
  onDownvote,
  onBookmark,
}: PromptCardProps) {
  function handleUpvote(e: React.MouseEvent) {
    e.stopPropagation();
    onUpvote();
  }

  function handleDownvote(e: React.MouseEvent) {
    e.stopPropagation();
    onDownvote();
  }

  function handleBookmark(e: React.MouseEvent) {
    e.stopPropagation();
    onBookmark();
  }

  const voteColor = state.upvoted
    ? "text-accent-light"
    : state.voteValue === -1
      ? "text-red-400"
      : isSelected
        ? "text-text-secondary"
        : "text-text-muted";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={clsx(
        "w-full text-left flex rounded-xl border transition-all duration-150 group overflow-hidden cursor-pointer",
        isSelected
          ? "border-accent/50 bg-bg-elevated shadow-[0_0_0_1px_rgba(124,58,237,0.2),inset_0_1px_0_rgba(255,255,255,0.04)]"
          : "border-border-subtle bg-bg-surface hover:border-border-default hover:bg-bg-elevated",
      )}
    >
      {/* Vote column — 44px min tap target on each button */}
      <div className="flex flex-col items-center justify-center py-2 min-w-[52px] border-r border-border-subtle">
        <button
          onClick={handleUpvote}
          aria-label="Upvote"
          className={clsx(
            "min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md transition-all hover:bg-bg-hover active:scale-90",
            state.upvoted
              ? "text-accent-light"
              : "text-text-muted hover:text-text-secondary",
          )}
        >
          <ChevronUp size={16} strokeWidth={state.upvoted ? 2.5 : 2} />
        </button>

        <span
          className={clsx(
            "text-sm font-semibold tabular-nums leading-none select-none",
            voteColor,
          )}
        >
          {state.upvotes}
        </span>

        <button
          onClick={handleDownvote}
          aria-label="Downvote"
          className={clsx(
            "min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md transition-all hover:bg-bg-hover active:scale-90",
            state.voteValue === -1
              ? "text-red-400"
              : "text-text-muted hover:text-text-secondary",
          )}
        >
          <ChevronDown
            size={16}
            strokeWidth={state.voteValue === -1 ? 2.5 : 2}
          />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 px-4 py-3.5">
        {/* Title + bookmark */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-base sm:text-sm font-semibold text-text-primary leading-snug line-clamp-2 flex-1">
            {prompt.title}
          </h3>
          <button
            onClick={handleBookmark}
            aria-label={state.bookmarked ? "Remove bookmark" : "Bookmark"}
            className={clsx(
              "flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded transition-all active:scale-90",
              state.bookmarked
                ? "text-accent-light"
                : // On mobile (no hover) always show; on sm+ hide until card hover
                  "text-text-muted sm:opacity-0 sm:group-hover:opacity-100 hover:text-text-secondary",
            )}
          >
            {state.bookmarked ? (
              <BookmarkCheck size={13} strokeWidth={2.5} />
            ) : (
              <Bookmark size={13} />
            )}
          </button>
        </div>

        {/* Description */}
        <p className="text-sm sm:text-xs text-text-secondary leading-snug mb-2.5 line-clamp-2">
          {prompt.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {prompt.tags.slice(0, 3).map((tag) => (
            <TagBadge key={tag} tag={tag} size="sm" />
          ))}
          {prompt.tags.length > 3 && (
            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium text-text-muted bg-bg-hover border border-border-subtle">
              +{prompt.tags.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Avatar author={prompt.author} size="xs" />
            <span className="text-[11px] text-text-secondary truncate">
              {prompt.author.name.split(" ")[0]}{" "}
              {prompt.author.name.split(" ")[1]?.[0]}.
            </span>
            <span className="text-text-muted text-[11px] flex-shrink-0">
              · {prompt.createdAt}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {state.runs[0] && <ModelBadge model={state.runs[0].model} />}
            <div className="flex items-center gap-1 text-[11px] text-text-muted">
              <Play size={9} />
              {formatRuns(state.runsCount)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

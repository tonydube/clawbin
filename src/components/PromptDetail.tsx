"use client";
import {
  Play,
  Bookmark,
  BookmarkCheck,
  Link2,
  Copy,
  Check,
  Star,
  ChevronRight,
  Globe,
  ThumbsUp,
  Zap,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Prompt, PromptState } from "@/types";
import Avatar from "./Avatar";
import TagBadge from "./TagBadge";
import RunCard from "./RunCard";
import { clsx } from "clsx";

interface PromptDetailProps {
  prompt: Prompt;
  state: PromptState;
  onUpvote: () => void;
  onBookmark: () => void;
  onRun: () => void;
  /** Called on mobile when user taps the back arrow to return to the feed */
  onBack?: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((pip) => (
        <Star
          key={pip}
          size={10}
          className={
            pip <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-border-default fill-transparent"
          }
        />
      ))}
    </div>
  );
}

function StatItem({
  icon,
  value,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={clsx(
        "flex-1 flex flex-col items-center gap-0.5 py-3 border-r last:border-r-0 border-border-subtle transition-colors",
        onClick && "hover:bg-bg-hover cursor-pointer active:bg-bg-active",
        active && "text-accent-light",
      )}
    >
      <div
        className={clsx(
          "flex items-center gap-1.5 font-semibold text-sm",
          active ? "text-accent-light" : "text-text-primary",
        )}
      >
        <span className={active ? "text-accent-light" : "text-text-secondary"}>
          {icon}
        </span>
        {value}
      </div>
      <span className="text-[11px] text-text-muted">{label}</span>
    </Tag>
  );
}

function formatRuns(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function HighlightedBody({ body }: { body: string }) {
  return (
    <pre className="text-xs text-text-primary font-mono whitespace-pre-wrap leading-relaxed">
      {body.split(/(\{\{[^}]+\}\})/g).map((part, i) =>
        part.startsWith("{{") ? (
          <span key={i} className="prompt-var font-semibold">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </pre>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PromptDetail({
  prompt,
  state,
  onUpvote,
  onBookmark,
  onRun,
  onBack,
}: PromptDetailProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAllRuns, setShowAllRuns] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const lineCount = prompt.body.split("\n").length;
  const charCount = prompt.body.length;

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt.body);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 1800);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(
      `${window.location.origin}/prompt/${prompt.id}`,
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1800);
  }

  function handleRun() {
    if (isRunning) return;
    setIsRunning(true);
    setTimeout(() => {
      onRun();
      setIsRunning(false);
      setShowAllRuns(true);
    }, 1500);
  }

  const visibleRuns = showAllRuns ? state.runs : state.runs.slice(0, 2);

  return (
    <div className="flex flex-col h-full">
      {/* ── Mobile back header (hidden on desktop) ── */}
      <div className="lg:hidden flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-border-subtle bg-bg-surface/90 backdrop-blur-sm">
        <button
          onClick={onBack}
          aria-label="Back to feed"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="flex-1 text-sm font-semibold text-text-primary truncate">
          {prompt.title}
        </h2>
        <button
          onClick={onBookmark}
          aria-label={state.bookmarked ? "Remove bookmark" : "Bookmark"}
          className={clsx(
            "min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors",
            state.bookmarked
              ? "text-accent-light"
              : "text-text-muted hover:text-text-primary hover:bg-bg-hover",
          )}
        >
          {state.bookmarked ? (
            <BookmarkCheck size={18} strokeWidth={2} />
          ) : (
            <Bookmark size={18} />
          )}
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 lg:px-6 pt-4 lg:pt-6 pb-4 lg:pb-8">
          {/* Title — desktop only (mobile shows it in the back header) */}
          <h2 className="hidden lg:block text-xl font-semibold text-text-primary leading-snug tracking-tight mb-3">
            {prompt.title}
          </h2>

          {/* Author row */}
          <div className="flex items-center gap-2 mb-4 lg:mb-5">
            <Link
              href={`/profile/${prompt.author.username}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Avatar author={prompt.author} size="sm" />
              <span className="text-sm text-text-secondary">
                By{" "}
                <span className="font-medium text-text-primary">
                  {prompt.author.name}
                </span>
              </span>
            </Link>
            <span className="text-text-muted text-xs">
              · {prompt.createdAt}
            </span>
            <span className="ml-1 flex items-center gap-1 text-[11px] text-text-muted bg-bg-elevated border border-border-subtle rounded-full px-2 py-0.5">
              <Globe size={10} />
              Public
            </span>
          </div>

          {/* Primary Run button — desktop only; mobile uses sticky bottom bar */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={clsx(
              "hidden lg:flex w-full items-center justify-center gap-2 h-10 rounded-xl font-semibold text-sm text-white transition-all mb-3",
              isRunning
                ? "bg-accent/70 cursor-not-allowed"
                : "bg-accent hover:bg-accent-hover active:scale-[0.98] shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_28px_rgba(124,58,237,0.45)]",
            )}
          >
            {isRunning ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Running\u2026
              </>
            ) : (
              <>
                <Play size={14} fill="white" />
                Run Prompt
              </>
            )}
          </button>

          {/* Secondary actions */}
          <div className="flex gap-2 mb-4 lg:mb-5">
            <button
              onClick={copyPrompt}
              className="flex flex-1 items-center justify-center gap-1.5 h-10 lg:h-8 rounded-lg border border-border-default bg-bg-elevated hover:bg-bg-hover active:scale-[0.98] transition-all text-xs font-medium text-text-secondary hover:text-text-primary"
            >
              {copiedPrompt ? (
                <>
                  <Check size={12} className="text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy Prompt
                </>
              )}
            </button>
            {/* Bookmark — desktop only; mobile exposed in back header */}
            <button
              onClick={onBookmark}
              className={clsx(
                "hidden lg:flex flex-1 items-center justify-center gap-1.5 h-8 rounded-lg border active:scale-[0.98] transition-all text-xs font-medium",
                state.bookmarked
                  ? "border-accent/40 bg-accent/10 text-accent-light"
                  : "border-border-default bg-bg-elevated hover:bg-bg-hover text-text-secondary hover:text-text-primary",
              )}
            >
              {state.bookmarked ? (
                <>
                  <BookmarkCheck size={12} />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark size={12} />
                  Bookmark
                </>
              )}
            </button>
            <button
              onClick={copyLink}
              className="flex flex-1 items-center justify-center gap-1.5 h-10 lg:h-8 rounded-lg border border-border-default bg-bg-elevated hover:bg-bg-hover active:scale-[0.98] transition-all text-xs font-medium text-text-secondary hover:text-text-primary"
            >
              {copiedLink ? (
                <>
                  <Check size={12} className="text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Link2 size={12} />
                  Share
                </>
              )}
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            {prompt.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4 lg:mb-5">
            {prompt.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} size="md" />
            ))}
          </div>

          {/* Stats row */}
          <div className="flex rounded-xl border border-border-subtle bg-bg-elevated mb-5 lg:mb-6 overflow-hidden">
            <StatItem
              icon={<ThumbsUp size={13} />}
              value={state.upvotes.toString()}
              label="Upvotes"
              onClick={onUpvote}
              active={state.upvoted}
            />
            <StatItem
              icon={<Play size={13} />}
              value={formatRuns(state.runsCount)}
              label="Runs"
            />
            <StatItem
              icon={<StarRating rating={prompt.rating} />}
              value={`${prompt.rating}`}
              label={`${prompt.ratingCount} ratings`}
            />
          </div>

          {/* Prompt body */}
          <div className="mb-6 lg:mb-7">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-semibold text-text-primary">
                Prompt
              </h3>
              <span className="text-[11px] text-text-muted">
                {lineCount} lines \u00b7 {charCount} chars
              </span>
            </div>
            <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/60" />
                  <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                  <div className="w-2 h-2 rounded-full bg-green-500/60" />
                  <span className="text-[11px] text-text-muted ml-1 font-mono">
                    prompt.txt
                  </span>
                </div>
                <button
                  onClick={copyPrompt}
                  className="flex items-center gap-1 px-2 py-1 min-h-[36px] rounded text-[11px] text-text-muted hover:text-text-secondary hover:bg-bg-hover transition-all"
                >
                  {copiedPrompt ? (
                    <Check size={10} className="text-green-400" />
                  ) : (
                    <Copy size={10} />
                  )}
                  Copy
                </button>
              </div>
              <div className="px-4 py-4 overflow-x-auto max-h-72 overflow-y-auto">
                <HighlightedBody body={prompt.body} />
              </div>
            </div>
          </div>

          {/* Example Runs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Zap size={14} className="text-amber-400" />
                Example Runs
                {state.runsCount > 0 && (
                  <span className="text-[11px] font-normal text-text-muted bg-bg-elevated border border-border-subtle rounded-full px-2 py-0.5">
                    {state.runsCount}
                  </span>
                )}
              </h3>
              {state.runs.length > 2 && (
                <button
                  onClick={() => setShowAllRuns((v) => !v)}
                  className="flex items-center gap-1 text-xs text-accent-light hover:text-text-accent transition-colors font-medium"
                >
                  {showAllRuns ? "Show less" : "View all"}
                  <ChevronRight
                    size={13}
                    className={clsx(
                      "transition-transform",
                      showAllRuns && "rotate-90",
                    )}
                  />
                </button>
              )}
            </div>

            {state.runs.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border-subtle px-5 py-10 text-center">
                <Play size={22} className="text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-secondary font-medium mb-1">
                  No runs yet
                </p>
                <p className="text-xs text-text-muted">
                  Hit{" "}
                  <span className="text-accent-light font-medium">
                    Run Prompt
                  </span>{" "}
                  above to generate the first run.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {visibleRuns.map((run) => (
                  <RunCard key={run.id} run={run} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom action bar (hidden on desktop) ── */}
      <div className="lg:hidden flex-shrink-0 border-t border-border-subtle bg-bg-surface/95 backdrop-blur-md px-4 py-3 flex gap-3">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className={clsx(
            "flex flex-1 items-center justify-center gap-2 h-12 rounded-xl font-semibold text-sm text-white transition-all",
            isRunning
              ? "bg-accent/70 cursor-not-allowed"
              : "bg-accent hover:bg-accent-hover active:scale-[0.97] shadow-[0_0_18px_rgba(124,58,237,0.3)]",
          )}
        >
          {isRunning ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Running\u2026
            </>
          ) : (
            <>
              <Play size={15} fill="white" />
              Run Prompt
            </>
          )}
        </button>
        <button
          onClick={copyPrompt}
          className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl border border-border-default bg-bg-elevated hover:bg-bg-hover active:scale-95 transition-all"
          aria-label="Copy prompt"
        >
          {copiedPrompt ? (
            <Check size={18} className="text-green-400" />
          ) : (
            <Copy size={18} className="text-text-secondary" />
          )}
        </button>
      </div>
    </div>
  );
}

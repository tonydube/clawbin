"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DEFAULT_MODEL_OPTIONS, FEED_PAGE_SIZE } from "@/lib/constants";
import {
  fetchBookmarkedPromptIds,
  fetchPromptById,
  fetchPromptRuns,
  fetchPrompts,
  insertPrompt,
  insertPromptRun,
} from "@/lib/services/prompt-service";
import {
  buildPromptState,
  buildRunPreview,
  mapProfileToAuthor,
  mapPromptOverviewRow,
  mapPromptRunRow,
  sortByIds,
} from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useVotes } from "@/hooks/useVotes";
import { Prompt, PromptState } from "@/types";
import { PromptOverviewRow } from "@/types/supabase";

type SortBy = "trending" | "latest" | "top-rated";

interface UsePromptsOptions {
  sortBy?: SortBy;
  query?: string;
  tag?: string;
  username?: string;
  bookmarkedOnly?: boolean;
  pageSize?: number;
  enabled?: boolean;
}

function mergePromptRows(
  current: PromptOverviewRow[],
  next: PromptOverviewRow[],
) {
  const map = new Map(current.map((row) => [row.id, row]));
  next.forEach((row) => {
    map.set(row.id, row);
  });
  return Array.from(map.values());
}

export function usePrompts(options: UsePromptsOptions = {}) {
  const { user, profile } = useAuth();
  const pageSize = options.pageSize ?? FEED_PAGE_SIZE;
  const enabled = options.enabled ?? true;
  const queryKey = JSON.stringify({
    bookmarkedOnly: options.bookmarkedOnly,
    query: options.query,
    sortBy: options.sortBy,
    tag: options.tag,
    username: options.username,
    enabled,
  });
  const [pagination, setPagination] = useState({ key: queryKey, page: 0 });
  const [rows, setRows] = useState<PromptOverviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const page = pagination.key === queryKey ? pagination.page : 0;

  useEffect(() => {
    let active = true;

    async function loadPrompts() {
      if (!enabled) {
        setRows([]);
        setLoading(false);
        setError(null);
        setHasMore(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let nextRows: PromptOverviewRow[] = [];
        if (options.bookmarkedOnly) {
          const promptIds = await fetchBookmarkedPromptIds(page, pageSize);
          if (promptIds.length > 0) {
            nextRows = await fetchPrompts({
              promptIds,
              page: 0,
              pageSize: promptIds.length,
            });
            nextRows = sortByIds(nextRows, promptIds);
          }
        } else {
          nextRows = await fetchPrompts({
            page,
            pageSize,
            sortBy: options.sortBy,
            query: options.query,
            tag: options.tag,
            username: options.username,
          });
        }

        if (!active) {
          return;
        }

        setRows((current) =>
          page === 0 ? nextRows : mergePromptRows(current, nextRows),
        );
        setHasMore(nextRows.length === pageSize && !options.bookmarkedOnly);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load prompts.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPrompts();

    return () => {
      active = false;
    };
  }, [
    enabled,
    options.bookmarkedOnly,
    options.query,
    options.sortBy,
    options.tag,
    options.username,
    page,
    pageSize,
    queryKey,
  ]);

  const promptIds = useMemo(() => rows.map((row) => row.id), [rows]);
  const votes = useVotes(promptIds);
  const bookmarks = useBookmarks(promptIds);

  const promptStates = useMemo<Record<string, PromptState>>(() => {
    return rows.reduce<Record<string, PromptState>>((accumulator, row) => {
      accumulator[row.id] = buildPromptState({
        prompt: row,
        voteValue: votes.getVote(row.id),
        bookmarked: bookmarks.isBookmarked(row.id),
        runs: [],
      });
      return accumulator;
    }, {});
  }, [bookmarks, rows, votes]);

  const prompts = useMemo<Prompt[]>(() => {
    return rows.map((row) => mapPromptOverviewRow(row, promptStates[row.id]));
  }, [promptStates, rows]);

  const setPromptVote = useCallback(
    async (promptId: string, nextValue: -1 | 0 | 1) => {
      const row = rows.find((item) => item.id === promptId);
      if (!row) {
        return;
      }

      const currentValue = votes.getVote(promptId);
      const resolvedValue = currentValue === nextValue ? 0 : nextValue;
      const delta = resolvedValue - currentValue;
      setRows((current) =>
        current.map((item) =>
          item.id === promptId
            ? ({
                ...item,
                vote_score: item.vote_score + delta,
              } as PromptOverviewRow)
            : item,
        ),
      );

      const persistedValue = await votes.setVote(promptId, resolvedValue);
      if (persistedValue !== resolvedValue) {
        setRows((current) =>
          current.map((item) =>
            item.id === promptId
              ? ({
                  ...item,
                  vote_score: item.vote_score - delta,
                } as PromptOverviewRow)
              : item,
          ),
        );
      }
    },
    [rows, votes],
  );

  const togglePromptBookmark = useCallback(
    async (promptId: string) => {
      await bookmarks.toggleBookmark(promptId);
    },
    [bookmarks],
  );

  const createPrompt = useCallback(
    async (input: {
      title: string;
      content: string;
      description: string;
      tags: string[];
      isPublic: boolean;
    }) => {
      if (!user) {
        throw new Error("You need to be signed in to create a prompt.");
      }

      const promptId = await insertPrompt({
        userId: user.id,
        title: input.title,
        content: input.content,
        description: input.description,
        tags: input.tags,
        isPublic: input.isPublic,
      });

      return promptId;
    },
    [user],
  );

  const loadMore = useCallback(() => {
    if (!hasMore || loading) {
      return;
    }
    setPagination((current) =>
      current.key === queryKey
        ? { key: queryKey, page: current.page + 1 }
        : { key: queryKey, page: 1 },
    );
  }, [hasMore, loading, queryKey]);

  return {
    prompts,
    promptStates,
    loading: loading || votes.loading || bookmarks.loading,
    error: error ?? votes.error ?? bookmarks.error,
    hasMore,
    loadMore,
    setPromptVote,
    togglePromptBookmark,
    createPrompt,
    currentProfileAuthor:
      profile &&
      mapProfileToAuthor({
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
      }),
  };
}

export function usePrompt(promptId: string | null) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [row, setRow] = useState<PromptOverviewRow | null>(null);
  const [runs, setRuns] = useState<PromptState["runs"]>([]);
  const [loading, setLoading] = useState(Boolean(promptId));
  const [error, setError] = useState<string | null>(null);
  const promptIds = useMemo(() => (promptId ? [promptId] : []), [promptId]);
  const votes = useVotes(promptIds);
  const bookmarks = useBookmarks(promptIds);

  useEffect(() => {
    let active = true;

    async function loadPrompt() {
      if (!promptId) {
        setRow(null);
        setRuns([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const promptRow = await fetchPromptById(promptId);
        const runRows = user ? await fetchPromptRuns(promptId, user.id) : [];

        if (!active) {
          return;
        }

        setRow(promptRow);
        setRuns(
          runRows.map((run) =>
            mapPromptRunRow(
              run,
              profile
                ? mapProfileToAuthor({
                    id: profile.id,
                    username: profile.username,
                    display_name: profile.display_name,
                    avatar_url: profile.avatar_url,
                  })
                : {
                    id: run.user_id,
                    name: "You",
                    username: "you",
                    initials: "YO",
                    avatarColor: "#7c3aed",
                  },
            ),
          ),
        );
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load prompt.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPrompt();

    return () => {
      active = false;
    };
  }, [profile, promptId, user]);

  const state = useMemo(() => {
    if (!row) {
      return null;
    }

    return buildPromptState({
      prompt: row,
      voteValue: promptId ? votes.getVote(promptId) : 0,
      bookmarked: promptId ? bookmarks.isBookmarked(promptId) : false,
      runs,
    });
  }, [bookmarks, promptId, row, runs, votes]);

  const prompt = useMemo(() => {
    if (!row || !state) {
      return null;
    }

    return mapPromptOverviewRow(row, state, runs);
  }, [row, runs, state]);

  const setPromptVote = useCallback(
    async (nextValue: -1 | 0 | 1) => {
      if (!row || !promptId) {
        return;
      }

      const currentValue = votes.getVote(promptId);
      const resolvedValue = currentValue === nextValue ? 0 : nextValue;
      const delta = resolvedValue - currentValue;
      setRow((current) =>
        current
          ? ({
              ...current,
              vote_score: current.vote_score + delta,
            } as PromptOverviewRow)
          : current,
      );
      const persistedValue = await votes.setVote(promptId, resolvedValue);
      if (persistedValue !== resolvedValue) {
        setRow((current) =>
          current
            ? ({
                ...current,
                vote_score: current.vote_score - delta,
              } as PromptOverviewRow)
            : current,
        );
      }
    },
    [promptId, row, votes],
  );

  const togglePromptBookmark = useCallback(async () => {
    if (!promptId) {
      return;
    }

    await bookmarks.toggleBookmark(promptId);
  }, [bookmarks, promptId]);

  const runPrompt = useCallback(async () => {
    if (!prompt) {
      return;
    }

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    const model = DEFAULT_MODEL_OPTIONS[0];
    const runRow = await insertPromptRun({
      userId: user.id,
      promptId: prompt.id,
      model,
      output: buildRunPreview(prompt.title, prompt.body),
    });

    const author = profile
      ? mapProfileToAuthor({
          id: profile.id,
          username: profile.username,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
        })
      : {
          id: user.id,
          name: "You",
          username: "you",
          initials: "YO",
          avatarColor: "#7c3aed",
        };

    const nextRun = mapPromptRunRow(runRow, author);
    setRuns((current) => [nextRun, ...current]);
    setRow((current) =>
      current
        ? ({
            ...current,
            runs_count: current.runs_count + 1,
          } as PromptOverviewRow)
        : current,
    );
  }, [pathname, profile, prompt, router, user]);

  return {
    prompt,
    state,
    loading: loading || votes.loading || bookmarks.loading,
    error: error ?? votes.error ?? bookmarks.error,
    setPromptVote,
    togglePromptBookmark,
    runPrompt,
  };
}

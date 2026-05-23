"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  deleteBookmark,
  fetchUserBookmarks,
  insertBookmark,
} from "@/lib/services/prompt-service";
import { useAuth } from "@/hooks/useAuth";

export function useBookmarks(promptIds: string[]) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const promptIdsKey = useMemo(() => promptIds.join(","), [promptIds]);

  useEffect(() => {
    let active = true;

    async function loadBookmarks() {
      if (!user || promptIds.length === 0) {
        setBookmarkIds((current) =>
          current.size === 0 ? current : new Set<string>(),
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const rows = await fetchUserBookmarks(promptIds, user.id);

        if (!active) {
          return;
        }

        setBookmarkIds(new Set(rows.map((row) => row.prompt_id)));
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load bookmarks.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadBookmarks();

    return () => {
      active = false;
    };
  }, [promptIds, promptIdsKey, user]);

  const toggleBookmark = useCallback(
    async (promptId: string) => {
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return false;
      }

      const previous = new Set(bookmarkIds);
      const next = new Set(bookmarkIds);
      const isBookmarked = next.has(promptId);
      if (isBookmarked) {
        next.delete(promptId);
      } else {
        next.add(promptId);
      }
      setBookmarkIds(next);

      try {
        if (isBookmarked) {
          await deleteBookmark(user.id, promptId);
        } else {
          await insertBookmark(user.id, promptId);
        }

        return !isBookmarked;
      } catch (mutationError) {
        setBookmarkIds(previous);
        setError(
          mutationError instanceof Error
            ? mutationError.message
            : "Failed to update bookmark.",
        );
        return false;
      }
    },
    [bookmarkIds, pathname, router, user],
  );

  return useMemo(
    () => ({
      bookmarkIds,
      loading,
      error,
      toggleBookmark,
      isBookmarked: (promptId: string) => bookmarkIds.has(promptId),
    }),
    [bookmarkIds, error, loading, toggleBookmark],
  );
}

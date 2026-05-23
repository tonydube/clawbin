"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  deleteVote,
  fetchUserVotes,
  upsertVote,
} from "@/lib/services/prompt-service";
import { useAuth } from "@/hooks/useAuth";

export function useVotes(promptIds: string[]) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [voteMap, setVoteMap] = useState<Record<string, -1 | 0 | 1>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const promptIdsKey = useMemo(() => promptIds.join(","), [promptIds]);

  useEffect(() => {
    let active = true;

    async function loadVotes() {
      if (!user || promptIds.length === 0) {
        setVoteMap((current) =>
          Object.keys(current).length === 0 ? current : {},
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const rows = await fetchUserVotes(promptIds, user.id);
        if (!active) {
          return;
        }

        setVoteMap(
          rows.reduce<Record<string, -1 | 0 | 1>>((accumulator, row) => {
            accumulator[row.prompt_id] = row.value;
            return accumulator;
          }, {}),
        );
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load votes.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadVotes();

    return () => {
      active = false;
    };
  }, [promptIds, promptIdsKey, user]);

  const setVote = useCallback(
    async (promptId: string, nextValue: -1 | 0 | 1) => {
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return 0 as const;
      }

      const previousValue = voteMap[promptId] ?? 0;
      setVoteMap((current) => ({ ...current, [promptId]: nextValue }));

      try {
        if (nextValue === 0) {
          await deleteVote(user.id, promptId);
        } else {
          await upsertVote({ userId: user.id, promptId, value: nextValue });
        }

        return nextValue;
      } catch (mutationError) {
        setVoteMap((current) => ({ ...current, [promptId]: previousValue }));
        setError(
          mutationError instanceof Error
            ? mutationError.message
            : "Failed to update vote.",
        );
        return previousValue;
      }
    },
    [pathname, router, user, voteMap],
  );

  return useMemo(
    () => ({
      voteMap,
      loading,
      error,
      setVote,
      getVote: (promptId: string) => voteMap[promptId] ?? 0,
    }),
    [error, loading, setVote, voteMap],
  );
}

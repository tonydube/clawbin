"use client";

import { useEffect, useMemo, useState } from "react";
import { FALLBACK_TAGS } from "@/lib/constants";
import { fetchTagStats } from "@/lib/services/prompt-service";

export function useTagStats() {
  const [tags, setTags] = useState<Array<{ label: string; count: number }>>(
    FALLBACK_TAGS.map((tag) => ({ label: tag, count: 0 })),
  );

  useEffect(() => {
    let active = true;

    async function loadTags() {
      try {
        const rows = await fetchTagStats();
        if (!active || rows.length === 0) {
          return;
        }

        setTags(
          rows.map((row) => ({
            label: row.tag,
            count: Number(row.prompt_count),
          })),
        );
      } catch {
        // Fall back to the static tag list when Supabase is not configured yet.
      }
    }

    void loadTags();

    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => tags, [tags]);
}

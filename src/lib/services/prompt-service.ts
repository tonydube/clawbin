import { getSupabaseBrowserClient } from "@/lib/supabase/supabaseClient";
import { FEED_PAGE_SIZE } from "@/lib/constants";
import {
  Database,
  PromptOverviewRow,
  PromptRunRow,
  ProfileRow,
  TagStatRow,
} from "@/types/supabase";

type PromptInsert = Database["public"]["Tables"]["prompts"]["Insert"];
type PromptVoteInsert = Database["public"]["Tables"]["prompt_votes"]["Insert"];
type BookmarkInsert = Database["public"]["Tables"]["bookmarks"]["Insert"];
type PromptRunInsert = Database["public"]["Tables"]["prompt_runs"]["Insert"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

type SortBy = "trending" | "latest" | "top-rated";

interface FetchPromptsOptions {
  page?: number;
  pageSize?: number;
  sortBy?: SortBy;
  query?: string;
  tag?: string;
  username?: string;
  promptIds?: string[];
}

export async function fetchPrompts(options: FetchPromptsOptions = {}) {
  const supabase = getSupabaseBrowserClient();
  const page = options.page ?? 0;
  const pageSize = options.pageSize ?? FEED_PAGE_SIZE;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("prompt_overview").select("*");

  if (options.username) {
    query = query.eq("username", options.username);
  }

  if (options.tag) {
    query = query.contains("tags", [options.tag]);
  }

  if (options.promptIds && options.promptIds.length > 0) {
    query = query.in("id", options.promptIds);
  }

  const search = options.query?.trim().toLowerCase();
  if (search) {
    query = query.or(
      [
        `title.ilike.%${search}%`,
        `description.ilike.%${search}%`,
        `content.ilike.%${search}%`,
        `display_name.ilike.%${search}%`,
        `username.ilike.%${search}%`,
      ].join(","),
    );
  }

  switch (options.sortBy) {
    case "latest":
      query = query.order("created_at", { ascending: false });
      break;
    case "top-rated":
      query = query
        .order("rating", { ascending: false })
        .order("rating_count", { ascending: false })
        .order("created_at", { ascending: false });
      break;
    case "trending":
    default:
      query = query
        .order("trending_score", { ascending: false })
        .order("created_at", { ascending: false });
      break;
  }

  const { data, error } = await query.range(from, to);

  if (error) {
    throw error;
  }

  return data as PromptOverviewRow[];
}

export async function fetchPromptById(promptId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("prompt_overview")
    .select("*")
    .eq("id", promptId)
    .single();

  if (error) {
    throw error;
  }

  return data as PromptOverviewRow;
}

export async function fetchPromptRuns(promptId: string, userId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("prompt_runs")
    .select("*")
    .eq("prompt_id", promptId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return (data ?? []) as PromptRunRow[];
}

export async function fetchUserRuns(userId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("prompt_runs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return (data ?? []) as PromptRunRow[];
}

export async function fetchUserVotes(promptIds: string[], userId: string) {
  if (promptIds.length === 0) {
    return [] as Array<{ prompt_id: string; value: -1 | 1 }>;
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("prompt_votes")
    .select("prompt_id, value")
    .eq("user_id", userId)
    .in("prompt_id", promptIds);

  if (error) {
    throw error;
  }

  return (data ?? []) as Array<{ prompt_id: string; value: -1 | 1 }>;
}

export async function fetchUserBookmarks(promptIds: string[], userId: string) {
  if (promptIds.length === 0) {
    return [] as Array<{ prompt_id: string }>;
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select("prompt_id")
    .eq("user_id", userId)
    .in("prompt_id", promptIds);

  if (error) {
    throw error;
  }

  return (data ?? []) as Array<{ prompt_id: string }>;
}

export async function fetchBookmarkedPromptIds(
  page = 0,
  pageSize = FEED_PAGE_SIZE,
) {
  const supabase = getSupabaseBrowserClient();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("bookmarks")
    .select("prompt_id")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return ((data ?? []) as Array<{ prompt_id: string }>).map(
    (item) => item.prompt_id,
  );
}

export async function insertPrompt(input: {
  userId: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  isPublic: boolean;
}) {
  const supabase = getSupabaseBrowserClient();
  const payload: PromptInsert = {
    user_id: input.userId,
    title: input.title,
    content: input.content,
    description: input.description || null,
    tags: input.tags,
    is_public: input.isPublic,
  };

  const { data, error } = await supabase
    .from("prompts")
    .insert(payload as never)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return (data as { id: string }).id;
}

export async function upsertVote(args: {
  userId: string;
  promptId: string;
  value: -1 | 1;
}) {
  const supabase = getSupabaseBrowserClient();
  const payload: PromptVoteInsert = {
    user_id: args.userId,
    prompt_id: args.promptId,
    value: args.value,
  };

  const { error } = await supabase
    .from("prompt_votes")
    .upsert(payload as never, { onConflict: "user_id,prompt_id" });

  if (error) {
    throw error;
  }
}

export async function deleteVote(userId: string, promptId: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("prompt_votes")
    .delete()
    .eq("user_id", userId)
    .eq("prompt_id", promptId);

  if (error) {
    throw error;
  }
}

export async function insertBookmark(userId: string, promptId: string) {
  const supabase = getSupabaseBrowserClient();
  const payload: BookmarkInsert = { user_id: userId, prompt_id: promptId };

  const { error } = await supabase.from("bookmarks").insert(payload as never);

  if (error) {
    throw error;
  }
}

export async function deleteBookmark(userId: string, promptId: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("prompt_id", promptId);

  if (error) {
    throw error;
  }
}

export async function insertPromptRun(args: {
  userId: string;
  promptId: string;
  model: string;
  input?: string;
  output: string;
}) {
  const supabase = getSupabaseBrowserClient();
  const payload: PromptRunInsert = {
    user_id: args.userId,
    prompt_id: args.promptId,
    model: args.model,
    input: args.input ?? null,
    output: args.output,
  };

  const { data, error } = await supabase
    .from("prompt_runs")
    .insert(payload as never)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as PromptRunRow;
}

export async function fetchProfileByUsername(username: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error) {
    throw error;
  }

  return data as ProfileRow;
}

export async function updateProfile(args: {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
}) {
  const supabase = getSupabaseBrowserClient();
  const payload: ProfileUpdate = {
    username: args.username,
    display_name: args.displayName,
    bio: args.bio,
    avatar_url: args.avatarUrl || null,
  };

  const { error } = await supabase
    .from("profiles")
    .update(payload as never)
    .eq("id", args.id);

  if (error) {
    throw error;
  }
}

export async function fetchTagStats() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("tag_stats")
    .select("*")
    .limit(20);

  if (error) {
    throw error;
  }

  return (data ?? []) as TagStatRow[];
}

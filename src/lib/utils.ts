import { Author, Prompt, PromptRun, PromptState } from "@/types";
import { ProfileRow, PromptOverviewRow, PromptRunRow } from "@/types/supabase";

export function getAvatarColor(seed: string) {
  const palette = [
    "#7c3aed",
    "#0891b2",
    "#059669",
    "#db2777",
    "#d97706",
    "#0284c7",
    "#dc2626",
    "#4f46e5",
  ];

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = seed.charCodeAt(index) + ((hash << 5) - hash);
  }

  return palette[Math.abs(hash) % palette.length];
}

export function getInitials(name: string, username: string) {
  const source = name.trim() || username.trim();
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "CB";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function formatRelativeTime(value: string) {
  const date = new Date(value);
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absSeconds < 60) {
    return formatter.format(diffSeconds, "second");
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) {
    return formatter.format(diffDays, "day");
  }

  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) {
    return formatter.format(diffMonths, "month");
  }

  const diffYears = Math.round(diffMonths / 12);
  return formatter.format(diffYears, "year");
}

export function mapProfileToAuthor(
  profile: Pick<ProfileRow, "id" | "username" | "display_name" | "avatar_url">,
): Author {
  return {
    id: profile.id,
    name: profile.display_name,
    username: profile.username,
    initials: getInitials(profile.display_name, profile.username),
    avatarColor: getAvatarColor(profile.id),
    avatarUrl: profile.avatar_url,
  };
}

export function mapPromptRunRow(run: PromptRunRow, author: Author): PromptRun {
  return {
    id: run.id,
    promptId: run.prompt_id,
    runBy: author,
    model: run.model,
    input: run.input ?? "",
    output: run.output,
    runAt: formatRelativeTime(run.created_at),
  };
}

export function mapPromptOverviewRow(
  row: PromptOverviewRow,
  state: PromptState,
  runs: PromptRun[] = [],
): Prompt {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    body: row.content,
    tags: row.tags,
    author: mapProfileToAuthor({
      id: row.user_id,
      username: row.username,
      display_name: row.display_name,
      avatar_url: row.avatar_url,
    }),
    createdAt: formatRelativeTime(row.created_at),
    upvotes: row.vote_score,
    runsCount: row.runs_count,
    rating: row.rating,
    ratingCount: row.rating_count,
    isPublic: row.is_public,
    isTrending: row.trending_score > 0,
    isBookmarked: state.bookmarked,
    runs,
    commentCount: row.comments_count,
  };
}

export function buildPromptState(args: {
  prompt: Pick<PromptOverviewRow, "vote_score" | "runs_count">;
  voteValue?: -1 | 0 | 1;
  bookmarked?: boolean;
  runs?: PromptRun[];
}): PromptState {
  const voteValue = args.voteValue ?? 0;
  return {
    upvotes: args.prompt.vote_score,
    upvoted: voteValue === 1,
    bookmarked: args.bookmarked ?? false,
    runs: args.runs ?? [],
    runsCount: args.prompt.runs_count,
    voteValue,
  };
}

export function buildRunPreview(promptTitle: string, content: string) {
  const variables = content.match(/\{\{[^}]+\}\}/g) ?? [];
  const variableList = variables.length > 0 ? variables.join(", ") : "none";

  return [
    `Prompt run recorded for \"${promptTitle}\".`,
    "",
    "This MVP stores prompt activity, votes, bookmarks, and authored content in Supabase.",
    "Model execution is intentionally out of scope, so this run entry acts as a saved handoff.",
    "",
    `Detected template variables: ${variableList}.`,
    "Copy the prompt into your preferred model to execute it with real inputs.",
  ].join("\n");
}

export function sortByIds<T extends { id: string }>(items: T[], ids: string[]) {
  const order = new Map(ids.map((id, index) => [id, index]));
  return [...items].sort((left, right) => {
    return (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0);
  });
}

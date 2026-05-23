export type Tag =
  | "Marketing"
  | "Email"
  | "Copywriting"
  | "Education"
  | "Explainer"
  | "Learning"
  | "Coding"
  | "SQL"
  | "Database"
  | "LinkedIn"
  | "Social Media"
  | "Research"
  | "Productivity"
  | "Data Analysis"
  | "Writing"
  | "SEO"
  | "Sales"
  | "Design"
  | "Engineering"
  | "AI"
  | string;

export type Model =
  | "GPT-4o"
  | "GPT-4o Mini"
  | "Claude 3.5"
  | "Claude 3 Opus"
  | "Gemini 1.5 Pro"
  | "Mistral Large";

export interface Author {
  id: string;
  name: string;
  avatarColor: string;
  initials: string;
  username: string;
  avatarUrl?: string | null;
}

export interface PromptRun {
  id: string;
  promptId: string;
  runBy: Author;
  model: Model | string;
  input: string;
  output: string;
  runAt: string; // relative date string
  tokensUsed?: number;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  body: string; // the actual prompt text
  tags: Tag[];
  author: Author;
  createdAt: string; // relative date string
  upvotes: number;
  runsCount: number;
  rating: number;
  ratingCount: number;
  isPublic: boolean;
  isTrending?: boolean;
  isBookmarked?: boolean;
  runs: PromptRun[];
  commentCount?: number;
}

// Per-prompt mutable UI state (upvote, bookmark, etc.)
export interface PromptState {
  upvotes: number;
  upvoted: boolean;
  bookmarked: boolean;
  runs: PromptRun[];
  runsCount: number;
  voteValue: -1 | 0 | 1;
}

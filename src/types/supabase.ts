export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          bio: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      prompts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          description: string | null;
          tags: string[];
          is_public: boolean;
          upvote_count: number;
          downvote_count: number;
          comments_count: number;
          runs_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          description?: string | null;
          tags?: string[];
          is_public?: boolean;
          upvote_count?: number;
          downvote_count?: number;
          comments_count?: number;
          runs_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          description?: string | null;
          tags?: string[];
          is_public?: boolean;
          upvote_count?: number;
          downvote_count?: number;
          comments_count?: number;
          runs_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      prompt_votes: {
        Row: {
          id: string;
          user_id: string;
          prompt_id: string;
          value: -1 | 1;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt_id: string;
          value: -1 | 1;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          value?: -1 | 1;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          prompt_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          prompt_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      prompt_runs: {
        Row: {
          id: string;
          user_id: string;
          prompt_id: string;
          model: string;
          input: string | null;
          output: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt_id: string;
          model: string;
          input?: string | null;
          output: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: {
      prompt_overview: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          description: string | null;
          tags: string[];
          is_public: boolean;
          upvote_count: number;
          downvote_count: number;
          comments_count: number;
          runs_count: number;
          created_at: string;
          updated_at: string;
          vote_score: number;
          rating_count: number;
          rating: number;
          trending_score: number;
          username: string;
          display_name: string;
          avatar_url: string | null;
          bio: string;
        };
      };
      tag_stats: {
        Row: {
          tag: string;
          prompt_count: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type PromptRow = Database["public"]["Tables"]["prompts"]["Row"];
export type PromptOverviewRow =
  Database["public"]["Views"]["prompt_overview"]["Row"];
export type PromptVoteRow = Database["public"]["Tables"]["prompt_votes"]["Row"];
export type BookmarkRow = Database["public"]["Tables"]["bookmarks"]["Row"];
export type PromptRunRow = Database["public"]["Tables"]["prompt_runs"]["Row"];
export type TagStatRow = Database["public"]["Views"]["tag_stats"]["Row"];

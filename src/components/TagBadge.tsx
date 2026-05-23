"use client";
import { Tag } from "@/types";
import { useTheme } from "@/context/ThemeContext";

const TAG_COLORS_DARK: Record<string, string> = {
  Marketing: "bg-pink-950/60 text-pink-300 border border-pink-900/50",
  Email: "bg-violet-950/60 text-violet-300 border border-violet-900/50",
  Copywriting: "bg-purple-950/60 text-purple-300 border border-purple-900/50",
  Education: "bg-blue-950/60 text-blue-300 border border-blue-900/50",
  Explainer: "bg-sky-950/60 text-sky-300 border border-sky-900/50",
  Learning: "bg-cyan-950/60 text-cyan-300 border border-cyan-900/50",
  Coding: "bg-green-950/60 text-green-300 border border-green-900/50",
  SQL: "bg-emerald-950/60 text-emerald-300 border border-emerald-900/50",
  Database: "bg-teal-950/60 text-teal-300 border border-teal-900/50",
  LinkedIn: "bg-indigo-950/60 text-indigo-300 border border-indigo-900/50",
  "Social Media": "bg-blue-950/60 text-blue-300 border border-blue-900/50",
  Research: "bg-amber-950/60 text-amber-300 border border-amber-900/50",
  Productivity: "bg-orange-950/60 text-orange-300 border border-orange-900/50",
  "Data Analysis":
    "bg-yellow-950/60 text-yellow-300 border border-yellow-900/50",
  Writing: "bg-rose-950/60 text-rose-300 border border-rose-900/50",
  SEO: "bg-lime-950/60 text-lime-300 border border-lime-900/50",
  Sales: "bg-red-950/60 text-red-300 border border-red-900/50",
  Design: "bg-fuchsia-950/60 text-fuchsia-300 border border-fuchsia-900/50",
  Engineering: "bg-slate-800/70 text-slate-300 border border-slate-700/50",
  AI: "bg-violet-950/60 text-violet-300 border border-violet-900/50",
};

const TAG_COLORS_LIGHT: Record<string, string> = {
  Marketing: "bg-pink-50 text-pink-700 border border-pink-200",
  Email: "bg-violet-50 text-violet-700 border border-violet-200",
  Copywriting: "bg-purple-50 text-purple-700 border border-purple-200",
  Education: "bg-blue-50 text-blue-700 border border-blue-200",
  Explainer: "bg-sky-50 text-sky-700 border border-sky-200",
  Learning: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  Coding: "bg-green-50 text-green-700 border border-green-200",
  SQL: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Database: "bg-teal-50 text-teal-700 border border-teal-200",
  LinkedIn: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  "Social Media": "bg-blue-50 text-blue-700 border border-blue-200",
  Research: "bg-amber-50 text-amber-700 border border-amber-200",
  Productivity: "bg-orange-50 text-orange-700 border border-orange-200",
  "Data Analysis": "bg-yellow-50 text-yellow-700 border border-yellow-200",
  Writing: "bg-rose-50 text-rose-700 border border-rose-200",
  SEO: "bg-lime-50 text-lime-700 border border-lime-200",
  Sales: "bg-red-50 text-red-700 border border-red-200",
  Design: "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200",
  Engineering: "bg-slate-100 text-slate-700 border border-slate-300",
  AI: "bg-violet-50 text-violet-700 border border-violet-200",
};

const DEFAULT_DARK = "bg-zinc-800/70 text-zinc-300 border border-zinc-700/50";
const DEFAULT_LIGHT = "bg-zinc-100 text-zinc-700 border border-zinc-300";

interface TagBadgeProps {
  tag: Tag;
  size?: "sm" | "md";
}

export default function TagBadge({ tag, size = "sm" }: TagBadgeProps) {
  const { theme } = useTheme();
  const map = theme === "light" ? TAG_COLORS_LIGHT : TAG_COLORS_DARK;
  const defaultColor = theme === "light" ? DEFAULT_LIGHT : DEFAULT_DARK;
  const color = map[tag] ?? defaultColor;
  return (
    <span
      className={`inline-flex items-center rounded-md font-medium ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      } ${color}`}
    >
      {tag}
    </span>
  );
}

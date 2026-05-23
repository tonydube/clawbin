"use client";
import { Model } from "@/types";
import { useTheme } from "@/context/ThemeContext";

const MODEL_STYLES_DARK: Record<Model, string> = {
  "GPT-4o": "bg-emerald-950/60 text-emerald-400 border border-emerald-900/40",
  "GPT-4o Mini":
    "bg-emerald-950/40 text-emerald-500 border border-emerald-900/30",
  "Claude 3.5": "bg-amber-950/60 text-amber-400 border border-amber-900/40",
  "Claude 3 Opus": "bg-amber-950/60 text-amber-300 border border-amber-900/40",
  "Gemini 1.5 Pro": "bg-blue-950/60 text-blue-400 border border-blue-900/40",
  "Mistral Large":
    "bg-purple-950/60 text-purple-400 border border-purple-900/40",
};

const MODEL_STYLES_LIGHT: Record<Model, string> = {
  "GPT-4o": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "GPT-4o Mini": "bg-emerald-50 text-emerald-600 border border-emerald-200",
  "Claude 3.5": "bg-amber-50 text-amber-700 border border-amber-200",
  "Claude 3 Opus": "bg-amber-50 text-amber-700 border border-amber-200",
  "Gemini 1.5 Pro": "bg-blue-50 text-blue-700 border border-blue-200",
  "Mistral Large": "bg-purple-50 text-purple-700 border border-purple-200",
};

export default function ModelBadge({ model }: { model: Model | string }) {
  const { theme } = useTheme();
  const map = (
    theme === "light" ? MODEL_STYLES_LIGHT : MODEL_STYLES_DARK
  ) as Record<string, string>;
  const fallback =
    theme === "light"
      ? "bg-zinc-100 text-zinc-600 border border-zinc-300"
      : "bg-zinc-800/60 text-zinc-400 border border-zinc-700/40";
  const style = map[model] ?? fallback;
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-mono font-medium ${style}`}
    >
      {model}
    </span>
  );
}

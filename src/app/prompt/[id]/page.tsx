"use client";
import { notFound } from "next/navigation";
import { use } from "react";
import { useRouter } from "next/navigation";
import PromptDetail from "@/components/PromptDetail";
import { usePrompt } from "@/hooks/usePrompts";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PromptPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const {
    prompt,
    state,
    loading,
    setPromptVote,
    togglePromptBookmark,
    runPrompt,
  } = usePrompt(id);

  if (!loading && (!prompt || !state)) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      {prompt && state ? (
        <PromptDetail
          prompt={prompt}
          state={state}
          onUpvote={() => void setPromptVote(1)}
          onBookmark={() => void togglePromptBookmark()}
          onRun={() => void runPrompt()}
          onBack={() => router.back()}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-text-secondary">
          Loading prompt…
        </div>
      )}
    </div>
  );
}

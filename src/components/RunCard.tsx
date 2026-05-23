"use client";
import { Copy, Check, ChevronDown } from "lucide-react";
import { PromptRun } from "@/types";
import Avatar from "./Avatar";
import ModelBadge from "./ModelBadge";
import { useState } from "react";

// How many lines to show when collapsed
const COLLAPSED_LINES = 5;

interface RunCardProps {
  run: PromptRun;
}

export default function RunCard({ run }: RunCardProps) {
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [outputExpanded, setOutputExpanded] = useState(false);

  const outputLines = run.output.split("\n");
  const isLong = outputLines.length > COLLAPSED_LINES;
  const visibleOutput = outputExpanded
    ? run.output
    : outputLines.slice(0, COLLAPSED_LINES).join("\n");

  const copyOutput = async () => {
    await navigator.clipboard.writeText(run.output);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 1800);
  };

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-elevated overflow-hidden group/card">
      {/* ── Run header ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle bg-bg-surface/60">
        <div className="flex items-center gap-2">
          <Avatar author={run.runBy} size="xs" />
          <span className="text-xs text-text-secondary">
            <span className="font-medium text-text-primary">
              {run.runBy.name}
            </span>
            <span className="text-text-muted"> · {run.runAt}</span>
          </span>
        </div>
        <ModelBadge model={run.model} />
      </div>

      {/* ── Input ── */}
      {run.input && (
        <div className="px-4 pt-3 pb-2.5">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1.5">
            Input
          </p>
          <div className="rounded-lg bg-bg-surface border border-border-subtle px-3 py-2.5">
            <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap leading-relaxed">
              {run.input}
            </pre>
          </div>
        </div>
      )}

      {/* ── Output ── */}
      <div className="px-4 pt-2 pb-3">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">
            Output
          </p>
          <button
            onClick={copyOutput}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-text-muted hover:text-text-secondary hover:bg-bg-hover transition-all"
          >
            {copiedOutput ? (
              <>
                <Check size={11} className="text-green-400" />
                <span className="text-green-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Output text + optional fade */}
        <div className="relative">
          <div
            className={[
              "rounded-lg bg-bg-surface border border-border-subtle px-3 py-2.5 overflow-hidden transition-all",
              !outputExpanded && isLong ? "max-h-[108px]" : "",
            ].join(" ")}
          >
            <pre className="text-xs text-text-primary font-mono whitespace-pre-wrap leading-relaxed">
              {visibleOutput}
            </pre>
          </div>

          {/* Gradient fade when collapsed */}
          {!outputExpanded && isLong && (
            <div className="absolute bottom-0 inset-x-0 h-10 rounded-b-lg bg-gradient-to-t from-bg-elevated to-transparent pointer-events-none" />
          )}
        </div>

        {/* Expand / collapse toggle */}
        {isLong && (
          <button
            onClick={() => setOutputExpanded((v) => !v)}
            className="mt-2 flex items-center gap-1 text-[11px] font-medium text-accent-light hover:text-violet-300 transition-colors"
          >
            <ChevronDown
              size={13}
              className={[
                "transition-transform",
                outputExpanded ? "rotate-180" : "",
              ].join(" ")}
            />
            {outputExpanded
              ? "Collapse output"
              : `Show full output · ${outputLines.length} lines`}
          </button>
        )}
      </div>
    </div>
  );
}

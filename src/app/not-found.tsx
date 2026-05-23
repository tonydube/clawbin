"use client";
import { useRouter } from "next/navigation";
import { Compass, AlertTriangle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border-default flex items-center justify-center mb-6">
        <AlertTriangle size={26} className="text-text-muted" />
      </div>

      <p className="text-[11px] font-semibold text-accent-light uppercase tracking-widest mb-3">
        404
      </p>

      <h1 className="text-2xl font-bold text-text-primary mb-3 tracking-tight">
        Page not found
      </h1>
      <p className="text-sm text-text-secondary max-w-xs leading-relaxed mb-8">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        removed.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-all active:scale-95 shadow-[0_0_16px_rgba(124,58,237,0.3)] hover:shadow-[0_0_22px_rgba(124,58,237,0.45)]"
        >
          <Compass size={15} />
          Explore Prompts
        </button>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-elevated border border-border-default text-sm font-medium text-text-secondary hover:text-text-primary hover:border-border-strong transition-all"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

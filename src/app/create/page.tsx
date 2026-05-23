"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Check, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { DEFAULT_MODEL_OPTIONS } from "@/lib/constants";
import { useTagStats } from "@/hooks/useTagStats";
import { useAuth } from "@/hooks/useAuth";
import { insertPrompt } from "@/lib/services/prompt-service";

const MODEL_OPTIONS = DEFAULT_MODEL_OPTIONS;

interface FormErrors {
  title?: string;
  body?: string;
  tags?: string;
  submit?: string;
}

export default function CreatePromptPage() {
  const router = useRouter();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const tags = useTagStats();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("GPT-4o");
  const [isPublic, setIsPublic] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Auto-resize the prompt body textarea
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 160)}px`;
  }, [body]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag].slice(0, 5),
    );
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    else if (title.length < 5)
      newErrors.title = "Title needs at least 5 characters.";
    if (!body.trim()) newErrors.body = "Prompt text is required.";
    else if (body.trim().length < 20)
      newErrors.body = "Prompt must be at least 20 characters.";
    if (selectedTags.length === 0) newErrors.tags = "Pick at least one tag.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (!user) {
      router.push("/login?next=%2Fcreate");
      return;
    }

    setSubmitted(true);
    setErrors({});

    try {
      const promptId = await insertPrompt({
        userId: user.id,
        title: title.trim(),
        content: body.trim(),
        description: description.trim(),
        tags: selectedTags,
        isPublic,
      });

      router.push(`/prompt/${promptId}`);
    } catch (submitError) {
      setSubmitted(false);
      setErrors({
        submit:
          submitError instanceof Error
            ? submitError.message
            : "Unable to publish prompt.",
      });
    }
  }

  const charCount = body.length;
  const lineCount = body.split("\n").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-border-subtle bg-bg-surface/80 backdrop-blur-sm">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-text-primary">
            Create Prompt
          </h1>
          <p className="text-xs text-text-muted hidden sm:block">
            Share a great prompt with the community
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitted}
          className={clsx(
            "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all",
            submitted
              ? "bg-green-600 cursor-not-allowed"
              : "bg-accent hover:bg-accent-hover active:scale-95 shadow-[0_0_14px_rgba(124,58,237,0.3)]",
          )}
        >
          {submitted ? (
            <>
              <Check size={14} />
              Published!
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Publish
            </>
          )}
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6"
        >
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title)
                  setErrors((p) => ({ ...p, title: undefined }));
              }}
              placeholder="e.g. Write a high-converting sales email 🔥"
              maxLength={120}
              className={clsx(
                "w-full h-11 px-4 rounded-xl bg-bg-elevated border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:bg-bg-hover transition-all",
                errors.title
                  ? "border-red-500/60 focus:border-red-500/80"
                  : "border-border-subtle focus:border-accent/50",
              )}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.title ? (
                <p className="text-xs text-red-400">{errors.title}</p>
              ) : (
                <span />
              )}
              <p className="text-[11px] text-text-muted ml-auto">
                {title.length}/120
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Short Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="One sentence about what this prompt does..."
              maxLength={200}
              className="w-full h-11 px-4 rounded-xl bg-bg-elevated border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:bg-bg-hover transition-all"
            />
            <p className="text-[11px] text-text-muted mt-1 text-right">
              {description.length}/200
            </p>
          </div>

          {/* Prompt body */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Prompt Text <span className="text-red-400">*</span>
              </label>
              <span className="text-[11px] text-text-muted">
                {lineCount} line{lineCount !== 1 ? "s" : ""} · {charCount} chars
              </span>
            </div>
            <div
              className={clsx(
                "rounded-xl border overflow-hidden",
                errors.body ? "border-red-500/60" : "border-border-subtle",
              )}
            >
              {/* Editor chrome */}
              <div className="flex items-center gap-2 px-4 py-2 bg-bg-elevated/60 border-b border-border-subtle">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
                <span className="ml-2 text-[11px] text-text-muted font-mono">
                  prompt.txt
                </span>
                <span className="ml-auto text-[11px] text-text-muted">
                  Use{" "}
                  <code className="text-accent-light">{"{{variable}}"}</code>{" "}
                  for fill-in-the-blank fields
                </span>
              </div>
              <textarea
                ref={bodyRef}
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  if (errors.body)
                    setErrors((p) => ({ ...p, body: undefined }));
                }}
                placeholder={`You are an expert copywriter.\n\nWrite a {{tone}} email for {{product}} that:\n- Highlights the key benefits\n- Builds curiosity\n- Ends with a clear CTA`}
                className="w-full px-4 py-3 bg-bg-surface text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none resize-none leading-relaxed min-h-[160px]"
                style={{ overflow: "hidden" }}
              />
            </div>
            {errors.body && (
              <p className="text-xs text-red-400 mt-1">{errors.body}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Tags <span className="text-red-400">*</span>
              <span className="ml-2 normal-case font-normal text-text-muted">
                (up to 5)
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => {
                const active = selectedTags.includes(t.label);
                return (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => {
                      toggleTag(t.label);
                      if (errors.tags)
                        setErrors((p) => ({ ...p, tags: undefined }));
                    }}
                    className={clsx(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      active
                        ? "bg-accent/20 text-accent-light border-accent/40"
                        : "bg-bg-elevated text-text-secondary border-border-subtle hover:border-border-default hover:text-text-primary",
                    )}
                  >
                    {active ? <Check size={10} /> : <Plus size={10} />}
                    {t.label}
                  </button>
                );
              })}
            </div>
            {errors.tags && (
              <p className="text-xs text-red-400 mt-2">{errors.tags}</p>
            )}
            {errors.submit && (
              <p className="text-xs text-red-400 mt-2">{errors.submit}</p>
            )}
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-xs text-text-muted">Selected:</span>
                {selectedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/15 text-accent-light border border-accent/30 text-xs font-medium hover:bg-accent/25 transition-colors"
                  >
                    {tag}
                    <X size={10} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Model + Visibility row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Best Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-bg-elevated border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent/50 cursor-pointer appearance-none"
              >
                {MODEL_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Visibility
              </label>
              <div className="flex rounded-xl bg-bg-elevated border border-border-subtle p-1">
                {[
                  { value: true, label: "Public" },
                  { value: false, label: "Private" },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setIsPublic(opt.value)}
                    className={clsx(
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                      isPublic === opt.value
                        ? "bg-bg-active text-text-primary"
                        : "text-text-secondary hover:text-text-primary",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit — mobile bottom button */}
          <div className="lg:hidden pb-4">
            <button
              type="submit"
              disabled={submitted}
              className={clsx(
                "w-full h-12 rounded-xl text-sm font-semibold text-white transition-all",
                submitted
                  ? "bg-green-600"
                  : "bg-accent hover:bg-accent-hover active:scale-[0.98] shadow-[0_0_18px_rgba(124,58,237,0.3)]",
              )}
            >
              {submitted ? "Published!" : "Publish Prompt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

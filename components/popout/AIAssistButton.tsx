"use client";

import { useCallback, useRef, useState } from "react";
import { Sparkles, Check, RefreshCw, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface AIAssistButtonProps {
  /** System prompt context passed to the API (e.g. "You are helping plan a wedding venue selection...") */
  contextPrompt: string;
  /** Entity ID for tracking */
  entityId: string;
  /** Called when user accepts generated content */
  onAccept: (content: string) => void;
  className?: string;
}

// ── Loading dots ─────────────────────────────────────────────────────────────

function PulsingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-gold"
          style={{
            animation: "pulse-dot 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes pulse-dot {
          0%,
          80%,
          100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function AIAssistButton({
  contextPrompt,
  entityId,
  onAccept,
  className,
}: AIAssistButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  const generate = useCallback(async () => {
    const prompt = userPrompt.trim();
    if (!prompt) return;

    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          context: contextPrompt,
          entity_type: "general",
          entity_id: entityId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Generation failed");
      }

      const data = await res.json();
      setResult(data.content);
    } catch {
      setResult("Unable to generate content right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userPrompt, contextPrompt, entityId]);

  const handleAccept = useCallback(() => {
    if (isEditing) {
      onAccept(editValue);
    } else if (result) {
      onAccept(result);
    }
    setIsOpen(false);
    setResult(null);
    setUserPrompt("");
    setIsEditing(false);
  }, [result, editValue, isEditing, onAccept]);

  const handleRegenerate = useCallback(() => {
    setIsEditing(false);
    generate();
  }, [generate]);

  const handleEdit = useCallback(() => {
    setEditValue(result ?? "");
    setIsEditing(true);
  }, [result]);

  const close = useCallback(() => {
    setIsOpen(false);
    setResult(null);
    setUserPrompt("");
    setIsEditing(false);
    setIsLoading(false);
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
          "border border-gold/20 text-gold hover:bg-gold-pale/50 hover:border-gold/40",
          isOpen && "bg-gold-pale/50 border-gold/40",
        )}
        aria-label="AI Assist"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="font-serif">Assist</span>
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className={cn(
            "absolute right-0 top-full mt-2 z-50",
            "w-80 rounded-lg border border-border bg-card shadow-lg",
            "popover-enter",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span className="font-serif text-xs font-semibold text-ink-soft">
                AI Assist
              </span>
            </div>
            <button
              type="button"
              onClick={close}
              className="text-ink-faint hover:text-ink-muted transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-3 space-y-3">
            {/* Prompt input */}
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="What would you like help with?"
              rows={3}
              className={cn(
                "w-full rounded-md border border-border bg-ivory-warm/50 px-3 py-2",
                "text-sm text-ink placeholder:text-ink-faint",
                "focus:outline-none focus:border-gold/40 transition-colors",
                "resize-none font-sans leading-relaxed",
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  generate();
                }
              }}
            />

            {/* Generate button */}
            {!result && !isLoading && (
              <button
                type="button"
                onClick={generate}
                disabled={!userPrompt.trim()}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-xs font-medium transition-colors",
                  userPrompt.trim()
                    ? "bg-gold text-ivory hover:bg-gold-light"
                    : "bg-ivory-deep text-ink-faint cursor-not-allowed",
                )}
              >
                Generate
              </button>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <PulsingDots />
              </div>
            )}

            {/* Result */}
            {result && !isLoading && (
              <div className="space-y-2">
                {isEditing ? (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={5}
                    className={cn(
                      "w-full rounded-md border border-gold/30 bg-ivory-warm/50 px-3 py-2",
                      "text-sm text-ink focus:outline-none focus:border-gold/40",
                      "resize-none font-sans leading-relaxed",
                    )}
                  />
                ) : (
                  <div className="rounded-md border border-gold-pale bg-gold-pale/20 px-3 py-2">
                    <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">
                      {result}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAccept}
                    className="flex items-center gap-1 rounded-md bg-gold text-ivory px-2.5 py-1.5 text-xs font-medium hover:bg-gold-light transition-colors"
                  >
                    <Check className="h-3 w-3" />
                    Use this
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs text-ink-muted hover:text-ink-soft hover:border-ink-faint transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate
                  </button>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs text-ink-muted hover:text-ink-soft hover:border-ink-faint transition-colors"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

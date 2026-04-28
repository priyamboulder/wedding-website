"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Link as LinkIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberRole } from "@/types/checklist";

const ROLES: MemberRole[] = ["Owner", "Planner", "Family", "Vendor", "Viewer"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteModal({
  open,
  coupleNames,
  inviteLink,
  onClose,
  onSend,
}: {
  open: boolean;
  coupleNames: { person1: string; person2: string };
  inviteLink: string;
  onClose: () => void;
  onSend: (emails: string[], role: MemberRole, message: string) => void;
}) {
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [role, setRole] = useState<MemberRole>("Family");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setEmails([]);
      setDraft("");
      setRole("Family");
      setMessage("");
      setCopied(false);
      setError(null);
    } else {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const commitDraft = useCallback(() => {
    const trimmed = draft.trim().replace(/,$/, "").trim();
    if (!trimmed) return true;
    if (!EMAIL_REGEX.test(trimmed)) {
      setError(`"${trimmed}" is not a valid email`);
      return false;
    }
    if (emails.some((e) => e.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return true;
    }
    setEmails((prev) => [...prev, trimmed]);
    setDraft("");
    setError(null);
    return true;
  }, [draft, emails]);

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && draft === "" && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!/[,\s]/.test(text)) return;
    e.preventDefault();
    const parts = text
      .split(/[,\s]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    const valid: string[] = [];
    const invalid: string[] = [];
    for (const p of parts) {
      if (EMAIL_REGEX.test(p)) valid.push(p);
      else invalid.push(p);
    }
    setEmails((prev) => {
      const existing = new Set(prev.map((e) => e.toLowerCase()));
      const fresh = valid.filter((v) => !existing.has(v.toLowerCase()));
      return [...prev, ...fresh];
    });
    setError(invalid.length ? `Ignored: ${invalid.join(", ")}` : null);
  };

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const handleSend = () => {
    if (draft.trim() && !commitDraft()) return;
    const finalEmails =
      draft.trim() && EMAIL_REGEX.test(draft.trim())
        ? [...emails, draft.trim()]
        : emails;
    if (finalEmails.length === 0) {
      setError("Add at least one email to send invitations");
      return;
    }
    onSend(finalEmails, role, message.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Invite to ${coupleNames.person1} and ${coupleNames.person2}'s planning space`}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border px-7 py-5">
              <div>
                <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  Invite
                </p>
                <h2 className="font-serif text-xl font-medium leading-tight tracking-tight text-ink">
                  Invite to {coupleNames.person1} &amp; {coupleNames.person2}'s
                  planning space
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink-muted"
                aria-label="Close invite dialog"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 px-7 py-6">
              {/* Emails */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                  Emails
                </label>
                <div
                  className={cn(
                    "flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-ivory px-2.5 py-2 transition-colors",
                    "focus-within:border-gold/50 focus-within:ring-1 focus-within:ring-gold/20",
                  )}
                  onClick={() => inputRef.current?.focus()}
                >
                  {emails.map((email) => (
                    <span
                      key={email}
                      className="flex items-center gap-1 rounded-full border border-gold/20 bg-gold-pale/40 px-2 py-0.5 text-[12px] text-ink-soft"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeEmail(email);
                        }}
                        className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-gold/15 hover:text-ink-muted"
                        aria-label={`Remove ${email}`}
                      >
                        <X size={10} strokeWidth={2} />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={inputRef}
                    type="text"
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      if (error) setError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                      if (draft.trim()) commitDraft();
                    }}
                    onPaste={handlePaste}
                    placeholder={
                      emails.length === 0
                        ? "guest@example.com, another@example.com"
                        : ""
                    }
                    className="flex-1 min-w-[140px] bg-transparent text-[13px] text-ink placeholder:text-ink-faint/60 outline-none"
                    aria-label="Add email address"
                  />
                </div>
                {error && (
                  <p className="text-[11px] text-rose">{error}</p>
                )}
                <p className="text-[11px] text-ink-faint italic">
                  Separate with commas or press Enter
                </p>
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as MemberRole)}
                  className="w-full cursor-pointer rounded-md border border-border bg-ivory px-3 py-2 text-[13px] text-ink outline-none transition-colors hover:border-ink-faint/40 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                  Personal message <span className="italic normal-case tracking-normal text-ink-faint/70">— optional</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Add a note so they know what they're joining…"
                  className="w-full resize-none rounded-md border border-border bg-ivory px-3 py-2.5 text-[13px] leading-relaxed text-ink-soft outline-none placeholder:text-ink-faint/50 transition-colors hover:border-ink-faint/40 focus-visible:border-gold/50 focus-visible:ring-1 focus-visible:ring-gold/20"
                />
              </div>

              {/* Share link */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                  Or share a link
                </label>
                <div className="flex items-center gap-2 rounded-md border border-border bg-ivory-warm/50 px-3 py-2">
                  <LinkIcon
                    size={13}
                    strokeWidth={1.5}
                    className="shrink-0 text-ink-faint"
                  />
                  <span className="flex-1 truncate font-mono text-[12px] text-ink-muted">
                    {inviteLink}
                  </span>
                  <button
                    onClick={handleCopy}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                      copied
                        ? "text-sage"
                        : "text-ink-muted hover:bg-white hover:text-ink",
                    )}
                    aria-label="Copy invite link"
                  >
                    {copied ? (
                      <>
                        <Check size={11} strokeWidth={2} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={11} strokeWidth={1.5} /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-border bg-ivory/50 px-7 py-4">
              <button
                onClick={onClose}
                className="rounded-md px-4 py-2 text-[13px] font-medium text-ink-muted transition-colors hover:bg-ivory-warm hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="rounded-md bg-gold px-4 py-2 text-[13px] font-medium text-white shadow-[0_1px_2px_rgba(184,134,11,0.2)] transition-all hover:bg-gold-light hover:shadow-[0_2px_6px_rgba(184,134,11,0.25)]"
              >
                Send invitations
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

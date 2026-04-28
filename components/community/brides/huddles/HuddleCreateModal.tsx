"use client";

// ── Huddle create modal ─────────────────────────────────────────────────────
// Right-side slide-over to spin up an instant or scheduled huddle. Deliberately
// terser than the meetup flow — huddles are low-friction, so the whole thing
// is: title, access, topics, (optional) date/time. Tapping "go live" creates
// the huddle and drops the host straight into the lobby via onCreated.

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Mic, Sparkles, Timer, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Huddle, HuddleType } from "@/types/community";
import { INTEREST_TAGS } from "@/lib/community/seed";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunityHuddlesStore } from "@/stores/community-huddles-store";

type DraftState = {
  title: string;
  description: string;
  access: "anyone" | "connections";
  topic_tags: string[];
  huddle_type: HuddleType;
  scheduled_date: string; // yyyy-mm-dd
  scheduled_time: string; // HH:MM
};

function defaultDraft(): DraftState {
  const later = new Date();
  later.setHours(later.getHours() + 24, 0, 0, 0);
  return {
    title: "",
    description: "",
    access: "anyone",
    topic_tags: [],
    huddle_type: "instant",
    scheduled_date: later.toISOString().slice(0, 10),
    scheduled_time: "19:00",
  };
}

export function HuddleCreateModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (h: Huddle) => void;
}) {
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const me = useMemo(
    () => (myProfileId ? profiles.find((p) => p.id === myProfileId) : undefined),
    [profiles, myProfileId],
  );
  const createHuddle = useCommunityHuddlesStore((s) => s.createHuddle);

  const [draft, setDraft] = useState<DraftState>(defaultDraft);

  const canSubmit = draft.title.trim().length > 0 && !!myProfileId;

  const reset = () => setDraft(defaultDraft());

  const submit = () => {
    if (!canSubmit || !myProfileId) return;
    const scheduled_at =
      draft.huddle_type === "scheduled"
        ? new Date(
            `${draft.scheduled_date}T${draft.scheduled_time}:00`,
          ).toISOString()
        : undefined;

    const huddle = createHuddle({
      host_id: myProfileId,
      title: draft.title.trim(),
      description: draft.description.trim() || undefined,
      topic_tags: draft.topic_tags,
      huddle_type: draft.huddle_type,
      scheduled_at,
      is_open: draft.access === "anyone",
      city: me?.hometown?.split(",")[0]?.trim(),
    });

    reset();
    onCreated(huddle);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
          />
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col bg-white shadow-xl"
            role="dialog"
            aria-label="Start a huddle"
          >
            <div className="flex items-center justify-between border-b border-gold/10 px-6 py-3.5">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                — start a huddle —
              </p>
              <button
                type="button"
                onClick={onClose}
                className="text-ink-muted transition-colors hover:text-ink"
                aria-label="Close"
              >
                <X size={18} strokeWidth={1.6} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2">
                <TypeButton
                  active={draft.huddle_type === "instant"}
                  onClick={() =>
                    setDraft((d) => ({ ...d, huddle_type: "instant" }))
                  }
                  icon={<Mic size={14} strokeWidth={1.8} />}
                  label="start now"
                  helper="go live in seconds"
                />
                <TypeButton
                  active={draft.huddle_type === "scheduled"}
                  onClick={() =>
                    setDraft((d) => ({ ...d, huddle_type: "scheduled" }))
                  }
                  icon={<Timer size={14} strokeWidth={1.8} />}
                  label="schedule"
                  helper="pick a date + time"
                />
              </div>

              {/* Title */}
              <div className="mt-6">
                <label className="text-[12px] font-medium text-ink">
                  name it
                </label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, title: e.target.value }))
                  }
                  placeholder="vendor recs, seating chart panic, anything"
                  className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="mt-5">
                <label className="text-[12px] font-medium text-ink">
                  what's this about?{" "}
                  <span className="text-ink-faint">optional</span>
                </label>
                <textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, description: e.target.value }))
                  }
                  placeholder="one or two sentences — so the right brides hop in"
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-border bg-white px-4 py-2.5 text-[13.5px] leading-[1.55] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none"
                />
              </div>

              {/* Scheduled datetime */}
              {draft.huddle_type === "scheduled" ? (
                <div className="mt-5">
                  <label className="text-[12px] font-medium text-ink">
                    when
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input
                      type="date"
                      value={draft.scheduled_date}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          scheduled_date: e.target.value,
                        }))
                      }
                      className="rounded-full border border-border bg-white px-3.5 py-1.5 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
                    />
                    <input
                      type="time"
                      value={draft.scheduled_time}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          scheduled_time: e.target.value,
                        }))
                      }
                      className="rounded-full border border-border bg-white px-3.5 py-1.5 text-[12.5px] text-ink focus:border-saffron/60 focus:outline-none"
                    />
                  </div>
                </div>
              ) : null}

              {/* Access */}
              <div className="mt-5">
                <label className="text-[12px] font-medium text-ink">
                  who can join?
                </label>
                <div className="mt-2 flex gap-2">
                  <AccessButton
                    active={draft.access === "anyone"}
                    onClick={() =>
                      setDraft((d) => ({ ...d, access: "anyone" }))
                    }
                    label="anyone"
                  />
                  <AccessButton
                    active={draft.access === "connections"}
                    onClick={() =>
                      setDraft((d) => ({ ...d, access: "connections" }))
                    }
                    label="my connections"
                  />
                </div>
              </div>

              {/* Topics */}
              <div className="mt-6">
                <label className="text-[12px] font-medium text-ink">
                  topics <span className="text-ink-faint">optional</span>
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {INTEREST_TAGS.map((tag) => {
                    const active = draft.topic_tags.includes(tag.slug);
                    return (
                      <button
                        key={tag.slug}
                        type="button"
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            topic_tags: active
                              ? d.topic_tags.filter((t) => t !== tag.slug)
                              : [...d.topic_tags, tag.slug],
                          }))
                        }
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11.5px] transition-colors",
                          active
                            ? "border-saffron bg-saffron/10 text-saffron"
                            : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
                        )}
                      >
                        <span aria-hidden>{tag.emoji}</span>
                        {tag.label.toLowerCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!myProfileId ? (
                <p className="mt-5 rounded-lg border border-gold/20 bg-ivory-warm/40 px-4 py-3 text-[12px] text-ink-muted">
                  <Sparkles
                    size={12}
                    strokeWidth={1.8}
                    className="mr-1 inline text-gold"
                  />
                  set up your profile first — settings is one tab over.
                </p>
              ) : null}
            </div>

            {/* Footer CTA */}
            <div className="border-t border-gold/10 bg-ivory-warm/30 px-6 py-4">
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition-colors",
                  canSubmit
                    ? draft.huddle_type === "instant"
                      ? "bg-rose text-white hover:bg-rose/90"
                      : "bg-ink text-ivory hover:bg-ink-soft"
                    : "cursor-not-allowed bg-ink/30 text-ivory",
                )}
              >
                {draft.huddle_type === "instant" ? (
                  <>
                    <Mic size={13} strokeWidth={1.8} />
                    go live →
                  </>
                ) : (
                  <>
                    <Check size={13} strokeWidth={1.8} />
                    put it on the calendar
                  </>
                )}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function TypeButton({
  active,
  onClick,
  icon,
  label,
  helper,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  helper: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-colors",
        active
          ? "border-saffron bg-saffron/10"
          : "border-border bg-white hover:border-saffron/40",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-[12.5px] font-medium",
          active ? "text-saffron" : "text-ink",
        )}
      >
        {icon}
        {label}
      </span>
      <span className="text-[11px] text-ink-faint">{helper}</span>
    </button>
  );
}

function AccessButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-[12.5px] font-medium transition-colors",
        active
          ? "border-ink bg-ink text-ivory"
          : "border-border bg-white text-ink-muted hover:border-ink/40 hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}

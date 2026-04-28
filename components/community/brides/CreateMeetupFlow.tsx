"use client";

// ── Create meetup flow ──────────────────────────────────────────────────────
// Single-page compact form that reads like a story post, not an event form.
// Meetup type pill row up top, smart title placeholder derived from the
// bride's wedding month + hometown, and optional targeting at the bottom.

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Check,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MEETUP_TYPES,
  type Meetup,
  type MeetupType,
} from "@/types/community";
import { INTEREST_TAGS } from "@/lib/community/seed";
import { readFileAsDataUrl, fallbackGradientFor } from "@/lib/community/photos";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunityMeetupsStore } from "@/stores/community-meetups-store";

type DraftState = {
  meetup_type: MeetupType;
  title: string;
  description: string;
  venue_name: string;
  venue_address: string;
  city: string;
  state: string;
  is_virtual: boolean;
  virtual_link: string;
  starts_at_date: string; // yyyy-mm-dd
  starts_at_time: string; // HH:MM
  ends_at_time: string; // HH:MM
  max_attendees: string; // number string, blank = unlimited
  cover_image_data_url?: string;
  target_wedding_months: string[];
  target_interests: string[];
};

function defaultDraft(city: string): DraftState {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 3);
  return {
    meetup_type: "coffee_chat",
    title: "",
    description: "",
    venue_name: "",
    venue_address: "",
    city,
    state: "",
    is_virtual: false,
    virtual_link: "",
    starts_at_date: tomorrow.toISOString().slice(0, 10),
    starts_at_time: "10:00",
    ends_at_time: "",
    max_attendees: "",
    target_wedding_months: [],
    target_interests: [],
  };
}

// Smart title placeholder based on meetup type + wedding month + city.
function titlePlaceholder(
  type: MeetupType,
  weddingDate?: string,
  city?: string,
): string {
  const month = weddingDate
    ? new Date(weddingDate).toLocaleDateString(undefined, { month: "long" }).toLowerCase()
    : undefined;
  const cityShort = city?.split(",")[0]?.toLowerCase();
  switch (type) {
    case "coffee_chat":
      if (month && cityShort) return `coffee with ${month} brides in ${cityShort}`;
      if (cityShort) return `coffee with the ${cityShort} brides`;
      return "coffee with other brides";
    case "brunch":
      if (month && cityShort) return `${month} brides brunch — ${cityShort}`;
      return "brunch with the brides";
    case "wedding_market":
      return "name of the bridal show or market";
    case "workshop":
      return "mehendi practice — bring your cones, I'll bring the chai";
    case "virtual_hangout":
      if (month) return `virtual hangout — ${month} brides`;
      return "virtual bride hangout";
    case "vendor_event":
      return "going to a cake tasting — anyone want to come?";
    default:
      return "give your meetup a name";
  }
}

export function CreateMeetupFlow({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (meetup: Meetup) => void;
}) {
  const myProfile = useCommunityProfilesStore((s) => {
    const id = s.myProfileId;
    return id ? s.profiles.find((p) => p.id === id) : undefined;
  });
  const defaultCity = myProfile?.hometown?.split(",")[0]?.trim() ?? "";

  const createMeetup = useCommunityMeetupsStore((s) => s.createMeetup);
  const rsvpAction = useCommunityMeetupsStore((s) => s.rsvp);

  const [draft, setDraft] = useState<DraftState>(defaultDraft(defaultCity));
  const fileRef = useRef<HTMLInputElement | null>(null);

  const placeholder = useMemo(
    () =>
      titlePlaceholder(
        draft.meetup_type,
        myProfile?.wedding_date,
        myProfile?.hometown,
      ),
    [draft.meetup_type, myProfile?.wedding_date, myProfile?.hometown],
  );

  const reset = () => setDraft(defaultDraft(defaultCity));

  const onCoverFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    if (dataUrl) setDraft((p) => ({ ...p, cover_image_data_url: dataUrl }));
  };

  const canSubmit =
    draft.title.trim().length > 0 &&
    (draft.is_virtual || draft.city.trim().length > 0) &&
    draft.starts_at_date.length > 0 &&
    draft.starts_at_time.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    const starts = new Date(`${draft.starts_at_date}T${draft.starts_at_time}`);
    const ends = draft.ends_at_time
      ? new Date(`${draft.starts_at_date}T${draft.ends_at_time}`)
      : undefined;

    const meetup = createMeetup({
      organizer_id: myProfile?.id,
      organizer_type: "bride",
      title: draft.title.trim(),
      description: draft.description.trim() || undefined,
      cover_image_data_url: draft.cover_image_data_url,
      cover_seed_gradient: draft.cover_image_data_url
        ? undefined
        : fallbackGradientFor(`${draft.meetup_type}-${draft.title}`),
      meetup_type: draft.meetup_type,
      city: draft.is_virtual ? "Virtual" : draft.city.trim(),
      state: draft.is_virtual ? undefined : draft.state.trim() || undefined,
      venue_name: draft.is_virtual ? undefined : draft.venue_name.trim() || undefined,
      venue_address: draft.is_virtual ? undefined : draft.venue_address.trim() || undefined,
      is_virtual: draft.is_virtual,
      virtual_link: draft.is_virtual ? draft.virtual_link.trim() || undefined : undefined,
      starts_at: starts.toISOString(),
      ends_at: ends?.toISOString(),
      max_attendees: draft.max_attendees
        ? Number.parseInt(draft.max_attendees, 10)
        : undefined,
      target_wedding_months: draft.target_wedding_months,
      target_interests: draft.target_interests,
    });

    // Auto-RSVP the host as going.
    if (myProfile) rsvpAction(meetup.id, myProfile.id, "going");

    reset();
    onCreated(meetup);
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
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col bg-white shadow-xl"
            role="dialog"
            aria-label="Create meetup"
          >
            <div className="flex items-center justify-between border-b border-gold/10 px-6 py-3.5">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Create a meetup
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
              {/* Type selector */}
              <div>
                <p className="text-[12px] font-medium text-ink">
                  what kind of meetup?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {MEETUP_TYPES.map((t) => {
                    const selected = draft.meetup_type === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() =>
                          setDraft((p) => ({ ...p, meetup_type: t.id }))
                        }
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
                          selected
                            ? "border-ink bg-ink text-ivory"
                            : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
                        )}
                      >
                        <span aria-hidden>{t.emoji}</span>
                        {t.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11.5px] text-ink-faint">
                  {MEETUP_TYPES.find((t) => t.id === draft.meetup_type)?.blurb}
                </p>
              </div>

              {/* Title */}
              <div className="mt-6">
                <label className="block text-[12px] font-medium text-ink">
                  give it a name
                </label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, title: e.target.value }))
                  }
                  className={cn(inputClass, "mt-1.5")}
                />
              </div>

              {/* Where */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-ink">
                    where?
                  </label>
                  <label className="inline-flex items-center gap-2 text-[11.5px] text-ink-muted">
                    <input
                      type="checkbox"
                      checked={draft.is_virtual}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, is_virtual: e.target.checked }))
                      }
                      className="h-3.5 w-3.5 accent-ink"
                    />
                    this is virtual
                  </label>
                </div>

                {draft.is_virtual ? (
                  <input
                    type="url"
                    placeholder="zoom / meet / facetime link"
                    value={draft.virtual_link}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, virtual_link: e.target.value }))
                    }
                    className={cn(inputClass, "mt-1.5")}
                  />
                ) : (
                  <div className="mt-1.5 space-y-2">
                    <input
                      type="text"
                      placeholder="venue name (e.g. Merit Coffee)"
                      value={draft.venue_name}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, venue_name: e.target.value }))
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      placeholder="street address (optional)"
                      value={draft.venue_address}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          venue_address: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                    <div className="grid grid-cols-[1fr_110px] gap-2">
                      <input
                        type="text"
                        placeholder="city"
                        value={draft.city}
                        onChange={(e) =>
                          setDraft((p) => ({ ...p, city: e.target.value }))
                        }
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="state"
                        value={draft.state}
                        onChange={(e) =>
                          setDraft((p) => ({ ...p, state: e.target.value }))
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* When */}
              <div className="mt-6">
                <label className="block text-[12px] font-medium text-ink">
                  when?
                </label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  <input
                    type="date"
                    value={draft.starts_at_date}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, starts_at_date: e.target.value }))
                    }
                    className={inputClass}
                  />
                  <input
                    type="time"
                    value={draft.starts_at_time}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, starts_at_time: e.target.value }))
                    }
                    className={inputClass}
                  />
                  <input
                    type="time"
                    value={draft.ends_at_time}
                    placeholder="end (optional)"
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, ends_at_time: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              {/* How many */}
              <div className="mt-6">
                <label className="block text-[12px] font-medium text-ink">
                  how many spots? <span className="text-ink-faint">(optional)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="leave blank for open invite"
                  value={draft.max_attendees}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, max_attendees: e.target.value }))
                  }
                  className={cn(inputClass, "mt-1.5 w-full md:w-48")}
                />
              </div>

              {/* Description */}
              <div className="mt-6">
                <label className="block text-[12px] font-medium text-ink">
                  a few words about it
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="what's the vibe? who's it for? anything folks should know?"
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, description: e.target.value }))
                  }
                  className={cn(inputClass, "mt-1.5 resize-none py-2")}
                />
              </div>

              {/* Cover photo */}
              <div className="mt-6">
                <label className="block text-[12px] font-medium text-ink">
                  cover photo <span className="text-ink-faint">(optional)</span>
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-16 w-24 overflow-hidden rounded-lg bg-ivory-warm">
                    {draft.cover_image_data_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={draft.cover_image_data_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          background: `linear-gradient(135deg, #EDE0C2 0%, #B8755D 100%)`,
                        }}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-ink"
                  >
                    <Camera size={12} strokeWidth={1.8} />
                    {draft.cover_image_data_url ? "change" : "add photo"}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onCoverFile}
                  />
                </div>
              </div>

              {/* Targeting (collapsed UI — just interests for v1) */}
              <div className="mt-7 rounded-xl border border-gold/15 bg-ivory-warm/20 p-4">
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  — who should see this? —
                </p>
                <p className="mt-1 text-[11.5px] text-ink-muted">
                  leave blank to show it to everyone. pick interests to surface
                  the meetup to the brides most likely to show up.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {INTEREST_TAGS.map((tag) => {
                    const selected = draft.target_interests.includes(tag.slug);
                    return (
                      <button
                        key={tag.slug}
                        type="button"
                        onClick={() =>
                          setDraft((p) => ({
                            ...p,
                            target_interests: selected
                              ? p.target_interests.filter((s) => s !== tag.slug)
                              : [...p.target_interests, tag.slug],
                          }))
                        }
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] transition-colors",
                          selected
                            ? "border-ink bg-ink text-ivory"
                            : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
                        )}
                      >
                        <span aria-hidden>{tag.emoji}</span>
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gold/15 bg-white px-6 py-4">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[13px] text-ink-muted transition-colors hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-medium transition-colors",
                    canSubmit
                      ? "bg-ink text-ivory hover:bg-ink-soft"
                      : "cursor-not-allowed bg-ink/40 text-ivory",
                  )}
                >
                  <Sparkles size={13} strokeWidth={1.8} />
                  Post meetup
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/15";

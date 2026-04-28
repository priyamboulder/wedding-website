"use client";

// ── Profile settings ────────────────────────────────────────────────────────
// A scrollable, section-by-section editor for the full community profile.
// Mirrors the onboarding steps but on a single page so the bride can edit
// any one piece without walking through the wizard again.
//
// Sections:
//   · Cover photo
//   · Photo gallery (drag-to-reorder omitted for v1 — buttons to move/delete)
//   · Basics (name, partner, cities, date, guest count)
//   · Dream-wedding quote
//   · Wedding details (events, vibe, palette, song)
//   · Interest tags
//   · Fun facts
//   · Privacy (open_to_connect toggle)
//   · Blocked brides

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  Camera,
  Eye,
  EyeOff,
  ImagePlus,
  Plus,
  Trash2,
  UserX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrideAvatar } from "@/components/community/BrideAvatar";
import { VendorChecklistEditor } from "@/components/community/brides/VendorChecklistEditor";
import { VendorInterestInbox } from "@/components/community/brides/VendorInterestInbox";
import { INTEREST_TAGS, PROFILE_PROMPTS } from "@/lib/community/seed";
import { readFileAsDataUrl } from "@/lib/community/photos";
import {
  GUEST_COUNT_BUCKETS,
  WEDDING_EVENTS,
  type ColorSwatch,
  type GuestCountRange,
  type ProfilePhoto,
  type ProfilePhotoType,
  type WeddingEvent,
} from "@/types/community";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useVendorNeedsStore } from "@/stores/vendor-needs-store";

const MAX_PHOTOS = 12;

export function ProfileSettingsPanel() {
  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const myProfile = useMemo(
    () => (myProfileId ? profiles.find((p) => p.id === myProfileId) : undefined),
    [profiles, myProfileId],
  );

  const updateMyProfile = useCommunityProfilesStore((s) => s.updateMyProfile);
  const setOpenToConnect = useCommunityProfilesStore((s) => s.setOpenToConnect);
  const allPhotos = useCommunityProfilesStore((s) => s.photos);
  const addPhoto = useCommunityProfilesStore((s) => s.addPhoto);
  const removePhoto = useCommunityProfilesStore((s) => s.removePhoto);
  const reorderPhotos = useCommunityProfilesStore((s) => s.reorderPhotos);
  const blocks = useCommunityProfilesStore((s) => s.blocks);
  const unblockProfile = useCommunityProfilesStore((s) => s.unblockProfile);
  const ensureVendorNeedsSeeded = useVendorNeedsStore((s) => s.ensureSeeded);
  const expirePendingInterests = useVendorNeedsStore((s) => s._expirePending);
  useEffect(() => {
    ensureVendorNeedsSeeded();
    expirePendingInterests();
  }, [ensureVendorNeedsSeeded, expirePendingInterests]);

  if (!myProfile) {
    return (
      <div className="px-10 py-16 text-center">
        <p className="font-serif text-[22px] italic text-ink">
          set up your profile first.
        </p>
      </div>
    );
  }

  const myPhotos = allPhotos
    .filter((p) => p.profile_id === myProfileId)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="px-6 py-8 md:px-10">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Cover photo */}
        <Section title="cover photo" subline="the first thing other brides see on your story card.">
          <CoverPhotoEditor
            profile={myProfile}
            onChange={(url) =>
              updateMyProfile({
                cover_photo_data_url: url,
                // Clear the seed gradient if the user sets a real cover.
                cover_seed_gradient: url ? undefined : myProfile.cover_seed_gradient,
              })
            }
          />
        </Section>

        {/* Photo gallery */}
        <Section
          title="photo gallery"
          subline={`up to ${MAX_PHOTOS} photos — engagement shots, venue visits, lehenga fittings, décor inspo.`}
        >
          <PhotoGalleryEditor
            photos={myPhotos as (ProfilePhoto & { profile_id: string })[]}
            profileId={myProfileId!}
            onAdd={(payload) => addPhoto(myProfileId!, payload)}
            onRemove={removePhoto}
            onReorder={(ids) => reorderPhotos(myProfileId!, ids)}
          />
        </Section>

        {/* Basics */}
        <Section title="basics">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Name">
              <input
                type="text"
                value={myProfile.display_name}
                onChange={(e) =>
                  updateMyProfile({ display_name: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Partner's name">
              <input
                type="text"
                value={myProfile.partner_name ?? ""}
                onChange={(e) =>
                  updateMyProfile({ partner_name: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="From">
              <input
                type="text"
                value={myProfile.hometown ?? ""}
                onChange={(e) =>
                  updateMyProfile({ hometown: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Getting married in">
              <input
                type="text"
                value={myProfile.wedding_city ?? ""}
                onChange={(e) =>
                  updateMyProfile({ wedding_city: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Wedding month / year">
              <input
                type="month"
                value={myProfile.wedding_date?.slice(0, 7) ?? ""}
                onChange={(e) =>
                  updateMyProfile({
                    wedding_date: e.target.value ? `${e.target.value}-01` : undefined,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Guest count">
              <div className="mt-1 flex flex-wrap gap-2">
                {GUEST_COUNT_BUCKETS.map((b) => {
                  const selected = myProfile.guest_count_range === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() =>
                        updateMyProfile({
                          guest_count_range: selected ? undefined : b.id,
                        })
                      }
                      className={cn(
                        "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                        selected
                          ? "border-ink bg-ink text-ivory"
                          : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
                      )}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        </Section>

        {/* Quote */}
        <Section
          title="dream wedding"
          subline="one or two sentences in your own voice — this is what leads your profile."
        >
          <textarea
            rows={4}
            maxLength={500}
            value={myProfile.quote ?? ""}
            onChange={(e) => updateMyProfile({ quote: e.target.value })}
            placeholder="palace at dusk, marigolds everywhere, and my nani's recipes on the menu…"
            className={cn(
              inputClass,
              "resize-none font-serif text-[15px] italic leading-[1.6]",
            )}
          />
          <p className="mt-1.5 text-right text-[11.5px] text-ink-faint">
            {(myProfile.quote ?? "").length}/500
          </p>
        </Section>

        {/* Wedding details */}
        <Section title="wedding details">
          <div className="space-y-5">
            <Field label="Events">
              <div className="mt-1 flex flex-wrap gap-2">
                {WEDDING_EVENTS.map((ev) => {
                  const selected = myProfile.wedding_events.includes(ev.id);
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() =>
                        updateMyProfile({
                          wedding_events: selected
                            ? myProfile.wedding_events.filter((e) => e !== ev.id)
                            : [...myProfile.wedding_events, ev.id],
                        })
                      }
                      className={cn(
                        "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                        selected
                          ? "border-ink bg-ink text-ivory"
                          : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-ink",
                      )}
                    >
                      {ev.label}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Vibe (a short phrase)">
              <input
                type="text"
                value={myProfile.wedding_vibe ?? ""}
                onChange={(e) => updateMyProfile({ wedding_vibe: e.target.value })}
                placeholder="grand & traditional meets modern minimalism"
                className={inputClass}
              />
            </Field>

            <Field label="Color palette">
              <ColorPaletteEditor
                value={myProfile.color_palette ?? []}
                onChange={(palette) => updateMyProfile({ color_palette: palette })}
              />
            </Field>

            <Field label="Your song">
              <input
                type="text"
                value={myProfile.wedding_song ?? ""}
                onChange={(e) =>
                  updateMyProfile({ wedding_song: e.target.value })
                }
                placeholder="'Kesariya' — it's our song"
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        {/* Vendor checklist */}
        <Section
          title="my vendor checklist"
          subline="which vendors are you still looking for? vendors on ananya can see what you need and reach out if they're a good fit."
        >
          <VendorChecklistEditor />
        </Section>

        {/* Vendor interest inbox */}
        <Section
          title="vendors interested in working with you"
          subline="introductions from vendors who saw your checklist. accept to share contact info, decline to pass."
        >
          <VendorInterestInbox />
        </Section>

        {/* Interest tags */}
        <Section
          title="what you want to chat about"
          subline="tap to toggle — these surface you to brides with overlapping interests."
        >
          <div className="flex flex-wrap gap-2">
            {INTEREST_TAGS.map((tag) => {
              const selected = myProfile.looking_for.includes(tag.slug);
              return (
                <button
                  key={tag.slug}
                  type="button"
                  onClick={() =>
                    updateMyProfile({
                      looking_for: selected
                        ? myProfile.looking_for.filter((s) => s !== tag.slug)
                        : [...myProfile.looking_for, tag.slug],
                    })
                  }
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
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
        </Section>

        {/* Fun facts */}
        <Section
          title="fun facts"
          subline="these are the lines that turn a profile into a friendship. skip any you want."
        >
          <div className="space-y-3">
            {PROFILE_PROMPTS.map((prompt) => (
              <Field label={prompt.prompt_text} key={prompt.slug}>
                <input
                  type="text"
                  placeholder={prompt.placeholder}
                  value={myProfile.fun_facts[prompt.slug] ?? ""}
                  onChange={(e) =>
                    updateMyProfile({
                      fun_facts: {
                        ...myProfile.fun_facts,
                        [prompt.slug]: e.target.value,
                      },
                    })
                  }
                  className={inputClass}
                />
              </Field>
            ))}
          </div>
        </Section>

        {/* Privacy */}
        <Section title="privacy">
          <div className="flex items-start justify-between gap-4 rounded-xl border border-gold/15 bg-white p-5">
            <div>
              <p className="font-serif text-[16px] font-medium text-ink">
                Directory visibility
              </p>
              <p className="mt-1 text-[12.5px] leading-[1.55] text-ink-muted">
                {myProfile.open_to_connect
                  ? "other brides can see your profile and send you connection requests."
                  : "you're hidden from the directory. accepted connections still work."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpenToConnect(!myProfile.open_to_connect)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-colors",
                myProfile.open_to_connect
                  ? "border border-border bg-white text-ink-muted hover:border-rose/40 hover:text-rose"
                  : "bg-ink text-ivory hover:bg-ink-soft",
              )}
            >
              {myProfile.open_to_connect ? (
                <>
                  <EyeOff size={13} strokeWidth={1.8} />
                  Hide me
                </>
              ) : (
                <>
                  <Eye size={13} strokeWidth={1.8} />
                  Make me visible
                </>
              )}
            </button>
          </div>
        </Section>

        {/* Blocklist */}
        <Section title="blocked brides">
          {blocks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gold/25 bg-ivory-warm/20 px-4 py-6 text-center text-[13px] italic text-ink-muted">
              nobody is blocked.
            </p>
          ) : (
            <ul className="divide-y divide-gold/10">
              {blocks.map((b) => {
                const them = profiles.find((p) => p.id === b.blocked_id);
                if (!them) return null;
                return (
                  <li key={b.id} className="flex items-center gap-3 py-3">
                    <BrideAvatar
                      name={them.display_name}
                      src={them.avatar_data_url}
                      size={36}
                    />
                    <p className="flex-1 font-serif text-[15px] font-medium text-ink">
                      {them.display_name}
                    </p>
                    <button
                      type="button"
                      onClick={() => unblockProfile(them.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-ink"
                    >
                      <UserX size={12} strokeWidth={1.8} />
                      Unblock
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

// ── Cover photo editor ─────────────────────────────────────────────────────

function CoverPhotoEditor({
  profile,
  onChange,
}: {
  profile: {
    cover_photo_data_url?: string;
    cover_seed_gradient?: [string, string];
    display_name: string;
  };
  onChange: (url: string | undefined) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    if (dataUrl) onChange(dataUrl);
  };

  const preview = profile.cover_photo_data_url;
  const gradient = profile.cover_seed_gradient ?? ["#F0D9B8", "#B8755D"];

  return (
    <div>
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-gold/20">
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-white transition-colors hover:bg-ink"
              aria-label="Remove cover photo"
            >
              <X size={14} strokeWidth={1.8} />
            </button>
          </>
        ) : (
          <div
            className="flex h-full w-full items-end p-5"
            style={{
              background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
            }}
          >
            <p className="font-serif text-[18px] italic text-white/90">
              {profile.display_name}
            </p>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-1.5 text-[12.5px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-ink"
      >
        <Camera size={13} strokeWidth={1.8} />
        {preview ? "Change photo" : "Upload a photo"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
    </div>
  );
}

// ── Photo gallery editor ───────────────────────────────────────────────────

function PhotoGalleryEditor({
  photos,
  onAdd,
  onRemove,
  onReorder,
}: {
  photos: (ProfilePhoto & { profile_id: string })[];
  profileId: string;
  onAdd: (payload: {
    data_url: string;
    photo_type: ProfilePhotoType;
  }) => void;
  onRemove: (photoId: string) => void;
  onReorder: (orderedIds: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      if (photos.length >= MAX_PHOTOS) break;
      const dataUrl = await readFileAsDataUrl(file);
      if (dataUrl) onAdd({ data_url: dataUrl, photo_type: "general" });
    }
    // Reset so the same file can be re-selected.
    e.target.value = "";
  };

  const moveIndex = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= photos.length) return;
    const ids = photos.map((p) => p.id);
    const [moved] = ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, moved);
    onReorder(ids);
  };

  const atCap = photos.length >= MAX_PHOTOS;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-gold/10 bg-ivory-warm"
          >
            {photo.data_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={photo.data_url}
                alt={photo.caption ?? ""}
                className="h-full w-full object-cover"
                draggable={false}
              />
            ) : photo.seed_gradient ? (
              <div
                className="flex h-full w-full items-end p-2"
                style={{
                  background: `linear-gradient(135deg, ${photo.seed_gradient[0]} 0%, ${photo.seed_gradient[1]} 100%)`,
                }}
              >
                {photo.seed_label && (
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/85"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {photo.seed_label}
                  </span>
                )}
              </div>
            ) : null}

            {/* Controls overlay */}
            <div className="absolute inset-0 flex items-end justify-end gap-1 bg-gradient-to-t from-ink/60 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => moveIndex(i, i - 1)}
                disabled={i === 0}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Move earlier"
              >
                <ArrowUp size={12} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => moveIndex(i, i + 1)}
                disabled={i === photos.length - 1}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Move later"
              >
                <ArrowDown size={12} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => onRemove(photo.id)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-rose transition-colors hover:bg-white"
                aria-label="Delete photo"
              >
                <Trash2 size={12} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        ))}

        {/* Add tile */}
        {!atCap && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-gold/30 bg-ivory-warm/30 text-ink-muted transition-colors hover:border-saffron/40 hover:text-ink"
          >
            <div className="text-center">
              <ImagePlus
                size={22}
                strokeWidth={1.6}
                className="mx-auto"
              />
              <span className="mt-2 block text-[11px]">add photo</span>
            </div>
          </button>
        )}
      </div>
      <p className="mt-3 text-[11.5px] text-ink-faint">
        {photos.length}/{MAX_PHOTOS} photos used
      </p>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFile}
      />
    </div>
  );
}

// ── Color palette editor ───────────────────────────────────────────────────

function ColorPaletteEditor({
  value,
  onChange,
}: {
  value: ColorSwatch[];
  onChange: (next: ColorSwatch[]) => void;
}) {
  const addSwatch = () => {
    onChange([...value, { name: "", hex: "#C4A27A" }]);
  };
  const updateSwatch = (idx: number, patch: Partial<ColorSwatch>) => {
    onChange(value.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };
  const removeSwatch = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className="mt-1 space-y-2">
      {value.length === 0 && (
        <p className="text-[12px] italic text-ink-faint">
          add a few swatches — the StoryCard doesn't need them, but the full
          profile reads richer with them.
        </p>
      )}
      {value.map((swatch, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="color"
            value={swatch.hex}
            onChange={(e) => updateSwatch(i, { hex: e.target.value })}
            className="h-9 w-9 cursor-pointer rounded-md border border-border bg-white p-0.5"
            aria-label={`Swatch ${i + 1} color`}
          />
          <input
            type="text"
            placeholder="dusty rose"
            value={swatch.name}
            onChange={(e) => updateSwatch(i, { name: e.target.value })}
            className={cn(inputClass, "flex-1")}
          />
          <button
            type="button"
            onClick={() => removeSwatch(i)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-faint transition-colors hover:text-rose"
            aria-label="Remove swatch"
          >
            <X size={14} strokeWidth={1.8} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addSwatch}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-saffron/40 hover:text-ink"
      >
        <Plus size={12} strokeWidth={1.8} />
        Add color
      </button>
    </div>
  );
}

// ── Primitives ─────────────────────────────────────────────────────────────

function Section({
  title,
  subline,
  children,
}: {
  title: string;
  subline?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gold/15 bg-white p-6 shadow-sm md:p-7">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        — {title} —
      </p>
      {subline && (
        <p className="mt-2 text-[13px] leading-[1.5] text-ink-muted">
          {subline}
        </p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] font-medium text-ink">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-white px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-faint focus:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/15";

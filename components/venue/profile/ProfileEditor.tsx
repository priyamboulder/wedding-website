"use client";

import { useMemo, useState } from "react";
import { VENUE_PALETTE } from "@/components/venue/ui";
import type {
  Amenity,
  EventSpace,
  GalleryPhoto,
  PricingTier,
  VenueProfile,
  VenueType,
} from "@/lib/venue/profile-seed";
import {
  EditorSection,
  FieldLabel,
  GhostButton,
  NumberInput,
  PrimaryButton,
  Select,
  TextArea,
  TextInput,
  TriToggle,
} from "./fields";
import { AvailabilityCalendar } from "./AvailabilityCalendar";

const VENUE_TYPES: VenueType[] = [
  "Hotel",
  "Banquet Hall",
  "Estate",
  "Resort",
  "Country Club",
  "Restaurant",
  "Outdoor Venue",
  "Other",
];

export function ProfileEditor({
  profile,
  onChange,
}: {
  profile: VenueProfile;
  onChange: (next: VenueProfile) => void;
}) {
  const patch = (p: Partial<VenueProfile>) => onChange({ ...profile, ...p });

  return (
    <div className="space-y-6">
      <BasicsSection profile={profile} patch={patch} />
      <SpacesSection profile={profile} patch={patch} />
      <AmenitiesSection profile={profile} patch={patch} />
      <GallerySection profile={profile} patch={patch} />
      <PricingSection profile={profile} patch={patch} />
      <CalendarSection profile={profile} patch={patch} />
    </div>
  );
}

/* ----------------------------- 1. Basics ----------------------------- */

function BasicsSection({
  profile,
  patch,
}: {
  profile: VenueProfile;
  patch: (p: Partial<VenueProfile>) => void;
}) {
  const { basics } = profile;
  const set = (p: Partial<VenueProfile["basics"]>) =>
    patch({ basics: { ...basics, ...p } });

  return (
    <EditorSection
      id="basics"
      eyebrow="Section 01"
      title="Basic Information"
      description="How your property introduces itself to couples browsing Ananya."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldLabel>Venue name</FieldLabel>
          <TextInput value={basics.name} onChange={(v) => set({ name: v })} />
        </div>
        <div className="md:col-span-2">
          <FieldLabel hint="One-line positioning line">Tagline</FieldLabel>
          <TextInput
            value={basics.tagline}
            onChange={(v) => set({ tagline: v })}
            placeholder="A Timeless Estate for Grand Celebrations"
          />
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Address</FieldLabel>
          <TextInput value={basics.address} onChange={(v) => set({ address: v })} />
        </div>
        <div>
          <FieldLabel>City</FieldLabel>
          <TextInput value={basics.city} onChange={(v) => set({ city: v })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>State</FieldLabel>
            <TextInput value={basics.state} onChange={(v) => set({ state: v })} />
          </div>
          <div>
            <FieldLabel>ZIP</FieldLabel>
            <TextInput value={basics.zip} onChange={(v) => set({ zip: v })} />
          </div>
        </div>
        <div className="md:col-span-2">
          <FieldLabel hint="2–3 paragraphs">Description</FieldLabel>
          <TextArea
            value={basics.description}
            onChange={(v) => set({ description: v })}
            rows={7}
          />
        </div>
        <div>
          <FieldLabel>Contact email</FieldLabel>
          <TextInput value={basics.email} onChange={(v) => set({ email: v })} />
        </div>
        <div>
          <FieldLabel>Phone</FieldLabel>
          <TextInput value={basics.phone} onChange={(v) => set({ phone: v })} />
        </div>
        <div>
          <FieldLabel>Website</FieldLabel>
          <TextInput value={basics.website} onChange={(v) => set({ website: v })} />
        </div>
        <div>
          <FieldLabel hint="Auto-syncs venue photos">Instagram handle</FieldLabel>
          <TextInput value={basics.instagram} onChange={(v) => set({ instagram: v })} />
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Venue type</FieldLabel>
          <Select<VenueType>
            value={basics.type}
            onChange={(v) => set({ type: v })}
            options={VENUE_TYPES.map((t) => ({ value: t, label: t }))}
          />
        </div>
      </div>
    </EditorSection>
  );
}

/* ------------------------- 2. Capacity & Spaces ---------------------- */

function SpacesSection({
  profile,
  patch,
}: {
  profile: VenueProfile;
  patch: (p: Partial<VenueProfile>) => void;
}) {
  const update = (id: string, next: Partial<EventSpace>) => {
    patch({
      spaces: profile.spaces.map((s) => (s.id === id ? { ...s, ...next } : s)),
    });
  };
  const remove = (id: string) => {
    patch({ spaces: profile.spaces.filter((s) => s.id !== id) });
  };
  const add = () => {
    const id = `space-${Date.now()}`;
    patch({
      spaces: [
        ...profile.spaces,
        {
          id,
          name: "New Space",
          type: "Indoor",
          floor: "1st",
          sqft: 0,
          capacity: { ceremony: 0, reception: 0, cocktail: 0 },
          features: [],
          photoUrls: [],
        },
      ],
    });
  };

  return (
    <EditorSection
      id="spaces"
      eyebrow="Section 02"
      title="Capacity & Spaces"
      description="Each event space within the venue — capacity, features, and photos."
      action={<GhostButton onClick={add}>+ Add Space</GhostButton>}
    >
      <div className="space-y-5">
        {profile.spaces.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            onChange={(next) => update(space.id, next)}
            onDelete={() => remove(space.id)}
          />
        ))}
      </div>
    </EditorSection>
  );
}

function SpaceCard({
  space,
  onChange,
  onDelete,
}: {
  space: EventSpace;
  onChange: (next: Partial<EventSpace>) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  const featuresText = space.features.join(", ");

  return (
    <div
      className="rounded-xl border"
      style={{ borderColor: VENUE_PALETTE.hairline, backgroundColor: "#FDFCF8" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        <div className="min-w-0">
          <h3
            className="text-[18px] leading-tight text-[#2C2C2C]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
          >
            {space.name}
          </h3>
          <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#8a8a8a]">
            {space.type} · {space.floor} · {space.sqft.toLocaleString()} sq ft · Cer{" "}
            {space.capacity.ceremony} / Rec {space.capacity.reception} / Ckt{" "}
            {space.capacity.cocktail}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GhostButton onClick={() => setOpen((o) => !o)}>
            {open ? "Close" : "Edit"}
          </GhostButton>
          <GhostButton onClick={onDelete} tone="danger">
            Delete
          </GhostButton>
        </div>
      </div>
      {open && (
        <div
          className="border-t px-5 py-5"
          style={{ borderColor: VENUE_PALETTE.hairlineSoft }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FieldLabel>Name</FieldLabel>
              <TextInput
                value={space.name}
                onChange={(v) => onChange({ name: v })}
              />
            </div>
            <div>
              <FieldLabel>Type</FieldLabel>
              <Select
                value={space.type}
                onChange={(v) => onChange({ type: v })}
                options={[
                  { value: "Indoor", label: "Indoor" },
                  { value: "Outdoor", label: "Outdoor" },
                  { value: "Indoor + Outdoor", label: "Indoor + Outdoor" },
                ]}
              />
            </div>
            <div>
              <FieldLabel>Floor</FieldLabel>
              <TextInput
                value={space.floor}
                onChange={(v) => onChange({ floor: v })}
              />
            </div>
            <div>
              <FieldLabel>Sq ft</FieldLabel>
              <NumberInput
                value={space.sqft}
                onChange={(v) => onChange({ sqft: v })}
                suffix="sqft"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 md:col-span-1">
              <div>
                <FieldLabel>Ceremony</FieldLabel>
                <NumberInput
                  value={space.capacity.ceremony}
                  onChange={(v) =>
                    onChange({ capacity: { ...space.capacity, ceremony: v } })
                  }
                />
              </div>
              <div>
                <FieldLabel>Reception</FieldLabel>
                <NumberInput
                  value={space.capacity.reception}
                  onChange={(v) =>
                    onChange({ capacity: { ...space.capacity, reception: v } })
                  }
                />
              </div>
              <div>
                <FieldLabel>Cocktail</FieldLabel>
                <NumberInput
                  value={space.capacity.cocktail}
                  onChange={(v) =>
                    onChange({ capacity: { ...space.capacity, cocktail: v } })
                  }
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <FieldLabel hint="Comma-separated">Features</FieldLabel>
              <TextInput
                value={featuresText}
                onChange={(v) =>
                  onChange({
                    features: v
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
            <div className="md:col-span-2">
              <FieldLabel>Photos ({space.photoUrls.length})</FieldLabel>
              <div className="grid grid-cols-4 gap-2">
                {space.photoUrls.map((url, i) => (
                  <div
                    key={`${space.id}-photo-${i}`}
                    className="relative aspect-[4/3] overflow-hidden rounded-lg border"
                    style={{ borderColor: VENUE_PALETTE.hairline }}
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          photoUrls: space.photoUrls.filter((_, idx) => idx !== i),
                        })
                      }
                      className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-[11px] font-medium text-[#8a2a20]"
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      photoUrls: [
                        ...space.photoUrls,
                        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
                      ],
                    })
                  }
                  className="grid aspect-[4/3] place-items-center rounded-lg border border-dashed text-[12px] text-[#8a8a8a] transition-colors hover:bg-[#F5E6D0]/40"
                  style={{ borderColor: "rgba(196,162,101,0.4)" }}
                >
                  + Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------ 3. South Asian Wedding Amenities ----------------- */

function AmenitiesSection({
  profile,
  patch,
}: {
  profile: VenueProfile;
  patch: (p: Partial<VenueProfile>) => void;
}) {
  const update = (groupId: string, itemId: string, next: Partial<Amenity>) => {
    patch({
      amenityGroups: profile.amenityGroups.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              items: g.items.map((i) => (i.id === itemId ? { ...i, ...next } : i)),
            }
      ),
    });
  };

  return (
    <EditorSection
      id="amenities"
      eyebrow="Section 03"
      title="South Asian Wedding Amenities"
      description="Ananya's differentiator. These answers help couples filter for venues that fit their traditions and logistics."
    >
      <div className="space-y-6">
        {profile.amenityGroups.map((group) => (
          <div key={group.id}>
            <h3
              className="mb-3 text-[15px] text-[#2C2C2C]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
              }}
            >
              {group.title}
            </h3>
            <div className="space-y-2.5">
              {group.items.map((item) => (
                <AmenityRow
                  key={item.id}
                  item={item}
                  onChange={(next) => update(group.id, item.id, next)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </EditorSection>
  );
}

function AmenityRow({
  item,
  onChange,
}: {
  item: Amenity;
  onChange: (next: Partial<Amenity>) => void;
}) {
  const [showNote, setShowNote] = useState(!!item.note);
  const hasDetailField = item.detail !== undefined;

  return (
    <div
      className="rounded-lg border bg-white px-4 py-3"
      style={{ borderColor: VENUE_PALETTE.hairlineSoft }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex-1 min-w-[240px] text-[13.5px] text-[#2C2C2C]">
          {item.label}
        </p>
        <div className="flex items-center gap-2">
          {hasDetailField && (
            <input
              type="text"
              value={item.detail ?? ""}
              onChange={(e) => onChange({ detail: e.target.value })}
              placeholder="detail"
              className="w-[128px] rounded-md border bg-white px-2.5 py-1 text-[12px] text-[#2C2C2C] outline-none focus:border-[#C4A265]"
              style={{ borderColor: VENUE_PALETTE.hairline }}
            />
          )}
          <TriToggle value={item.answer} onChange={(v) => onChange({ answer: v })} />
          <button
            type="button"
            onClick={() => setShowNote((s) => !s)}
            className="text-[11px] text-[#9E8245] hover:text-[#C4A265]"
          >
            {item.note || showNote ? "Note" : "+ Note"}
          </button>
        </div>
      </div>
      {(showNote || item.note) && (
        <div className="mt-2">
          <input
            type="text"
            value={item.note ?? ""}
            onChange={(e) => onChange({ note: e.target.value })}
            placeholder="Optional detail for couples — e.g. restrictions, advance notice, additional fees."
            className="w-full rounded-md border bg-[#FBF9F5] px-3 py-1.5 text-[12px] italic text-[#5a5a5a] outline-none focus:border-[#C4A265]"
            style={{ borderColor: VENUE_PALETTE.hairline, fontFamily: "'EB Garamond', serif" }}
          />
        </div>
      )}
    </div>
  );
}

/* ---------------------------- 4. Gallery ----------------------------- */

function GallerySection({
  profile,
  patch,
}: {
  profile: VenueProfile;
  patch: (p: Partial<VenueProfile>) => void;
}) {
  const [tab, setTab] = useState<"marketing" | "instagram" | "tour">("marketing");

  const update = (id: string, next: Partial<GalleryPhoto>) =>
    patch({
      gallery: profile.gallery.map((p) => (p.id === id ? { ...p, ...next } : p)),
    });

  const filtered = profile.gallery.filter((p) =>
    tab === "marketing" ? p.source === "marketing" : p.source === "instagram"
  );

  const marketingCount = profile.gallery.filter((p) => p.source === "marketing").length;
  const instaCount = profile.gallery.filter((p) => p.source === "instagram").length;

  return (
    <EditorSection
      id="gallery"
      eyebrow="Section 04"
      title="Photo Gallery"
      description="Marketing photos you upload, plus wedding photos auto-synced from Instagram."
    >
      <div
        className="mb-4 inline-flex rounded-full border p-1"
        style={{ borderColor: VENUE_PALETTE.hairline }}
      >
        <TabButton active={tab === "marketing"} onClick={() => setTab("marketing")}>
          Marketing ({marketingCount})
        </TabButton>
        <TabButton active={tab === "instagram"} onClick={() => setTab("instagram")}>
          From Instagram ({instaCount})
        </TabButton>
        <TabButton active={tab === "tour"} onClick={() => setTab("tour")}>
          Virtual tour & floor plans
        </TabButton>
      </div>

      {tab !== "tour" ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {filtered.map((photo) => (
            <GalleryTile
              key={photo.id}
              photo={photo}
              spaces={profile.spaces}
              onChange={(next) => update(photo.id, next)}
            />
          ))}
          {tab === "marketing" && (
            <button
              type="button"
              onClick={() =>
                patch({
                  gallery: [
                    ...profile.gallery,
                    {
                      id: `mk-${Date.now()}`,
                      source: "marketing",
                      url: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1600&q=80",
                      caption: "",
                    },
                  ],
                })
              }
              className="grid aspect-[4/3] place-items-center rounded-lg border border-dashed text-[12.5px] text-[#8a8a8a] transition-colors hover:bg-[#F5E6D0]/40"
              style={{ borderColor: "rgba(196,162,101,0.4)" }}
            >
              + Upload photo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <FieldLabel hint="Paste Matterport / YouTube / custom link">
              360° virtual tour URL
            </FieldLabel>
            <TextInput
              value={profile.virtualTourUrl}
              onChange={(v) => patch({ virtualTourUrl: v })}
            />
          </div>
          <div>
            <FieldLabel>Floor plans</FieldLabel>
            <ul
              className="rounded-lg border bg-white"
              style={{ borderColor: VENUE_PALETTE.hairline }}
            >
              {profile.floorPlans.map((fp, i) => (
                <li
                  key={fp.id}
                  className={`flex items-center justify-between px-3 py-2 text-[13px] ${i === 0 ? "" : "border-t"}`}
                  style={i === 0 ? undefined : { borderColor: VENUE_PALETTE.hairlineSoft }}
                >
                  <span className="text-[#2C2C2C]">{fp.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#9E8245]">
                      {fp.url === "#" ? "Uploaded" : "External"}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        patch({
                          floorPlans: profile.floorPlans.filter((x) => x.id !== fp.id),
                        })
                      }
                      className="text-[11px] text-[#8a2a20] hover:text-[#c0392b]"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
              <li
                className="border-t px-3 py-2"
                style={{ borderColor: VENUE_PALETTE.hairlineSoft }}
              >
                <GhostButton
                  onClick={() =>
                    patch({
                      floorPlans: [
                        ...profile.floorPlans,
                        {
                          id: `fp-${Date.now()}`,
                          label: "New floor plan",
                          url: "#",
                        },
                      ],
                    })
                  }
                >
                  + Upload floor plan
                </GhostButton>
              </li>
            </ul>
          </div>
        </div>
      )}
    </EditorSection>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-[12px] transition-colors ${
        active ? "bg-[#F5E6D0] text-[#2C2C2C]" : "text-[#6a6a6a] hover:bg-[#F5E6D0]/55"
      }`}
    >
      {children}
    </button>
  );
}

function GalleryTile({
  photo,
  spaces,
  onChange,
}: {
  photo: GalleryPhoto;
  spaces: EventSpace[];
  onChange: (next: Partial<GalleryPhoto>) => void;
}) {
  const spaceName = photo.spaceId
    ? spaces.find((s) => s.id === photo.spaceId)?.name
    : undefined;

  return (
    <div
      className="overflow-hidden rounded-lg border bg-white"
      style={{ borderColor: VENUE_PALETTE.hairline, opacity: photo.hidden ? 0.55 : 1 }}
    >
      <div className="relative aspect-[4/3]">
        <img src={photo.url} alt="" className="h-full w-full object-cover" />
        {photo.featured && (
          <span
            className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-[2px] text-[10px] font-medium"
            style={{ color: VENUE_PALETTE.goldDeep }}
          >
            ✦ Featured
          </span>
        )}
        {photo.source === "instagram" && photo.instagramHandle && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-[2px] font-mono text-[10px] text-white">
            {photo.instagramHandle}
          </span>
        )}
      </div>
      <div className="space-y-1.5 px-3 py-2.5">
        <input
          type="text"
          value={photo.caption ?? ""}
          onChange={(e) => onChange({ caption: e.target.value })}
          placeholder="Caption"
          className="w-full rounded-md border bg-white px-2.5 py-1 text-[12px] text-[#2C2C2C] outline-none focus:border-[#C4A265]"
          style={{ borderColor: VENUE_PALETTE.hairlineSoft }}
        />
        <div className="flex items-center justify-between gap-2">
          <select
            value={photo.spaceId ?? ""}
            onChange={(e) => onChange({ spaceId: e.target.value || undefined })}
            className="w-full rounded-md border bg-white px-2.5 py-1 text-[11.5px] text-[#2C2C2C] outline-none focus:border-[#C4A265]"
            style={{ borderColor: VENUE_PALETTE.hairlineSoft }}
          >
            <option value="">— Tag a space —</option>
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8a8a8a]">
            {spaceName ?? "—"}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => onChange({ featured: !photo.featured })}
            className="text-[11px] text-[#9E8245] hover:text-[#C4A265]"
          >
            {photo.featured ? "Unfeature" : "Feature"}
          </button>
          <button
            type="button"
            onClick={() => onChange({ hidden: !photo.hidden })}
            className="text-[11px] text-[#8a2a20] hover:text-[#c0392b]"
          >
            {photo.hidden ? "Unhide" : "Hide"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- 5. Pricing ---------------------------- */

function PricingSection({
  profile,
  patch,
}: {
  profile: VenueProfile;
  patch: (p: Partial<VenueProfile>) => void;
}) {
  const update = (id: string, next: Partial<PricingTier>) =>
    patch({
      pricingTiers: profile.pricingTiers.map((t) =>
        t.id === id ? { ...t, ...next } : t
      ),
    });
  const remove = (id: string) =>
    patch({ pricingTiers: profile.pricingTiers.filter((t) => t.id !== id) });
  const add = () =>
    patch({
      pricingTiers: [
        ...profile.pricingTiers,
        {
          id: `tier-${Date.now()}`,
          name: "New tier",
          priceLow: 0,
          priceHigh: 0,
          includes: "",
        },
      ],
    });

  return (
    <EditorSection
      id="pricing"
      eyebrow="Section 05"
      title="Pricing"
      description="Ranges and what's included. Couples see these as starting-point estimates, not invoices."
      action={<GhostButton onClick={add}>+ Add tier</GhostButton>}
    >
      <div className="space-y-4">
        {profile.pricingTiers.map((tier) => (
          <PricingTierCard
            key={tier.id}
            tier={tier}
            onChange={(next) => update(tier.id, next)}
            onDelete={() => remove(tier.id)}
          />
        ))}
      </div>

      <div
        className="mt-6 rounded-xl border p-5"
        style={{
          borderColor: VENUE_PALETTE.hairline,
          backgroundColor: "#FBF1DF",
        }}
      >
        <h3
          className="text-[14px] text-[#5a4a30]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          Seasonal Pricing Notes
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <FieldLabel>Peak</FieldLabel>
            <TextInput
              value={profile.seasonalNotes.peak}
              onChange={(v) =>
                patch({
                  seasonalNotes: { ...profile.seasonalNotes, peak: v },
                })
              }
            />
          </div>
          <div>
            <FieldLabel>Off-peak</FieldLabel>
            <TextInput
              value={profile.seasonalNotes.offPeak}
              onChange={(v) =>
                patch({
                  seasonalNotes: { ...profile.seasonalNotes, offPeak: v },
                })
              }
            />
          </div>
          <div>
            <FieldLabel>Holiday</FieldLabel>
            <TextInput
              value={profile.seasonalNotes.holiday}
              onChange={(v) =>
                patch({
                  seasonalNotes: { ...profile.seasonalNotes, holiday: v },
                })
              }
            />
          </div>
        </div>
      </div>
    </EditorSection>
  );
}

function PricingTierCard({
  tier,
  onChange,
  onDelete,
}: {
  tier: PricingTier;
  onChange: (next: Partial<PricingTier>) => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="rounded-xl border bg-white p-5"
      style={{ borderColor: VENUE_PALETTE.hairline }}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-5">
          <FieldLabel>Tier name</FieldLabel>
          <TextInput value={tier.name} onChange={(v) => onChange({ name: v })} />
        </div>
        <div className="md:col-span-3">
          <FieldLabel>Price low</FieldLabel>
          <NumberInput
            value={tier.priceLow}
            onChange={(v) => onChange({ priceLow: v })}
            suffix="$"
          />
        </div>
        <div className="md:col-span-3">
          <FieldLabel>Price high</FieldLabel>
          <NumberInput
            value={tier.priceHigh}
            onChange={(v) => onChange({ priceHigh: v })}
            suffix="$"
          />
        </div>
        <div className="md:col-span-1 flex items-end justify-end">
          <GhostButton onClick={onDelete} tone="danger">
            ×
          </GhostButton>
        </div>
        <div className="md:col-span-4">
          <FieldLabel>F&B minimum (optional)</FieldLabel>
          <NumberInput
            value={tier.fbMinimum ?? 0}
            onChange={(v) => onChange({ fbMinimum: v || undefined })}
            suffix="$"
          />
        </div>
        <div className="md:col-span-8">
          <FieldLabel>Includes</FieldLabel>
          <TextInput
            value={tier.includes}
            onChange={(v) => onChange({ includes: v })}
          />
        </div>
      </div>
    </div>
  );
}

/* --------------------------- 6. Availability ------------------------- */

function CalendarSection({
  profile,
  patch,
}: {
  profile: VenueProfile;
  patch: (p: Partial<VenueProfile>) => void;
}) {
  const stats = useMemo(() => {
    let booked = 0,
      hold = 0,
      blocked = 0,
      available = 0;
    for (const d of profile.calendar) {
      if (d.status === "booked") booked++;
      else if (d.status === "hold") hold++;
      else if (d.status === "blocked") blocked++;
      else available++;
    }
    return { booked, hold, blocked, available };
  }, [profile.calendar]);

  return (
    <EditorSection
      id="calendar"
      eyebrow="Section 06"
      title="Availability Calendar"
      description="Click a date to cycle its status. Couples browsing your profile see availability only — not couple names."
      action={<GhostButton>Sync external calendar</GhostButton>}
    >
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatusStat label="Available" value={stats.available} dot="#F5EFE3" textColor="#9E8245" />
        <StatusStat label="Booked" value={stats.booked} dot={VENUE_PALETTE.charcoal} textColor="#FAF8F5" />
        <StatusStat label="Hold" value={stats.hold} dot={VENUE_PALETTE.gold} textColor="#FFFFFF" />
        <StatusStat label="Blocked" value={stats.blocked} dot="#cfcfcf" textColor="#2C2C2C" />
      </div>
      <AvailabilityCalendar
        days={profile.calendar}
        onChange={(next) => patch({ calendar: next })}
        mode="editor"
      />
    </EditorSection>
  );
}

function StatusStat({
  label,
  value,
  dot,
  textColor,
}: {
  label: string;
  value: number;
  dot: string;
  textColor: string;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-lg border bg-white px-3 py-2"
      style={{ borderColor: VENUE_PALETTE.hairlineSoft }}
    >
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden
          className="inline-block h-3 w-3 rounded-[2px]"
          style={{ backgroundColor: dot, color: textColor }}
        />
        <span className="text-[12.5px] text-[#2C2C2C]">{label}</span>
      </span>
      <span className="font-mono text-[13px] text-[#2C2C2C]" style={{ fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

/* Save bar at the bottom — not really persisting anywhere (localStorage only
   in this repo, no backend), but demonstrates the UX. */

export function SaveBar({ onSave }: { onSave?: () => void }) {
  return (
    <div
      className="sticky bottom-4 mt-4 flex items-center justify-between rounded-full border bg-white/95 px-5 py-2.5 backdrop-blur"
      style={{
        borderColor: VENUE_PALETTE.hairline,
        boxShadow: "0 20px 40px -20px rgba(44,44,44,0.25)",
      }}
    >
      <p className="text-[12px] italic text-[#6a6a6a]" style={{ fontFamily: "'EB Garamond', serif" }}>
        Changes update the preview on the right in real-time.
      </p>
      <div className="flex items-center gap-2">
        <GhostButton>Preview public</GhostButton>
        <PrimaryButton onClick={onSave}>Save changes</PrimaryButton>
      </div>
    </div>
  );
}

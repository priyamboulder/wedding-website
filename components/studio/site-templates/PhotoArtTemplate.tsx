"use client";

// Photo-art wedding site template.
// Renders couple details over a full-bleed Marigold artwork background.
// Cycles through images in the category for each section.

import type { TemplateRenderProps } from "@/types/wedding-site";

// All photo filenames per category — statically listed so no filesystem calls needed at runtime.
const CATEGORY_PHOTOS: Record<string, string[]> = {
  abstract: [
    "Uma_Patel_Abstract_ink_wash_in_saffron_orange_and_burgundy_on_wet_rice_pape_08fe28a1-bfac-49a4-9401-803851ac77fe.jpg",
    "Uma_Patel_Abstract_ink_wash_in_saffron_orange_and_burgundy_on_wet_rice_pape_84c6d9ec-e227-4b2e-ae82-e8c10ab812de.jpg",
    "Uma_Patel_Abstract_watercolor_wash_in_deep_indigo_bleeding_into_soft_gray-b_3636322c-7b2a-4f16-acb1-00c2c0fa6e82.jpg",
    "Uma_Patel_Abstract_watercolor_wash_in_dusty_mauve_and_soft_gray_and_touches_7ea08af1-b70e-413a-9113-014756135ad7.jpg",
    "Uma_Patel_Abstract_watercolor_wash_in_dusty_rose_and_warm_gold_and_soft_ter_47828539-cb31-4cf1-b228-6009feff8199.jpg",
    "Uma_Patel_Abstract_watercolor_wash_in_soft_sage_green_and_warm_gold_bleedin_7d750fce-bcb3-4431-8e32-3dada77b08f5.jpg",
    "Uma_Patel_Soft_watercolor_wash_in_sandy_beige_and_pale_ocean_blue_and_seafo_1593f8c8-dd14-4d72-9faa-7e57cc4d9a6d.jpg",
  ],
  celestial: [
    "02_Celestial_pattern.jpg",
    "Uma_Patel_Constellation_pattern_drawn_in_fine_gold_ink_connecting_small_sta_1d8ca41b-5dd8-49d3-80b5-51d44e5c1f67.jpg",
    "Uma_Patel_Crescent_moon_and_scattered_stars_drawn_in_fine_gold_ink_on_deep_86231033-29ef-4224-b562-e9076ccb356a.jpg",
    "Uma_Patel_Eclipsed_sun_with_corona_rays_drawn_in_fine_gold_ink_on_charcoal_0c1f228d-5784-49b7-950a-bd1b808685dd.jpg",
    "Uma_Patel_Full_moon_drawn_in_fine_ink_with_soft_watercolor_fill_in_pale_gol_1bd3834d-9d2d-49d6-9eb9-2c1b494eac34.jpg",
    "Uma_Patel_Sun_and_moon_facing_each_other_as_a_pair_drawn_in_fine_gold_ink_o_0268ee1b-9948-4998-8485-5041e3147fb0.jpg",
  ],
  fauna: [
    "Uma_Patel_Single_butterfly_with_wings_open_drawn_in_fine_ink_with_soft_wate_22644b25-8cbe-470a-a15e-e7d6f925d14d.jpg",
  ],
  field: [
    "Uma_Patel_Autumn_maple_leaves_in_various_stages_of_turning_drawn_in_fine_in_9a6e9c14-fb4d-4a26-9fcd-7e6d8af779bd.jpg",
  ],
  flora: [
    "Uma_Patel_Dark_botanical_arrangement_of_dried_flowers_and_seed_pods_in_mute_b4c8a04f-8993-4dbb-9495-fccf58b6a760.jpg",
    "Uma_Patel_Dark_moody_arrangement_of_garden_roses_and_ranunculus_in_deep_bur_b947af00-7207-465a-b360-56bc7ad2c6e8.jpg",
    "Uma_Patel_Gold_foil_botanical_illustration_of_peony_flowers_on_heavy_navy_b_0bd3890c-feda-4c13-ac02-15ecdccc2902.jpg",
    "Uma_Patel_Dried_jasmine_garland_coiled_in_a_loose_spiral_on_aged_cream_cott_2d22b979-d13a-43b5-ac2e-bd9442cff108.jpg",
  ],
  folklore: [
    "05_Spices_pattern.jpg",
    "06_Toile_pattern.jpg",
    "Uma_Patel_Abstract_line_drawing_of_a_decorated_elephant_in_profile_single_b97b0e1f-afdb-4271-af06-c0fd2996ad91.jpg",
    "Uma_Patel_Abstract_minimalist_line_drawing_of_Ganesha_in_single_continuous_b91f9d50-2142-4b79-ab1f-62cc5a9cdadf.jpg",
  ],
  "skylines-travel": [
    "Uma_Patel_Amalfi_Coast_cliffside_village_drawn_in_fine_sepia_ink_on_cream_p_ce4c2ee3-cc53-4c88-a923-f15fc6b00eff.jpg",
    "Uma_Patel_Atlanta_skyline_drawn_in_fine_gold_ink_on_warm_cream_paper_soft_9f968f21-1922-4ab6-9025-f1e20c8fb73e.jpg",
    "Uma_Patel_Austin_Texas_skyline_with_Congress_Avenue_Bridge_drawn_in_fine_se_9391742e-e7df-45c2-8b43-7f3846e3fca2.jpg",
  ],
  "top-picks": [
    "A_Folklore_Paisley.jpg",
    "B_Folklore_Diyas_Lanterns.jpg",
    "C_Fauna_Butterflies.jpg",
    "D_Flora_Lotus.jpg",
    "E_Flora_Mushrooms_Woodland.jpg",
    "F_Field_Pomegranates.jpg",
  ],
};

interface Props extends TemplateRenderProps {
  photoCategory: string;
}

function photoUrl(category: string, index: number): string {
  const photos = CATEGORY_PHOTOS[category] ?? [];
  if (!photos.length) return "";
  const file = photos[index % photos.length];
  return `/marigold-photos/${category}/${encodeURIComponent(file)}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function PhotoArtTemplate({ photoCategory, content, brand, mode }: Props) {
  const { couple, weddingDate, primaryVenue, story, events } = content;
  const heroPhoto = photoUrl(photoCategory, 0);
  const storyPhoto = photoUrl(photoCategory, 1);
  const eventsPhoto = photoUrl(photoCategory, 2);
  const rsvpPhoto = photoUrl(photoCategory, 3);

  const bodyStyle: React.CSSProperties = {
    fontFamily: brand.bodyFont,
    color: brand.ink,
    background: brand.surface,
    margin: 0,
    padding: 0,
  };

  const displayStyle: React.CSSProperties = {
    fontFamily: brand.displayFont,
  };

  const accentStyle: React.CSSProperties = {
    color: brand.accent,
  };

  if (mode === "preview") {
    return (
      <div
        style={{
          ...bodyStyle,
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: heroPhoto ? `url('${heroPhoto}')` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.38)",
          }}
        />
        <div style={{ position: "relative", textAlign: "center", color: "#fff" }}>
          <div style={{ ...displayStyle, fontSize: 28, fontWeight: 300, letterSpacing: "0.04em" }}>
            {couple.first} &amp; {couple.second}
          </div>
          <div style={{ fontSize: 11, marginTop: 6, letterSpacing: "0.16em", opacity: 0.8 }}>
            {formatDate(weddingDate).toUpperCase()}
          </div>
        </div>
      </div>
    );
  }

  // ── Full showcase ─────────────────────────────────────────────────────────────

  return (
    <div style={bodyStyle}>
      {/* HERO */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: heroPhoto ? `url('${heroPhoto}')` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          textAlign: "center",
          padding: "80px 24px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.42)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, color: "#fff", maxWidth: 640 }}>
          <p
            style={{
              fontFamily: brand.bodyFont,
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              opacity: 0.75,
              marginBottom: 24,
            }}
          >
            {content.hero.eyebrow || "Together with their families"}
          </p>
          <h1
            style={{
              ...displayStyle,
              fontSize: "clamp(42px, 8vw, 80px)",
              fontWeight: 300,
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            {couple.first} &amp; {couple.second}
          </h1>
          <div
            style={{
              width: 48,
              height: 1,
              background: brand.accent,
              margin: "0 auto 20px",
            }}
          />
          <p
            style={{
              fontFamily: brand.bodyFont,
              fontSize: 14,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              opacity: 0.88,
              marginBottom: 8,
            }}
          >
            {formatDate(weddingDate)}
          </p>
          <p style={{ fontFamily: brand.bodyFont, fontSize: 13, opacity: 0.72 }}>
            {primaryVenue}
          </p>
          <p
            style={{
              fontFamily: brand.bodyFont,
              fontSize: 12,
              opacity: 0.55,
              marginTop: 16,
              letterSpacing: "0.12em",
            }}
          >
            {couple.hashtag}
          </p>
        </div>
      </section>

      {/* OUR STORY */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: 500,
        }}
      >
        <div
          style={{
            backgroundImage: storyPhoto ? `url('${storyPhoto}')` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: 400,
          }}
        />
        <div
          style={{
            padding: "64px 48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: brand.surface,
          }}
        >
          <p style={{ ...accentStyle, fontFamily: brand.bodyFont, fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase", marginBottom: 16 }}>
            Our Story
          </p>
          <h2 style={{ ...displayStyle, fontSize: 32, fontWeight: 300, marginBottom: 24, lineHeight: 1.25 }}>
            {story.title}
          </h2>
          {story.paragraphs.map((p, i) => (
            <p key={i} style={{ fontFamily: brand.bodyFont, fontSize: 15, lineHeight: 1.8, color: brand.ink, opacity: 0.82, marginBottom: 16 }}>
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* EVENTS */}
      <section
        style={{
          position: "relative",
          backgroundImage: eventsPhoto ? `url('${eventsPhoto}')` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          padding: "80px 24px",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", color: "#fff" }}>
          <p style={{ fontFamily: brand.bodyFont, fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase", opacity: 0.7, textAlign: "center", marginBottom: 12, color: brand.accent }}>
            Celebrations
          </p>
          <h2 style={{ ...displayStyle, fontSize: 36, fontWeight: 300, textAlign: "center", marginBottom: 48 }}>
            Join Us
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {events.map((ev) => (
              <div
                key={ev.id}
                style={{
                  background: "rgba(255,255,255,0.09)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  padding: "24px 20px",
                }}
              >
                <p style={{ ...accentStyle, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
                  {ev.name}
                </p>
                <p style={{ ...displayStyle, fontSize: 20, fontWeight: 300, marginBottom: 12 }}>{ev.venue}</p>
                <p style={{ fontFamily: brand.bodyFont, fontSize: 13, opacity: 0.75, marginBottom: 4 }}>
                  {formatDate(ev.date)} · {ev.timeLabel}
                </p>
                {ev.dressCode && (
                  <p style={{ fontFamily: brand.bodyFont, fontSize: 12, opacity: 0.55 }}>
                    {ev.dressCode}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RSVP */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: 400,
        }}
      >
        <div
          style={{
            padding: "64px 48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: brand.surface,
          }}
        >
          <p style={{ ...accentStyle, fontFamily: brand.bodyFont, fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase", marginBottom: 16 }}>
            RSVP
          </p>
          <h2 style={{ ...displayStyle, fontSize: 32, fontWeight: 300, marginBottom: 20, lineHeight: 1.2 }}>
            We hope to see you there
          </h2>
          <p style={{ fontFamily: brand.bodyFont, fontSize: 14, lineHeight: 1.7, opacity: 0.78, marginBottom: 20 }}>
            {content.rsvp.instructions}
          </p>
          <p style={{ fontFamily: brand.bodyFont, fontSize: 12, opacity: 0.55 }}>
            Kindly respond by {formatDate(content.rsvp.deadlineIso)}
          </p>
        </div>
        <div
          style={{
            backgroundImage: rsvpPhoto ? `url('${rsvpPhoto}')` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: 400,
          }}
        />
      </section>

      {/* FOOTER */}
      <footer
        style={{
          textAlign: "center",
          padding: "48px 24px",
          background: brand.surface,
          borderTop: `1px solid ${brand.accent}33`,
        }}
      >
        <p style={{ ...displayStyle, fontSize: 22, fontWeight: 300, marginBottom: 8 }}>
          {couple.first} &amp; {couple.second}
        </p>
        <p style={{ fontFamily: brand.bodyFont, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.45 }}>
          {couple.hashtag}
        </p>
      </footer>
    </div>
  );
}

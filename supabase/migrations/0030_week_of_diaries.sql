-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0030: The Week Of — diary-format real-wedding articles.
--
-- A "Week Of" diary is a special long-form content type that lives in the
-- Real Weddings tab of the Planning Circle (/blog). Unlike a traditional
-- write-up, it reads like the bride's actual journal — one entry per day
-- of the wedding week, with a mood, a body, and (optionally) a pull quote.
--
-- Data model:
--   - One row per diary. The day-by-day entries live in `days` as a JSONB
--     array; each element is one diary entry. We chose JSONB (rather than a
--     child table) because:
--       1. Days are always read together with the parent diary — no use-
--          case for joining or filtering individual days.
--       2. Order matters and is intrinsic to the array, with no need for
--          a separate sort_index column.
--       3. The day shape is editorial-flexible (mood enum, optional photo,
--          optional pull quote) and we want it to evolve without a
--          migration per field.
--   - `tags` is a JSONB string array of all-caps event tags ("HALDI",
--     "MEHENDI", …) — same shape as `events` on RealWedding so the UI can
--     reuse the photo-tag pill style.
--   - `status` gates publish; only 'published' rows are surfaced by the
--     public-read RLS policy below.
-- ──────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS week_of_diaries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  author_persona  text NOT NULL,
  intro_text      text,
  cover_image     text,
  days            jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags            jsonb NOT NULL DEFAULT '[]'::jsonb,
  wedding_date    date,
  location        text,
  guest_count     integer,
  status          text NOT NULL DEFAULT 'draft',
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT week_of_diaries_status_check CHECK (status IN ('draft', 'published')),
  CONSTRAINT week_of_diaries_days_is_array CHECK (jsonb_typeof(days) = 'array'),
  CONSTRAINT week_of_diaries_tags_is_array CHECK (jsonb_typeof(tags) = 'array')
);

CREATE INDEX IF NOT EXISTS week_of_diaries_published_idx
  ON week_of_diaries (published_at DESC NULLS LAST)
  WHERE status = 'published';

-- ── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE week_of_diaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads published diaries" ON week_of_diaries;
CREATE POLICY "Public reads published diaries"
  ON week_of_diaries FOR SELECT TO anon, authenticated
  USING (status = 'published');

-- ── Seed: A December Wedding in Udaipur ──────────────────────────────────

INSERT INTO week_of_diaries (
  title, author_persona, intro_text, cover_image, days, tags,
  wedding_date, location, guest_count, status, published_at
) VALUES (
  'The Week Of: A December Wedding in Udaipur',
  'Bride, December 2026, City Palace, Udaipur. 280 guests. 5 events. 2 meltdowns. Zero regrets.',
  NULL,
  NULL,
  '[
    {
      "day_number": 1,
      "day_of_week": "Monday",
      "title": "The Arrival",
      "mood": "excited",
      "body": "We landed in Udaipur to 22-degree weather and a hotel room full of welcome bags I''d obsessed over for months. My mom was already there, naturally, rearranging the welcome bag tissue paper because ''it didn''t look welcoming enough.'' My sister texted from the airport: ''I forgot my ceremony outfit.'' We''ve been here three hours.",
      "pull_quote": "It hadn''t started yet and it was already perfectly chaotic.",
      "image_url": null
    },
    {
      "day_number": 2,
      "day_of_week": "Tuesday",
      "title": "Mehendi, Tears, and 47 WhatsApp Messages",
      "mood": "overwhelmed",
      "body": "The mehendi artist arrived at 9am. By 11am, both my hands were done and I couldn''t touch anything. By 2pm, my mom was crying because the mehndi paste color ''wasn''t dark enough.'' By 5pm I had 47 unread WhatsApp messages from various family members about tomorrow''s logistics. I responded to none of them. My hands were busy. The perfect excuse.",
      "pull_quote": "My hands were busy. The perfect excuse.",
      "image_url": null
    },
    {
      "day_number": 3,
      "day_of_week": "Wednesday",
      "title": "The Sangeet Nobody Planned For",
      "mood": "chaotic",
      "body": "I say ''nobody planned for'' loosely. We planned for months. Choreographer, music cues, lighting. What we didn''t plan for was my uncle deciding to do a 12-minute freestyle performance to a medley of 90s Bollywood songs. Or my father-in-law''s ''surprise'' speech that went 25 minutes. The DJ looked at me. I looked at the bartender. The bartender understood.",
      "pull_quote": "The DJ looked at me. I looked at the bartender. The bartender understood.",
      "image_url": null
    },
    {
      "day_number": 4,
      "day_of_week": "Thursday",
      "title": "The Day Before",
      "mood": "anxious",
      "body": "Everyone says the day before is when it hits you. They''re right, but not in the way I expected. It didn''t hit me emotionally — it hit me logistically. The decorator sent the wrong shade of gold for the mandap draping. The baraat horse had ''scheduling issues'' (I didn''t know horses had schedules). And my partner called to say his sherwani was missing a button. One button. You''d think the world was ending from the panic in his voice.",
      "pull_quote": "I didn''t know horses had schedules.",
      "image_url": null
    },
    {
      "day_number": 5,
      "day_of_week": "Friday",
      "title": "The Wedding",
      "mood": "emotional",
      "body": "I don''t remember the mandap color being wrong. I don''t remember if the horse showed up on time. I remember my dad''s face when he saw me. I remember my partner''s hands shaking during the pheras. I remember my grandmother whispering prayers I couldn''t hear but somehow felt. The photographer told me later I cried four times. I thought it was once. Apparently my mascara knew better.",
      "pull_quote": "The photographer told me I cried four times. I thought it was once.",
      "image_url": null
    },
    {
      "day_number": 6,
      "day_of_week": "Saturday",
      "title": "The Morning After",
      "mood": "peaceful",
      "body": "We had a brunch. Low-key. Sunlight through the arches of the hotel. Everyone was exhausted and happy and eating too much. My mom hugged me and said ''I''m sorry about the tissue paper.'' I didn''t know what she meant at first. Then I remembered Day 1. It felt like it happened to someone else, in another life, a week ago.",
      "pull_quote": "It felt like it happened to someone else, in another life, a week ago.",
      "image_url": null
    }
  ]'::jsonb,
  '["MEHENDI", "SANGEET", "CEREMONY", "RECEPTION"]'::jsonb,
  '2026-12-04',
  'City Palace, Udaipur',
  280,
  'published',
  now()
)
ON CONFLICT DO NOTHING;

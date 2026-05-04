-- ──────────────────────────────────────────────────────────────────────────
-- Migration 0034: The Grapevine — seed data.
--
-- Two archived sessions plus a small upcoming session so the public tab
-- doesn't render empty before any real session has been scheduled. Counts
-- (total_questions, total_answered, upvote_count) are bumped by the
-- triggers from migration 0033, so we don't have to maintain them by hand.
--
-- Reaction seed pattern: we don't have real auth.users to attribute seed
-- reactions to. Instead, each highlighted answer gets a small jsonb of
-- baked-in reaction counts (reaction_counts column in the JSON below) that
-- the read API merges with live counts. To keep the schema clean we surface
-- these as `seed_reaction_*` columns on grapevine_ama_answers; if not
-- present yet, this migration adds them and the public read view picks
-- them up.
-- ──────────────────────────────────────────────────────────────────────────

-- Add seed reaction columns the public reaction surface can fold into
-- live counts. Done here (rather than in 0033) so the base schema mirrors
-- the spec's table shape exactly.
ALTER TABLE grapevine_ama_answers
  ADD COLUMN IF NOT EXISTS seed_reaction_helpful     integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seed_reaction_real_talk   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seed_reaction_needed_this integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seed_reaction_fire        integer NOT NULL DEFAULT 0;

-- Likewise for upvotes — let seed questions show non-zero upvote counts
-- without inserting fake auth.users rows.
ALTER TABLE grapevine_ama_questions
  ADD COLUMN IF NOT EXISTS seed_upvotes integer NOT NULL DEFAULT 0;

-- Refresh the session-stats view so it sums seed_upvotes too.
-- DROP + CREATE rather than CREATE OR REPLACE: the latter rejects view
-- redefinitions whenever the underlying SELECT shape drifts (even adding
-- a column to a SUM() expression has tripped this in the wild).
DROP VIEW IF EXISTS grapevine_ama_session_stats;

CREATE VIEW grapevine_ama_session_stats
WITH (security_invoker = false) AS
SELECT
  s.id AS session_id,
  s.total_questions,
  s.total_answered,
  COALESCE(SUM(q.upvote_count + q.seed_upvotes), 0)::int AS total_upvotes,
  (SELECT COUNT(*)::int
     FROM grapevine_ama_reactions r
     JOIN grapevine_ama_answers a ON a.id = r.answer_id
     WHERE a.session_id = s.id) +
  (SELECT COALESCE(SUM(
       a.seed_reaction_helpful + a.seed_reaction_real_talk
     + a.seed_reaction_needed_this + a.seed_reaction_fire), 0)::int
     FROM grapevine_ama_answers a
     WHERE a.session_id = s.id) AS total_reactions
FROM grapevine_ama_sessions s
LEFT JOIN grapevine_ama_questions q
  ON q.session_id = s.id AND q.status <> 'rejected'
GROUP BY s.id, s.total_questions, s.total_answered;

GRANT SELECT ON grapevine_ama_session_stats TO anon, authenticated;

-- ── Session 1: Marcy Blum — Luxury Wedding Planner ──────────────────────

INSERT INTO grapevine_ama_sessions (
  id, title, slug, description,
  expert_name, expert_title, expert_bio, expert_credentials,
  session_type, tags,
  status, scheduled_start, scheduled_end, actual_start, actual_end,
  created_at
) VALUES (
  '11111111-1111-4111-8111-111111111111',
  'Ask a Luxury Wedding Planner Anything',
  'ask-marcy-blum-anything',
  'Marcy Blum has planned 500+ weddings — from intimate garden ceremonies to 1,000-guest palace celebrations. She answered the questions our community has been asking about budget, family dynamics, vendor management, and what actually matters on the day.',
  'Marcy Blum',
  'Celebrity Wedding Planner, 30+ years',
  '30 years, 500+ weddings, from intimate garden ceremonies to 1,000-guest palace celebrations. Based in New York, works globally.',
  '["500+ weddings planned", "Featured in Vogue & Harper''s Bazaar", "Based in New York"]'::jsonb,
  'planner',
  '["budget", "planning", "vendor management", "family dynamics"]'::jsonb,
  'archived',
  '2026-04-15 19:00:00-05'::timestamptz,
  '2026-04-15 20:30:00-05'::timestamptz,
  '2026-04-15 19:02:00-05'::timestamptz,
  '2026-04-15 20:41:00-05'::timestamptz,
  '2026-04-15 14:00:00-05'::timestamptz
) ON CONFLICT (slug) DO NOTHING;

-- Q&A pairs for session 1. We insert questions first (status='answered'
-- so the count triggers fire correctly), then answers, then the seed
-- reaction/upvote columns are bumped via UPDATE so we don't need fake
-- auth.users rows.

WITH s1 AS (SELECT id FROM grapevine_ama_sessions WHERE slug='ask-marcy-blum-anything')
INSERT INTO grapevine_ama_questions (
  id, session_id, persona_tag, question_text, is_anonymous, status,
  seed_upvotes, created_at
)
SELECT v.id::uuid, s1.id, v.persona, v.qtext, true, 'answered', v.upv, v.ts::timestamptz
FROM s1, (VALUES
  ('21111111-0001-4111-8111-111111111111', 'Bride, 8 months out', 'What''s the single biggest mistake couples make during planning?', 14, '2026-04-15 19:04:00-05'),
  ('21111111-0002-4111-8111-111111111111', 'Bride, 5 months out', 'How do I handle my MIL wanting to invite 100 extra people we don''t have budget for?', 11, '2026-04-15 19:07:00-05'),
  ('21111111-0003-4111-8111-111111111111', 'Groom, just nodding along', 'Is a wedding planner actually worth the money or can we just use spreadsheets and family help?', 9, '2026-04-15 19:10:00-05'),
  ('21111111-0004-4111-8111-111111111111', 'Momzilla, proudly', 'My daughter wants a ''minimalist'' wedding. How do I support her vision without it looking like we didn''t try?', 13, '2026-04-15 19:14:00-05'),
  ('21111111-0005-4111-8111-111111111111', 'Bride, 3 months out', 'How far in advance should I send the final timeline to vendors?', 7, '2026-04-15 19:17:00-05'),
  ('21111111-0006-4111-8111-111111111111', 'Bride, 11 months out', 'Is it tacky to have a B-list for the guest list?', 8, '2026-04-15 19:21:00-05'),
  ('21111111-0007-4111-8111-111111111111', 'Bridesmaid, exhausted', 'How much should I realistically budget for being in a wedding party?', 12, '2026-04-15 19:25:00-05'),
  ('21111111-0008-4111-8111-111111111111', 'Bride, 7 months out', 'What''s one thing couples always wish they''d spent more on?', 15, '2026-04-15 19:29:00-05'),
  ('21111111-0009-4111-8111-111111111111', 'Groom, just nodding along', 'Any tips for the groom to be actually useful during planning?', 10, '2026-04-15 19:33:00-05'),
  ('21111111-0010-4111-8111-111111111111', 'Bride, 4 months out', 'How do I handle a vendor I''ve already booked but am now unhappy with?', 8, '2026-04-15 19:38:00-05'),
  ('21111111-0011-4111-8111-111111111111', 'Aunty ji, concerned', 'These modern couples want everything ''minimal.'' What happened to grand weddings?', 6, '2026-04-15 19:43:00-05'),
  ('21111111-0012-4111-8111-111111111111', 'Bride, 6 months out', 'What''s the most underrated part of wedding planning that nobody talks about?', 14, '2026-04-15 19:48:00-05')
) AS v(id, persona, qtext, upv, ts)
ON CONFLICT (id) DO NOTHING;

WITH s1 AS (SELECT id FROM grapevine_ama_sessions WHERE slug='ask-marcy-blum-anything')
INSERT INTO grapevine_ama_answers (
  question_id, session_id, answer_text, answered_by, is_highlighted,
  seed_reaction_helpful, seed_reaction_real_talk, seed_reaction_needed_this, seed_reaction_fire,
  created_at
)
SELECT v.qid::uuid, s1.id, v.body, 'Marcy Blum', v.hl, v.h, v.r, v.n, v.f, v.ts::timestamptz
FROM s1, (VALUES
  ('21111111-0001-4111-8111-111111111111', 'Not communicating their actual budget to their planner from day one. I can''t help you if I don''t know what we''re working with. I''ve seen couples waste months falling in love with venues they can''t afford because they were embarrassed to say their number. Your planner isn''t judging you. Your planner is trying to make your money go as far as possible.', true, 6, 5, 4, 3, '2026-04-15 19:05:30-05'),
  ('21111111-0002-4111-8111-111111111111', 'This is the most common conversation I mediate. Here''s what works: frame it as a venue capacity issue, not a money issue. ''The venue holds 250 and we''re at 240'' is much easier for everyone to accept than ''we can''t afford your friends.'' If she pushes, offer her a fixed number — ''we can add 15 more from your list'' — and let her prioritize. Giving her a number gives her agency without giving her the whole guest list.', false, 0, 0, 0, 0, '2026-04-15 19:09:00-05'),
  ('21111111-0003-4111-8111-111111111111', 'I''m obviously biased, but here''s the honest answer: if you have a family member who has genuinely planned a large-scale event before — not just thrown a party, but managed 15 vendors, a timeline, a floor plan, and a budget — then you might be fine. But if your ''family help'' means your aunt who ''knows a guy'' for flowers, hire a planner. At minimum, hire a day-of coordinator. The money you save from vendor negotiations and avoided mistakes usually covers the fee.', false, 0, 0, 0, 0, '2026-04-15 19:13:00-05'),
  ('21111111-0004-4111-8111-111111111111', 'I love this question. Minimalist doesn''t mean empty or cheap — it means intentional. The trick is quality over quantity. One stunning floral installation instead of flowers on every table. A gorgeous custom mandap with clean lines instead of a heavily draped one. Beautiful fabric, perfect lighting, incredible food. Guests won''t count the centerpieces. They''ll remember how it felt. Your daughter has taste. Trust it.', true, 7, 4, 5, 4, '2026-04-15 19:16:00-05'),
  ('21111111-0005-4111-8111-111111111111', 'Two weeks minimum. I send mine three weeks out with a note that says ''reply with any conflicts by Friday.'' Then I send a final confirmed version one week before. Every vendor should have the same document — same timeline, same contact list, same venue load-in details. If your vendors are operating from different timelines, that''s where things fall apart.', false, 0, 0, 0, 0, '2026-04-15 19:20:00-05'),
  ('21111111-0006-4111-8111-111111111111', 'It''s not tacky, it''s practical. Every planner does this. The key is timing — your B-list invitations should go out at least 6 weeks before the wedding so those guests don''t feel like last-minute fillers. And never, ever tell anyone they were on the B-list. Take that to your grave.', false, 0, 0, 0, 0, '2026-04-15 19:24:00-05'),
  ('21111111-0007-4111-8111-111111111111', 'I tell couples they should be aware of what they''re asking. Between outfit, travel, accommodations, bachelorette, gifts, hair and makeup — a bridesmaid can easily spend $2,000-$5,000. If you''re the couple, either cover some of those costs, give genuine flexibility on outfits, or don''t be surprised when someone can''t participate. Being in a wedding party shouldn''t require a payment plan.', false, 0, 0, 0, 0, '2026-04-15 19:28:00-05'),
  ('21111111-0008-4111-8111-111111111111', 'Photography. Every single time. No one regrets spending more on their photographer. I''ve had couples tell me three years later they wish they''d upgraded. The flowers die, the food gets eaten, the DJ goes home. The photos are forever. If you have to cut somewhere else to upgrade your photographer, do it.', true, 8, 6, 7, 5, '2026-04-15 19:32:00-05'),
  ('21111111-0009-4111-8111-111111111111', 'Pick three things you genuinely care about — maybe it''s the music, the food, and the baraat — and own those completely. Research vendors, attend tastings, make decisions. For everything else, be available when your partner needs a sounding board but don''t insert opinions you don''t actually have. Saying ''I don''t mind, you choose'' on things you truly don''t care about is not being unhelpful — it''s being honest. What''s unhelpful is pretending to care about napkin colors and then being resentful about it.', false, 0, 0, 0, 0, '2026-04-15 19:37:00-05'),
  ('21111111-0010-4111-8111-111111111111', 'First, name the specific issue. ''I''m unhappy'' isn''t actionable. ''You haven''t responded to my last three emails within 48 hours'' is. Have a direct conversation — phone, not text — and give them a chance to correct it. If the issue is fundamental (style mismatch, reliability concerns), review your contract''s cancellation terms. Some vendors will let you out gracefully if you''re honest. I''ve seen couples waste months being passively unhappy when a 20-minute conversation would have fixed it.', false, 0, 0, 0, 0, '2026-04-15 19:42:00-05'),
  ('21111111-0011-4111-8111-111111111111', 'Grand weddings are alive and well — I planned a 900-guest celebration in Udaipur last month. But ''grand'' is being redefined. For some couples, grandeur is a massive guest list and a palace venue. For others, it''s a 100-person wedding with extraordinary food, a couture outfit, and a photographer who charges more than some people''s entire wedding budget. Both are grand. They''re just grand in different languages.', false, 0, 0, 0, 0, '2026-04-15 19:47:00-05'),
  ('21111111-0012-4111-8111-111111111111', 'The week-of timeline. Everybody obsesses over the venue, the outfit, the décor. Almost nobody spends enough time on the minute-by-minute logistics of the actual day. When does the decorator load in? When does the bride arrive for photos? How long is the gap between ceremony and reception? Where do guests go during that gap? A beautiful wedding with bad timing feels chaotic. A simpler wedding with perfect timing feels effortless.', true, 9, 5, 6, 4, '2026-04-15 19:52:00-05')
) AS v(qid, body, hl, h, r, n, f, ts)
ON CONFLICT (question_id) DO NOTHING;

-- ── Session 2: Ananya S. — Real Bride ───────────────────────────────────

INSERT INTO grapevine_ama_sessions (
  id, title, slug, description,
  expert_name, expert_title, expert_bio, expert_credentials,
  session_type, tags,
  status, scheduled_start, scheduled_end, actual_start, actual_end,
  created_at
) VALUES (
  '22222222-2222-4222-8222-222222222222',
  'Real Talk: I Planned a 300-Guest Wedding on a Budget',
  'real-talk-300-guest-wedding-budget',
  'Ananya pulled off a 300-guest, 4-event wedding in Dallas for under $80K — without a planner. She answered the questions every budget-conscious bride wants to ask but is too embarrassed to.',
  'Ananya S.',
  'Real Bride · Dallas, 2025',
  'Planned a 300-guest, 4-event wedding in Dallas for under $80K without a planner. Survived to tell the tale.',
  '["300 guests", "4 events", "$80K total budget", "Dallas, 2025"]'::jsonb,
  'real_bride',
  '["budget", "diy", "dallas", "family", "vendor tips"]'::jsonb,
  'archived',
  '2026-03-22 19:00:00-05'::timestamptz,
  '2026-03-22 20:30:00-05'::timestamptz,
  '2026-03-22 19:01:00-05'::timestamptz,
  '2026-03-22 20:38:00-05'::timestamptz,
  '2026-03-22 14:00:00-05'::timestamptz
) ON CONFLICT (slug) DO NOTHING;

WITH s2 AS (SELECT id FROM grapevine_ama_sessions WHERE slug='real-talk-300-guest-wedding-budget')
INSERT INTO grapevine_ama_questions (
  id, session_id, persona_tag, question_text, is_anonymous, status,
  seed_upvotes, created_at
)
SELECT v.id::uuid, s2.id, v.persona, v.qtext, true, 'answered', v.upv, v.ts::timestamptz
FROM s2, (VALUES
  ('22221111-0001-4222-8222-222222222222', 'Bride, 9 months out', 'How did you keep 300 guests under $80K? That seems impossible.', 15, '2026-03-22 19:03:00-05'),
  ('22221111-0002-4222-8222-222222222222', 'Bride, 6 months out', 'Did you feel like you were missing out by not having a planner?', 9, '2026-03-22 19:07:00-05'),
  ('22221111-0003-4222-8222-222222222222', 'Momzilla, proudly', 'How did you handle family members who wanted to add guests beyond the budget?', 12, '2026-03-22 19:11:00-05'),
  ('22221111-0004-4222-8222-222222222222', 'Bride, 4 months out', 'What''s one thing you''d spend MORE on if you did it again?', 14, '2026-03-22 19:15:00-05'),
  ('22221111-0005-4222-8222-222222222222', 'Groom, just nodding along', 'What did the groom actually do during planning?', 10, '2026-03-22 19:20:00-05'),
  ('22221111-0006-4222-8222-222222222222', 'Bride, 7 months out', 'What vendor category had the biggest price variation?', 11, '2026-03-22 19:25:00-05'),
  ('22221111-0007-4222-8222-222222222222', 'Bridesmaid, exhausted', 'Any tips for being helpful to a budget-conscious bride without making it awkward?', 8, '2026-03-22 19:29:00-05'),
  ('22221111-0008-4222-8222-222222222222', 'Bride, 10 months out', 'How did you find good vendors on a budget?', 13, '2026-03-22 19:33:00-05'),
  ('22221111-0009-4222-8222-222222222222', 'Bride, 5 months out', 'What''s something you cut from the budget that guests definitely noticed?', 9, '2026-03-22 19:38:00-05'),
  ('22221111-0010-4222-8222-222222222222', 'Bride, 12 months out', 'If you could only give one piece of advice to a budget bride, what would it be?', 15, '2026-03-22 19:42:00-05')
) AS v(id, persona, qtext, upv, ts)
ON CONFLICT (id) DO NOTHING;

WITH s2 AS (SELECT id FROM grapevine_ama_sessions WHERE slug='real-talk-300-guest-wedding-budget')
INSERT INTO grapevine_ama_answers (
  question_id, session_id, answer_text, answered_by, is_highlighted,
  seed_reaction_helpful, seed_reaction_real_talk, seed_reaction_needed_this, seed_reaction_fire,
  created_at
)
SELECT v.qid::uuid, s2.id, v.body, 'Ananya S.', v.hl, v.h, v.r, v.n, v.f, v.ts::timestamptz
FROM s2, (VALUES
  ('22221111-0001-4222-8222-222222222222', 'The biggest hack was the venue. We used a community center for the ceremony and a hotel ballroom for the reception — but we negotiated the ballroom rate by booking on a Thursday. Saved $12K right there. The second biggest save was catering — we used a home caterer for the mehendi and haldi (amazing food, half the price of commercial catering) and only used the expensive caterer for the reception. Third: I did my own invitations using Canva and a local printer. Total invite cost: $400 for 300 families.', false, 0, 0, 0, 0, '2026-03-22 19:05:00-05'),
  ('22221111-0002-4222-8222-222222222222', 'Honestly, yes — during the last two weeks. The planning itself was manageable because I''m organized and I like spreadsheets. But the week of the wedding, I was coordinating vendors via text while getting my mehendi done and it was genuinely stressful. If I could go back, I''d skip the planner for the 10-month planning phase and hire a day-of coordinator for $1,500-$2,000. That''s the sweet spot.', false, 0, 0, 0, 0, '2026-03-22 19:09:00-05'),
  ('22221111-0003-4222-8222-222222222222', 'I gave both sets of parents a number: 30 additional guests each, non-negotiable. I framed it as a venue fire code issue (it wasn''t, but they didn''t check). My MIL pushed back and I said ''I''d love to include everyone, but each additional guest costs us $180 in food and seating alone — if you''d like to cover the additional guests, we can absolutely add them.'' She picked her 30.', false, 0, 0, 0, 0, '2026-03-22 19:14:00-05'),
  ('22221111-0004-4222-8222-222222222222', 'The photographer. We went mid-range and the photos are fine but not spectacular. I look at other weddings with those cinematic, editorial-quality photos and I feel a pang. Everything else from the wedding is a memory now — the photos are the only thing I look at regularly. I''d cut the décor budget by $3K and put it toward a premium photographer.', false, 0, 0, 0, 0, '2026-03-22 19:18:00-05'),
  ('22221111-0005-4222-8222-222222222222', 'My husband handled four things: the baraat logistics (horse, DJ, route), the bar menu and alcohol purchasing, the honeymoon planning, and all technology (wedding website, music playlists, AV setup at the venue). Everything else was me and my mom. But here''s what mattered most — he showed up to every vendor meeting, he gave honest opinions when asked, and he never once said ''whatever you want'' when I genuinely needed a second opinion. That''s more valuable than managing a spreadsheet.', false, 0, 0, 0, 0, '2026-03-22 19:23:00-05'),
  ('22221111-0006-4222-8222-222222222222', 'Décor, by a mile. I got quotes from $5,000 to $35,000 for essentially the same mandap concept. The $5K vendor and the $15K vendor produced nearly identical work — I saw their portfolios side by side. The difference was the $15K vendor had a bigger Instagram following. I went with the $5K vendor and the mandap was gorgeous. Always ask for portfolios of similar work, not just their highlight reel.', false, 0, 0, 0, 0, '2026-03-22 19:28:00-05'),
  ('22221111-0007-4222-8222-222222222222', 'The most helpful thing my bridesmaids did was never once making me feel weird about budget decisions. When I said ''pick any outfit in this color family under $100,'' they just did it — no questions, no ''are you sure you don''t want us to match?'' When I said we were doing a potluck-style haldi at home, they showed up with dishes and decorations without being asked. The second most helpful thing: they stopped suggesting expensive add-ons. Every ''wouldn''t it be cute if...'' costs money.', false, 0, 0, 0, 0, '2026-03-22 19:32:00-05'),
  ('22221111-0008-4222-8222-222222222222', 'Three strategies. One: I searched Instagram hashtags for Dallas weddings in my budget range and DM''d the tagged vendors directly. Two: I asked every vendor I booked to recommend other vendors in a similar price range — vendors know who else works at their price point. Three: I looked for vendors who were 1-2 years into their business. They have the skills but not the demand yet, so their prices are 30-40% lower. My mehendi artist was in her second year and she was phenomenal.', false, 0, 0, 0, 0, '2026-03-22 19:36:00-05'),
  ('22221111-0009-4222-8222-222222222222', 'The centerpieces. I did simple candle clusters instead of floral arrangements and multiple people asked about it. Not in a mean way — more like ''oh, I expected flowers on the tables.'' So yes, people notice. But here''s the thing: they noticed for about 30 seconds, then they ate dinner and danced and had a great time. Nobody left saying ''the wedding was beautiful BUT the centerpieces.'' The things people actually talked about: the food, the music, and my husband''s baraat entrance.', false, 0, 0, 0, 0, '2026-03-22 19:41:00-05'),
  ('22221111-0010-4222-8222-222222222222', 'Decide what your three non-negotiables are BEFORE you start planning, and protect those budget lines no matter what. For me it was food quality, photography, and the ceremony mandap. Everything else was flexible. When I needed to cut, I never touched those three. This saves you from the death-by-a-thousand-cuts problem where you shave a little from everything and end up with a wedding where nothing feels special. It''s better to have three incredible things and seven good-enough things than ten mediocre things.', true, 8, 6, 7, 5, '2026-03-22 19:45:00-05')
) AS v(qid, body, hl, h, r, n, f, ts)
ON CONFLICT (question_id) DO NOTHING;

-- ── Session 3: Upcoming — gives the live banner something to point to ───

INSERT INTO grapevine_ama_sessions (
  id, title, slug, description,
  expert_name, expert_title, expert_bio, expert_credentials,
  session_type, tags,
  status, scheduled_start, scheduled_end,
  created_at
) VALUES (
  '33333333-3333-4333-8333-333333333333',
  'Ask a Pandit Anything: Ceremony, Tradition, Modern Couples',
  'ask-a-pandit-anything',
  'Pandit Sharma has officiated 800+ ceremonies. He''s answering your questions about tradition, modern adaptations, blended ceremonies, and what really matters under the mandap.',
  'Pandit Vijay Sharma',
  'Officiant · 800+ ceremonies',
  '20 years officiating Hindu weddings across the US, including blended and interfaith ceremonies. Open to "is it bad luck if…" questions.',
  '["800+ ceremonies", "Interfaith experienced", "Based in Houston"]'::jsonb,
  'pandit',
  '["ceremony", "tradition", "interfaith"]'::jsonb,
  'upcoming',
  (now() + interval '5 days')::timestamptz,
  (now() + interval '5 days' + interval '90 minutes')::timestamptz,
  now()
) ON CONFLICT (slug) DO NOTHING;

# Ananya — AI Feature Specification for the Wedding Checklist

## Design Philosophy

Every AI feature in Ananya is **task-shaped, not chat-shaped**. We refuse the generic "ask me anything" drawer — instead, each checklist task gets a bespoke AI surface that matches the *actual* mental model of that decision: a drag-drop canvas where a canvas belongs, a visual diff where a comparison belongs, a printable program where a program belongs. The AI is treated as a **constraint solver and artifact generator**, not a conversationalist. We lean into what LLMs + multimodal models uniquely do well: **parsing messy cultural/familial inputs into structure, generating ranked options under hard constraints, and producing finished artifacts the couple can hand to a vendor unchanged**. Indian weddings are high-dimensional — 5 events × 500 guests × 20 vendors × 8 regional tradition layers — so our features assume that density rather than hiding it. Every feature passes one test: if we stripped the Indian-wedding context out, the feature would stop making sense. And every output is addressable — it lives in the project, can be edited by hand, and feeds the next feature downstream.

---

## Phase 0 — Foundation & Vision

### Task: Decide tradition profile & non-negotiables
**Event/phase:** Couple Alignment (12–18 months out)
**The real problem underneath:** An interfaith or inter-regional couple (e.g., Gujarati bride + Tamil Brahmin groom) doesn't know what ceremonies even *exist* on the other side, let alone which are non-negotiable for the in-laws. They fear accidentally skipping something load-bearing.
**Generic AI would say:** "Summarize the differences between Gujarati and Tamil weddings."

**The Ananya AI feature:**
- **Name:** Tradition Braid
- **What it does:** Takes each partner's declared background (region, sub-community, religious observance level, family strictness) and generates a side-by-side ceremony map showing which rituals overlap, which are mutually exclusive, and which can be stacked. Surfaces a "braid" of 3 recommended hybrid programs — tradition-forward, balanced, modern-fusion — each with the specific ceremonies and their cultural meaning.
- **UI surface:** Two vertical columns (one per partner's heritage), ceremonies as cards; AI draws connective lines between equivalents (e.g., Gujarati *Mameru* ↔ Tamil *Nichayathartham*). A "Braid" button generates three merged programs as selectable timelines. Each ceremony card opens a panel with "why this matters to your in-laws" written in family-sensitive language.
- **Inputs it uses:** Partner profiles (region, community, observance), family roles captured in the profile step, any uploaded family elders' notes/voice memos.
- **Outputs it produces:** A canonical ceremony list that seeds the checklist, pandit brief, invitation content, and muhurat request downstream.
- **Model/prompt approach:** Claude Opus 4.7 with a retrieval layer over a curated corpus of regional ritual references. Structured JSON output (`ceremonies[]` with `name`, `originTradition`, `required`, `equivalentOnOtherSide`, `canMergeWith`, `inLawSensitivity`). No free-form text in the primary output.
- **Why this specific feature for this specific task:** Interfaith planning failure is almost always a *knowledge asymmetry* problem, not a preference problem. The feature compresses what would otherwise be six awkward calls with aunts into one structured view that respects both sides.

---

### Task: Set total budget & allocate by event
**Event/phase:** Budget Architecture
**The real problem underneath:** The couple has a ceiling number but no felt sense of what ₹X buys across 5 events. They also don't know how family contribution politics will shape which line items can be cut.
**Generic AI would say:** "Here's a suggested budget breakdown."

**The Ananya AI feature:**
- **Name:** Spend Simulator
- **What it does:** A live, reactive budget canvas where every slider shows *consequence*, not just math. Moving "Decor" from ₹30L → ₹20L instantly shows which specific things you lose ("imported floral ceiling removed, mandap downgrade from hand-carved to modular, no aisle runners"). Running the simulator against the current vendor shortlists, it flags which bookings are already locked and recomputes the remaining flex.
- **UI surface:** Horizontal stacked budget bar per event, clicking an event explodes into a treemap of categories. Every category has a "what this buys" tooltip populated from the vendor database. Trade-off slider at bottom: "If I cut ₹5L, where should it come from?" → AI highlights 3 candidate cuts on the canvas with impact severity.
- **Inputs it uses:** Ceiling, event count, expected guest count, region/city (for regional cost baselines), current vendor shortlists, any signed contracts, family contribution split.
- **Outputs it produces:** A versioned budget document that feeds payment schedule builder, vendor shortlist filters, and the cost-per-guest metric shown on the checklist dashboard.
- **Model/prompt approach:** Claude Sonnet 4.6 for reasoning over structured cost data; tool use for pulling vendor quote ranges; structured JSON output. No generation — purely reasoning + retrieval.
- **Why this specific feature for this specific task:** Budget tools fail when they're spreadsheets disguised as apps. The magic moment here is *consequence at a glance* — ₹5L stops being an abstract number and becomes "no floral ceiling."

---

## Phase 1 — Branding & Identity

### Task: Choose wedding hashtag
**Event/phase:** Wedding Brand Development
**The real problem underneath:** The couple wants something clever with their names, that hasn't been used (Instagram check), that their family can pronounce, and that works across event-specific variants.
**Generic AI would say:** "Here are 20 hashtag ideas for Pooja and Raj."
*(This already exists in the popout gallery — reference `components/popout/templates/hashtag_picker`.)*

**The Ananya AI feature:**
- **Name:** Hashtag Forge (upgrade to existing popout)
- **What it does:** Generates candidate hashtags in four creative registers (portmanteau, pun, cultural reference, alliteration), live-checks availability on Instagram/TikTok, and produces event-specific variants automatically (#PoojaRajMehndi, #PoojaRajSangeet). Scores each on pronounceability (for elders), brandability, and search uniqueness.
- **UI surface:** Existing hashtag_picker popout extended with a 2×N grid: candidate tag | live availability dots per platform | event variant expander | "say it out loud" pronunciation preview. Selected tag locks and propagates to stationery, signage, and website modules.
- **Inputs it uses:** Both first names, last names, meeting story (one sentence), tone preference (playful/formal), event list.
- **Outputs it produces:** A locked primary hashtag + per-event secondary hashtags, stored as brand tokens consumable by invitation, signage, and welcome-kit features.
- **Model/prompt approach:** Claude Haiku 4.5 for fast candidate generation (cheap, high-volume); Sonnet for the scoring pass; real IG/TikTok availability via a search tool.
- **Why this specific feature for this specific task:** The couple has already used `#PoojaRaj2026` across ten false starts. The magic is the event-variant autogeneration and the live availability — they commit once and every downstream artifact inherits the tag.

---

### Task: Design wedding monogram
**Event/phase:** Wedding Brand Development
**The real problem underneath:** Couples want a monogram that feels heritage-rooted (peacock, lotus, temple arch) but modern — and they can't describe typography or motif geometry without a designer in the room.
**Generic AI would say:** "Here's a monogram design. Want me to try another?"

**The Ananya AI feature:**
- **Name:** Monogram Designer (existing template — upgrade path)
- **What it does:** Takes initials + regional heritage + color palette + aesthetic direction (3 reference images uploaded from Pinterest) and generates 12 vector monogram candidates. Each is exportable as SVG at brand resolution. Motif library adapts: Gujarati → bandhani rosette, Tamil → temple gopuram, Punjabi → jhumka silhouette, Marwari → chaukhandi arch.
- **UI surface:** Reference `components/popout/templates/monogram_designer`. 4×3 grid of candidates; each tile shows the monogram on three backgrounds (invitation card, welcome kit box, gobo projection). Sliders: ornamentation density, typography formality, motif prominence. Lock → propagates to all stationery.
- **Inputs it uses:** Initials, regional heritage, color palette tokens, uploaded Pinterest refs.
- **Outputs it produces:** A brand asset kit (SVG, PNG, single-color knockout, vertical/horizontal variants) stored as brand tokens.
- **Model/prompt approach:** Multimodal — Claude analyzes reference images for aesthetic direction, then tool-calls a vector generation service with structured style parameters. Output is SVG, not raster.
- **Why this specific feature for this specific task:** The artifact is production-grade (vector, not pixel-blurry), so the couple can hand it directly to their invitation vendor. That's the magic — skipping the designer-brief round.

---

### Task: Build per-event color palette
**Event/phase:** Wedding Brand Development
**The real problem underneath:** Choosing colors is easy; choosing five *inter-event* palettes that progress narratively (mehndi → sangeet → wedding → reception) without clashing and while staying photographable is hard.
**Generic AI would say:** "Here are some color palette suggestions."

**The Ananya AI feature:**
- **Name:** Color Story
- **What it does:** Generates a narrative color arc across all events — each event's palette is informed by the one before, like a film. Validates against traditional expectations (red+gold must appear at ceremony), photographs-well-under-tungsten rules, and visual contrast to the bride's lehenga. Produces palette + swatches + sample decor/outfit/stationery applications.
- **UI surface:** Reference `components/popout/templates/color_palette` upgraded. Horizontal event strip (Haldi → Mehndi → Sangeet → Wedding → Reception); each event shows a 5-swatch palette; hovering reveals "why this works with the next event." Timeline slider at top: "Traditional → Modern" re-generates the whole arc. Export → locks palette into every downstream decor/attire/stationery feature.
- **Inputs it uses:** Event list, bride's lehenga images (if uploaded), venue lighting (indoor/outdoor/tungsten/natural), tradition profile.
- **Outputs it produces:** Per-event palette JSON (hex + names + role: primary/accent/neutral) propagated as brand tokens.
- **Model/prompt approach:** Claude Sonnet with multimodal ingestion of lehenga/venue photos; constraint-checked against a rules table for tradition + photography.
- **Why this specific feature for this specific task:** Palettes built in isolation clash on film. The arc-based thinking is the magic — the couple sees the wedding as a single visual story, not five disconnected events.

---

## Phase 2 — Core Bookings

### Task: Build guest list & manage invite tiers
**Event/phase:** Guest Management
**The real problem underneath:** The couple has a WhatsApp message from dad with 60 names, a Google Doc from mom with 80, aunt Meena's "don't forget these" list of 20, and they need to end up at a defensible 450. Every cut has family-politics consequences.
**Generic AI would say:** "Upload your guest list and I'll clean it."

**The Ananya AI feature:**
- **Name:** Social Distance Solver
- **What it does:** Ingests messy guest inputs (text dumps, forwarded contact vCards, scanned handwritten notes) and clusters every guest by *social distance rings*: immediate family → extended family → family friends → work → couple's friends. A capacity slider (300 → 500 → 700) reveals which rings get included at each tier, with an explainer for every cut ("at 450, you lose dad's office colleagues from the ceremony but keep them for reception"). Flags politically-load-bearing guests (elders, family friends who hosted your parents' weddings) as uncut-able.
- **UI surface:** Concentric ring visualization — bride and groom at center, rings expanding outward. Slider at bottom controls capacity. Each guest is a dot; hovering shows "how they got here" (added by whom, relationship). AI annotations appear as callout bubbles: "Consider moving Sharma uncle up a ring — he attended both your parents' weddings."
- **Inputs it uses:** Uploaded WhatsApp exports, vCards, photos of handwritten lists, family point-people's contributions, explicit must-invite markers.
- **Outputs it produces:** Structured guest database with relationship tags, ring assignments, per-event eligibility (some rings invited only to reception), feeds RSVP, seating, welcome kit, and photo matrix features.
- **Model/prompt approach:** Claude Opus for the ambiguity-heavy relationship inference; multimodal for handwritten list OCR; structured JSON output with a strict `Guest` schema.
- **Why this specific feature for this specific task:** Guest list tools treat this like a CSV. It's not — it's a political document. Social-distance ring reasoning is the magic because it matches how families actually think.

---

### Task: Shortlist venues per event
**Event/phase:** Venue Selection
**The real problem underneath:** The couple can't tell from photos whether a venue can handle 600 guests with a havan (open flame), outside catering (critical for Indian food), and a 3 AM last-call muhurat.
**Generic AI would say:** "Here are highly-rated venues in your city."

**The Ananya AI feature:**
- **Name:** Venue Fit Scorer
- **What it does:** For each venue in Ananya's database, runs an Indian-wedding-specific compatibility pass: fire permit? outside caterer allowed? noise curfew vs. muhurat time? baraat entry route? bridal suite? parking for 300 cars + valet? Displays a radar chart per venue showing fit across 8 axes that actually matter for Indian weddings (not "WiFi quality"). Flags dealbreakers before the site visit.
- **UI surface:** Grid of venue cards; each has a radar chart overlay. Filter bar at top: event type, capacity, date (cross-checked against muhurat). Click a venue → deep-dive panel with prior Indian wedding photos at that venue (scraped from vendor portfolios), AI-authored "what could go wrong" list specific to Indian weddings ("this venue's 11 PM noise curfew won't clear your pheras muhurat at 11:47 PM").
- **Inputs it uses:** Venue DB (capacity, permits, catering rules, curfews), muhurat times, guest count, tradition profile (Sikh weddings need longer morning window, etc.), event list.
- **Outputs it produces:** Ranked shortlist with a "fit score" + red-flag list per venue. Feeds site-visit scheduling.
- **Model/prompt approach:** Sonnet 4.6 with tool use over the venue DB. Structured output with `dealbreakers[]`, `warnings[]`, `strengths[]` per venue.
- **Why this specific feature for this specific task:** Generic venue tools rank by rating. Indian weddings fail on invisible constraints (fire, outside caterer, baraat entry). Surfacing these *before* the site visit saves weeks.

---

### Task: Match with the right pandit
**Event/phase:** Vendor Selection
**The real problem underneath:** A South Indian bride marrying into a North Indian family needs a pandit who can credibly perform both *kanyadaan* and *mangal pheras* in the right regional register, speak the elders' mother tongue for the explanations, and know the family's gotra/sampradaya.
**Generic AI would say:** "Here are 5-star pandits in your area."

**The Ananya AI feature:**
- **Name:** Pandit Match
- **What it does:** Matches the family against pandits in the DB on: regional ritual specialty (Iyer vs. Iyengar vs. Smartha vs. Madhwa if South Indian; Brahmo vs. Sanatani if Bengali), spoken languages (critical for elders who need the ceremony explained live in Marathi or Tamil), comfort with interfaith/inter-regional blending, willingness to work alongside a second pandit from the other side, and mandap setup requirements. Surfaces 3–5 candidates with an explicit "why this pandit" paragraph per match.
- **UI surface:** Side panel invoked from the "Book pandit" task. Top: family context card (auto-populated from tradition profile). Middle: candidate cards, each with a "compatibility" strip across 6 axes. Bottom: one-click "schedule intro call" with question brief pre-generated (gotra check, specific pherā count, whether they'll do inter-regional blending).
- **Inputs it uses:** Tradition profile, gotra (if entered), ceremony list from Tradition Braid, both families' elder languages, pandit DB.
- **Outputs it produces:** Shortlist → selected pandit → auto-generated ritual brief (with ceremony list, muhurat times, family-specific customs to honor) sent as part of booking.
- **Model/prompt approach:** Sonnet with DB tool use; structured output. The ritual brief is templated, not free-generated, for accuracy.
- **Why this specific feature for this specific task:** This is the most fragile vendor booking in an Indian wedding and the most under-served by generic tools. The wrong pandit means the ceremony doesn't feel legitimate to the elders. Specificity is the magic.

---

### Task: Shortlist HMUA (hair & makeup artist)
**Event/phase:** Vendor Selection
**The real problem underneath:** The bride has 30 Instagram-saved inspo looks but doesn't know which HMUAs can actually execute *her face* in *that style* — and each HMUA has a signature aesthetic they gravitate toward regardless of the brief.
**Generic AI would say:** "Here are top-rated HMUAs with portfolios."

**The Ananya AI feature:**
- **Name:** Bridal Look DNA
- **What it does:** Ingests the bride's uploaded inspo folder + her own face photos (front, 3/4, profile) + her lehenga images. Analyzes each HMUA's portfolio for *their* aesthetic signature (dewy vs. matte base, sharp cut-crease vs. soft wash, heavy vs. minimal contouring). Clusters HMUAs by style signature. For the 3 best-matched, generates a "you-on-their-aesthetic" preview using multimodal simulation (face + style reference).
- **UI surface:** Three-panel layout: (1) her inspo moodboard with dominant style tags extracted, (2) HMUA grid clustered by aesthetic signature with style-DNA chips, (3) preview panel showing simulated look on her face. Slider: "traditional bold" ↔ "minimal modern." Locked selection triggers trial-booking flow.
- **Inputs it uses:** Uploaded inspo folder, bride's face photos, lehenga photos, HMUA portfolio database, event list (some bridal looks need haldi/mehndi variants too).
- **Outputs it produces:** Ranked HMUA shortlist + selected look references per event + trial-booking brief.
- **Model/prompt approach:** Multimodal Claude for aesthetic extraction + clustering. Image simulation via a tool-called diffusion service with style-transfer constraints. Explicit guardrails to prevent feature-altering edits (no skin lightening, no face reshaping).
- **Why this specific feature for this specific task:** Brides make this decision based on misleading portfolios. The aesthetic-DNA clustering + your-face preview is the magic — it moves from "I hope" to "I see."

---

### Task: Shortlist photographer
**Event/phase:** Vendor Selection
**The real problem underneath:** Every photographer's Instagram is a highlight reel. The couple can't tell who's genuinely great at *low-light mandap pheras* vs. who only shoots dreamy outdoor receptions.
**Generic AI would say:** "Here are photographers you might like."

**The Ananya AI feature:**
- **Name:** Portfolio X-Ray
- **What it does:** Ingests 10–15 photographer Instagram handles (or portfolio URLs), samples 50+ images each, and computes each photographer's actual strengths: candid hit rate, low-light ceremony capability, group photo composition, baraat energy capture, detail-shot quality, film vs. digital signature. Produces a comparison grid across the axes the couple chose as priorities.
- **UI surface:** Input strip: paste handles. Output: comparison table, photographers as columns, capability axes as rows, each cell a score with 2 representative sample shots. Filter at top: "Prioritize candids" / "Prioritize ceremony" / "Prioritize portraits" re-sorts photographers. Click a cell → lightbox of 6 example shots for that axis.
- **Inputs it uses:** Portfolio URLs / Instagram handles, event list, priority weights chosen by couple.
- **Outputs it produces:** Shortlist + evidence pack per photographer (used during in-person meeting).
- **Model/prompt approach:** Multimodal Claude for per-image classification; aggregation at the photographer level; structured output. Explicit refusal to score based on "beauty standards" — only technical/compositional axes.
- **Why this specific feature for this specific task:** Photographer selection is dominated by follower count. An evidence-based capability X-ray is the magic.

---

### Task: Shortlist caterer
**Event/phase:** Vendor Selection
**The real problem underneath:** Caterers send 40-page menus in PDF/photo form with regional dish names that the bride's side (North Indian) doesn't recognize and the groom's side (Tamil) does. Evaluating cross-catererly is a Rosetta stone problem.
**Generic AI would say:** "Here's a summary of each caterer's menu."

**The Ananya AI feature:**
- **Name:** Menu Rosetta
- **What it does:** Ingests menu PDFs/photos from 3–5 caterers. Extracts and normalizes every dish into a canonical schema (name, region, primary ingredients, Jain/vegan/gluten compatibility, spice level, typical serving style). Produces a cross-caterer comparison: "Caterer A has 14 authentic Gujarati items, Caterer B has 2." Flags authenticity gaps ("Caterer C lists *idiyappam* but their description suggests they're confusing it with *sevai* — ask about this"). Suggests menu swaps for dietary constraints.
- **UI surface:** Drop zone for menu files. Output: a dish matrix — dishes as rows (grouped by region), caterers as columns, authenticity + cost badges per cell. Side panel shows per-caterer strengths ("deep Gujarati, weak on Tamil"). Filter: dietary profile, event.
- **Inputs it uses:** Uploaded menu files, dietary constraint data from RSVPs, event list, tradition profile.
- **Outputs it produces:** Per-event menu recommendation per caterer + curated tasting menu brief for the tasting visit.
- **Model/prompt approach:** Multimodal extraction from PDFs/photos → structured dish records in a normalized `Dish` schema. Sonnet for authenticity flagging via retrieval against a regional cuisine reference. Explicit confidence scores on extractions.
- **Why this specific feature for this specific task:** Menu comparison is otherwise done on printouts with highlighters. Normalization across caterers, across regions, with authenticity flags, is not something a generic tool can do.

---

### Task: Shortlist decor vendor
**Event/phase:** Vendor Selection
**The real problem underneath:** The couple has a 200-pin Pinterest board but no way to verify which decor vendors can actually execute it at their venue and budget.
**Generic AI would say:** "Share your inspiration and I'll suggest vendors."

**The Ananya AI feature:**
- **Name:** Execution Match
- **What it does:** Ingests the couple's Pinterest board + budget + venue dimensions. Analyzes the aesthetic (color palette, floral density, structural elements like mandap style). Cross-references the decor vendor DB: which vendors have *actually delivered* similar work in the past 2 years, at what budget bands. Flags aspirational pins that no vendor in the shortlist can hit at budget.
- **UI surface:** Left panel: couple's moodboard. Right panel: vendor cards, each showing 3 past-work shots most similar to the moodboard with a "match score." Aspirational-pin warnings float over specific pins: "No vendor in your budget has done a ceiling of this density — expect a 60% scale-down." Click a vendor → a generated "what they'd probably quote" range based on the moodboard's complexity.
- **Inputs it uses:** Pinterest board images, venue dimensions/photos, decor vendor DB (past-work tagged), budget.
- **Outputs it produces:** Ranked decor vendor shortlist + calibrated moodboard (aspirational pins flagged) + quote-range estimate per vendor.
- **Model/prompt approach:** Multimodal similarity matching between pins and vendor portfolios; retrieval-augmented reasoning over vendor past-work DB; structured output.
- **Why this specific feature for this specific task:** The Pinterest-to-reality gap is the #1 source of decor disappointment. Calibrating expectations *before* the vendor meeting is the magic.

---

## Phase 3 — Pre-Wedding Events

### Task: Curate menus across all events
**Event/phase:** Food & Beverage
**The real problem underneath:** 5 events × 3 meal service points = up to 15 menus. Elders complain if a dish repeats. Regional authenticity has to rotate (groom's side Tamil breakfast one morning, bride's side Gujarati lunch the next). Jain/vegan/allergy constraints thread through all of them.
**Generic AI would say:** "Here's a sample wedding menu."

**The Ananya AI feature:**
- **Name:** Menu Architect
- **What it does:** Builds a full multi-event menu grid as a constraint satisfaction problem: no dish repeats across events, regional rotation respects both families (e.g., bride's-side-led lunch, groom's-side-led dinner), dietary coverage verified for every guest segment, cost per head stays within the event's budget envelope. Produces a kitchen-ready brief for the caterer plus a guest-facing menu card per event.
- **UI surface:** A matrix canvas: events as columns, meal services as rows, dishes as draggable chips. AI populates initial layout; couple can lock/replace any dish and AI rebalances. Right rail: live constraint readout (regional balance %, dietary coverage %, repetition count, cost/head per event). One button: "Generate guest menu cards" — propagates to stationery.
- **Inputs it uses:** Tradition profile, caterer's dish catalog from Menu Rosetta, dietary RSVP data, budget per event, guest count per event.
- **Outputs it produces:** Kitchen brief (caterer), menu cards (stationery), signage (for live stations).
- **Model/prompt approach:** Sonnet with structured output enforcing schema. Treated as a constraint solver; Claude proposes dish placements and the app validates via rules before surfacing.
- **Why this specific feature for this specific task:** The cross-event dish non-repetition + regional rotation problem is exactly the kind of multi-constraint reasoning an LLM is uniquely suited to, and it's the #1 thing caterers and families fight about.

---

### Task: Design live stations and chaat counters
**Event/phase:** Food & Beverage — Sangeet/Reception
**The real problem underneath:** Live stations create magical guest moments but fail when queues snake through the dance floor or the pani puri station runs dry at minute 40.
**Generic AI would say:** "Suggest some live station ideas."

**The Ananya AI feature:**
- **Name:** Station Flow
- **What it does:** Given the venue floor plan and expected guest count, generates a live-station layout optimized for traffic flow, service throughput (dishes-per-minute), and dance floor protection. Simulates peak-hour queue lengths per station. Suggests which stations run all night vs. appear at specific windows (kulfi cart at 10:30 PM, not earlier).
- **UI surface:** Annotated floor plan. Live stations as draggable icons; drop one and AI shows projected queue length, suggested staff count, and ingredient replenishment cadence. Heat-map overlay toggles between "guest density" and "queue pressure." A timeline scrubber at the bottom shows how the layout should change through the evening.
- **Inputs it uses:** Venue floor plan (uploaded PDF/image), guest count, event type, menu selection, bar location (to avoid clustering), service duration.
- **Outputs it produces:** A station layout spec (delivered to the caterer + venue coordinator) with per-station staffing and timing notes.
- **Model/prompt approach:** Multimodal (floor plan ingestion) + Sonnet for simulation reasoning + structured output. Simulation is rule-based; Claude generates and critiques.
- **Why this specific feature for this specific task:** The "rani of chaat" moment fails operationally. Turning it into a throughput problem with a simulated preview is the magic.

---

### Task: Design the bar program
**Event/phase:** Food & Beverage — Sangeet/Reception
**The real problem underneath:** Some events are dry (ceremony, haldi), some are full bar (sangeet, reception), and elders want specific drinks (whisky for groom's uncles, masala wines for the aunties). Signature cocktails tied to the couple's story are a big opportunity.
**Generic AI would say:** "Here's a sample bar menu."

**The Ananya AI feature:**
- **Name:** Bar Program Architect
- **What it does:** Builds a per-event bar spec (dry/beer-wine/full bar), generates 3 signature cocktails tied to the couple's story (meeting city, favorite flavors, cultural riffs like a *paan*-infused gin sour), computes alcohol quantities using Indian-wedding-specific math (whisky-heavy among groom's side elders, wine among friends), and produces a bar menu card in the brand style.
- **UI surface:** Stepper: event type → crowd profile sliders (elders/friends/mixed) → signature cocktail generator with editable concept cards → quantity calculator with confidence bands. Export: bartender brief + menu card.
- **Inputs it uses:** Event list, guest demographics, brand tokens, couple's story inputs (from website/monogram flow), budget.
- **Outputs it produces:** Bartender brief with quantities, 3 signature cocktails with recipes, menu cards for stationery.
- **Model/prompt approach:** Sonnet; cocktail generation is where LLM creativity shines — tie flavor profile to narrative.
- **Why this specific feature for this specific task:** Signature cocktails are a guest-memory generator. The story-to-cocktail mapping is the magic LLMs do uniquely well.

---

### Task: Plan the sangeet show program
**Event/phase:** Events & Programming
**The real problem underneath:** The sangeet is a 90-minute variety show with 6 group performances, a couple dance, parents' surprise, and 3 solos. Sequencing + energy pacing + rehearsal scheduling + music cuts is a producer's job no one signed up for.
**Generic AI would say:** "Here's a sample sangeet timeline."

**The Ananya AI feature:**
- **Name:** Sangeet Run-of-Show
- **What it does:** Takes the roster of who's performing (groom's sisters group, bride's college friends, parents' surprise duet, etc.), their requested songs, and skill level. Generates a full 90-minute show: opening, pacing arc (up-down-up-crescendo-finale), introductions by the MC, transitions, costume-change buffers, rehearsal schedule reverse-engineered from the event date. Produces a printable cue sheet for the DJ + MC script + rehearsal calendar for each group.
- **UI surface:** Timeline canvas — horizontal show bar, draggable performance blocks. Each block shows song, duration, energy level (color-coded). AI-generated transitions appear between blocks. Right panel: rehearsal schedule with AI-suggested conflict-free windows. Export: cue sheet (DJ), script (MC), rehearsal invites (per group).
- **Inputs it uses:** Performer roster, song list, skill/comfort levels (self-reported), event date, venue stage specs.
- **Outputs it produces:** DJ cue sheet, MC script, rehearsal schedule, group-specific rehearsal briefs.
- **Model/prompt approach:** Sonnet with structured show-document schema. Energy-pacing rules encoded; Claude sequences + writes MC script in couple's brand voice.
- **Why this specific feature for this specific task:** Families who try to run the sangeet themselves end up with flat energy. Energy-arc reasoning + transition generation is the magic.

---

### Task: Back-compute event timing from muhurat
**Event/phase:** Events & Programming — Wedding Day
**The real problem underneath:** Pandit gives an exact muhurat — "pheras at 11:47 PM, mangalsutra at 12:03 AM." Working backwards from that to every upstream time (makeup start, baraat call time, photographer arrival) is a spreadsheet the couple shouldn't have to build.
**Generic AI would say:** "Here's a sample wedding day timeline."

**The Ananya AI feature:**
- **Name:** Muhurat Backbuild
- **What it does:** Ingests the pandit's fixed muhurat anchors and reverse-engineers a full day timeline with realistic buffers for every upstream activity: ceremony rehearsal, varmala, baraat, mandap prep, photo session, bridal entry, makeup touch-up, etc. Flags conflicts (e.g., "HMUA needs 4 hours for bridal look but your muhurat gives her 3 — either add a second artist or start 60 minutes earlier"). Produces a per-person schedule (bride, groom, parents, pandit, HMUA, photographer) with handoff moments marked.
- **UI surface:** Anchored timeline — muhurat times pinned in red, all other blocks adjustable. Toggle "show per person" reveals a swim-lane view (bride's day, HMUA's day, photographer's day). Conflict markers as warning chips with suggested fixes. Export per-person schedule PDFs.
- **Inputs it uses:** Muhurat anchors, vendor lead-time defaults (HMUA 4hr bridal, 1.5hr per additional look; photographer arrival norms), venue proximity/transit, buffer preferences.
- **Outputs it produces:** Master timeline, per-vendor schedules, per-family-member schedules — all sharable as PDFs or calendar invites.
- **Model/prompt approach:** Sonnet for reasoning + a deterministic rules engine. Conflict detection is rule-based; Claude writes the human-readable fixes.
- **Why this specific feature for this specific task:** This is the operational spine of the day. Muhurat-anchored backbuild with conflict detection is something only a reasoning model can do credibly.

---

### Task: Curate music playlists per event
**Event/phase:** Music & Entertainment
**The real problem underneath:** Each event needs a different emotional register (haldi upbeat daytime folk, mehndi playful, sangeet dance, ceremony sacred, reception mixed age). Both families have "must-play" songs that can't be skipped. The DJ needs a cohesive brief, not a 300-song dump.
**Generic AI would say:** "Here's a wedding playlist."

**The Ananya AI feature:**
- **Name:** Event DJ Brief
- **What it does:** Generates a per-event playlist with energy arc (warm-up → peak → settle), respects must-play songs from each family side (tagged by which aunty requested which song), blends regional music (Punjabi bhangra for groom's side, Gujarati garba for bride's side on appropriate events), and leaves "floor space" for open requests. Produces a DJ brief (not a playlist) — a document the DJ actually uses.
- **UI surface:** Per-event panel: event type, duration, crowd demographics. Must-play song intake at top (paste from WhatsApp group). AI generates a timeline view of the event with energy curve + song blocks at key moments (bride entry song, first dance, grand finale). Couple can lock any block; AI rebalances around it.
- **Inputs it uses:** Event list, crowd demographics, must-play songs, couple's own taste (Spotify export if provided), tradition profile.
- **Outputs it produces:** DJ brief per event (energy curve, must-play markers, key-moment songs, do-not-play list).
- **Model/prompt approach:** Sonnet with music knowledge retrieval + structured output. Does NOT try to replace the DJ — generates the *brief*.
- **Why this specific feature for this specific task:** The anti-pattern is the "300-song playlist dump." A brief with structure is what good DJs actually want, and generating it requires cultural music knowledge at scale.

---

## Phase 4 — Outfits & Styling

### Task: Coordinate outfits across family & events
**Event/phase:** Outfit & Wardrobe
**The real problem underneath:** 6 immediate family members × 5 events = 30 outfits, none should clash in photos (MIL and mom shouldn't wear the same color family on the same day), and each outfit needs a coordinated accessory stack.
**Generic AI would say:** "Here are outfit color suggestions."

**The Ananya AI feature:**
- **Name:** Outfit Matrix
- **What it does:** A coordination canvas for the extended family's outfits across every event. Each cell (person × event) is an outfit slot; the couple uploads known outfits (bride's lehenga, groom's sherwani) and AI proposes coordinated outfits for remaining slots, ensuring color/motif/formality harmony within each event and no exact repetition across photos. Generates mood images for proposed slots.
- **UI surface:** A grid: rows = family members, columns = events. Each cell shows the outfit image (uploaded or AI-generated mock). Click a cell to lock an outfit or ask for alternatives. Row highlight shows one person's arc across events; column highlight shows one event's family-wide look. Validation ribbon at top: "Sangeet: 3 people in emerald — consider shifting Dad to deep teal."
- **Inputs it uses:** Family roster, event list, per-event color palette from Color Story, already-purchased outfit photos.
- **Outputs it produces:** Shopping list per family member (what's still needed), coordination validation report, reference images for fittings.
- **Model/prompt approach:** Multimodal Claude for outfit color/style analysis + clash detection; diffusion-tool for proposed-outfit mockups; structured output.
- **Why this specific feature for this specific task:** Families end up photographing 5 mehndis where four aunts wear the same yellow. Cross-family cross-event coordination is a multi-dim constraint problem LLMs solve well.

---

### Task: Pair jewelry with outfits
**Event/phase:** Outfit & Wardrobe
**The real problem underneath:** The bride has heirloom pieces from both sides (nani's polki set, dadi's temple jewelry, mom's pearls) plus newly-bought sets. Figuring out which piece goes with which lehenga across events is a styling session that never happens until the morning of.
**Generic AI would say:** "Match these jewelry pieces to your outfits."

**The Ananya AI feature:**
- **Name:** Jewelry Pairing Board
- **What it does:** Takes photos of every jewelry piece (heirloom and new) and every outfit. Generates outfit-jewelry pairings respecting metal tone (yellow gold vs. rose gold vs. silver/polki), motif compatibility (temple jewelry goes with silk, polki with heavy zari), event formality (sangeet = lighter, wedding = heaviest). Flags when a specific piece carries sentimental weight worth centering.
- **UI surface:** Grid of outfit cards, each with a drop zone labeled "Primary set / Accent / Earrings / Bangles / Maang tikka." AI auto-fills suggestions; hover shows reasoning. Right panel: heirloom inventory with "last worn" timestamps across events (so nani's set isn't absent from wedding day photos).
- **Inputs it uses:** Uploaded jewelry photos + provenance notes, outfit photos, event list, skin tone (optional, for metal tone harmony).
- **Outputs it produces:** Per-outfit styling card with every piece mapped + handoff sheet for HMUA / dresser.
- **Model/prompt approach:** Multimodal for piece classification + pairing reasoning.
- **Why this specific feature for this specific task:** The heirloom provenance-aware dimension ("grandma's set wants to be on camera at pheras, not mehndi") is emotional labor an AI can genuinely offload.

---

### Task: Build the fitting schedule
**Event/phase:** Outfit & Wardrobe
**The real problem underneath:** Every outfit needs 2–3 fittings, each tailor has lead times, some outfits are shipping from Mumbai, others from local — sequencing all this in reverse from the wedding date is a nightmare spreadsheet.
**Generic AI would say:** "Set up fitting appointments."

**The Ananya AI feature:**
- **Name:** Fitting Reverse-Calendar
- **What it does:** Ingests every outfit with its source (boutique, tailor, shipping origin) and builds a reverse-chronology fitting calendar: first fitting → alteration → second fitting → final check. Accounts for shipping delays, tailor holiday closures, and buffer for surprise re-alterations. Flags outfits at risk of missing their event.
- **UI surface:** Horizontal calendar with outfit rows; fitting milestones as pinned dots. Risk ribbon at top ("Bride's pheras lehenga: 2 fittings before event, 0 buffer — add a week"). One-click export as calendar invites with addresses.
- **Inputs it uses:** Outfit inventory, vendor lead times, wedding date, travel schedules.
- **Outputs it produces:** Calendar of fittings, risk alerts, vendor reminder emails.
- **Model/prompt approach:** Deterministic scheduling + Sonnet for natural-language risk narration.
- **Why this specific feature for this specific task:** Fitting failures cause wardrobe panic in week -2. Reverse-calendar logic with risk detection is operationally critical.

---

## Phase 5 — Decor & Aesthetic

### Task: Design the mandap
**Event/phase:** Decor & Aesthetic
**The real problem underneath:** The couple has seen 50 mandap photos but can't visualize how any of them land in *their* venue at *their* scale with *their* color palette.
**Generic AI would say:** "Here are mandap design options."

**The Ananya AI feature:**
- **Name:** Mandap in Situ
- **What it does:** Generates photorealistic mandap renderings placed into the couple's *actual* venue photo at proportional scale. Sliders for structural style (pillar-and-canopy, dome, asymmetric modern, traditional four-post), floral density, color palette (pulled from Color Story), canopy material. Each render is exportable to share with decor vendors as a brief.
- **UI surface:** Upload venue ceremony-space photo → AI auto-masks the space. Mandap configuration panel on the right with live re-render (~5 sec per change). Save a render → it becomes a vendor brief with structural notes.
- **Inputs it uses:** Venue photo, color palette from Color Story, tradition profile, guest count (affects mandap scale).
- **Outputs it produces:** 3–5 shortlisted renders + vendor briefs.
- **Model/prompt approach:** Multimodal Claude to parse venue photo + compose structured render prompt; diffusion tool for rendering; refinement loop.
- **Why this specific feature for this specific task:** Mandap briefs are where decor miscommunication happens most expensively. A render-in-your-venue is the magic moment.

---

### Task: Plan photo-moment spots at the venue
**Event/phase:** Decor & Aesthetic / Photography
**The real problem underneath:** Great photo moments happen in specific spots at specific times with specific light. No one maps this out — they discover the good spots during the event and miss them.
**Generic AI would say:** "Here are photo location suggestions."

**The Ananya AI feature:**
- **Name:** Photo Moment Map
- **What it does:** Ingests venue floor plan + sun orientation + event timing. Marks high-impact photo spots with why (directional light at 5 PM, backdrop of hanging florals, intimate archway), flags "golden hour window at the west lawn: 6:15–6:45 PM" and embeds this into the photographer brief and day-of timeline.
- **UI surface:** Annotated venue map with pinned photo-moment icons. Click a pin → recommended time window, shot type (couple portrait, family group, candid), required prop/backdrop. Timeline integration shows when these windows align with the couple's availability.
- **Inputs it uses:** Venue floor plan, geographic orientation, event timeline, decor plan (backdrops shift through events).
- **Outputs it produces:** Photographer shot-location brief + day-of photo windows in the timeline.
- **Model/prompt approach:** Multimodal floor-plan parsing + Sonnet for photo-opportunity reasoning.
- **Why this specific feature for this specific task:** Golden hour happens exactly once and most couples miss it. Precomputing the windows is the magic.

---

### Task: Style the haldi and mehndi setups
**Event/phase:** Decor & Aesthetic — Pre-Wedding
**The real problem underneath:** Haldi and mehndi are the most Instagrammable events and also the easiest to overspend on. The couple wants a strong aesthetic without hiring a second decor vendor.
**Generic AI would say:** "Here's haldi decor inspiration."

**The Ananya AI feature:**
- **Name:** Haldi/Mehndi Set Builder
- **What it does:** Generates a low-lift set design kit for haldi and mehndi: focal seating (swing vs. platform vs. floor cushions), backdrop (paper flower wall, marigold curtain, fabric draping), prop list (kalash, turmeric pots, lotus floats), and a shopping list with approximate costs. Optimized for "high-impact, low-setup-time" since these are day events.
- **UI surface:** Two-event tabbed panel. Each shows a rendered concept + prop checklist + shopping list with vendor links. Style slider: "traditional → modern minimal." Rendered concept regenerates.
- **Inputs it uses:** Tradition profile, color palette, venue space for these events, budget envelope.
- **Outputs it produces:** Styling kit + shopping list + vendor handoff brief.
- **Model/prompt approach:** Multimodal render + Sonnet for shopping list reasoning.
- **Why this specific feature for this specific task:** These events are under-invested because they're "before the real wedding." Giving couples a styled-for-camera kit is the magic.

---

## Phase 6 — Invitations & Stationery

### Task: Compose bilingual invitation text
**Event/phase:** Invitations & Stationery
**The real problem underneath:** Indian wedding invitations need formal Hindi/Gujarati/Tamil/Marathi text with correct honorifics, puja invocation, family tree lines ("S/o... G/o... R/o..."), and gotra/sampradaya references. Translation apps fail on the register.
**Generic AI would say:** "Here's a translated invitation."

**The Ananya AI feature:**
- **Name:** Invitation Composer
- **What it does:** Takes structured family data (grandparents' names, parents' names, gotra, home city) and generates properly formatted invitation text in English + regional language side-by-side. Handles honorifics (Shri/Shrimati/Chiranjivi/Saubhagyavati), script accuracy (Devanagari vowel marks, Tamil grantha characters for Sanskrit terms), and ceremonial phrasing. Includes Ganesha invocation per tradition.
- **UI surface:** Structured form for family data → live-updating bilingual preview in real invitation layout. Side panel shows "why this phrasing" explanations for each line. Toggle per-event (main invite vs. sangeet insert vs. reception card).
- **Inputs it uses:** Family tree data, tradition profile, event list, muhurat times, venue details.
- **Outputs it produces:** Print-ready bilingual invitation copy for every event card + WhatsApp-sharable text versions.
- **Model/prompt approach:** Sonnet with curated cultural-invitation-text reference; structured output with both scripts. Multi-pass: generate → validate script accuracy → elder-readable check.
- **Why this specific feature for this specific task:** This is typically a multi-week back-and-forth with a family uncle who "knows the right words." Compressing that into minutes, with elder-review still built in, is the magic.

---

### Task: Generate motif/pattern kit for all stationery
**Event/phase:** Invitations & Stationery
**The real problem underneath:** The couple wants a consistent motif system across invite, welcome kit, signage, menu cards — but each new piece becomes a one-off design conversation.
**Generic AI would say:** "Here's a pattern you might like."

**The Ananya AI feature:**
- **Name:** Motif System
- **What it does:** Generates a regional-heritage-rooted motif kit: primary motif (e.g., peacock for Rajasthani heritage, temple gopuram for Tamil), secondary motifs (paisley, lotus), border patterns, corner ornaments, spot illustrations. Delivered as a vector kit with naming conventions that the couple can hand to any stationery vendor.
- **UI surface:** Motif gallery organized by type (focal, border, corner, pattern). Each is editable via style sliders (intricacy, stroke weight, fill style). Export → zipped SVG kit with an index document.
- **Inputs it uses:** Tradition profile, color palette, monogram.
- **Outputs it produces:** Brand-consistent motif kit, reused across every stationery module and signage generator.
- **Model/prompt approach:** Diffusion tool constrained to vector-friendly outputs; Claude as the stylistic director.
- **Why this specific feature for this specific task:** Motif inconsistency is the #1 visual-brand leak across Indian weddings. A heritage-rooted kit is a one-shot fix.

---

### Task: Produce event-specific stationery variants
**Event/phase:** Invitations & Stationery
**The real problem underneath:** One approved design has to spawn 12 variants — save-the-date, main invite, sangeet insert, mehndi card, reception card, welcome bag note, table numbers, menu cards, ceremony program, directional signage, seating chart, thank-you card.
**Generic AI would say:** "Resize this invitation for other events."

**The Ananya AI feature:**
- **Name:** Stationery Set Generator
- **What it does:** Applies the approved design system (monogram + palette + motifs + typography + voice) to every stationery artifact across all events. Each artifact maintains visual consistency while adapting to its purpose (intimate note vs. directional signage). Content fills automatically from the guest, venue, and event databases.
- **UI surface:** Grid of artifact types with generated previews; click to edit any. Batch export as print-ready PDFs with bleed/crop marks, plus digital variants (WhatsApp, email).
- **Inputs it uses:** Brand tokens (monogram, palette, motifs, voice), invitation text, guest list (for personalization), event list, venue info.
- **Outputs it produces:** Complete stationery kit ready for printer handoff.
- **Model/prompt approach:** Template-driven with Sonnet for text adaptation + multimodal composition.
- **Why this specific feature for this specific task:** Stationery project management eats 40 hours. Generating the full set from locked brand tokens compresses it to an afternoon.

---

## Phase 7 — Logistics

### Task: Allocate hotel room blocks
**Event/phase:** Logistics
**The real problem underneath:** 80 rooms across 3 hotels, and the couple has to assign every out-of-town guest considering: elders need ground floor / elevator access, young families need adjoining rooms, cousins can share, VIPs get suites, and everyone should be proximate to their event transportation.
**Generic AI would say:** "Here's a room assignment spreadsheet."

**The Ananya AI feature:**
- **Name:** Room Block Solver
- **What it does:** Takes the room block inventory (hotels, room types, floors, amenities) and the guest list with relationship/age/mobility metadata. Produces an optimized assignment: elders ground-floor near elevator, couples in kings, families in adjoining rooms, VIPs in suites, rowdy cousin group in one wing. Flags impossible constraints and suggests trade-offs.
- **UI surface:** Split view — guest list on left with filters (elder, family, VIP), hotel floor plans on right with drag-and-drop assignment. AI-generated first pass; couple can override. Conflict indicators ("Sharma family of 5 but only 2 adjoining rooms available — book a third across the hall?").
- **Inputs it uses:** Room block inventory, guest list with tags, relationship graph, check-in/out dates, special needs flags.
- **Outputs it produces:** Room assignment per guest (sent to hotel as a rooming list), per-guest confirmation card in welcome kits.
- **Model/prompt approach:** Sonnet as constraint solver with structured I/O; deterministic validation layer.
- **Why this specific feature for this specific task:** This is a bin-packing problem with 50 soft constraints. LLMs are genuinely good at soft-constraint reasoning; it's the right tool.

---

### Task: Compose welcome kits
**Event/phase:** Logistics
**The real problem underneath:** A welcome kit is a brand moment and a logistical one. Generic kits ("water + granola bar + itinerary") waste the opportunity; the couple wants guest-group-specific content but doesn't have time to write 30 variants.
**Generic AI would say:** "Here's a welcome kit checklist."

**The Ananya AI feature:**
- **Name:** Welcome Kit Composer
- **What it does:** Generates welcome kit contents + a personalized welcome note per guest segment: elders get a reverent note + local temple map + tea selection; couple's friends get a playful note + bar crawl map + hangover kit; out-of-town families get a kids-activity recommendation + grocery store map. Every kit carries the same core (itinerary, brand card, water) + segmented add-ons + a personalized note in the couple's voice.
- **UI surface:** Guest-segment grid (elders / young-family / couple-friends / work-colleagues / vendors). Each cell shows: core items, segment add-ons, note preview. Edit any note; AI keeps voice consistent. Packing checklist per segment with quantities.
- **Inputs it uses:** Guest segmentation, couple's brand voice, local venue context, budget per kit.
- **Outputs it produces:** Per-segment packing list + printed notes + quantity totals for procurement.
- **Model/prompt approach:** Sonnet for note personalization in couple's voice; structured output for kit composition.
- **Why this specific feature for this specific task:** Per-segment personalization at scale is exactly where LLMs shine. Guests *remember* welcome kits — this is a high-ROI AI investment.

---

### Task: Plan the baraat logistics
**Event/phase:** Logistics — Wedding Day
**The real problem underneath:** The baraat (groom's procession with dhol, horse/car, dancing family) has to start at a specific place, travel a specific route with city permits, arrive at the venue in the muhurat window, and clear the entry before the bride's welcome.
**Generic AI would say:** "Plan your baraat procession."

**The Ananya AI feature:**
- **Name:** Baraat Choreographer
- **What it does:** Given start point, venue entry, and baraat start-time muhurat, calculates the march route, pace (dhol slows things down — planned for), permit requirements by city, group spacing, and the venue-entry sequence (dhol enters first, groom on ghori, family follows). Coordinates with the venue on timing so bride's welcome ritual lands right.
- **UI surface:** Map view with route drawn; procession timeline below. Adjust pace slider — see duration update. Permit checklist per city zone traversed. Venue-entry moment detail panel.
- **Inputs it uses:** Start and end locations, baraat muhurat, procession size, dhol/band vendor details, venue coordinator contact.
- **Outputs it produces:** Route map, permit checklist, timed procession plan, vendor handoff brief.
- **Model/prompt approach:** Sonnet + maps tool; city permit reference database.
- **Why this specific feature for this specific task:** Baraat timing failures ripple through the whole ceremony. Precomputing pace + permits is operational magic.

---

## Phase 8 — Photography & Video

### Task: Build the family photo matrix
**Event/phase:** Photography & Video — Wedding Day
**The real problem underneath:** A 200-person family wedding produces 40+ specific combo shots (bride + paternal grandparents, bride + maternal cousins, bride + dad's four sisters), and they all have to be captured in a 45-minute window without chaos.
**Generic AI would say:** "Here's a wedding photo shot list."

**The Ananya AI feature:**
- **Name:** Family Photo Matrix
- **What it does:** Generates the full combo shot list from the guest list's relationship graph (every meaningful family grouping both sides expect), sequences it to minimize gathering time (shoot all paternal groupings before anyone leaves, then maternal), produces a printable call-sheet with names for the photographer's assistant to marshal crowds efficiently.
- **UI surface:** Tree-diagram view of the family; click groupings to include in the shot list. AI-generated sequence with time estimates. Each shot has a "who needs to be here" list with photos. Print → a bound shot-list booklet for the photographer + a summoning-order list for the family coordinator.
- **Inputs it uses:** Guest list with family relationships, photographer's preferred shot duration, wedding-day timeline, venue photo backdrop.
- **Outputs it produces:** Shot list, sequence, summoning order, printable call-sheet.
- **Model/prompt approach:** Structured reasoning over the family graph; Sonnet for sequencing + name-list generation.
- **Why this specific feature for this specific task:** Family photo chaos is the #1 day-of timeline killer. Precomputing the sequence + summoning order is a genuine operational unlock.

---

### Task: Generate event-specific shot lists
**Event/phase:** Photography & Video — Pre-Wedding & Wedding
**The real problem underneath:** Each event has culturally-specific shots ("the turmeric-flying moment" at haldi, "henna palm close-up" at mehndi, "the first-look at the mandap" at the ceremony). Photographers often miss them if not briefed.
**Generic AI would say:** "Here are wedding shots to capture."

**The Ananya AI feature:**
- **Name:** Event Shot Brief
- **What it does:** Per event, generates a ranked shot list with cultural specificity: must-haves (muhurat moment shots), nice-to-haves (candid moments), experimental (drone shots if permitted). Each shot has a reference image + technical notes (low light, fast shutter, flash restrictions near havan).
- **UI surface:** Per-event tabs. Shot cards with reference image + technical note. Drag to reorder priority. Export as PDF brief for the photographer.
- **Inputs it uses:** Event list, tradition profile, venue lighting conditions, photographer style from Portfolio X-Ray.
- **Outputs it produces:** Per-event shot brief PDF.
- **Model/prompt approach:** Sonnet with cultural photography corpus + structured output.
- **Why this specific feature for this specific task:** Cultural shot-literacy varies wildly across photographers. A shot brief closes the gap.

---

### Task: Curate the post-wedding album
**Event/phase:** Photography & Video — Post-Wedding
**The real problem underneath:** 12,000 photos delivered by the photographer. The couple has to pick ~300 for the heirloom album, but they also have to share event-specific sets with family over WhatsApp.
**Generic AI would say:** "Here are the best photos."

**The Ananya AI feature:**
- **Name:** Album Arc
- **What it does:** Ingests the full photo drop. Organizes by event, then by narrative arc within each event (anticipation → ritual → peak moment → afterglow). Detects "the shots" — first look, first phera, parents' tears, baraat entry. Proposes album curation (cover, openers, climax, close). Separately generates shareable event-specific slices for family WhatsApp groups.
- **UI surface:** Event tabs → narrative arc timeline → thumbnails placed along the arc → "star moment" auto-detected shots pinned above. Couple can promote/demote. Export: album layout (with page breaks), WhatsApp-share sets per event, per-family-member custom sets (for the thank-you notes downstream).
- **Inputs it uses:** Photo drop, shot list annotations, photographer's metadata, event list, family list.
- **Outputs it produces:** Album layout, event highlight sets, personal sets per close family member.
- **Model/prompt approach:** Multimodal Claude for per-photo classification + narrative sequencing; explicit guardrails against beauty-bias in "best shot" scoring.
- **Why this specific feature for this specific task:** The post-wedding curation task is where most couples give up and produce nothing. Arc-based curation with star-moment detection is the magic.

---

## Phase 9 — Budget & Payments

### Task: Build vendor payment schedule
**Event/phase:** Budget & Payments
**The real problem underneath:** 15 vendors × contracts with different payment terms (30% on signing, 50% 30 days before, 20% day-of) = a cashflow calendar no one wants to build manually.
**Generic AI would say:** "Here's a vendor payment tracker."

**The Ananya AI feature:**
- **Name:** Payment Schedule Extractor
- **What it does:** Ingests signed contracts (PDFs/photos), extracts every payment milestone as a structured schedule with due date, amount, method, payee. Builds a cashflow calendar with reminders. Tracks per-family contribution allocation (which line items are paid by which side).
- **UI surface:** Contract drop zone → extracted milestones appear as cards → calendar view. Contribution-split view shows each family's month-by-month outlay. Reminder scheduling integrated with email/WhatsApp.
- **Inputs it uses:** Contract files, family contribution split.
- **Outputs it produces:** Payment calendar, reminder notifications, per-family cashflow statement.
- **Model/prompt approach:** Multimodal extraction from contracts → structured `PaymentMilestone` schema. Sonnet for ambiguous clauses.
- **Why this specific feature for this specific task:** Missing a vendor payment is a trust-destroying incident. Extract + track is low-glamour, high-value AI.

---

### Task: Simulate budget trade-offs
**Event/phase:** Budget & Payments
**The real problem underneath:** Mid-planning reality check: "we're ₹7L over budget, where do we cut?" — and cuts have non-linear consequences (downgrading decor also changes the mandap which changes the photo quality).
**Generic AI would say:** "Here are places you could cut budget."

**The Ananya AI feature:**
- **Name:** Trade-off Simulator (extension of Spend Simulator)
- **What it does:** Given a target cut amount, proposes 3 distinct cut strategies with explicit downstream impact: "Strategy A: cut florals 30% — mandap becomes modular not hand-carved, photos less dramatic; Strategy B: downsize reception venue — saves ₹6L but room block needs to move; Strategy C: drop welcome dinner — cleanest, saves ₹4.5L, guests with Thursday travel miss a touchpoint." Each strategy is reversible within the tool.
- **UI surface:** Target input. Three strategy cards with consequence chips. Simulate button re-computes the full budget. Compare view — current state vs. chosen strategy.
- **Inputs it uses:** Current budget state, vendor commitment state, priority preferences entered earlier.
- **Outputs it produces:** Applied strategy updates to the budget + downstream changes propagated to vendor briefs (if scope changes).
- **Model/prompt approach:** Sonnet for reasoning over impact graph; deterministic calculation layer.
- **Why this specific feature for this specific task:** Budget cut decisions happen in panic. Structured consequence reasoning reduces regret.

---

## Phase 10 — RSVP, Dietary, Arrival

### Task: Chase RSVP non-responders
**Event/phase:** Guest Management
**The real problem underneath:** Two weeks to RSVP deadline, 120 non-responders. Each needs a follow-up in the right register: younger cousins over WhatsApp, elders over a phone call from dad, family friends with a formal note.
**Generic AI would say:** "Draft a follow-up email."

**The Ananya AI feature:**
- **Name:** RSVP Whisperer
- **What it does:** For each non-responder, generates a follow-up in the right channel (WhatsApp/phone/email), register (formal/casual/elder-respectful), and language (English/Hinglish/Gujarati). Bundles follow-ups by who's sending (some go out from the bride, some from dad, some from the family point-person for that branch). Includes phone call scripts when the elder prefers a call.
- **UI surface:** Non-responder table with AI-proposed follow-up per row (channel, sender, message). Couple can batch-approve by sender. Phone calls get a bullet-point script panel. Send integrates with WhatsApp/email.
- **Inputs it uses:** Guest list with relationship metadata, RSVP state, family point-people mapping, preferred language per guest (if known).
- **Outputs it produces:** Batched outreach (queued messages + phone-call task list).
- **Model/prompt approach:** Sonnet for per-guest register adaptation; structured output per message.
- **Why this specific feature for this specific task:** The register-matching is what makes this impossible to template. Per-guest tone is exactly what LLMs do uniquely well.

---

### Task: Resolve dietary & accommodation constraints
**Event/phase:** Guest Management
**The real problem underneath:** RSVPs come in messy ("Jain for sasurji's family of 5, veg no onion/garlic for Meenaben, Rahul is vegan now"). The kitchen needs a clean count per meal segment; hotel needs a clean rooming list with special needs.
**Generic AI would say:** "Export a dietary summary."

**The Ananya AI feature:**
- **Name:** Constraint Normalizer
- **What it does:** Parses messy RSVP free-text into structured dietary + accommodation flags per guest. Aggregates into kitchen-ready counts per event (Jain: 12, Vegan: 8, Gluten-free: 5, Nut allergy: 3). Cross-checks dietary against menu (Menu Architect) and flags gaps. Generates rooming special-needs summary for the hotel.
- **UI surface:** RSVP inbox with per-response parsed chips (Jain / no-onion-garlic / wheelchair). Aggregated counts dashboard per event. Action: "push to caterer" / "push to hotel."
- **Inputs it uses:** RSVP free-text, guest list.
- **Outputs it produces:** Structured dietary database, kitchen-ready counts, hotel special-needs list.
- **Model/prompt approach:** Sonnet for parsing; structured output schema for dietary/accommodation.
- **Why this specific feature for this specific task:** The parse-messy-text-to-structure problem is LLM-native and this is its highest-value application in wedding planning.

---

## Phase 11 — Post-Wedding

### Task: Write personalized thank-you notes
**Event/phase:** Post-Wedding
**The real problem underneath:** 400 guests, 300 gifts, each thank-you note should reference the specific gift + a specific memory from the wedding with that guest. Writing 300 personalized notes takes weeks; generic notes feel hollow.
**Generic AI would say:** "Draft a thank-you note."

**The Ananya AI feature:**
- **Name:** Thank-You Weaver
- **What it does:** For each guest, composes a personalized note weaving (1) the gift they gave, (2) a specific moment from the wedding photos they appeared in, (3) a personal memory the couple adds or confirms. Each note in the couple's voice (calibrated from other copy they've approved). Output: handwritten-style or printed, per preference.
- **UI surface:** Table of guests with gift + photo-memory columns auto-populated; couple can add a one-line memory. AI drafts each note; couple reviews in batches. Export to a handwriting service or print with brand stationery.
- **Inputs it uses:** Guest list, gift log (from RSVP/registry), photo album (where does this guest appear), couple's voice calibration.
- **Outputs it produces:** 300 printed or handwritten-simulated notes, each genuinely different.
- **Model/prompt approach:** Sonnet per-note generation with strict voice consistency + per-guest context packing.
- **Why this specific feature for this specific task:** Personalized-at-scale-in-the-couple's-voice is the cleanest LLM use case in the entire product. The magic is that every note is actually different and actually personal.

---

### Task: Compose vendor reviews
**Event/phase:** Post-Wedding
**The real problem underneath:** Vendors deserve reviews (WedMeGood, Zola, Google). Writing 15 balanced reviews is drudgery; most couples never do it, which is bad for the vendor ecosystem.
**Generic AI would say:** "Draft a vendor review."

**The Ananya AI feature:**
- **Name:** Review Composer
- **What it does:** Pulls per-vendor data — contract deliverables vs. delivered, communication quality, day-of issues logged, couple's short rating per axis — and drafts a balanced multi-platform review. Adapts length and tone per platform (Google short, WedMeGood detailed). Flags issues the couple wanted to raise but didn't want public; generates a private-feedback email alongside.
- **UI surface:** Vendor list with rating sliders per axis (communication, delivery, value, flexibility). AI drafts reviews; couple reviews. Batch publish.
- **Inputs it uses:** Vendor contracts, delivery log, couple's ratings, any issues logged.
- **Outputs it produces:** Published reviews across platforms + private feedback emails.
- **Model/prompt approach:** Sonnet with multi-platform style adaptation.
- **Why this specific feature for this specific task:** This is the most neglected post-wedding task. Lowering the friction is the magic.

---

### Tasks where AI shouldn't force itself in

A few tasks are better handled as vanilla forms with good defaults — adding AI would be cosmetic:

- **Domain registration / wedding website platform selection** — straightforward choice; AI-generated recommendations add noise.
- **Opening a wedding bank account** — banking logistics, not reasoning.
- **Confirming venue parking capacity** — phone call to the venue coordinator is faster than any tool.
- **ADA accessibility confirmation** — must be human-verified on site; AI summaries are dangerous here.

We'd rather have 40 excellent features than pepper these with assistants that don't earn their keep.

---

## Cross-cutting AI Capabilities (Engineering Primitives)

Multiple features above share underlying capabilities. Building these once as reusable primitives lets every new task feature compose instead of re-implement.

### 1. Structured Family Reasoner
**Used by:** Social Distance Solver, Family Photo Matrix, Invitation Composer, RSVP Whisperer, Thank-You Weaver, Room Block Solver.
**What it is:** A canonical family graph (per-guest: relationship to bride, relationship to groom, generation, side, age bucket, preferred language, mobility flags, must-invite markers) with a Claude-powered ambiguity resolver for messy inputs (WhatsApp forwards, handwritten lists, vCards). Everything in the product queries this graph — it's the guest-list spine.

### 2. Brand Token System (Color / Monogram / Motifs / Voice)
**Used by:** Color Story, Monogram Designer, Motif System, Stationery Set Generator, Welcome Kit Composer, Thank-You Weaver.
**What it is:** A locked brand document containing palette hex values (per event), monogram SVG, motif kit, typography choices, and a *voice calibration* sample. Every generative feature reads these tokens so output is visually and tonally coherent across artifacts.

### 3. Cultural Context Adapter
**Used by:** Tradition Braid, Pandit Match, Venue Fit Scorer, Menu Architect, Invitation Composer, Event Shot Brief, Sangeet Run-of-Show.
**What it is:** A retrieval layer over a curated corpus of regional wedding references (ceremony sequences per community, regional cuisine, honorifics, appropriate music, ritual objects). Every feature that needs "what does this community expect here?" calls this primitive with a tradition profile and gets structured cultural facts back — not free-generated prose.

### 4. Multimodal Moodboard-to-Spec Translator
**Used by:** Bridal Look DNA, Execution Match, Mandap in Situ, Jewelry Pairing Board, Outfit Matrix, Haldi/Mehndi Set Builder.
**What it is:** A vision capability that takes a set of reference images (Pinterest boards, portfolio shots, outfit photos) and extracts structured aesthetic parameters (color distribution, motif density, formality, floral vs. structural ratio). Downstream features use the spec instead of the raw images.

### 5. Constraint-Solving Layout Engine
**Used by:** Menu Architect, Outfit Matrix, Station Flow, Room Block Solver, Muhurat Backbuild, Sangeet Run-of-Show, Family Photo Matrix.
**What it is:** An LLM-driven soft-constraint solver: takes a problem (bin-packing, sequencing, coordination) as structured input, produces a layout respecting hard constraints and optimizing soft ones, narrates trade-offs in natural language. Claude proposes; deterministic validation layer checks; loop until valid.

### 6. Document Extractor
**Used by:** Menu Rosetta, Payment Schedule Extractor, Constraint Normalizer.
**What it is:** Multimodal ingestion of PDFs, photos, and free-text into strict structured schemas (Dish, PaymentMilestone, DietaryFlag) with confidence scores and an HITL review UI for low-confidence extractions. Shared schema registry keeps output interoperable across features.

---

## Closing notes for engineering

- Every feature output should be a **first-class record** in Ananya's data model — not just a chat response in a history. This is what lets features compose (the Tradition Braid output feeds the Pandit Match input; the Color Story output feeds the Outfit Matrix).
- Where we use diffusion for imagery (Mandap in Situ, Monogram Designer, Haldi/Mehndi Set Builder), Claude is the *director* producing structured render prompts — not the generator. This keeps quality predictable and auditable.
- Every feature ships with an explicit "no-AI fallback path" — the couple can always hand-edit the output. The AI is scaffolding, not a gate.
- Guardrails matter: no beauty-bias in photo scoring, no skin tone alteration in HMUA previews, no tradition-authority overreach in Tradition Braid (always route big calls back to the family elder or pandit).

// Builds system + user prompts for the AI checklist generator.
// System prompt is heavy (phase list + regional rituals + rules) and stable
// across calls — wrapped with cache_control: ephemeral in the route.

import {
  BUDGET_LABELS,
  BLENDING_LABELS,
  EVENTS_LABELS,
  FAITH_LABELS,
  GUESTS_LABELS,
  HINDU_REGION_LABELS,
  type WeddingProfile,
} from "./profile";

export const VALID_PHASE_IDS = [
  "phase-0",
  "phase-1",
  "phase-2",
  "phase-3",
  "phase-4",
  "phase-5",
  "phase-6",
  "phase-7",
  "phase-8",
  "phase-9",
  "phase-10",
  "phase-11",
  "phase-12",
] as const;

export type ValidPhaseId = (typeof VALID_PHASE_IDS)[number];

export const PHASE_GUIDE: Record<ValidPhaseId, string> = {
  "phase-0": "Foundation & Vision — budget, values, tradition profile, wedding planner decision",
  "phase-1": "Branding & Identity — hashtag, monogram, colors, website, save-the-dates design",
  "phase-2": "Core Bookings — venue, priest/pandit, photographer, videographer, caterer",
  "phase-3": "Attire & Styling — couple outfits per event, family outfits, jewelry, hair & makeup",
  "phase-4": "Vendors — Experience Layer — decor, florals, DJ/band, lighting, transportation, mehndi artist",
  "phase-5": "Paper & Stationery — invitations, day-of paper, signage, menus, place cards, welcome bags",
  "phase-6": "Guest Management — list, RSVPs, room blocks, dietary, seating chart, comms",
  "phase-7": "Ceremony Specifics — rituals, ceremony items, officiant coordination, vows, readings",
  "phase-8": "Gifts & Favors — wedding party gifts, parent gifts, vendor tips, guest favors, registry",
  "phase-9": "Legal & Administrative — marriage license, name change, insurance, passports, prenup",
  "phase-10": "Final Month — week-by-week countdown, fittings, confirmations, emergency kit",
  "phase-11": "Event Days — day-of execution per event (load-in, timing, crew)",
  "phase-12": "Post-Wedding — thank-yous, returns, name change filings, honeymoon wrap-up",
};

export const VALID_CATEGORY_TAGS = [
  "photography",
  "videography",
  "catering",
  "decor_florals",
  "entertainment",
  "guest_experiences",
  "hmua",
  "venue",
  "mehndi",
  "transportation",
  "stationery",
  "pandit_ceremony",
  "wardrobe",
  "jewelry",
  "cake_sweets",
  "gifting",
  "travel_accommodations",
] as const;

const RITUAL_LIBRARIES = `
REGIONAL HINDU RITUAL INVENTORY — use real ritual names verbatim in task titles.

GUJARATI:
  Pre-wedding: Gol Dhana (engagement), Chandlo Matli (formal engagement), Pithi (turmeric ceremony), Mameru/Mosalu (maternal uncle's gifts), Garba & Raas night, Mandap Mahurat (mandap consecration), Graha Shanti puja, Jaan (groom's arrival).
  Wedding: Swagatam (welcome), Jaimala, Kanyadaan, Hasta Melap, Mangal Phera (4 pheras, not 7), Saptapadi, Saubhagya Chinha.
  Post-wedding: Vidaai, Ghar Nu Laxmi (bride's entry), Chero Pakrawanu.

PUNJABI:
  Pre-wedding: Roka, Thaka, Shagun, Chunni Chadhana, Sagai, Mehndi, Jaggo (night before, singing + dancing), Chooda ceremony (red & white bangles blessed by maternal uncle), Kalire tying, Vatna/Haldi, Sehrabandi, Ghodi Chadhana (groom mounts mare).
  Wedding: Milni (family meeting), Varmala, Laavan (4 rounds around Guru Granth Sahib if Sikh; 4 pheras if Hindu), Anand Karaj (Sikh-specific), Phere.
  Post: Doli / Vidaai, Ghar Aana (arrival at groom's home), Mooh Dikhai.

BENGALI:
  Pre-wedding: Aashirbaad (formal blessing), Ai Buro Bhaat (bachelor's feast), Dodhi Mangal (pre-dawn meal), Gaye Holud (turmeric on body, separate for bride & groom), Adhibas, Shankha Pola (conch + coral bangles).
  Wedding: Bor Jatri (groom's procession), Bor Boron (welcome with urli), Potto Bastra, Saat Paak (bride carried in 7 circles), Shubho Drishti (first eye contact under betel-leaf veil), Mala Badal (garland exchange), Sampradan, Yagna, Saptapadi, Sindoor Daan, Ghomta (veil).
  Post: Bidaai, Bou Bhaat (reception by groom's family), Phool Shojja (flower bed night), Dwiragaman.

TAMIL (South Indian):
  Pre-wedding: Nichayathartham (engagement), Pallikai Thellichal (sprouting seeds), Naandi Shraardham, Janavasam (groom's procession), Kashi Yatra (mock pilgrimage), Mangala Snanam (holy bath on wedding morning).
  Wedding: Nalangu (playful post-ceremony games), Kanyadaanam, Maangalya Dharanam (tying of Thaali), Saptapadi, Paanigrahanam, Oonjal (couple on swing), Akshadai (blessing with rice).
  Post: Grihapravesham, Sammandhi Virundhu (reception meal).

TELUGU:
  Pre-wedding: Nischitartham (engagement), Pellikuthuru (bride's ceremony), Pellikoduku (groom's ceremony), Snathakam (sacred thread ceremony for groom), Kashi Yatra, Mangala Snanam.
  Wedding: Gauri Puja, Kanyadaanam, Jeelakarra-Bellam (cumin + jaggery placed on each other's heads at auspicious moment), Madhuparkam (white cotton clothes), Sumangali Prarthana, Mangalsutra Dharanam, Saptapadi, Talambralu (playful showering of rice).
  Post: Grihapravesam, Arundhati Nakshatra darshan.

MARATHI:
  Pre-wedding: Sakhar Puda (engagement), Kelvan (ritual meal at each house), Halad Chadavane (turmeric), Simant Puja (welcoming groom's family), Mandap installation.
  Wedding: Punyahavachan, Antarpat (silk curtain between couple), Mangalashtakam (blessing verses), Sankalp, Kanyadaan, Laajahoma, Saptapadi, Sindoor, Karmasamapti.
  Post: Varaat, Grihapravesh, Satyanarayan Puja.

RAJASTHANI:
  Pre-wedding: Tilak, Ganpati Sthapana, Griha Shanti, Pithi Dastoor, Mehndi, Mahira Dastoor (maternal uncle's gifts), Nikasi (groom's departure with sword on horseback), Toran (groom strikes door frame).
  Wedding: Baraat, Dwar Pooja, Jaimala, Granthi Bandhan, Pheras, Saptapadi, Anjhala Bharai.
  Post: Vidaai, Muh Dikhai, Pagelagni.

KASHMIRI PANDIT:
  Pre-wedding: Kasamdry (commitment), Livun (house cleaning ritual), Wanvun (singing sessions), Maenziraat (mehndi + holy bath), Devgon (sacred thread for groom), Diugon (for bride).
  Wedding: Lagan, Kanyadaan, Saat Phere, Posh Puza (flower worship), Athwas (holding hands ceremony).
  Post: Satraat, Phirlath (reception by bride's family), Roth Khabar (sweet bread exchange).

MALAYALI (Kerala Hindu, Nair/Namboothiri variants):
  Pre-wedding: Nishchayam (engagement), Ayana (astrological match), Muhurtham fixing.
  Wedding: Thalam (auspicious plate), Kanyadaanam, Thaalikettu (tying of Thaali), Pudamuri (gifting of cloth), Saptapadi (in some traditions), Grihapravesham.
  Kerala-specific: Kasavu saree (off-white with gold border), Nalukettu venue if traditional.

NORTH INDIAN (generic, where region unclear): Mehndi, Sangeet, Haldi, Ganesh Puja, Mandap, Baraat, Varmala, Pheras (7), Kanyadaan, Sindoor, Mangalsutra, Vidaai.

INTERFAITH PAIRING GUIDANCE:
  Hindu × Christian: Sequence options — (a) Church ceremony + separate Hindu ceremony (most common); (b) Hindu pheras followed by Christian vows and unity candle in same venue with intermission; (c) Signing of marriage register from Christian side + full Hindu ceremony. Always generate tasks for both officiants (pandit + priest) and both sets of ceremony items.
  Hindu × Muslim: Nikah (with imam + 2 witnesses + mahr + nikah-nama) typically precedes Hindu ceremony. Some couples add a Walima reception. Generate both Nikah-specific items (imam, witnesses, mahr conversation, nikah-nama drafting) and Hindu pheras items. Note halal/vegetarian menu coordination.
  Hindu × Jewish: Chuppah can be placed under/inside the Mandap structure — tasks for custom structure. Include breaking the glass at ceremony end; Ketubah signing before ceremony; Rabbi + Pandit coordination.
  Hindu × Sikh: Anand Karaj at Gurdwara (laavan around Guru Granth Sahib) + Hindu pheras — two ceremonies, two venues typically. Tasks for both officiants; no alcohol at Gurdwara.
  Hindu × Buddhist: Buddhist blessing ceremony (chanting + water blessing by monks) alongside Hindu ceremony; monks' dana offering.
`;

const TASK_RULES = `
TASK GRANULARITY RULES:
1. Every task is a SINGLE completable action starting with a verb (book, research, confirm, order, schedule, draft, plan, coordinate, finalize, brief, source).
2. Never combine actions with "and" — split into separate tasks.
3. Use REAL ritual/vendor names from the inventory above when relevant (e.g., "Source Chooda bangles from maternal uncle" not "Get bangles").
4. "notes" field: include cultural context, why the task matters, or a tip — 1 sentence max.
5. Due dates via daysBeforeWedding (integer, can be negative for post-wedding tasks). Guidance:
   - 365+ days: big decisions (budget, venue, planner choice)
   - 300–180 days: major vendors, save-the-dates, outfit sourcing (custom couture)
   - 180–90 days: invitations, room blocks, final menu, outfit fittings, choreographer
   - 90–30 days: RSVPs close, seating, final headcount, marriage license research
   - 30–7 days: final fittings, license pickup, day-of emergency kit
   - 7–0 days: rehearsals, vendor confirmations
   - negative: thank-you notes, name change, honeymoon wrap

TARGET OUTPUT VOLUME: ~150–300 tasks total, weighted by the chosen events/budget/guests. Depth over breadth — a single event like Mehndi should have 8–15 tasks if the user selected it.
`;

export function buildSystemPrompt(): string {
  const phaseBlock = VALID_PHASE_IDS.map(
    (id) => `  ${id}: ${PHASE_GUIDE[id]}`,
  ).join("\n");
  const categoryBlock = VALID_CATEGORY_TAGS.join(", ");

  return `You are the AI Checklist Engine for a premium Indian wedding planning platform. Your job: given a couple's wedding profile, generate a culturally-specific, richly detailed checklist of single-action tasks.

VALID PHASES (use phase_id exactly):
${phaseBlock}

VALID category_tags (optional, pick 0–2 per task):
${categoryBlock}

${RITUAL_LIBRARIES}

${TASK_RULES}

OUTPUT FORMAT — respond with ONE JSON object, no prose before or after:

{
  "tasks": [
    {
      "phase_id": "phase-0",
      "subsection": "budget",                       // short free-form kebab-case key
      "title": "Set overall wedding budget",
      "description": "One sentence describing the deliverable.",
      "priority": "critical",                       // critical | high | medium | low
      "daysBeforeWedding": 365,
      "category_tags": [],                          // optional, from the enum above
      "notes": "Optional 1-sentence cultural/tactical note, or empty string."
    }
  ]
}

Do not include any text outside the JSON object. All tasks must reference a valid phase_id.`;
}

export function buildUserPrompt(p: WeddingProfile): string {
  const faiths = p.faiths.map((f) => FAITH_LABELS[f]).join(", ") || "—";
  const regions =
    p.hinduRegions.length > 0
      ? p.hinduRegions.map((r) => HINDU_REGION_LABELS[r]).join(", ")
      : "n/a";
  const blending = p.interfaithBlending ? BLENDING_LABELS[p.interfaithBlending] : "n/a (single tradition)";
  const events = p.eventsScale ? EVENTS_LABELS[p.eventsScale] : "—";
  const guests = p.guestScale ? GUESTS_LABELS[p.guestScale] : "—";
  const budget = p.budgetTier ? BUDGET_LABELS[p.budgetTier] : "—";
  const location =
    [p.locationCity, p.locationRegion, p.locationCountry].filter(Boolean).join(", ") || "—";

  return `Generate the checklist for this wedding:

- Wedding date: ${p.weddingDate}
- Faith(s): ${faiths}
- Hindu region(s): ${regions}
- Interfaith blending approach: ${blending}
- Must-include traditions (free text): ${p.interfaithNotes || "—"}
- Number of events: ${events}
- Guest count: ${guests}
- Budget tier: ${budget}
- Location: ${location}${p.isDestination ? " (destination wedding)" : ""}

Return the JSON object described in the system prompt.`;
}

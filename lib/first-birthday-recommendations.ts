// ── Baby's First Birthday recommendation engine ────────────────────────────
// Curated themes, activities, menus, vendors, and ceremony guides scored
// against the couple's vibe, guest count, venue, budget, traditions, kid
// mix, and hard no's. The Discover tab renders ranked results grouped by
// the auto-detected mode (party / ceremony / combined / grand).

import type {
  FirstBirthdayCeremony,
  FirstBirthdayPlan,
  FirstBirthdayRec,
  FirstBirthdayRecScore,
  FirstBirthdayRecScoreBreakdown,
  FirstBirthdayRecType,
  FirstBirthdayVibe,
} from "@/types/first-birthday";

// ── Pool ───────────────────────────────────────────────────────────────────

export const FIRST_BIRTHDAY_RECOMMENDATIONS: FirstBirthdayRec[] = [
  // ── Themes ─────────────────────────────────────────────────────────────
  {
    id: "one_year_of_wonderful",
    type: "theme",
    name: "One Year of Wonderful",
    hook: "Soft pastels, a single statement balloon arch, and a cake that's almost too pretty to smash",
    editorialDescription:
      "The classic first-birthday vision, dialed in. A pastel palette of peach, butter yellow, and palest blush. A balloon arch that frames the cake table without overwhelming it. A single statement candle — the number one — and a smash cake that's more pretty than sweet.\n\nThis theme works anywhere: living room, backyard, banquet hall. The palette does the heavy lifting, the arch does the photo-wall duty, and the rest is restraint. Pair it with a bubble machine for the kids and you have a party that photographs like a magazine spread.",
    palette: ["#F5D9C7", "#F4E4B8", "#E8D4EB"],
    vibes: ["classic_sweet", "modern_minimal", "backyard_bash", "intimate_family"],
    venueTypes: ["home", "backyard", "banquet_hall", "hotel", "restaurant"],
    minGuests: 10,
    maxGuests: 80,
    costLowCents: 20000,
    costHighCents: 80000,
    culturalTags: [],
    kidSafetyNotes: "Balloon arch needs to be secured out of grabbing reach.",
    ageMin: 12,
    ageMax: 60,
    highlights: [
      "Smash cake setup",
      "Photo backdrop",
      "Sensory play station",
      "Bubble machine",
    ],
    violates: [],
    whatYoullNeed: [
      "Pastel balloon arch (DIY kit or decorator)",
      "Smash cake + main cake",
      "Cake table linen + styling",
      "Simple pastel tableware",
    ],
    pairings: ["smash_cake_moment", "bubble_show", "parallel_spread"],
    suggestedDuration: "2–3 hours",
    peakMonths: [],
  },
  {
    id: "safari_first_birthday",
    type: "theme",
    name: "Safari First Birthday",
    hook: "Stuffed animal centerpieces, leaf garlands, animal-print everything — wild in the best way",
    editorialDescription:
      "A themed party that doesn't feel themed. Instead of cartoon animals on plates, it's real jungle greenery, warm neutral tones, and stuffed animal centerpieces the kids can play with. Subtle animal prints on napkins and napkin rings. A photo backdrop built from eucalyptus and palm fronds.\n\nThe secret is restraint — think 'safari lodge' rather than 'theme park.' You get a visual story without the plastic-toy landfill.",
    palette: ["#7B8C5A", "#D1B28A", "#F5E6D3"],
    vibes: ["themed_party", "outdoor_adventure", "classic_sweet"],
    venueTypes: ["home", "backyard", "park", "banquet_hall"],
    minGuests: 15,
    maxGuests: 60,
    costLowCents: 30000,
    costHighCents: 120000,
    culturalTags: [],
    kidSafetyNotes: "Avoid small plastic animal figurines for under-2 guests.",
    ageMin: 12,
    ageMax: 72,
    highlights: [
      "Animal cookie decorating",
      "Safari photo booth",
      "Petting zoo add-on",
      "Jungle juice bar",
    ],
    violates: [],
    whatYoullNeed: [
      "Leaf garlands + greenery",
      "Stuffed animal centerpieces",
      "Animal-print linens",
      "Safari-themed cake",
    ],
    pairings: ["smash_cake_moment", "bubble_show"],
    suggestedDuration: "3 hours",
    peakMonths: [4, 5, 6, 7, 8, 9],
  },
  {
    id: "royal_first_birthday",
    type: "theme",
    name: "Royal First Birthday",
    hook: "Full venue transformation — stage backdrop, balloon installations, grand entrance",
    editorialDescription:
      "When you want the first birthday to feel like a proper event — a stage-quality backdrop, floor-to-ceiling balloon installations, themed table settings, and a grand entrance. This is the banquet hall treatment: professional decor team, full AV, MC, and a program.\n\nIt scales beautifully for 100+ guests, and it's the right call when this birthday is carrying cultural weight — extended family flying in, grandparents' first grandchild, a milestone the whole community is marking.",
    palette: ["#C59E3E", "#8B4A52", "#F5E6D3"],
    vibes: ["grand_celebration", "themed_party", "cultural_ceremony", "combined_ceremony_party"],
    venueTypes: ["banquet_hall", "hotel", "cultural_center"],
    minGuests: 80,
    maxGuests: 300,
    costLowCents: 300000,
    costHighCents: 1500000,
    culturalTags: ["annaprashan", "dohl", "tol_janchi", "mundan"],
    kidSafetyNotes: "Confirm venue's kid-safe play corner and changing area.",
    ageMin: 12,
    ageMax: 24,
    highlights: [
      "Professional decorator",
      "Stage program",
      "Photo + video",
      "DJ & emcee",
    ],
    violates: [],
    whatYoullNeed: [
      "Booked banquet hall",
      "Decorator contract",
      "Photography + videography team",
      "Emcee / program host",
    ],
    pairings: ["first_birthday_photographer", "decorator_balloon_artist"],
    suggestedDuration: "4–6 hours",
    peakMonths: [],
  },
  {
    id: "backyard_bash_simple",
    type: "theme",
    name: "Backyard Cake & Popsicles",
    hook: "Casual, kid-friendly, sprinklers and popsicles, no stress",
    editorialDescription:
      "The anti-Pinterest first birthday — and it might be the most joyful one. A backyard or park, a kiddie pool if the weather's right, a sprinkler, a table of popsicles and watermelon, and one good cake. That's it.\n\nGuests come in shorts. Kids run. Parents actually sit down. The whole thing lasts two hours and everyone remembers the feeling, not the decor.",
    palette: ["#E8D4B0", "#8FB9A8", "#F5E6D3"],
    vibes: ["backyard_bash", "outdoor_adventure", "intimate_family", "modern_minimal"],
    venueTypes: ["backyard", "home", "park"],
    minGuests: 10,
    maxGuests: 40,
    costLowCents: 10000,
    costHighCents: 40000,
    culturalTags: [],
    kidSafetyNotes: "Fenced yard or dedicated watcher for under-3s near water.",
    ageMin: 12,
    ageMax: 72,
    highlights: [
      "Sprinkler / kiddie pool",
      "Popsicle cart",
      "Watermelon spread",
      "One statement cake",
    ],
    violates: [],
    whatYoullNeed: [
      "Outdoor space",
      "Cake + popsicles",
      "Casual dress code note on invite",
      "Towels for wet kids",
    ],
    pairings: ["smash_cake_moment", "parallel_spread"],
    suggestedDuration: "2 hours",
    peakMonths: [5, 6, 7, 8, 9],
  },

  // ── Activities ─────────────────────────────────────────────────────────
  {
    id: "smash_cake_moment",
    type: "activity",
    name: "The Smash Cake Moment",
    hook: "A dedicated station with a backdrop, easy-clean floor cover, and a camera-ready setup",
    editorialDescription:
      "Every first birthday needs this. A dedicated smash cake setup — a simple backdrop (a wall of balloons, a fabric drop, a 'ONE' sign), a cake on a low pedestal, and plastic drop cloths you can pull up and toss.\n\nBuild 15 minutes of the schedule around it. Photographer positioned ahead of time. Parents near but out of frame. Whether your baby dives in or stares at the cake in polite confusion — both make the photo that goes on every holiday card for a decade.",
    palette: ["#F5D9C7", "#C59E3E", "#F5E6D3"],
    vibes: [
      "classic_sweet",
      "themed_party",
      "backyard_bash",
      "outdoor_adventure",
      "modern_minimal",
      "combined_ceremony_party",
      "grand_celebration",
    ],
    venueTypes: ["home", "backyard", "banquet_hall", "hotel", "park", "cultural_center", "restaurant"],
    minGuests: 5,
    maxGuests: 300,
    costLowCents: 3000,
    costHighCents: 15000,
    culturalTags: [],
    kidSafetyNotes: "Check baby's allergens — use allergen-free smash cake if needed.",
    ageMin: 11,
    ageMax: 15,
    highlights: [
      "Allergen-free cake option",
      "15-minute activity",
      "Peak photo moment",
      "Easy cleanup",
    ],
    violates: ["no_smash_cake"],
    whatYoullNeed: [
      "Smash cake (often separate from main cake)",
      "Drop cloth / easy-clean flooring",
      "Simple backdrop",
      "Baby's smash-cake outfit (easy to wash)",
    ],
    pairings: ["one_year_of_wonderful", "first_birthday_photographer"],
    suggestedDuration: "15 min",
    peakMonths: [],
  },
  {
    id: "bubble_show",
    type: "activity",
    name: "Bubble Show",
    hook: "A performer with giant bubbles — mesmerizing for toddlers, relaxing for parents",
    editorialDescription:
      "Hire a bubble performer for a 20–30 minute set. Giant bubbles, floor bubbles, rainbow bubbles, bubble-inside-a-bubble. Toddlers stare, slightly older kids chase, adults secretly watch too.\n\nBenefits: no loud music, no age cutoff, nobody is scared (unlike a costumed character), it works indoor or outdoor. The price point is surprisingly reasonable and one show holds everyone's attention through the lunch-to-cake transition.",
    palette: ["#B5D8E8", "#F5E6D3", "#E8C4A0"],
    vibes: [
      "classic_sweet",
      "backyard_bash",
      "outdoor_adventure",
      "themed_party",
      "combined_ceremony_party",
      "grand_celebration",
      "modern_minimal",
    ],
    venueTypes: ["home", "backyard", "banquet_hall", "hotel", "park"],
    minGuests: 10,
    maxGuests: 100,
    costLowCents: 25000,
    costHighCents: 75000,
    culturalTags: [],
    kidSafetyNotes: "Soap-based bubbles can be slippery on smooth floors.",
    ageMin: 6,
    ageMax: 96,
    highlights: [
      "20–30 min show",
      "Indoor or outdoor",
      "No loud noises",
      "All ages love it",
    ],
    violates: ["no_clowns"],
    whatYoullNeed: [
      "Booked bubble performer",
      "20x20 ft clear space",
      "Non-slip mat or outdoor surface",
    ],
    pairings: ["smash_cake_moment", "one_year_of_wonderful"],
    suggestedDuration: "30 min",
    peakMonths: [],
  },
  {
    id: "sensory_stations",
    type: "activity",
    name: "Sensory Play Stations",
    hook: "Playdough, water tables, stacking toys — age-appropriate stations for roaming toddlers",
    editorialDescription:
      "Instead of one structured activity, set up 3–4 low tables with sensory stations the toddlers can circulate through freely. A water table. A playdough station. A bin of kinetic sand. Stacking cups.\n\nIt handles the mixed-age-group problem beautifully — babies watch, toddlers play, older kids run the station like little teachers. Adults can step away because the stations are self-guiding. Best part: it kills the 'what do we do now' dead air between lunch and cake.",
    palette: ["#8FB9A8", "#E8C4A0", "#F5E6D3"],
    vibes: [
      "classic_sweet",
      "modern_minimal",
      "backyard_bash",
      "themed_party",
      "intimate_family",
      "combined_ceremony_party",
    ],
    venueTypes: ["home", "backyard", "banquet_hall", "hotel", "kids_venue", "park"],
    minGuests: 8,
    maxGuests: 60,
    costLowCents: 5000,
    costHighCents: 20000,
    culturalTags: [],
    kidSafetyNotes:
      "Keep kinetic sand + small objects away from under-18-months (choking hazard).",
    ageMin: 6,
    ageMax: 60,
    highlights: [
      "Self-guiding play",
      "Mixed-age friendly",
      "Low-cost setup",
      "Fills dead time",
    ],
    violates: [],
    whatYoullNeed: [
      "3–4 low tables",
      "Playdough, water table, sensory bins",
      "Wipes + spare towels",
    ],
    pairings: ["parallel_spread", "smash_cake_moment"],
    suggestedDuration: "45–60 min",
    peakMonths: [],
  },

  // ── Menus ──────────────────────────────────────────────────────────────
  {
    id: "parallel_spread",
    type: "menu",
    name: "The Parallel Spread",
    hook: "Kid-safe finger foods on the low table, adult-worthy grazing board up high",
    editorialDescription:
      "The menu strategy that actually works for a first birthday. Two parallel tracks: a low table at toddler height with finger foods (soft fruit, cheese cubes, mini sandwiches, cut pasta, steamed veggies), and a grown-up grazing board on a counter or high table (charcuterie, dips, bread, olives, a smart cheese).\n\nNothing is a choking hazard. Nothing requires utensils. Kids graze. Adults eat well. The kid table runs out and you refill — the adult table runs out and it's a hint the party is winding down.",
    palette: ["#E8C4A0", "#8FB9A8", "#F5E6D3"],
    vibes: [
      "classic_sweet",
      "modern_minimal",
      "backyard_bash",
      "intimate_family",
      "themed_party",
      "combined_ceremony_party",
      "outdoor_adventure",
    ],
    venueTypes: ["home", "backyard", "park", "banquet_hall", "hotel"],
    minGuests: 10,
    maxGuests: 80,
    costLowCents: 20000,
    costHighCents: 80000,
    culturalTags: [],
    kidSafetyNotes:
      "Label any items with common allergens (nuts, dairy, egg, gluten) — nut-free zone at kid table.",
    ageMin: 9,
    ageMax: 96,
    highlights: [
      "Nut-free kid zone",
      "No choking hazards",
      "Adult cocktails optional",
      "Scales to 50+",
    ],
    violates: [],
    whatYoullNeed: [
      "Two serving surfaces (low + counter)",
      "Finger-food menu (soft, cut small)",
      "Adult grazing board ingredients",
      "Allergen labels / cards",
    ],
    pairings: ["smash_cake_moment", "sensory_stations"],
    suggestedDuration: "Lunch / snack service",
    peakMonths: [],
  },
  {
    id: "catered_buffet",
    type: "menu",
    name: "Full Catered Buffet",
    hook: "Let the venue or caterer handle it — buffet with a kids' station, main spread, and dessert table",
    editorialDescription:
      "For larger celebrations and banquet venues. A full catered buffet with three distinct zones: a kids' station (safe finger foods, mac and cheese, fruit), the main adult buffet (a cultural menu, if relevant — biryani, daal, roasted veggies, kebabs), and a dessert table centered on the cake.\n\nBuffet over plated for first birthdays — people are up and down with kids constantly. Dietary cards at each dish are non-negotiable. Build in a chai / coffee bar near the dessert table and the end of the party takes care of itself.",
    palette: ["#8B4A52", "#D4A853", "#F5E6D3"],
    vibes: ["grand_celebration", "combined_ceremony_party", "cultural_ceremony", "themed_party"],
    venueTypes: ["banquet_hall", "hotel", "cultural_center", "restaurant"],
    minGuests: 40,
    maxGuests: 300,
    costLowCents: 150000,
    costHighCents: 800000,
    culturalTags: ["annaprashan", "dohl", "tol_janchi", "mundan"],
    kidSafetyNotes: "Ask caterer about nut-free kids' station and allergen labeling.",
    ageMin: 12,
    ageMax: 96,
    highlights: [
      "Kids' station separate",
      "Dietary cards at each dish",
      "Cake table styling",
      "Chai & coffee bar",
    ],
    violates: [],
    whatYoullNeed: [
      "Catering contract + tasting",
      "Dietary requirements sent to caterer",
      "Cake table + dessert display",
      "Chai / coffee service",
    ],
    pairings: ["royal_first_birthday", "decorator_balloon_artist"],
    suggestedDuration: "Lunch service",
    peakMonths: [],
  },

  // ── Vendors ────────────────────────────────────────────────────────────
  {
    id: "first_birthday_photographer",
    type: "vendor",
    name: "First Birthday Photographer",
    hook: "Someone who specializes in milestone events and knows how to shoot a one-year-old who won't sit still",
    editorialDescription:
      "Not a wedding photographer moonlighting on a Saturday. Look for a specialist in milestone / cake-smash / family portraits — someone with a portfolio of babies at parties. They'll know how to work fast, stay low, shoot candid, and cover the ceremony-then-party transition without missing the smash.\n\nBook 2–3 hours of coverage. Ask for candid + posed mix, at least one family portrait, all grandparent combinations, and the full smash sequence. Make sure they're available through the cake cut; they can leave before the goodbyes.",
    palette: ["#C47666", "#E8A895", "#F5E6D3"],
    vibes: [
      "grand_celebration",
      "combined_ceremony_party",
      "cultural_ceremony",
      "classic_sweet",
      "themed_party",
      "modern_minimal",
    ],
    venueTypes: ["banquet_hall", "hotel", "home", "backyard", "cultural_center", "park"],
    minGuests: 15,
    maxGuests: 300,
    costLowCents: 50000,
    costHighCents: 250000,
    culturalTags: [],
    kidSafetyNotes: "",
    ageMin: 12,
    ageMax: 24,
    highlights: [
      "Candid + posed",
      "Cake smash coverage",
      "Family portraits",
      "2–3 hour package",
    ],
    violates: [],
    whatYoullNeed: [
      "Photographer contract",
      "Shot list shared in advance",
      "Ceremony call time confirmed",
    ],
    pairings: ["smash_cake_moment", "royal_first_birthday"],
    suggestedDuration: "2–3 hour coverage",
    peakMonths: [],
  },
  {
    id: "decorator_balloon_artist",
    type: "vendor",
    name: "Event Decorator / Balloon Artist",
    hook: "Backdrop, balloon installations, table styling, entrance decor — the visual transformation",
    editorialDescription:
      "For banquet-hall and grand events, the decorator is the highest-leverage vendor after the caterer. A good one arrives 6 hours before guests, brings a crew, handles the backdrop, the balloon arch, the centerpieces, the cake table styling, and the entrance decor — and strikes everything within an hour of goodbye.\n\nSend them mood board + palette + any ceremony-specific items (thali placement, doljabi table, hanbok-appropriate backdrop). Ask for a stage mock if they're building a photo wall.",
    palette: ["#8B4A52", "#C59E3E", "#F5E6D3"],
    vibes: ["grand_celebration", "themed_party", "combined_ceremony_party", "cultural_ceremony"],
    venueTypes: ["banquet_hall", "hotel", "cultural_center", "restaurant"],
    minGuests: 50,
    maxGuests: 300,
    costLowCents: 150000,
    costHighCents: 800000,
    culturalTags: ["annaprashan", "dohl", "tol_janchi", "mundan"],
    kidSafetyNotes: "Secure balloon arches + freestanding pieces well out of kids' reach.",
    ageMin: 12,
    ageMax: 24,
    highlights: [
      "Stage backdrop",
      "Balloon arch",
      "Table centerpieces",
      "Cake table styling",
    ],
    violates: [],
    whatYoullNeed: [
      "Signed decorator contract",
      "Mood board + palette sent",
      "Load-in time confirmed with venue",
    ],
    pairings: ["royal_first_birthday", "catered_buffet"],
    suggestedDuration: "Full event",
    peakMonths: [],
  },

  // ── Ceremony Guides ────────────────────────────────────────────────────
  {
    id: "annaprashan_guide",
    type: "ceremony_guide",
    name: "Annaprashan — First Rice Ceremony",
    hook: "A step-by-step guide to the rice-feeding ceremony: setup, sequence, prayers, and what to prepare",
    editorialDescription:
      "Annaprashan (also called Mukhe Bhaat in Bengali tradition) marks the first time a child eats solid food — traditionally rice and payesh (sweet rice pudding). The ceremony is usually held when the baby is 6–8 months old, but many families hold it at the first birthday instead, combining two milestones.\n\nThe structure varies by family and region, but the core sequence is consistent: the baby is seated (often on a grandfather's or uncle's lap), a small brass thali with rice, payesh, and symbolic items is placed before them, the pandit leads mantras and blessings, and an elder feeds the baby the first bite of rice. This is the photograph. The rest of the room watches.\n\nAsk your family how they've done this before. Your grandmother will have variations the internet won't list — small things about who feeds the first bite, which hand, the specific mantras. Write them down. This is your family's version of the ceremony, and it's the right one.",
    palette: ["#C59E3E", "#8B4A52", "#F5E6D3"],
    vibes: ["cultural_ceremony", "combined_ceremony_party", "grand_celebration", "intimate_family"],
    venueTypes: ["home", "cultural_center", "banquet_hall", "hotel"],
    minGuests: 5,
    maxGuests: 300,
    costLowCents: 5000,
    costHighCents: 50000,
    culturalTags: ["annaprashan", "choroonu"],
    kidSafetyNotes:
      "Confirm rice texture and temperature with your pediatrician — payesh is often given as a tiny token taste, not a full portion.",
    ageMin: 6,
    ageMax: 18,
    highlights: [
      "Ritual sequence",
      "Setup checklist",
      "Pandit coordination",
      "Prasad preparation",
    ],
    violates: [],
    whatYoullNeed: [
      "Brass thali + small bowls",
      "Cooked rice + payesh",
      "Fresh flowers + ghee lamp",
      "Baby's ceremony outfit (often new)",
      "Pandit / officiant confirmed",
      "Mat or asan for seating",
    ],
    pairings: ["catered_buffet", "first_birthday_photographer"],
    suggestedDuration: "45–60 min",
    peakMonths: [],
  },
  {
    id: "dohl_guide",
    type: "ceremony_guide",
    name: "Dohl / Tol Janchi — Korean First Birthday",
    hook: "The doljabi (object grab) ceremony: traditional items, their meanings, table setup",
    editorialDescription:
      "The Korean first birthday — Dohl in traditional form, Tol Janchi in modern — is one of the most joyful ceremony formats you can plan. The centerpiece is the doljabi: a low table is set with symbolic objects, the baby (in hanbok) is placed before it, and the whole room holds their breath while the baby chooses an object. Each object predicts the baby's future path.\n\nTraditional items include a pencil (scholar), money (wealth), string (long life), thread (long life or tailor), rice (plenty), and a gavel (justice). Modern adaptations add a microphone (performer), stethoscope (doctor), gold coin, soccer ball, paintbrush, or anything meaningful to your family.\n\nThe baby's hanbok is a core part of the photo. Rent or buy one in advance and have a backup outfit for the after-ceremony. The dohl cake (ddeokcakes, songpyeon, and increasingly a Western-style frosted cake) comes after the doljabi.",
    palette: ["#C4766E", "#E8D4B0", "#F5E6D3"],
    vibes: ["cultural_ceremony", "combined_ceremony_party", "grand_celebration", "intimate_family"],
    venueTypes: ["home", "banquet_hall", "hotel", "restaurant", "cultural_center"],
    minGuests: 15,
    maxGuests: 250,
    costLowCents: 30000,
    costHighCents: 300000,
    culturalTags: ["dohl", "tol_janchi"],
    kidSafetyNotes:
      "All doljabi items must be safe to touch / mouth — no sharp or heavy objects; avoid real coins and substitute a gold-foil-wrapped token.",
    ageMin: 11,
    ageMax: 14,
    highlights: [
      "Doljabi items & meanings",
      "Table layout",
      "Hanbok fitting",
      "Songpyeon & tteok",
    ],
    violates: [],
    whatYoullNeed: [
      "Doljabi table (low)",
      "6–12 symbolic objects",
      "Baby's hanbok",
      "Dohl cake / ddeok / songpyeon",
      "Traditional backdrop or table setup",
    ],
    pairings: ["catered_buffet", "first_birthday_photographer"],
    suggestedDuration: "60–75 min",
    peakMonths: [],
  },
  {
    id: "zhuazhou_guide",
    type: "ceremony_guide",
    name: "Zhuazhou — The Choosing Ceremony",
    hook: "Baby chooses from symbolic objects to 'predict' their future — the items, meanings, and photo setup",
    editorialDescription:
      "Zhuazhou (抓周) is the Chinese first-birthday ceremony where the baby is placed before an array of symbolic objects and the object they reach for is said to predict their future. It's the same family of ceremony as the Korean doljabi, and many Chinese-American families hold a modern fusion of both.\n\nTraditional items: a book (scholar), a brush (artist/writer), an abacus or calculator (finance), a seal (official), a ruler (builder/architect), a spring onion (cleverness), money, and a steamed bun (prosperity). Substitute anything that reflects what your family values. Set the items in a half-circle facing the baby; photograph from behind the items so the baby's face is the focal point.",
    palette: ["#C47666", "#C59E3E", "#F5E6D3"],
    vibes: ["cultural_ceremony", "combined_ceremony_party", "intimate_family", "grand_celebration"],
    venueTypes: ["home", "banquet_hall", "restaurant", "cultural_center"],
    minGuests: 10,
    maxGuests: 200,
    costLowCents: 10000,
    costHighCents: 100000,
    culturalTags: ["zhuazhou"],
    kidSafetyNotes:
      "All objects must pass the choking / sharp-edge test. Swap heirloom items for lookalike replicas if needed.",
    ageMin: 11,
    ageMax: 14,
    highlights: [
      "Traditional items list",
      "Modern item swaps",
      "Setup guide",
      "Photo positioning",
    ],
    violates: [],
    whatYoullNeed: [
      "Low table or floor mat",
      "8–12 symbolic objects",
      "Red cloth backdrop",
      "Camera positioned behind items",
    ],
    pairings: ["catered_buffet", "first_birthday_photographer"],
    suggestedDuration: "30–45 min",
    peakMonths: [],
  },

  // ── Ritual Setup ──────────────────────────────────────────────────────
  {
    id: "annaprashan_setup",
    type: "ritual_setup",
    name: "Annaprashan Setup Checklist",
    hook: "Everything you need: thali, rice, payesh, new outfit, seating, and photo setup",
    editorialDescription:
      "A practical, print-friendly checklist for the Annaprashan morning. Shop two days before, cook payesh the night before, and stage everything on the thali in the morning. Walk the pandit through the setup when they arrive and confirm seating arrangements — usually the baby sits on the maternal grandfather or uncle's lap.\n\nKeep a clean change of clothes ready. Payesh stains.",
    palette: ["#C59E3E", "#E8D4B0", "#F5E6D3"],
    vibes: ["cultural_ceremony", "combined_ceremony_party", "intimate_family"],
    venueTypes: ["home", "cultural_center"],
    minGuests: 5,
    maxGuests: 100,
    costLowCents: 3000,
    costHighCents: 25000,
    culturalTags: ["annaprashan"],
    kidSafetyNotes: "Keep ghee lamp well out of crawl range.",
    ageMin: 6,
    ageMax: 18,
    highlights: [
      "Shopping list",
      "Day-of timeline",
      "What the pandit needs",
      "Common variations",
    ],
    violates: [],
    whatYoullNeed: [
      "Brass thali + bowls",
      "Rice, payesh, ghee, flowers, small spoon",
      "Baby's new outfit",
      "Clean change of clothes",
      "Asan / mat for seating",
      "Pandit dakshina envelope",
    ],
    pairings: ["annaprashan_guide", "first_birthday_photographer"],
    suggestedDuration: "30 min prep",
    peakMonths: [],
  },
];

// ── Lookup ────────────────────────────────────────────────────────────────

export function getFirstBirthdayRec(id: string): FirstBirthdayRec | undefined {
  return FIRST_BIRTHDAY_RECOMMENDATIONS.find((r) => r.id === id);
}

// ── Scoring ───────────────────────────────────────────────────────────────

const WEIGHTS = {
  vibe: 0.2,
  guestFit: 0.15,
  budget: 0.15,
  venue: 0.15,
  kid: 0.1,
  cultural: 0.1,
  season: 0.05,
  personal: 0.1,
};

const GUEST_TIER_MIDPOINT: Record<string, number> = {
  intimate: 10,
  medium: 27,
  large: 60,
  grand: 115,
  mega: 200,
};

function scoreVibe(rec: FirstBirthdayRec, vibes: FirstBirthdayVibe[]): number {
  if (vibes.length === 0) return 55;
  const hits = vibes.filter((v) => rec.vibes.includes(v)).length;
  if (hits === 0) return 35;
  return Math.min(100, 60 + hits * 20);
}

function scoreGuestFit(rec: FirstBirthdayRec, plan: FirstBirthdayPlan): number {
  const midpoint = plan.guestTier
    ? GUEST_TIER_MIDPOINT[plan.guestTier] ?? 30
    : 30;
  if (midpoint >= rec.minGuests && midpoint <= rec.maxGuests) return 100;
  const dist =
    midpoint < rec.minGuests
      ? rec.minGuests - midpoint
      : midpoint - rec.maxGuests;
  if (dist <= 15) return 70;
  if (dist <= 40) return 45;
  return 25;
}

function scoreBudget(rec: FirstBirthdayRec, ceilingCents: number): number {
  if (ceilingCents <= 0) return 60;
  // Rec costs are whole-event (not per-head). Fit if ceiling >= low end.
  if (ceilingCents >= rec.costHighCents) return 100;
  if (ceilingCents >= (rec.costLowCents + rec.costHighCents) / 2) return 85;
  if (ceilingCents >= rec.costLowCents) return 65;
  return 35;
}

function scoreVenue(rec: FirstBirthdayRec, plan: FirstBirthdayPlan): number {
  if (!plan.venueType || plan.venueType === "undecided") return 65;
  return rec.venueTypes.includes(plan.venueType) ? 100 : 40;
}

function scoreKid(rec: FirstBirthdayRec, plan: FirstBirthdayPlan): number {
  if (!plan.guestMix) return 70;
  if (plan.guestMix === "kid_heavy" && rec.ageMin !== undefined) {
    return 85;
  }
  return 70;
}

function scoreCultural(
  rec: FirstBirthdayRec,
  ceremony: FirstBirthdayCeremony,
): number {
  if (rec.culturalTags.length === 0) {
    return ceremony.traditions.length > 0 ? 55 : 70;
  }
  const overlap = rec.culturalTags.filter((t) =>
    ceremony.traditions.includes(t),
  ).length;
  if (overlap > 0) return 100;
  return ceremony.traditions.length > 0 ? 30 : 55;
}

function extractMonth(dateStr: string): number | null {
  const lower = dateStr.toLowerCase();
  const names = [
    "january","february","march","april","may","june",
    "july","august","september","october","november","december",
  ];
  for (let i = 0; i < names.length; i++) {
    if (lower.includes(names[i]!)) return i + 1;
  }
  const iso = /\b\d{4}-(\d{2})-\d{2}\b/.exec(dateStr);
  if (iso) return Number(iso[1]);
  return null;
}

function scoreSeason(rec: FirstBirthdayRec, partyDate: string): number {
  if (rec.peakMonths.length === 0) return 70;
  const month = extractMonth(partyDate);
  if (!month) return 70;
  return rec.peakMonths.includes(month) ? 100 : 45;
}

function scorePersonal(rec: FirstBirthdayRec, resonance: string): number {
  if (!resonance.trim()) return 60;
  const haystack = [
    rec.hook,
    rec.editorialDescription,
    ...rec.highlights,
  ]
    .join(" ")
    .toLowerCase();
  const tokens = resonance
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((t) => t.length >= 4);
  if (tokens.length === 0) return 60;
  let hits = 0;
  for (const t of tokens) if (haystack.includes(t)) hits++;
  return Math.round(55 + (hits / tokens.length) * 45);
}

function hardNoPenalty(
  rec: FirstBirthdayRec,
  hardNos: FirstBirthdayPlan["hardNos"],
): number {
  if (hardNos.length === 0) return 0;
  const hits = hardNos.filter((h) => rec.violates.includes(h));
  return hits.length * 18;
}

function pickMatchTag(breakdown: FirstBirthdayRecScoreBreakdown): string {
  const entries = Object.entries(breakdown) as [
    keyof FirstBirthdayRecScoreBreakdown,
    number,
  ][];
  entries.sort((a, b) => b[1] - a[1]);
  const [topKey, topValue] = entries[0]!;
  if (topValue < 70) return "Worth a look";
  switch (topKey) {
    case "vibe":
      return "Perfect for your vibe";
    case "guestFit":
      return "Fits your guest count";
    case "budget":
      return "Great for your budget";
    case "venue":
      return "Works at your venue";
    case "kid":
      return "Kid-approved";
    case "cultural":
      return "Matches your tradition";
    case "season":
      return "Good timing";
    case "personal":
      return "Echoes what you said";
  }
}

function buildWhyNote(
  rec: FirstBirthdayRec,
  breakdown: FirstBirthdayRecScoreBreakdown,
  ceremony: FirstBirthdayCeremony,
): string {
  if (breakdown.cultural >= 95 && rec.culturalTags.length > 0) {
    const match = rec.culturalTags.find((t) => ceremony.traditions.includes(t));
    if (match) {
      return `Lines up with the ${match.replace("_", " ")} tradition you selected — the guide is tailored to it.`;
    }
  }
  if (breakdown.vibe >= 90) {
    return "Built for the vibes you picked — it's what this one is meant to do.";
  }
  if (breakdown.guestFit >= 90) {
    return "Scales cleanly to your guest count — neither too sparse nor too crowded.";
  }
  if (breakdown.budget >= 90) {
    return "Sits comfortably in the budget you set without cutting corners.";
  }
  if (breakdown.venue >= 90) {
    return "Fits your venue type — the setup carries over naturally.";
  }
  if (breakdown.personal >= 80) {
    return "Echoes a few phrases from what you wrote about this year.";
  }
  return "A solid match across vibe, venue, and budget.";
}

export function scoreFirstBirthdayRec(
  rec: FirstBirthdayRec,
  plan: FirstBirthdayPlan,
  ceremony: FirstBirthdayCeremony,
): FirstBirthdayRecScore {
  const breakdown: FirstBirthdayRecScoreBreakdown = {
    vibe: scoreVibe(rec, plan.vibes),
    guestFit: scoreGuestFit(rec, plan),
    budget: scoreBudget(rec, plan.budgetCeilingCents),
    venue: scoreVenue(rec, plan),
    kid: scoreKid(rec, plan),
    cultural: scoreCultural(rec, ceremony),
    season: scoreSeason(rec, plan.partyDate),
    personal: scorePersonal(rec, plan.whatThisYearHasMeant),
  };

  const raw =
    breakdown.vibe * WEIGHTS.vibe +
    breakdown.guestFit * WEIGHTS.guestFit +
    breakdown.budget * WEIGHTS.budget +
    breakdown.venue * WEIGHTS.venue +
    breakdown.kid * WEIGHTS.kid +
    breakdown.cultural * WEIGHTS.cultural +
    breakdown.season * WEIGHTS.season +
    breakdown.personal * WEIGHTS.personal;

  const penalty = hardNoPenalty(rec, plan.hardNos);
  const score = Math.max(0, Math.min(100, Math.round(raw - penalty)));

  return {
    recId: rec.id,
    score,
    breakdown,
    matchTag: pickMatchTag(breakdown),
    whyNote: buildWhyNote(rec, breakdown, ceremony),
  };
}

export function rankFirstBirthdayRecs(
  plan: FirstBirthdayPlan,
  ceremony: FirstBirthdayCeremony,
  pool: FirstBirthdayRec[] = FIRST_BIRTHDAY_RECOMMENDATIONS,
): { rec: FirstBirthdayRec; score: FirstBirthdayRecScore }[] {
  return pool
    .map((rec) => ({ rec, score: scoreFirstBirthdayRec(rec, plan, ceremony) }))
    .sort((a, b) => b.score.score - a.score.score);
}

export function firstBirthdayRecTypeLabel(type: FirstBirthdayRecType): string {
  switch (type) {
    case "theme":
      return "Theme";
    case "activity":
      return "Activity";
    case "menu":
      return "Menu";
    case "vendor":
      return "Vendor";
    case "ceremony_guide":
      return "Ceremony Guide";
    case "ritual_setup":
      return "Ritual Setup";
  }
}

export function formatCostRange(rec: FirstBirthdayRec): string {
  const lo = Math.round(rec.costLowCents / 100).toLocaleString();
  const hi = Math.round(rec.costHighCents / 100).toLocaleString();
  return `$${lo}–$${hi}`;
}

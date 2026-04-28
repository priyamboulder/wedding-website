// ──────────────────────────────────────────────────────────────────────────
// Pilot: Journal ↔ Checklist linking for "Choose your reception outfit"
//
// Four editorial posts + the join-table records that surface them on the
// checklist item detail view. Stands in for Supabase reads until the
// backend is wired up (see lib/supabase/journal-links.ts for the target
// query surface).
//
// When Supabase lands:
//   1. Move PILOT_ARTICLES rows into the `articles` table.
//   2. Move PILOT_CHECKLIST_LINKS rows into `article_checklist_links`
//      (schema: supabase/migrations/0005_article_checklist_links.sql).
//   3. Delete this file, have the journal page read from the DB instead.
// ──────────────────────────────────────────────────────────────────────────

import type { Article } from "@/types/journal";
import type { ArticleChecklistLink } from "@/types/journal-links";

// ── Checklist item under pilot ────────────────────────────────────────────
// "Choose your reception outfit" — lib/checklist-seed.ts, p3-bwar-07.
export const PILOT_CHECKLIST_ITEM_ID = "p3-bwar-07";

// ── Articles ──────────────────────────────────────────────────────────────

export const PILOT_ARTICLES: Article[] = [
  // ── 1. Primer ───────────────────────────────────────────────────────────
  {
    id: "a-reception-primer",
    slug: "reception-look-why-it-matters",
    tier: "feature",
    span: "half",
    category: "style",
    title: "The Reception Look: Why It Matters More Than You Think",
    deck:
      "The ceremony outfit is for your grandmother. The reception outfit is for the rest of your life — and the cameras know it.",
    byline: "By Mira Iyengar",
    bylineBio:
      "Mira Iyengar was Fashion Features Director at Vogue India until 2024. She writes about textile and ceremony at Ananya.",
    readingTime: 9,
    publishedAt: "2026-04-02",
    heroSeed: "ananya-reception-primer",
    tags: ["reception", "style", "fashion", "cultural-shift"],
    body: [
      {
        kind: "p",
        text: "At most Indian weddings, the reception outfit is the outfit the bride is wearing in the photograph her friends post to Instagram. Not the mandap, not the phere, not the sindoor — the reception. It is the image that runs in the Vogue India column. It is the look her college roommate texts her mother about. If you are planning a wedding at a certain tier, you should understand why that is, because the decision you are about to make is larger than the fabric.",
      },
      {
        kind: "p",
        text: "The ceremony look answers to lineage. The reception look answers to the future. The former is a promise to your grandmother that you remembered who you came from. The latter is a signal to everyone else — your new colleagues, your spouse's cousins, the friends who flew in from Singapore — about who you are now, and the couple you intend to become. The two outfits are doing different jobs. Treat them as such.",
      },
      {
        kind: "h2",
        text: "What the camera sees",
      },
      {
        kind: "p",
        text: "A well-photographed Indian wedding produces between 4,000 and 9,000 usable frames across the week. Of those, perhaps 80 will enter the couple's lifetime rotation — the ones that end up framed in the hallway, in the anniversary post, in the wedding film's teaser. Roughly a third of that 80 will be from the reception. This is not because receptions are more photogenic per minute than ceremonies. It is because the reception is the first event where the bride looks directly into the lens.",
      },
      {
        kind: "p",
        text: "At the ceremony, she is looking at her partner. At the haldi, she is laughing with her cousins. At the sangeet, she is dancing. At the reception, she is being introduced — which means she is standing, usually, in a good light, turned toward the room, composed. The camera knows this. The guest list knows this. The outfit has to know this too.",
      },
      {
        kind: "pullquote",
        text: "The ceremony look answers to lineage. The reception look answers to the future.",
      },
      {
        kind: "h2",
        text: "The modern shift away from red",
      },
      {
        kind: "p",
        text: "For about forty years, the assumption was that the bride wore red for the ceremony and a lighter red — a rani pink, a maroon, a ruby — for the reception. The shift away from that assumption is not new, but it has become absolute in the last eight years. Brides who can afford couture are now actively choosing to contrast the two looks rather than rhyme them. The ceremony might be an ivory-and-gold Benarasi. The reception is a cobalt Sabyasachi column gown with a throw-over dupatta. Or the reverse: a scarlet Manish Malhotra for the phere, followed by a champagne Falguni Shane Peacock number with crystal embellishment for the evening.",
      },
      {
        kind: "p",
        text: "The reason is partly cultural — second-generation brides working in Manhattan, London, Bengaluru startups want their reception photos to read as contemporary rather than specifically bridal — and partly mechanical. If you have spent eight hours in a thirty-pound red lehenga under a hot tent, you want to change into something you can actually move in, eat in, dance in. The reception outfit has a job to do beyond aesthetics. It has to let you be a person for the next six hours.",
      },
      {
        kind: "h2",
        text: "How your guests read the difference",
      },
      {
        kind: "p",
        text: "There is a language that Indian wedding guests — particularly the aunties — read fluently, and you should know that they are reading it. A bride who changes into a visibly more fashion-forward look for the reception is communicating: I honor the tradition and I have my own direction. A bride who keeps the ceremony aesthetic into the reception is communicating: I want this to feel continuous with who my family has always been. Neither is wrong. Both are legible.",
      },
      {
        kind: "p",
        text: "The groom's look operates the same way, and the signal from groom to groom is shifting faster than bride-to-bride. The sherwani at the ceremony followed by a tuxedo at the reception has been common for twenty years. The newer move, which is quietly everywhere right now, is a sherwani or bandhgala at the ceremony and a bandhgala at the reception — but tailored like an Italian dinner jacket, in wool rather than silk, with Raghavendra Rathore or Tarun Tahiliani precision. The fusion is the point. The look reads as confidently bi-cultural, not as if the groom changed costumes to be acceptable to his spouse's Western colleagues.",
      },
      {
        kind: "h2",
        text: "The holistic decision",
      },
      {
        kind: "p",
        text: "When my clients ask me how to think about the reception outfit, I tell them to stop thinking about the outfit and start thinking about the frame. The outfit is going to be photographed against a specific wall, under a specific set of lights, next to a specific partner, at a specific moment in the timeline of the evening. Those variables are not decorative — they are load-bearing. An ivory lehenga is extraordinary against a deep green mehndi-leaf wall in the soft gold of a banquet chandelier. The same ivory lehenga disappears against a cream marble hotel ballroom under cool LED uplighting. Nobody tells brides this at their first fitting, and it is the single most common reason that a very expensive outfit photographs flat.",
      },
      {
        kind: "p",
        text: "So: before you commit to a silhouette, know your venue's color temperature. Before you commit to a palette, know what color the groom is wearing. Before you commit to a designer, know your timeline. The outfit decision is not first. It is third, at best, and the couples who treat it as first are the ones whose reception photos, two years later, they cannot quite put their finger on why they do not love.",
      },
      {
        kind: "h2",
        text: "What to do this week",
      },
      {
        kind: "p",
        text: "If your wedding is more than eight months out, you have time. Start a visual reference file — not Pinterest, which will homogenize you — of specific brides whose reception looks you actually respond to, noting the designer, the venue, and the lighting. If your wedding is inside eight months, your silhouette and designer tier have to be locked within the next three weeks. Couture ateliers will tell you they can accommodate shorter timelines, and some can, but the ones who do are usually the ones who will also cut corners on the embroidery. The rest of this primer series — the decision framework, the vendor-consultation guide, the timeline — exists to get you to a confident answer without the panic that sets in at T-minus-five-months, when your inbox is full of atelier replies that politely say 'our calendar is closed for your dates.'",
      },
    ],
    checklist: [
      {
        phase_id: "phase-3",
        subsection: "Bridal Attire",
        title: "Confirm reception silhouette and designer tier",
        description:
          "Lock lehenga / gown / fusion and couture / ready-to-wear / rental before any consultations.",
        priority: "high",
      },
      {
        phase_id: "phase-3",
        subsection: "Bridal Attire",
        title: "Confirm venue lighting temperature with DJ/decor",
        description:
          "Warm tungsten flatters gold, ivory, blush. Cool LED kills them. Ask before you commit to the palette.",
        priority: "medium",
      },
    ],
    studio: [
      {
        area: "brand",
        label: "Coordinate reception palette with your brand kit",
        description:
          "Pull the reception outfit's secondary hues into your invitation suite so the week reads as one continuous visual story.",
      },
    ],
    vendors: [
      {
        category: "wardrobe",
        reason:
          "Ateliers who understand the difference between ceremony construction and reception construction. Not every couture house does both well.",
      },
      {
        category: "photography",
        reason:
          "Photographers who can read lighting against fabric — ask for their reception portfolio specifically, not their full gallery.",
      },
    ],
  },

  // ── 2. Decision framework ───────────────────────────────────────────────
  {
    id: "a-reception-framework",
    slug: "reception-silhouette-designer-tradeoffs",
    tier: "feature",
    span: "half",
    category: "style",
    title: "Silhouette, Tier, Designer: The Reception-Outfit Decision Map",
    deck:
      "Lehenga versus gown versus fusion. Couture versus ready-to-wear versus rental. A working framework for a decision most brides make in the wrong order.",
    byline: "By Devika Rao",
    bylineBio:
      "Devika Rao is a Mumbai-based stylist who has dressed brides for fifty-two weddings across six countries. Formerly at Sabyasachi's atelier.",
    readingTime: 12,
    publishedAt: "2026-04-04",
    heroSeed: "ananya-reception-framework",
    tags: ["reception", "style", "couture", "decision-framework"],
    body: [
      {
        kind: "p",
        text: "Most brides come to their first reception-outfit meeting with a designer already in mind. This is the wrong place to start. The designer is the last decision, not the first. Before you walk into Sabyasachi's Horniman Circle flagship or Manish Malhotra's Kala Ghoda atelier, you should have answered three questions, in order: what silhouette, what tier, and what coordination. Only then does the designer question resolve itself.",
      },
      {
        kind: "h2",
        text: "Decision one: silhouette",
      },
      {
        kind: "p",
        text: "There are four silhouettes worth considering for an Indian reception in 2026, each with a distinct visual argument.",
      },
      {
        kind: "list",
        items: [
          "The modern lehenga — lighter than the ceremony version, often with a sculpted blouse and a fluid skirt, embroidered lightly rather than densely. Reads as Indian, fashion-forward, confidently bridal. Best when the ceremony was a traditional red lehenga and you want continuity without repetition.",
          "The column gown or saree-gown — a long, narrow line, usually with a traditional drape built in. Reads as international, architectural, directly referential to couture red carpets. Best when the ceremony was traditional and you want the reception to signal a different register. Tarun Tahiliani and Gaurav Gupta are the strongest practitioners.",
          "The sharara or palazzo suit — high, structured kurta over loose pants, often in lighter fabric than the ceremony. Reads as considered, literary, a little bit Delhi. Best for brides who want to move easily and do not want the weight of a lehenga. Anamika Khanna, Abu Jani Sandeep Khosla.",
          "The fusion separates — a traditional blouse with a modern skirt, or a gown with a classical dupatta, or a sari draped over a bustier. Reads as explicitly bi-cultural. Best when the couple is already coded that way by their guest list. Rahul Mishra, Payal Khandwala, emerging designers like Saaksha & Kinni.",
        ],
      },
      {
        kind: "pullquote",
        text: "The designer is the last decision, not the first.",
      },
      {
        kind: "p",
        text: "Rule of thumb: if your ceremony silhouette was a heavy red lehenga, your reception should not be another heavy lehenga in a different color, because the photographs will read as repetitive. Shift the silhouette, not just the palette.",
      },
      {
        kind: "h2",
        text: "Decision two: tier",
      },
      {
        kind: "p",
        text: "Price is a proxy for three things at once — the quality of the embroidery, the lead time, and the exclusivity of the design. Understand what you are buying at each tier before you choose.",
      },
      {
        kind: "list",
        items: [
          "Full couture (₹12L–₹40L / $15,000–$50,000). Sabyasachi, Manish Malhotra, Falguni Shane Peacock, Rahul Mishra, Abu Jani Sandeep Khosla. Six- to eight-month lead time minimum. Embroidery is hand-done by karigars who have been with the atelier for years. The outfit will be one of perhaps ten in that exact colorway in the world. Fittings are scheduled, not guessed at. This is the tier for brides whose reception outfit needs to survive being photographed by a wedding editor.",
          "Premium ready-to-wear and made-to-measure (₹3L–₹8L / $4,000–$10,000). Anita Dongre, Tarun Tahiliani diffusion, Ridhi Mehra, Ridhima Bhasin, Shyamal & Bhumika's lighter collections. Twelve- to sixteen-week lead times. Embroidery is often machine-assisted with hand finishing. Design is not exclusive to you, but the fit can be customized. This tier is where most brides at premium-budget weddings land for the reception, because it lets couture get spent on the ceremony lehenga.",
          "Rental couture (₹30K–₹1.5L / $400–$2,000). Flyrobe, Rent An Attire, The Clothing Rental. You get an actual Sabyasachi or Manish Malhotra piece, previously worn, dry-cleaned, with a deposit. Good for the lower-profile events like sangeet and mehndi. For the reception, most brides who can afford the real thing will want to own it — but the rental tier has become legitimate enough that a confident bride can rent her reception outfit without apology. The catch is selection: you are picking from what is available, not what you imagined.",
          "Emerging designer, made-to-measure (₹1.5L–₹3L / $2,000–$4,000). Punit Balana, Nishar Ahmed, Pankaj & Nidhi, Saaksha & Kinni, Torani. Eight- to twelve-week lead times. You get a designer relationship without the couture markup — the designer will often fit you personally. Best for brides who care more about originality than about name recognition.",
        ],
      },
      {
        kind: "p",
        text: "A snapshot of each tier, with real names and real numbers. These are the houses our editors return to most often for reception work — not the only ones worth considering, but reasonable starting points for each tier.",
      },
      {
        kind: "designer_showcase",
        designer: "Sabyasachi",
        collection: "Heritage Bridal Couture 2025",
        piece:
          "Ivory silk column gown with hand-embroidered silver zardozi panels and a hand-pieced tulle dupatta. Sabyasachi's reception silhouettes have moved sharply toward column and fluted shapes since 2023 — a deliberate counterweight to the heavier ceremony lehenga.",
        price_range: "$28,000 – $42,000 / ₹23L – ₹35L",
        lead_time: "6–8 months",
        image_url: "/images/portfolio/wedding/wedding-06.jpg",
        image_alt:
          "Ivory column gown with silver zardozi embroidery, photographed in studio.",
        credit: {
          name: "Press-kit image needed — request from Sabyasachi PR",
          placeholder: true,
        },
        vendor_slug: "sabyasachi",
        note: "The reference point for what reception couture can be. Fittings are scheduled from order intake; karigars in Kolkata have been with the house for a decade or more.",
      },
      {
        kind: "designer_showcase",
        designer: "Tarun Tahiliani",
        collection: "Tarun Tahiliani Diffusion / Tasva",
        piece:
          "Drape-inspired saree-gown in blush crepe with a pre-stitched pallu and a crystal-edged border. Made-to-measure with three scheduled fittings. The diffusion line is run by a trained atelier team; the couture side is Tarun himself.",
        price_range: "$3,800 – $6,500 / ₹3.2L – ₹5.4L",
        lead_time: "12–16 weeks",
        image_url: "/images/portfolio/wedding/wedding-07.jpg",
        image_alt:
          "Blush saree-gown with draped pallu, photographed in a natural-light studio.",
        credit: {
          name: "Press-kit image needed — request from Tarun Tahiliani PR",
          placeholder: true,
        },
        vendor_slug: "tarun-tahiliani",
        note: "The answer for brides who want couture sensibility with a calendar that respects real life. A serious number of the reception looks photographed in Vogue India's wedding issue every season come from this house.",
      },
      {
        kind: "designer_showcase",
        designer: "Saaksha & Kinni",
        collection: "Recent Couture / Spring 2026",
        piece:
          "Structured bustier with layered organza lehenga skirt in dove grey and rose gold. Hand-cutwork rather than dense embroidery — lighter to wear, photographs clean under ballroom light.",
        price_range: "$2,200 – $3,800 / ₹1.8L – ₹3.2L",
        lead_time: "8–12 weeks",
        image_url: "/images/portfolio/portrait/portrait-05.jpg",
        image_alt:
          "Dove grey bustier and organza skirt, photographed against a muted backdrop.",
        credit: {
          name: "Press-kit image needed — request via designer Instagram DM",
          placeholder: true,
        },
        note: "The tier where originality beats name recognition. The designer will personally fit you. The piece will not be on another bride's Instagram.",
      },
      {
        kind: "designer_showcase",
        designer: "Flyrobe",
        collection: "Rental Marketplace",
        piece:
          "Actual Sabyasachi, Manish Malhotra, and Anamika Khanna pieces, previously worn, professionally cleaned, with a refundable deposit. Selection rotates monthly; size availability is narrower than full couture.",
        price_range: "$400 – $2,000 / ₹30K – ₹1.5L",
        lead_time: "Inside 3 weeks",
        image_url: "/images/portfolio/portrait/portrait-06.jpg",
        image_alt:
          "Marketplace grid of rental couture pieces, previously worn and professionally cleaned.",
        credit: {
          name: "Editorial photograph needed — commission or request from Flyrobe",
          placeholder: true,
        },
        note: "Legitimate for sangeet and mehndi at this budget tier. For reception, most brides who can afford ownership will prefer it — but the rental path is no longer embarrassing, and for sub-₹10 lakh weddings it is genuinely the right move.",
      },
      {
        kind: "h2",
        text: "Decision three: coordination",
      },
      {
        kind: "p",
        text: "Three things need to coordinate with your reception outfit, and none of them are your opinion.",
      },
      {
        kind: "p",
        text: "One — the groom. The rule that has held for decades: one of you is the statement piece, one is the supporting piece. If the bride is in a crystal-embellished Falguni Shane Peacock gown, the groom should be in a matte bandhgala. If the groom is in a fully embroidered Raghavendra Rathore sherwani, the bride should choose a cleaner silhouette. Two heavily embellished pieces next to each other wash each other out — the camera cannot find the focal point, and neither can the guests.",
      },
      {
        kind: "p",
        text: "Two — the venue. Before you commit to a palette, walk the reception space at night, with the lights actually on. Many hotel ballrooms have cool LED-based systems that kill gold and blush; many palace venues have warm tungsten that flatters them. If the venue has limestone walls, an ivory outfit vanishes; if it has oxblood textile panels, a cream outfit floats beautifully. A good planner will do this walk with you. A great one will bring a fabric swatch.",
      },
      {
        kind: "p",
        text: "Three — the photography plan. If your photographer has committed to a specific entrance shot — you coming down a staircase, say, or emerging between two curtains — the outfit has to work in that shot's motion. A floor-length gown with a train reads differently descending stairs than a structured lehenga. Ask your photographer for the planned key shots before final fitting. Bring the images to the atelier.",
      },
      {
        kind: "h2",
        text: "A worked example",
      },
      {
        kind: "p",
        text: "A bride planning a January reception at the Taj Falaknuma in Hyderabad (warm-tungsten ballroom, sandstone walls, Mughal-heavy decor), whose groom is wearing a Raghavendra Rathore sherwani in pistachio with fine gold thread, asked us how to think about her outfit. The ceremony had been a traditional red Sabyasachi lehenga. The answer that walked out: a sculpted Tarun Tahiliani column gown in dove-gray Chanderi with silver cord-work, floor-length, no train, with a draped dupatta over one shoulder. The silhouette shifted from lehenga to column, honoring the rule against repetition. The palette picked up the gold and silver of the groom's sherwani without competing. The fabric sat beautifully under the warm chandeliers of the ballroom. The photograph of the couple on the stairs is, three years later, still their most-requested frame.",
      },
      {
        kind: "photo",
        url: "/images/portfolio/best/best-11.jpg",
        alt: "Couple on the grand staircase of a palace venue, bride in a dove-grey column gown, groom in a pistachio sherwani, warm chandelier lighting overhead.",
        caption:
          "The staircase frame from the Taj Falaknuma example. Column gown against warm tungsten; no competition between bride and groom.",
        credit: {
          name: "Editorial photograph needed — replace with real couple with signed release",
          placeholder: true,
        },
      },
      {
        kind: "h2",
        text: "What the framework protects you from",
      },
      {
        kind: "p",
        text: "The single most common mistake at this price point is choosing the designer before the silhouette, because it means you end up with an outfit that is unmistakably that designer but does not quite fit your body, your venue, or your partner's look. The second most common mistake is choosing the palette before the venue walk, because it means you end up with an outfit that is gorgeous in daylight and dead under ballroom LED. Use the framework — silhouette, tier, coordination — and the designer question becomes a short list of three or four ateliers, not a panicked rotation through fifteen.",
      },
    ],
    checklist: [
      {
        phase_id: "phase-3",
        subsection: "Bridal Attire",
        title: "Lock silhouette before approaching designers",
        description:
          "Decide lehenga vs. gown vs. sharara vs. fusion first. It will cut your designer shortlist in half.",
        priority: "high",
      },
      {
        phase_id: "phase-3",
        subsection: "Bridal Attire",
        title: "Walk the reception venue at night with lights on",
        description:
          "Check color temperature before committing to a palette. Warm tungsten versus cool LED changes everything.",
        priority: "medium",
      },
      {
        phase_id: "phase-3",
        subsection: "Groom Attire",
        title: "Align statement piece between bride and groom",
        description:
          "One of you is the focal point; the other is supporting. Decide together before either books a designer.",
        priority: "high",
      },
    ],
    studio: [],
    vendors: [
      {
        category: "wardrobe",
        reason:
          "Designers whose reception work is structurally distinct from their ceremony work. Ask to see both when you consult.",
      },
    ],
  },

  // ── 3. Vendor-question guide ────────────────────────────────────────────
  {
    id: "a-reception-consult",
    slug: "designer-consultation-questions",
    tier: "feature",
    span: "half",
    category: "planning",
    title: "What to Ask the Designer: A Consultation Cheat Sheet",
    deck:
      "Fifteen questions to take into your first atelier meeting, with the answers a serious couture house will give — and the answers that should send you back to your list.",
    byline: "By Priya Shukla",
    bylineBio:
      "Priya Shukla is a bridal stylist and former atelier manager at Anita Dongre. She has chaperoned 140+ couture consultations.",
    readingTime: 11,
    publishedAt: "2026-04-06",
    heroSeed: "ananya-reception-consult",
    tags: ["reception", "vendors", "designers", "consultation"],
    body: [
      {
        kind: "p",
        text: "The consultation is not where you decide. The consultation is where you collect the information that lets you decide. Most brides walk in having already picked the designer in their head; then they spend an hour being shown beautiful things and walk out without the data they actually needed. This guide is the opposite — fifteen questions, arranged in the order a good atelier meeting should unfold, with the answers a serious house will give you and the ones that should cause you to thank them politely and go home.",
      },
      {
        kind: "h2",
        text: "Before you go in",
      },
      {
        kind: "p",
        text: "Take three reference images with you — not fifteen — and one photograph each of the ceremony outfit and the groom's reception look if confirmed. Take your wedding date on paper. Take your planner or your mother, one, not both. Wear something close-fitting so the designer can read your line. Do not take your phone out to photograph anything in the atelier unless invited.",
      },
      {
        kind: "h2",
        text: "The lead-time questions",
      },
      {
        kind: "p",
        text: "One — 'What is your current lead time for a custom reception piece?' A good answer names a specific window and anchors it to the calendar: 'We are booking October deliveries now, so if your wedding is in December, we can do it, but we would need to close your order this week.' A red-flag answer: 'We can definitely make it work' with no calendar anchor, especially said warmly. That is the sentence that becomes 'unfortunately the karigars fell behind' five months later.",
      },
      {
        kind: "p",
        text: "Two — 'Who else is getting delivered in the same window?' You are not asking for names; you are asking for volume. A good atelier will tell you roughly how many brides they have in the same two-week cut — 'We have about eight November-December brides right now' — so you can calibrate risk. If the designer cannot or will not answer, they are either overcommitted or opaque. Both are problems.",
      },
      {
        kind: "p",
        text: "Three — 'What happens if your karigars are delayed?' A good answer is honest: 'We build a two-week buffer into every bridal piece; if we lose more than that we will tell you by month six so we can adjust embroidery scope.' A red-flag answer is a reassurance with no contingency — 'that will not happen with us.'",
      },
      {
        kind: "h2",
        text: "The fitting and alterations questions",
      },
      {
        kind: "p",
        text: "Four — 'How many fittings are included, and where do they happen?' Standard for couture is three fittings: initial muslin, embellishment-placed, final. If you are based outside the city of the atelier, ask about the travel policy. Sabyasachi does quarterly trunk shows in New York, London, and Dubai; Manish Malhotra travels less predictably. Ridhi Mehra will sometimes send a tailor to you.",
      },
      {
        kind: "p",
        text: "Five — 'What is your alteration window?' A good answer builds in six to eight weeks between final fit and wedding. A red-flag answer is 'we do the final fitting the week of.' If you lose or gain weight in the last month — which is common, given stress — you need the buffer.",
      },
      {
        kind: "p",
        text: "Six — 'What if I want to change the embroidery scope after the first fitting?' A good atelier will tell you their freeze date — typically at the end of the first fitting — after which changes are either impossible or cost a named surcharge. A red-flag answer is 'we can change anything up until the final fitting.' That is untrue for hand embroidery and implies the atelier does not understand its own workflow.",
      },
      {
        kind: "h2",
        text: "The fabric and embroidery questions",
      },
      {
        kind: "p",
        text: "Seven — 'Can I see the actual fabric and the embroidery samples, not sketches?' A good atelier will bring out swatches of the base fabric (raw silk, Chanderi, organza, velvet) and small trial panels of the embroidery in the colorway. A red-flag atelier will show you only mood boards or digital renderings. Embroidery density is impossible to judge from a sketch.",
      },
      {
        kind: "p",
        text: "Eight — 'What technique is the embroidery, and who executes it?' Zardozi, aari, gota-patti, chikankari, tilla, French knots — these are not interchangeable, and their price points are radically different. A serious house will name the technique and, if pressed, tell you roughly the size of the karigar team and where they are based. (Most couture houses karigar in Kolkata, Lucknow, or Jaipur depending on technique.) Vagueness here is either a sign of outsourcing you were not told about or of a lack of familiarity that does not fit the price.",
      },
      {
        kind: "p",
        text: "Nine — 'What is the weight of the finished piece?' A Sabyasachi ceremony lehenga can run 12 to 15 kilograms. A reception gown should run half of that or less. If the answer is 'we try not to weigh them,' push. You will be wearing it for six hours.",
      },
      {
        kind: "h2",
        text: "The money and logistics questions",
      },
      {
        kind: "p",
        text: "Ten — 'What is included in the quoted price?' A good atelier will itemize: base fabric, embroidery, lining, blouse, dupatta, petticoat, initial accessories. A red-flag atelier will quote 'everything you need' and then add on. At couture price points, the dupatta and the blouse are often priced separately; know which.",
      },
      {
        kind: "p",
        text: "Eleven — 'What is the payment schedule?' Standard couture is 50 percent at order, 25 percent at second fitting, 25 percent at delivery. Emerging designers often ask for 30 percent up front. A red-flag answer is 'full payment at order,' which removes your leverage if the piece disappoints.",
      },
      {
        kind: "p",
        text: "Twelve — 'What happens if I lose or gain weight?' The answer should involve seam allowance (most couture ateliers build in an inch and a half on key seams) and a named protocol for alterations inside a defined window. 'It will fit perfectly' is not an answer. It is a wish.",
      },
      {
        kind: "p",
        text: "Thirteen — 'How will the piece be delivered?' For couture, this matters more than it sounds. Sabyasachi will courier via FedEx Priority with insurance for an additional charge, typically $300–$500 for international delivery. Manish Malhotra usually requires atelier pickup or family collection. Emerging designers will sometimes ship via unsecured courier — get this in writing.",
      },
      {
        kind: "h2",
        text: "The culture questions",
      },
      {
        kind: "p",
        text: "Fourteen — 'Can you tell me about a recent bride whose piece came in outside the original scope?' This is the question that reveals the atelier's character. A good house will tell you a specific story with specific accommodations. A house that says 'that has never happened' either is lying or does not pay attention.",
      },
      {
        kind: "p",
        text: "Fifteen — 'Who is my point of contact once I have placed the order?' The designer is usually not it. A good atelier assigns you to a specific atelier manager with a direct phone number and a stated response window. A red-flag answer is 'just email the general inbox and we will respond.'",
      },
      {
        kind: "h2",
        text: "What a good atelier meeting feels like",
      },
      {
        kind: "p",
        text: "You will know you are in a good atelier meeting when the designer is more interested in your wedding than in showing you their portfolio. They will ask about the ceremony outfit, the groom's look, the venue, the lighting. They will suggest silhouettes you had not considered and explain why. They will volunteer their constraints — 'we would not be able to do full zardozi in your window' — before you have to ask. They will end the meeting with a written follow-up that summarizes what was discussed and the calendar windows for each next step.",
      },
      {
        kind: "p",
        text: "You will know you are in a bad one when the designer is charming and generous with their time and you leave with no dates, no prices in writing, and a feeling that you have been welcomed rather than hired.",
      },
    ],
    checklist: [
      {
        phase_id: "phase-3",
        subsection: "Bridal Attire",
        title: "Prepare designer consultation questions in writing",
        description:
          "Print the 15-question cheat sheet. Do not rely on memory — a good atelier will respect specificity.",
        priority: "high",
      },
      {
        phase_id: "phase-3",
        subsection: "Bridal Attire",
        title: "Request written follow-up from every consultation",
        description:
          "Any atelier worth its tier will send a written recap with dates and prices within 48 hours.",
        priority: "medium",
      },
    ],
    studio: [],
    vendors: [
      {
        category: "wardrobe",
        reason:
          "You are evaluating the atelier's process, not just the designer's name. Bring this checklist to all three consultations.",
      },
    ],
  },

  // ── 4. Timeline / logistics ─────────────────────────────────────────────
  {
    id: "a-reception-timeline",
    slug: "reception-outfit-eight-month-timeline",
    tier: "feature",
    span: "half",
    category: "planning",
    title: "The Eight-Month Reception-Outfit Timeline",
    deck:
      "What to do at T-minus-eight-months, T-minus-four, T-minus-one, and the week of. With alterations buffers, travel logistics, and the steaming question nobody warns you about.",
    byline: "By Radhika Desai",
    bylineBio:
      "Radhika Desai is the founder of Desai & Co., a wedding planning firm based in Delhi and New York. She has planned 210 weddings since 2009.",
    readingTime: 10,
    publishedAt: "2026-04-08",
    heroSeed: "ananya-reception-timeline",
    tags: ["reception", "timeline", "logistics", "planning"],
    body: [
      {
        kind: "p",
        text: "Indian couture is not a calendar-flexible craft. The single most common reason a reception outfit arrives disappointing — puckered embroidery, a blouse that does not sit flat, a hemline that reads cheap — is that someone in the chain compressed a timeline that does not compress. This piece is the timeline we give our brides at Desai & Co. It assumes an eight-month runway, which is the minimum for couture at a serious tier. If you have less, scroll to the bottom — there is a protocol for that too.",
      },
      {
        kind: "h2",
        text: "T-minus eight months (research and shortlist)",
      },
      {
        kind: "list",
        items: [
          "Build a private reference file of eight to twelve reception looks you actually respond to. Note the designer, the venue, and the lighting.",
          "Identify the three silhouettes most alive for you — lehenga, gown, fusion — and commit to one going in. You can change, but an open mind with a designer is wasted oxygen.",
          "Shortlist three to five designers whose reception work fits your silhouette. Cross off anyone whose recent brides you have seen complain about delays.",
          "Request first-consultation appointments. Top-tier ateliers (Sabyasachi, Manish Malhotra, Falguni Shane Peacock) book consultation slots two to six weeks out.",
        ],
      },
      {
        kind: "h2",
        text: "T-minus seven months (consultations)",
      },
      {
        kind: "list",
        items: [
          "Take the 15-question consultation cheat sheet into all three meetings. Do not decide on the day — go home and sleep.",
          "Within 48 hours of each meeting, you should have a written recap from the atelier with lead times, prices, and what the piece will include. If it does not come, follow up once. If it still does not come, cross that atelier off.",
          "Make the designer decision by the end of this month. Signing in month six means starting embroidery in month five means delivering in month one means no alterations buffer.",
        ],
      },
      {
        kind: "h2",
        text: "T-minus six months (order and design freeze)",
      },
      {
        kind: "list",
        items: [
          "Place the order. Pay the 50 percent deposit (couture) or 30 percent deposit (emerging designer). Get the order confirmation in writing with the key dates spelled out.",
          "Complete the initial design meeting — this is usually a separate appointment after deposit, where you finalize embroidery scope, exact palette, blouse construction. This meeting is a hard freeze. Bring your groom's look, the venue lighting information, and your photographer's shot plan.",
          "Do not, after this point, scroll Instagram for inspiration. You will see a single bride in a different silhouette and convince yourself you have made the wrong choice. This is well-documented and it is called the six-month wobble. It is nonsense. Trust the framework.",
        ],
      },
      {
        kind: "pullquote",
        text: "The single most common reason a reception outfit arrives disappointing is that someone in the chain compressed a timeline that does not compress.",
      },
      {
        kind: "h2",
        text: "T-minus four months (first fitting)",
      },
      {
        kind: "list",
        items: [
          "First fitting is usually a muslin or toile — a cotton mockup of the silhouette, without embellishment, to confirm fit and proportion. If you cannot travel to the atelier, some houses will send a fit kit by courier with a local tailor partner; Sabyasachi and Tarun Tahiliani are best-in-class at this.",
          "Confirm jewelry and footwear now, even if you are not buying yet. The height of your heel affects the hem of the outfit; the weight of your choker affects the blouse line. Bring the intended pieces (or exact proxies) to the fitting.",
          "If the muslin is materially off in the line — not just minor adjustments — raise it now, in writing. A designer who pushes back hard against changes at the muslin stage is the designer you want. A designer who takes every note without comment is a designer whose final piece will not know what it is.",
        ],
      },
      {
        kind: "h2",
        text: "T-minus three months (second fitting)",
      },
      {
        kind: "list",
        items: [
          "Second fitting is in actual fabric, with embellishment placed (often basted rather than final-sewn). This is the meeting where you see the piece for the first time. Reactions at this meeting run emotional — budget for it.",
          "Blouse construction should be final at this fitting. Blouses are where couture reveals itself. A blouse that does not sit flat against the ribcage, that gaps at the armhole, or that pulls at the dart is a blouse that will photograph as amateur.",
          "Confirm the dupatta drape with the designer. Most reception dupattas are single-draped over one shoulder or held at the elbow; the decision affects the overall silhouette.",
        ],
      },
      {
        kind: "h2",
        text: "T-minus two months (final fitting)",
      },
      {
        kind: "list",
        items: [
          "Final fitting is in the completed piece. It should fit correctly. Adjustments should be minor — seams of less than half an inch, possibly a hem.",
          "If the piece does not fit correctly at this meeting, you are inside the danger window. Raise everything in writing, copy your planner, and hold the atelier to the contracted alteration protocol.",
          "Confirm delivery logistics: pickup date, courier service, insurance. If international, confirm the customs declaration value — couture pieces shipped at declared values below their actual worth will be held.",
        ],
      },
      {
        kind: "h2",
        text: "T-minus one month (alterations buffer)",
      },
      {
        kind: "list",
        items: [
          "This month exists entirely so that if you have lost or gained weight under stress, there is a protocol. Both happen. The atelier's seam allowance should accommodate up to 1.5 inches in either direction.",
          "Do not diet in this window. Whatever your body is, dress it. The bride who tries to lose 5 kg in the last four weeks is the bride whose reception outfit does not sit right, because even a 3 kg shift changes the fit of a structured blouse.",
          "Schedule the final in-outfit photo test — just a phone photo of you standing and sitting in the outfit in your hotel room, in warm light and cool light. If something reads off at this stage, you still have time to correct it.",
        ],
      },
      {
        kind: "h2",
        text: "The week of (steaming and logistics)",
      },
      {
        kind: "p",
        text: "Indian couture arrives wrinkled. This is not a failure of the atelier — it is inherent to the fabrics and the transport. A Sabyasachi gown flown from Mumbai to Udaipur will arrive with a muslin overlay, which will itself have compressed against the embroidery in unhelpful ways. You need a steamer, and you need someone competent with it.",
      },
      {
        kind: "list",
        items: [
          "Reserve a commercial garment steamer at the venue at least 48 hours before the reception. Most five-star venues in India have one; most palace venues do not. Confirm with the banquet manager.",
          "Identify the steamer operator. Do not let the hotel's housekeeping steam your lehenga. Bring your own person — usually your own designer's in-house steamer for couture, or a trusted local tailor your planner knows.",
          "Dupatta gets its own garment bag. If it travels folded with the lehenga, the embroidery will crease through.",
          "For destination weddings: carry the outfit on the plane, never checked. Most Indian airlines will allow a couture garment bag as an additional carry-on with pre-notification. Budget for the fee.",
          "For international destinations: file customs declaration before travel. A $30,000 couture piece flagged by customs in Dubai on the day of the reception is, I promise you, a real story from a real bride whose name I will not repeat.",
        ],
      },
      {
        kind: "h2",
        text: "If you have less than eight months",
      },
      {
        kind: "p",
        text: "The compressed protocol: drop a tier. A ready-to-wear Anita Dongre or Tarun Tahiliani diffusion piece with made-to-measure alterations can be delivered in 10 to 14 weeks. An emerging designer (Punit Balana, Saaksha & Kinni) can sometimes hit 12 weeks for a custom piece, but only if you close the order in the first meeting. Rental couture — Flyrobe, Rent An Attire — can be confirmed inside three weeks, which is the protocol for true emergencies.",
      },
      {
        kind: "p",
        text: "What you should not do: attempt full couture inside seven months. Every atelier will say yes; roughly half will quietly cut corners on the embroidery to hit the date; you will not know which half until the piece arrives. This is the single most preventable disappointment in this entire decision, and the only thing standing between you and it is the timeline you are reading right now.",
      },
    ],
    checklist: [
      {
        phase_id: "phase-3",
        subsection: "Bridal Attire",
        title: "Place reception outfit order by T-minus-6 months",
        description:
          "Any later and you are inside the danger window for couture. Drop a tier if you must.",
        priority: "high",
      },
      {
        phase_id: "phase-3",
        subsection: "Bridal Attire",
        title: "Reserve venue steamer + identified operator",
        description:
          "Indian couture arrives wrinkled. Do not let hotel housekeeping handle a $20K gown.",
        priority: "medium",
      },
      {
        phase_id: "phase-12",
        subsection: "Travel",
        title: "Confirm airline couture-garment-bag policy",
        description:
          "For destination weddings: carry on, never check. Most Indian airlines allow it with pre-notification.",
        priority: "high",
      },
    ],
    studio: [],
    vendors: [
      {
        category: "wardrobe",
        reason:
          "Ateliers whose lead-time transparency matches the timeline on this page. Vague answers to calendar questions are the signal to leave.",
      },
    ],
  },
];

// ── Join-table seed ───────────────────────────────────────────────────────
// Mirrors supabase/migrations/0005_article_checklist_links.sql rows that
// would exist in production. One row per (article, checklist item,
// relationship) tuple. Use PILOT_CHECKLIST_ITEM_ID rather than hard-coding
// the slug — makes the scale-up path to the next item obvious.

export const PILOT_CHECKLIST_LINKS: ArticleChecklistLink[] = [
  {
    id: "link-primer-reception",
    article_id: "a-reception-primer",
    checklist_item_id: PILOT_CHECKLIST_ITEM_ID,
    relationship_type: "primer",
    display_order: 0,
    relevance_score: 0.95,
    editorial_note:
      "Start here — frames the whole decision before the bride walks into her first atelier. Especially load-bearing for brides who assume the reception is a 'second look' rather than the photographed one.",
    created_at: "2026-04-02T00:00:00Z",
    updated_at: "2026-04-02T00:00:00Z",
  },
  {
    id: "link-framework-reception",
    article_id: "a-reception-framework",
    checklist_item_id: PILOT_CHECKLIST_ITEM_ID,
    relationship_type: "decision_framework",
    display_order: 0,
    relevance_score: 0.93,
    editorial_note:
      "Core decision map. Covers silhouette, tier, and coordination in the right order — the order brides usually get wrong.",
    created_at: "2026-04-04T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
  },
  {
    id: "link-consult-reception",
    article_id: "a-reception-consult",
    checklist_item_id: PILOT_CHECKLIST_ITEM_ID,
    relationship_type: "vendor_questions",
    display_order: 0,
    relevance_score: 0.9,
    editorial_note:
      "Hand this to the bride before her first consultation. The 15 questions are the reason couture ateliers either step up or stop returning emails.",
    created_at: "2026-04-06T00:00:00Z",
    updated_at: "2026-04-06T00:00:00Z",
  },
  {
    id: "link-timeline-reception",
    article_id: "a-reception-timeline",
    checklist_item_id: PILOT_CHECKLIST_ITEM_ID,
    relationship_type: "timeline",
    display_order: 0,
    relevance_score: 0.92,
    editorial_note:
      "The 8-month runway is the single best predictor of whether a couture reception piece arrives on time and correct. Show this before the bride signs any deposit.",
    created_at: "2026-04-08T00:00:00Z",
    updated_at: "2026-04-08T00:00:00Z",
  },
];

// ── Client-side lookup helpers ────────────────────────────────────────────
// Mirror lib/supabase/journal-links.ts query shapes, read from the seed
// arrays. Swap over when Supabase is wired up.

export function getRelatedArticlesForItem(
  checklistItemId: string,
): ArticleChecklistLink[] {
  return PILOT_CHECKLIST_LINKS.filter(
    (l) => l.checklist_item_id === checklistItemId,
  );
}

export function getSupportedItemsForArticle(
  articleId: string,
): ArticleChecklistLink[] {
  return PILOT_CHECKLIST_LINKS.filter((l) => l.article_id === articleId);
}

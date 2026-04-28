// ── Suite detail editorial content ────────────────────────────────────────
// Voice: an experienced South Asian wedding planner — warm, confident,
// specific. Copy here powers the Suite Builder slide-over panel. Kept
// separate from stationery-seed.ts so production data (quantity, cost,
// status) stays isolated from catalogue prose.

import type {
  StationerySuiteAddon,
  StationerySuiteDetail,
  StationerySuiteInspiration,
} from "@/types/stationery";

// Placeholder image URLs use placehold.co with the workspace palette so
// the gallery renders meaningfully before real curation lands. Swap the
// URLs once the planner uploads real inspiration (see Prompt 5).
const PH = (label: string, bg: string, fg: string): string =>
  `https://placehold.co/400x300/${bg}/${fg}?text=${encodeURIComponent(label)}&font=lora`;

// ── Editorial details (one per suite item) ────────────────────────────────

export const SEED_STATIONERY_SUITE_DETAILS: StationerySuiteDetail[] = [
  // 1. Save the Date
  {
    item_id: "sui-save-the-date",
    slug: "save-the-date",
    event_group: "pre_wedding",
    tagline: "The first promise — a date in the mail, a season in the air.",
    editorial_intro:
      "A Save the Date is the opening note of a wedding that spans three days and a dozen flights. It lets the aunt in Bombay move her surgery, the cousin in Toronto cash in miles, the friend from college block a long weekend before the Airbnb she wants gets claimed.\n\nAt this moment you are not asking anyone to RSVP. You are making a public promise that this wedding is real, that these dates are chosen, and that your people are on the list.",
    why_it_matters:
      "For a multi-event Indian wedding with destination guests, eight to ten months of runway is what turns wish-I-could-be-there into I'll-be-there. Skip this piece and you are filling seats on guilt and favors.",
    pro_tips: [
      "Send the printed card and the digital mirror on the same day. The printed card is for your parents' generation; the digital version is for the group chat.",
      "Include the wedding website URL or QR code, but nothing else operational — no dress code, no RSVP, no insistence. This is an announcement, not a briefing.",
      "If your venue isn't locked in yet, you can still commit to the city. 'Udaipur · April 2026' is enough for flights.",
      "Order ten to fifteen percent more than your household count. Late-added guests, sentimental keepsakes for the grandparents, one for your own keepsake box.",
    ],
    common_mistakes: [
      "Waiting until the suite is fully designed. The Save the Date can live in its own visual world — you'll lock the full identity later with the main invitation.",
      "Sending too close to the wedding. Inside six months for a destination wedding, you've already lost half your international guests to other plans.",
    ],
    timeline_guidance: "Ship 8–10 months before the wedding.",
    typical_quantity_note: "One per household, plus a 10% buffer for late adds.",
    inspiration_notes:
      "Quiet confidence — type-forward layouts, a single hit of gold, ivory stock you can feel through the envelope.",
    starting_price_cents: 18000,
    price_range_label: "Starting from ₹180 per card",
    upsell_headline: "Ready to announce your dates?",
    upsell_body:
      "Our designers will pair your Save the Date with a digital companion so your group chat and your grandmother both hear the news the same week.",
    upsell_cta_label: "Explore Save the Date designs",
    blog_post_title: "Save the Date timing for Indian weddings: the 8-month rule",
    blog_post_excerpt:
      "Why destination weddings need more runway than your American friends expect — and how to send a card that holds its tone for the full wait.",
    blog_post_url: "https://ananya.app/journal/save-the-date-timing",
  },

  // 2. Main Invitation Card
  {
    item_id: "sui-main-invitation",
    slug: "main-invitation",
    event_group: "pre_wedding",
    tagline: "The centerpiece — the card every other piece takes its cue from.",
    editorial_intro:
      "The Main Invitation is the heart of your suite. It is the piece that sits on a guest's counter for three months, that their mother photographs and sends to the family group, that they read twice before tucking into the mirror frame in the hallway.\n\nEvery other piece — the inserts, the RSVP, the day-of menu — borrows its typography, its palette, its motif from this one card. Spend the most design attention here. The rest of the suite follows.",
    why_it_matters:
      "Your invitation sets guests' expectation for the wedding itself. A letterpress cotton card with hand-painted gold tells them you've thought about cotton and gold. A flat digital print tells them you haven't.",
    pro_tips: [
      "Lead with the couple line and the family hosts — in that order for modern couples, reversed for traditional households. Settle this with both sets of parents before you see a proof.",
      "If you are printing in two languages, set them side-by-side or face-to-face (folded card), not stacked. Stacking forces one language to read as primary.",
      "Commission a custom monogram or motif before you start the invitation design. It will travel across every piece and it's cheaper to design once.",
      "Budget for a paper upgrade. The difference between 120gsm card stock and 600gsm cotton is felt in the hand before it's read by the eye.",
      "Reserve one finished invitation, uncut and pristine, for your wedding album. You will want it in twenty years.",
    ],
    common_mistakes: [
      "Cramming event logistics onto the main card. That's what inserts are for — the main card carries the ceremony, the ceremony carries the tone.",
      "Approving a proof on-screen without seeing a press proof on the real stock. Gold foil especially lies on screen — you need to see it catch light in your hand.",
    ],
    timeline_guidance: "Design 5–6 months out · print 3–4 months out · mail 2 months out.",
    typical_quantity_note: "One per household. Print 10% over your list for late adds and keepsakes.",
    inspiration_notes:
      "Letterpress cotton with a single foil hit. Or silk-screened ivory with a hand-lettered monogram. The card you'd want a guest to frame.",
    starting_price_cents: 52000,
    price_range_label: "Starting from ₹520 per card",
    upsell_headline: "Ready to design the centerpiece?",
    upsell_body:
      "Two rounds of proofs, real press samples on cotton, and a monogram developed by hand. Most couples who start here have their suite locked within six weeks.",
    upsell_cta_label: "Explore Main Invitation designs",
    blog_post_title: "Anatomy of a wedding invitation: every line, what it means",
    blog_post_excerpt:
      "The hosts line, the couple line, the venue line, the request line. Five decisions that shape the whole suite, worked through with real examples.",
    blog_post_url: "https://ananya.app/journal/invitation-anatomy",
  },

  // 3. RSVP Card
  {
    item_id: "sui-rsvp",
    slug: "rsvp-card",
    event_group: "pre_wedding",
    tagline: "The quiet conversation — yes, no, and one asked-for allergy.",
    editorial_intro:
      "An RSVP card looks simple. It is not. It is the instrument by which four hundred guests resolve into a catering number, a seating chart, a final headcount you can afford.\n\nThe modern convention is a printed card with a QR code that jumps to your wedding site — giving older relatives the paper they expect and younger guests the app flow they prefer. Both roads return the same data to your RSVP tracker.",
    why_it_matters:
      "Every week past your deadline that an RSVP is missing, your caterer is quoting on a guest who may not come. For a 400-person wedding, 5% attrition on the guest list is the difference between comfort and crunch.",
    pro_tips: [
      "Set the RSVP deadline four weeks before the wedding — not two. You need time to chase non-responders before final catering numbers lock.",
      "Ask only what catering actually needs: meal selection if you have set courses, dietary notes as free text, song request if you want. Skip the rest.",
      "Include a stamped, self-addressed envelope for printed RSVPs. The friction of finding a stamp is where half your RSVPs go to die.",
      "Pair with a digital RSVP at the same URL. Track both streams into one dashboard so you don't double-count.",
    ],
    common_mistakes: [
      "Writing 'regrets only' or 'no response needed.' You will not know your number until forty-eight hours before the wedding.",
      "Putting the RSVP deadline in small type at the bottom. Lead with it. Bold it. It's the whole point of the card.",
    ],
    timeline_guidance: "Mail with the main invitation · deadline ~4 weeks before the wedding.",
    typical_quantity_note: "One per household, plus a 10% buffer for lost-in-mail and duplicates.",
    inspiration_notes:
      "A small card with generous white space — a single M/F/Vegetarian check, a dietary line, and the deadline bolded at the top.",
    starting_price_cents: 14000,
    price_range_label: "Starting from ₹140 per card",
    upsell_headline: "A clean RSVP flow keeps the whole suite calm.",
    upsell_body:
      "We'll design the printed card and wire the QR to your RSVP tracker in one pass so you're not managing two lists.",
    upsell_cta_label: "Explore RSVP designs",
  },

  // 4. Details & Dress Code Card
  {
    item_id: "sui-details",
    slug: "details-card",
    event_group: "pre_wedding",
    tagline: "The guide — venue, dress code, and the hotel block, at a glance.",
    editorial_intro:
      "The Details Card is the piece that does the invitation's operational work so the main card doesn't have to. Venue addresses, dress code per event, hotel block overview, parking notes, anything practical that would clutter the ceremony card.\n\nFor multi-event weddings — where a guest is packing for mehendi, sangeet, ceremony, and reception — this card is the survival guide. It's the one they photograph and send to their partner.",
    why_it_matters:
      "The difference between guests showing up in the right outfit at the right venue, and guests arriving in cocktail attire to the sangeet when the note said 'festive Indian.' This card prevents your mother's phone from ringing.",
    pro_tips: [
      "Spell out the dress code. 'Festive Indian' means nothing to guests who haven't worn Indian formal since a cousin's wedding in 2019. Give colors, give examples, give a photo on the wedding site.",
      "Include the hotel block code and the booking deadline prominently. Guests who miss the block pay twice and blame you.",
      "If you have multiple venues, pin them on a simple map on the back of the card or print a separate Map Card.",
      "Write in voice, not in form letter. 'Pack light but expect to change outfits four times' reads better than 'Multiple attire changes required.'",
    ],
    common_mistakes: [
      "Burying the dress code under venue logistics. Lead with the dress code — that's the decision your guests need to make first.",
      "Assuming guests know where the venue is. Even local guests need the pin; destination guests need the whole map.",
    ],
    timeline_guidance: "Mail inside the invitation suite · 2–3 months before the wedding.",
    typical_quantity_note: "One per household — this is the card everyone photographs.",
    inspiration_notes:
      "A clean two-column layout — dress code on the left, logistics on the right. Or a foldout with a map on the inside.",
    starting_price_cents: 15000,
    price_range_label: "Starting from ₹150 per card",
    upsell_headline: "Give your guests a guide worth keeping.",
    upsell_body:
      "A Details Card that matches the tone of your main invitation — same typography, same stock, written to be read twice.",
    upsell_cta_label: "Explore Details Card designs",
  },

  // 5. Mehendi Insert
  {
    item_id: "sui-mehendi-insert",
    slug: "mehendi-insert",
    event_group: "pre_wedding",
    tagline: "Yellow and green — an afternoon of palms, stories, and slow hands.",
    editorial_intro:
      "A Mehendi Insert is the permission slip for your most intimate pre-wedding event. It signals that this afternoon is different in tone — barefoot on a lawn, a buffet of chaat, a henna artist working patient circles into palms — and dresses the day accordingly.\n\nIt's also the first insert your guests will pull from the envelope, so it carries the full aesthetic into their hands two months before the wedding itself.",
    why_it_matters:
      "Mehendi is the event that sets your wedding's emotional register. The card is small, but its job is large: tell your guests this is the event where the bride laughs without holding court, where your school friends meet your dadi.",
    pro_tips: [
      "Specify the attire cue explicitly — yellows, greens, garden casual. It protects guests from overdressing and underdressing in equal measure.",
      "Include the start time and the arrival window. Mehendi is long-form — guests can arrive anytime in the first ninety minutes and still catch the full event.",
      "If the venue is a home, write the host's name and the address as a single line. 'Sharma Residence, Plano' reads warmer than a street number alone.",
      "Call out that palms should be clean and unlotioned if guests want henna. It seems obvious; it is not.",
    ],
    common_mistakes: [
      "Using the same dress code language as the ceremony. Mehendi dress is a different register — 'festive Indian' reads too formal.",
      "Forgetting to mention that the event runs through the late afternoon. Guests who leave at 5 PM miss the dhol circle that happens at 6.",
    ],
    timeline_guidance: "Mail as part of the invitation suite · 2–3 months out.",
    typical_quantity_note: "One per household invited to the Mehendi — usually a smaller circle than the wedding itself.",
    inspiration_notes:
      "Hand-drawn mehendi motifs in sage and saffron, or a clean typographic card with a small painted leaf flourish.",
    starting_price_cents: 14000,
    price_range_label: "Starting from ₹140 per insert",
    upsell_headline: "Set the tone for your first event.",
    upsell_body:
      "A Mehendi insert that reads as an invitation to a garden afternoon, not a logistical update.",
    upsell_cta_label: "Explore Mehendi Insert designs",
  },

  // 6. Sangeet Insert
  {
    item_id: "sui-sangeet-insert",
    slug: "sangeet-insert",
    event_group: "pre_wedding",
    tagline: "Jewel tones, late dinner, a choreographed dance you've been rehearsing since November.",
    editorial_intro:
      "A Sangeet Insert carries the loudest event of your wedding into an envelope. Performances, choreographed numbers, a live dhol, a DJ. Guests need to know this is the night to save some stamina for — and to dress for the light show, not the ceremony.\n\nA good Sangeet card signals energy in its visual language — deeper palette, tighter typography, a hit of foil where the Mehendi card had a painted leaf.",
    why_it_matters:
      "Sangeet dress code is the most frequently misread by guests. Cocktail attire is not Indian cocktail attire. Call time matters — guests who arrive after the opening sequence have lost the shape of the night.",
    pro_tips: [
      "Write the call time in bold. Sangeet events run on a tighter schedule than most guests expect, and choreographed performances start when they start.",
      "Specify 'jewel tones' or 'Indian cocktail' explicitly. Leave ambiguity out of it.",
      "If you have performances planned, mention that the program begins at a specific time so guests arrive before it, not during.",
      "Include a dance floor opening time if it's different from the program start — gives the crowd permission to pace themselves.",
    ],
    common_mistakes: [
      "Using 'cocktail attire' without 'Indian'. Guests will arrive in little black dresses.",
      "Listing the Sangeet as starting at the doors-open time. Name two times: when guests arrive, and when the program begins.",
    ],
    timeline_guidance: "Mail as part of the invitation suite · 2–3 months out.",
    typical_quantity_note: "One per household invited to the Sangeet.",
    inspiration_notes:
      "Deep magenta on ivory with a thin gold rule. Or a modern script on midnight cardstock with a pearlescent foil.",
    starting_price_cents: 14000,
    price_range_label: "Starting from ₹140 per insert",
    upsell_headline: "Make the call time unmissable.",
    upsell_body:
      "A Sangeet insert that reads as choreography on paper — the energy, the tempo, the arrival window, all of it.",
    upsell_cta_label: "Explore Sangeet Insert designs",
  },

  // 7. Reception Insert
  {
    item_id: "sui-reception-insert",
    slug: "reception-insert",
    event_group: "pre_wedding",
    tagline: "A different venue, a different rhythm — the celebration, unhurried.",
    editorial_intro:
      "A Reception Insert carries the final event of the wedding into its own card. Often it's a separate venue, a separate guest list, a separate dress code from the ceremony — and pushing that detail onto the main invitation always reads as an afterthought.\n\nGive it its own piece, its own tone, and its own clear information: address, start time, open bar note if applicable, after-party cue.",
    why_it_matters:
      "Many of your colleagues and distant-circle guests will only attend the reception. This is their primary invitation; treat it as such.",
    pro_tips: [
      "If the reception is a different venue from the ceremony, lead with the venue — guests will skim, and the address needs to be found in one second.",
      "Note the start time relative to the ceremony. 'Immediately following the ceremony' is fine if the venues are near; it's cruel if there's a forty-minute drive in between.",
      "If you have an after-party, mention it on the insert so guests can pace themselves and plan transport.",
      "Include an open-bar note if applicable. Guests travel lighter when they know they don't need a wallet.",
    ],
    common_mistakes: [
      "Assuming guests know the reception is a separate venue. Even close friends will miss the address change if you don't lead with it.",
      "Under-dressing the copy. The reception is the celebration — the insert's voice should match, not read as a logistics memo.",
    ],
    timeline_guidance: "Mail with the invitation suite · 2–3 months out.",
    typical_quantity_note: "One per household. Reception-only guests get just this insert + main invitation.",
    inspiration_notes:
      "Gold foil on deep plum, or a modern type-only card in warm ivory with a vintage dance motif.",
    starting_price_cents: 14000,
    price_range_label: "Starting from ₹140 per insert",
    upsell_headline: "Give the reception the card it deserves.",
    upsell_body:
      "Often your colleagues' only paper touchpoint with your wedding. Design it like the centerpiece it is for them.",
    upsell_cta_label: "Explore Reception Insert designs",
  },

  // 8. Map / Directions Card
  {
    item_id: "sui-map",
    slug: "map-card",
    event_group: "pre_wedding",
    tagline: "A drawn map — because every guest photographs it before they drive.",
    editorial_intro:
      "A Map Card is a small gift to your guests. It turns address-typing into a glance — venue, parking, shuttle pickup, the gate they should actually enter through. For multi-event weddings with multiple venues, it's the piece that keeps drivers calm on the afternoon of.\n\nIt's also the insert that most often gets saved. People keep pretty maps.",
    why_it_matters:
      "Venues with complicated entries — farmhouses, palaces, heritage properties — lose guests to GPS misdirection every wedding. A hand-drawn map with landmarks solves what Google Maps cannot.",
    pro_tips: [
      "Mark the parking gate, not just the venue. For palace venues especially, guests often end up at the wrong entrance.",
      "Illustrate it, don't photograph it. A hand-drawn map reads as intentional; a screenshot reads as a Slack paste.",
      "If you have a shuttle from the hotel block, mark the pickup point and the schedule on the card — not only on the wedding site.",
      "Keep the legend minimal: venue, parking, shuttle, bathrooms. Anything more and the map starts reading like a floor plan.",
    ],
    common_mistakes: [
      "Printing a photograph of a Google Maps screenshot. It looks cheap against the rest of your suite.",
      "Skipping the scale. Guests estimate drive time from the map's visual scale — make sure it's accurate.",
    ],
    timeline_guidance: "Mail inside the suite · 2 months out.",
    typical_quantity_note: "One per household for multi-venue weddings — optional for single-venue events.",
    inspiration_notes:
      "Ink-line illustration on textured paper, with a compass rose and three tasteful landmark icons.",
    starting_price_cents: 11000,
    price_range_label: "Starting from ₹110 per card",
    upsell_headline: "A map worth keeping.",
    upsell_body:
      "We'll illustrate your venue by hand — landmark to landmark, not pixel to pixel.",
    upsell_cta_label: "Explore Map Card designs",
  },

  // 9. Accommodation Card
  {
    item_id: "sui-accommodation",
    slug: "accommodation-card",
    event_group: "pre_wedding",
    tagline: "Hotel block, booking code, deadline in bold.",
    editorial_intro:
      "An Accommodation Card exists to save your guests from rate-shopping at 11 PM the week of your wedding. It carries the hotel block code, the booking deadline, and the rate — three pieces of information, each one a phone call prevented.\n\nFor destination weddings, it can be the difference between a guest booking your block (good for your vendor relationship) and a guest booking an Airbnb (bad for your shuttle plan).",
    why_it_matters:
      "Hotel blocks release rooms back to general inventory at a set deadline. Every guest who misses the deadline pays rack rate, and some of them won't come if it's too expensive.",
    pro_tips: [
      "Put the booking deadline in the largest type on the card. It's the number that matters most.",
      "Include the booking code and a booking URL. Some guests will call; some will click; serve both.",
      "If you have multiple hotels at different price points, list them clearly — guests appreciate the choice.",
      "Note the shuttle pickup hotel(s) if you're running a shuttle. Guests will often choose their hotel based on the shuttle.",
    ],
    common_mistakes: [
      "Assuming guests know what a hotel block is. Write one sentence explaining they get a discounted rate for booking before the deadline.",
      "Listing the hotel without listing the dates. Guests book weird date ranges without this.",
    ],
    timeline_guidance: "Mail with the invitation suite · 2–3 months out.",
    typical_quantity_note: "One per household for destination weddings.",
    inspiration_notes:
      "Clean typographic card — venue name, rate, code, deadline. Gold pinstripe at the top, nothing more.",
    starting_price_cents: 11000,
    price_range_label: "Starting from ₹110 per card",
    upsell_headline: "Protect the hotel block.",
    upsell_body:
      "A clear Accommodation Card that gets your guests to book your rate, on your dates, before the deadline.",
    upsell_cta_label: "Explore Accommodation Card designs",
  },

  // 10. Outer Envelope
  {
    item_id: "sui-envelope-outer",
    slug: "outer-envelope",
    event_group: "pre_wedding",
    tagline: "The first touch — addressed in ink, weighted just so.",
    editorial_intro:
      "The outer envelope is the first thing a guest touches. Before they read a word of your invitation, they've felt the weight of the paper, seen the calligrapher's hand on the address line, registered the wax seal at the flap. The envelope is where the story starts — and if you skip it, the story starts flat.\n\nFor luxury suites, the envelope often gets a colored liner that matches the palette inside. The smallest moment of surprise when they slide the card out.",
    why_it_matters:
      "In an era of digital everything, a hand-addressed envelope arriving in the mail is a tactile event. Guests remember it. They show their roommates. They tell their mothers.",
    pro_tips: [
      "Commission a calligrapher early. The good ones book out three months ahead and will not rush for you.",
      "Include a liner on the inside flap — either patterned, hand-marbled, or in your accent color. It reads as a hidden reward.",
      "Weight the paper. A 120gsm envelope feels ordinary; a 160gsm feels like a document.",
      "Address to both the invited name and the spouse — 'Mr. & Mrs.' or 'Rohan and Kavya' — so there's no ambiguity about who's invited.",
    ],
    common_mistakes: [
      "Printing address labels. Even the prettiest printed label reads as a mass mailing.",
      "Using a return address that doesn't match the suite. The return address is part of the aesthetic, not an afterthought.",
    ],
    timeline_guidance: "Address 2 months out · mail 6–8 weeks before the wedding.",
    typical_quantity_note: "One per household, plus 5% for addressing errors.",
    inspiration_notes:
      "Cream envelope with a sindoor marbled liner, addressed in pointed pen. Or ivory envelope with a gold wax seal at the flap.",
    starting_price_cents: 9500,
    price_range_label: "Starting from ₹95 per envelope (addressing extra)",
    upsell_headline: "Start the suite before the card is open.",
    upsell_body:
      "We pair envelopes with calligraphers and liners. Your suite arrives as a moment, not a piece of mail.",
    upsell_cta_label: "Explore envelope & calligraphy",
  },

  // 11. Belly Band + Wax Seal
  {
    item_id: "sui-enclosure",
    slug: "enclosure",
    event_group: "pre_wedding",
    tagline: "The ribbon, the seal, the small theater of opening a letter.",
    editorial_intro:
      "An enclosure holds the suite together — literally, as a belly band or wax seal that closes the stack of cards, and figuratively, as the moment between opening the envelope and reading the invitation. It is a small piece of stagecraft.\n\nA wax seal with your monogram costs very little and reads as a gesture — guests will keep the seal even if they eventually recycle the envelope.",
    why_it_matters:
      "The enclosure is the first tactile interaction with the suite itself. It sets the physical pacing of the reveal — fingers to seal, seal to card, card to letter.",
    pro_tips: [
      "Commission the wax seal early. A custom monogram stamp takes 2–3 weeks to engrave.",
      "Use sealing wax, not glue-gun wax. Real wax breaks cleanly; glue-gun wax stretches and looks cheap.",
      "A belly band with a hand-tied ribbon reads more luxe than a printed wrap. Hand-tie them in a weekend with a few helpers.",
      "Match the wax color to the palette — deep burgundy, antique gold, ivory — not the default red from the art store.",
    ],
    common_mistakes: [
      "Using a commercial wax seal with a generic crest. Your monogram should be yours; anything else reads as stock.",
      "Skipping the enclosure and letting the cards rattle loose in the envelope. The cards arrive feeling disorganized.",
    ],
    timeline_guidance: "Assemble 2 months out · before addressing envelopes.",
    typical_quantity_note: "One per household. Stamp a few extras for damage.",
    inspiration_notes:
      "Monogrammed wax seal in antique gold over an ivory belly band — a single moment of color on an otherwise warm palette.",
    starting_price_cents: 7500,
    price_range_label: "Starting from ₹75 per enclosure",
    upsell_headline: "Finish the suite with a seal.",
    upsell_body:
      "Custom wax seals with your monogram, hand-stamped on belly bands that match your palette.",
    upsell_cta_label: "Explore enclosures & wax seals",
  },

  // 12. Ceremony Program
  {
    item_id: "sui-program",
    slug: "ceremony-program",
    event_group: "wedding_day",
    tagline: "A quiet guide — rituals named, meanings offered, your families introduced.",
    editorial_intro:
      "A Ceremony Program turns a one-hour ritual that a non-desi guest would otherwise sit through confused into something they can follow, step by step, with their own small moments of recognition. What is the pheras? What's happening under the mandap? Who is that standing to the left of the bride?\n\nFor South Asian ceremonies, this piece is part translation, part family introduction, part keepsake. Half your guests will take it home and put it in a drawer.",
    why_it_matters:
      "For mixed-audience weddings, the program is the difference between your partner's side understanding what they just witnessed and politely clapping at the wrong moments. It's hospitality in paper form.",
    pro_tips: [
      "Write the program in your own voice, not in rote ritual-by-ritual explainer. 'My grandmother walks us around the fire for the first time' reads warmer than 'Saptapadi — seven circles.'",
      "Include family role callouts. Name the pandit, the brother who holds the garland, the aunt who leads the song.",
      "If you have a translation, run it facing — not below. Facing pages let bilingual guests follow both at their own pace.",
      "Budget for one program per guest. Programs are the piece guests take to their seats and read through before and during the ceremony.",
      "Reserve a dozen keepsake copies on heavier stock for immediate family.",
    ],
    common_mistakes: [
      "Defaulting to Wikipedia explanations of each ritual. Your guests don't need a textbook; they need your version of it.",
      "Skipping the family callouts. They are the moment non-desi guests stop feeling like outsiders.",
    ],
    timeline_guidance: "Content finalized 1 month out · print 2 weeks before · distribute day-of.",
    typical_quantity_note: "One per guest (not per household) — plus 5% for damage and keepsakes.",
    inspiration_notes:
      "Booklet bound with a ribbon in the palette color. Or a single folded card on textured cream, with a gold motif at the top.",
    starting_price_cents: 9000,
    price_range_label: "Starting from ₹90 per program",
    upsell_headline: "Make the ceremony legible.",
    upsell_body:
      "We help you write the program in your voice — family roles, ritual meaning, the story your grandmother would tell.",
    upsell_cta_label: "Explore Program designs",
    blog_post_title: "Writing a wedding program that your partner's side will actually read",
    blog_post_excerpt:
      "Ritual-by-ritual explanations are exhausting. Here's how to write a ceremony program that reads like a letter from the bride.",
    blog_post_url: "https://ananya.app/journal/writing-the-program",
  },

  // 13. Menu Cards
  {
    item_id: "sui-menu",
    slug: "menu-card",
    event_group: "wedding_day",
    tagline: "A course on a card — what's coming, who it's for, what it won't include.",
    editorial_intro:
      "A Menu Card at each place setting tells a guest three things before they pick up a fork: what's coming, what the meal's rhythm is, and — critically — which course is vegetarian, vegan, or made without gluten.\n\nFor Indian weddings, where a single menu can span six courses and four regional traditions, the card is also a small tour guide. Mention the dish's origin. Mention the chef's hand. Give guests a reason to eat attentively, not just quickly.",
    why_it_matters:
      "Menu cards cut down on waitstaff explanations and let guests pace themselves across a long dinner. They also double as keepsake — more than one couple has found menu cards from their own wedding taped into a friend's kitchen.",
    pro_tips: [
      "Use dietary icons — a small leaf for vegetarian, a seedling for vegan, a wheat icon for gluten-free. Place them right of each dish for scannability.",
      "Write in the chef's voice, not in restaurant-speak. 'Slow-cooked Awadhi biryani, layered with saffron' beats 'Biryani.'",
      "Print one per place setting, not one per couple. Guests like having the card in front of them.",
      "Match the menu typography to the main invitation. This is the piece that closes the aesthetic loop day-of.",
    ],
    common_mistakes: [
      "Listing dishes without context. Guests at a buffet don't need the menu; guests at a plated dinner need narrative.",
      "Forgetting the dietary icons. Vegetarian guests will ask the waitstaff regardless; give them the card answer first.",
    ],
    timeline_guidance: "Content finalized after the RSVP deadline · print 2 weeks before.",
    typical_quantity_note: "One per place setting — print 5% over guest count for damage.",
    inspiration_notes:
      "Warm ivory with a gold rule at the top, dish names in the invitation font, dietary icons in sage along the right margin.",
    starting_price_cents: 7000,
    price_range_label: "Starting from ₹70 per menu",
    upsell_headline: "Set the table with the suite.",
    upsell_body:
      "We'll coordinate menu copy with your caterer's final dish list and print on stock that matches your main invitation.",
    upsell_cta_label: "Explore Menu Card designs",
  },

  // 14. Place / Escort Cards
  {
    item_id: "sui-place",
    slug: "place-card",
    event_group: "wedding_day",
    tagline: "The small card that says — yes, exactly this seat, exactly for you.",
    editorial_intro:
      "Place cards and escort cards are the pieces that make the seating chart physical. An escort card at the entrance table tells a guest their table number; a place card at the table tells them their exact seat.\n\nFor large Indian weddings — where the seating is often negotiated between the two families over weeks — these cards are the diplomatic outcome made visible. A guest finds their card, sees their name written in ink by a calligrapher, and the chart quietly does its work.",
    why_it_matters:
      "A wedding with assigned seats and no place cards feels like an event that lost its list. The cards close the loop between your planning spreadsheet and your guests' arrival.",
    pro_tips: [
      "Hire a calligrapher for the handwriting, even if you printed the cards. Printed names read as a seating chart; handwritten names read as a welcome.",
      "Alphabetize by last name at the escort table. Guests will scan for 'Sharma' before 'Rohan.'",
      "Include the table number on the escort card, not just the first name. Guests can go straight to the table without asking.",
      "If you have a plus-one couple, do two cards at the table — it reads more considered than one card for the pair.",
    ],
    common_mistakes: [
      "Using the guest's first name only on the escort table. Two Rohans in a 400-person wedding is common.",
      "Writing place cards for a buffet event. Place cards are for assigned seating; escort cards alone work for buffet.",
    ],
    timeline_guidance: "Content finalized 1 week out · calligraphy 3–5 days before.",
    typical_quantity_note: "One per guest for assigned seating. Escort cards only if it's buffet or open seating.",
    inspiration_notes:
      "Tented card in ivory cotton, with a single gold line at the top and the name in pointed-pen calligraphy.",
    starting_price_cents: 5500,
    price_range_label: "Starting from ₹55 per card (+ calligraphy)",
    upsell_headline: "Hand-lettered, seat by seat.",
    upsell_body:
      "We pair your place cards with calligraphers who'll hand-letter the full guest list. Two weeks out, they arrive ready for the table.",
    upsell_cta_label: "Explore Place Card designs",
  },

  // 15. Table Numbers / Names
  {
    item_id: "sui-table-numbers",
    slug: "table-number",
    event_group: "wedding_day",
    tagline: "A small sign at the center of every table — the quiet anchor.",
    editorial_intro:
      "Table numbers are the lightest piece in the suite and one of the most visible. They sit at eye level through the entire meal, and they are the piece photographers lean on for the establishing shot of a table.\n\nSome couples replace numbers with names — cities they've lived in, dishes their grandmothers make, ragas — which turns the table identifiers into a small gesture about who they are. Both work. Both are the suite's smallest ambassador.",
    why_it_matters:
      "For 40 tables of ten, the table numbers are the navigation system. For the photographer, they're the thread that ties the event photographs together.",
    pro_tips: [
      "Make them tall enough to see standing — 12–15cm minimum on the top sign. Guests navigate from twenty feet away.",
      "Double-side print so the table number is visible from both sides of the room.",
      "If you're naming tables instead of numbering, keep the names to one or two words. 'Udaipur' is better than 'The Lake Palace of Udaipur.'",
      "Match the base to the centerpiece vibe — a heavy paper base for florals, a frame for minimalist tables.",
    ],
    common_mistakes: [
      "Printing only one side. Guests on the far side of the table never see the number.",
      "Making the number too small. Table numbers that photograph well are bigger than you think.",
    ],
    timeline_guidance: "Print 2 weeks before · deliver to venue day-of.",
    typical_quantity_note: "One per table — one unit covers both sides if double-sided.",
    inspiration_notes:
      "Double-sided card in a wood or brass stand, with a large numeral in the invitation serif. Or a flat framed print at the centerpiece.",
    starting_price_cents: 22000,
    price_range_label: "Starting from ₹220 per table",
    upsell_headline: "Anchor every table.",
    upsell_body:
      "Table numbers matched to your suite — printed double-sided, mounted on stands that hold up to centerpieces.",
    upsell_cta_label: "Explore Table Number designs",
  },

  // 16. Welcome Bag Insert
  {
    item_id: "sui-welcome-bag",
    slug: "welcome-bag-insert",
    event_group: "wedding_day",
    tagline: "A love letter left on the hotel bed — welcome, here's the plan.",
    editorial_intro:
      "For destination weddings, the Welcome Bag Insert is the first piece of paper your guests see upon arrival. It lives inside the tote waiting on their hotel bed, alongside the mithai and the water bottles and the city map. It's the only piece of the suite most guests will interact with before the wedding itself begins.\n\nTreat it as a note from you. Not an itinerary; a welcome.",
    why_it_matters:
      "Destination guests arrive tired, half-oriented, in a city they don't know. The insert sets the tone for the next seventy-two hours — and tells them the shuttle leaves at 5:30.",
    pro_tips: [
      "Write it in the first person. 'We're so glad you're here' lands warmer than 'Welcome to Jaipur.'",
      "Include the full weekend itinerary on the reverse — what's at what time, what to wear, where to be.",
      "Mention the emergency contact — your planner's name and number, not yours or your parents'.",
      "Keep it one card. Multi-page inserts get left in the tote.",
    ],
    common_mistakes: [
      "Making it purely operational. The insert is part hospitality, part logistics — skew hospitality first.",
      "Forgetting the shuttle schedule. For destination weddings, this is the single most-consulted piece of information all weekend.",
    ],
    timeline_guidance: "Finalize content 1 month out · print 2 weeks out · pack bags 1 week out.",
    typical_quantity_note: "One per room — not per guest. Most rooms are doubles.",
    inspiration_notes:
      "Folded card in warm ivory, printed both sides — love note on one, itinerary on the other, with the planner's phone in bold at the bottom.",
    starting_price_cents: 5500,
    price_range_label: "Starting from ₹55 per insert",
    upsell_headline: "Welcome your people before you see them.",
    upsell_body:
      "A welcome card on their pillow, written as a note from you — and the whole weekend, clearly on the back.",
    upsell_cta_label: "Explore Welcome Insert designs",
  },

  // 17. Seating Chart Display
  {
    item_id: "sui-seating",
    slug: "seating-chart",
    event_group: "wedding_day",
    tagline: "The grand sign at the entrance — everyone's name, one room, one glance.",
    editorial_intro:
      "A Seating Chart Display is the large-format piece at the reception entrance — the sign everyone pauses at, photographs, and takes five minutes finding their own name on. It replaces escort cards for couples who prefer the visual gesture of a single sign over a table of small cards.\n\nA good seating chart reads as design, not as a spreadsheet. Grouped by table, names in calligraphy or a well-set type, the whole piece framed like artwork.",
    why_it_matters:
      "The seating chart is the first thing guests see when they enter the reception. It sets the tone and orients the room in thirty seconds.",
    pro_tips: [
      "Organize alphabetically by last name across the whole chart, with table numbers beside each name. Faster to find a single guest than grouping by table.",
      "Or, organize by table with table names at the top. Pick one pattern and commit.",
      "Mount it on an easel at a height that reads comfortably from five feet away. Charts placed too low or too high read as signage, not as a moment.",
      "Print on foam board or acrylic, not paper. A 400-guest chart on paper sags by hour two.",
    ],
    common_mistakes: [
      "Splitting the chart into two boards at the entrance. Guests crowd around one; the other gets ignored.",
      "Making it too small to read from three feet away. This is the single largest piece you'll print — size it for the room.",
    ],
    timeline_guidance: "Content finalized after RSVP deadline · print 1 week out.",
    typical_quantity_note: "One per reception entrance.",
    inspiration_notes:
      "A single acrylic board with names calligraphed in white ink, mounted on a brass easel. Or a framed paper chart with a hand-lettered header.",
    starting_price_cents: 650000,
    price_range_label: "Starting from ₹6,500 per display",
    upsell_headline: "A single sign — every name, framed as artwork.",
    upsell_body:
      "We'll design your chart, set the type, print on acrylic or board, and deliver ready to display.",
    upsell_cta_label: "Explore Seating Chart designs",
  },

  // 18. Thank You Cards
  {
    item_id: "sui-thank-you",
    slug: "thank-you-card",
    event_group: "post_wedding",
    tagline: "A photograph, a sentence, a stamp — within six weeks.",
    editorial_intro:
      "A Thank You Card is the closing note of the wedding. It arrives four to six weeks after the last event, carries a photograph from the ceremony, and acknowledges the gift or the presence specifically, by name.\n\nFor gift-giving households especially, the Thank You is not optional — it is how your wedding ends gracefully, rather than trailing off into a Google Photos album nobody visits.",
    why_it_matters:
      "A handwritten Thank You is the piece of the suite that lives the longest on a guest's refrigerator. It's also the piece that makes your closest family members feel seen after three months of quiet preparation.",
    pro_tips: [
      "Pair the card with a photograph of the two of you at the wedding. Mini-prints attached with a corner mount read as a scrapbook moment.",
      "Write each one by hand. Printed thank-you notes read as a mailing; handwritten reads as gratitude.",
      "Set up an assembly line — one of you writes the note, the other addresses the envelope and applies the stamp.",
      "Budget for 6 weeks of writing. Do ten a night, not fifty in a weekend.",
      "Mention the gift or their presence specifically. 'Thank you for the vase' lands — 'Thank you for being there' is what you say when you don't remember.",
    ],
    common_mistakes: [
      "Printing a generic 'thank you' card without a handwritten note inside. Guests notice the absence of handwriting immediately.",
      "Waiting more than 8 weeks. After that, a thank-you reads as an apology for a late thank-you, not a thank-you.",
    ],
    timeline_guidance: "Mail within 6 weeks of the wedding.",
    typical_quantity_note: "One per gift-giving household — usually a subset of your full guest list.",
    inspiration_notes:
      "Folded card in warm ivory, photograph tucked into a corner mount on the inside spread, handwritten note on the facing page.",
    starting_price_cents: 11000,
    price_range_label: "Starting from ₹110 per card",
    upsell_headline: "Close the suite with a note.",
    upsell_body:
      "We'll design the card and the matching envelope — you and your partner handle the writing, one night at a time.",
    upsell_cta_label: "Explore Thank You Card designs",
  },

  // 19. At-Home Card
  {
    item_id: "sui-at-home",
    slug: "at-home-card",
    event_group: "post_wedding",
    tagline: "A small announcement — new address, new surname direction, new chapter.",
    editorial_intro:
      "An At-Home Card tells your circle where and how to reach you now that the wedding is over. New shared address, whether one of you is changing surnames, the preferred way to be written to going forward. It's a small card — often enclosed inside the Thank You — and it is the suite's final breath.\n\nFor couples moving to a new city, it doubles as the change-of-address note. For couples keeping both surnames, it resolves the 'how do I address the next invitation to you' question once, in writing.",
    why_it_matters:
      "Small social courtesy — but the kind of courtesy that makes the older generation in your family feel confident writing to you, inviting you, sending you things. A thirty-second reassurance.",
    pro_tips: [
      "Tuck it inside the Thank You card rather than mailing separately. One envelope, two pieces.",
      "Lead with the address — it's the operational detail most guests will use.",
      "If you're both keeping your surnames, write it clearly. 'Rohan Sharma & Kavya Malhotra' beats any assumption.",
      "Include an email if you want. Phone numbers usually don't change; email sometimes does.",
    ],
    common_mistakes: [
      "Mailing it separately from the Thank You. Most couples who do this skip the mailing altogether; combined, it's a single act.",
      "Being vague about surnames. The card exists precisely to resolve the ambiguity — don't leave it open.",
    ],
    timeline_guidance: "Mail alongside the Thank You cards, within 6 weeks.",
    typical_quantity_note: "One per gift-giving household — matched to the Thank You count.",
    inspiration_notes:
      "A small calling-card-style insert on the same stock as the Thank You, with a minimal type treatment.",
    starting_price_cents: 9500,
    price_range_label: "Starting from ₹95 per card",
    upsell_headline: "A clean close to the suite.",
    upsell_body:
      "An At-Home card designed to match your Thank You — one envelope, two pieces of correspondence, one signature.",
    upsell_cta_label: "Explore At-Home Card designs",
  },

  // 20. Favor Tag / Mithai Box Insert
  {
    item_id: "sui-favor-tag",
    slug: "favor-tag",
    event_group: "post_wedding",
    tagline: "A tag tied in twine — a last thank-you before they leave the night.",
    editorial_intro:
      "A Favor Tag is the card tied to the mithai box, the small plant, the silk pouch of dry fruits — whatever favor sends your guests home with something in their hand. It's the suite's shortest sentence, and often its most read.\n\nFor couples who want the tag to linger, the copy goes past 'Thank You' into something smaller and more specific: a line from a poem, a blessing, the name of the caterer who made the mithai.",
    why_it_matters:
      "The favor is often the last physical memento of your wedding a guest takes home. The tag is what makes it memorable rather than generic.",
    pro_tips: [
      "Keep the copy to one or two lines. A tag is not a thank-you card — it's a signature on a gift.",
      "Tie with twine, silk ribbon, or gold thread, matched to the palette.",
      "If the favor is consumable (mithai, ladoo), mention the maker — 'From our grandmother's kitchen' or 'Made by Chandu Halwai, Old Delhi.'",
      "Print the couple's names on the back in a small monogram. It's the tiniest moment of branding, and the one guests save.",
    ],
    common_mistakes: [
      "Overwriting the tag. Long copy on a 2-inch card reads as desperate.",
      "Printing on flimsy card. The tag gets handled, stuffed in a pocket, tied to the bag — use weight.",
    ],
    timeline_guidance: "Print 2 weeks before · tie in the week before.",
    typical_quantity_note: "One per guest, tied to each favor. 5% buffer for damage.",
    inspiration_notes:
      "Small rectangular tag in cream cotton with a rounded corner, tied with gold twine. Or a wax-sealed circle tag on a silk pouch.",
    starting_price_cents: 4000,
    price_range_label: "Starting from ₹40 per tag",
    upsell_headline: "A signature on every gift.",
    upsell_body:
      "We'll design the tag, print on cotton, and coordinate the twine color with your favors.",
    upsell_cta_label: "Explore Favor Tag designs",
  },
];

// ── Inspiration images ────────────────────────────────────────────────────
// Seed 2–3 per item. URLs are palette-tinted placeholders until the planner
// uploads real curation. Captions and tags are real catalogue data.

const COCOA = "3D2B1F";
const IVORY = "F5ECD8";
const GOLD = "C19A5B";
const SINDOOR = "8C2A1C";
const HENNA = "A07C4D";

export const SEED_STATIONERY_SUITE_INSPIRATIONS: StationerySuiteInspiration[] = [
  // Save the Date
  {
    id: "ins-std-1",
    item_id: "sui-save-the-date",
    image_url: PH("Letterpress ivory", IVORY, COCOA),
    caption: "Letterpress on cotton, a single date line in antique gold.",
    credit: "Bond Street Press · 2025",
    style_tags: ["minimalist", "letterpress", "gold-foil"],
    sort_order: 0,
  },
  {
    id: "ins-std-2",
    item_id: "sui-save-the-date",
    image_url: PH("Painted leaf", HENNA, IVORY),
    caption: "Hand-painted leaf motif, type-forward date announcement.",
    credit: "Ananya Studio archives",
    style_tags: ["botanical", "hand-painted", "warm"],
    sort_order: 1,
  },
  {
    id: "ins-std-3",
    item_id: "sui-save-the-date",
    image_url: PH("Modern sans", COCOA, IVORY),
    caption: "Modern type on cocoa stock — city and month, nothing more.",
    credit: "Oak & Press",
    style_tags: ["modern", "sans-serif", "minimalist"],
    sort_order: 2,
  },

  // Main Invitation
  {
    id: "ins-main-1",
    item_id: "sui-main-invitation",
    image_url: PH("Gold foil monogram", IVORY, GOLD),
    caption: "Gold foil monogram over letterpress cotton, 600gsm.",
    credit: "Bond Street Press",
    style_tags: ["traditional", "foil", "monogram"],
    sort_order: 0,
  },
  {
    id: "ins-main-2",
    item_id: "sui-main-invitation",
    image_url: PH("Paisley border", GOLD, COCOA),
    caption: "Paisley border in cocoa ink, Hindi + English facing layout.",
    credit: "Studio Sindh",
    style_tags: ["paisley", "traditional", "bilingual"],
    sort_order: 1,
  },
  {
    id: "ins-main-3",
    item_id: "sui-main-invitation",
    image_url: PH("Silk screen", SINDOOR, IVORY),
    caption: "Silk-screened sindoor on ivory, mughal-era motif at the top.",
    credit: "Ananya Studio commission",
    style_tags: ["mughal", "silk-screen", "sindoor"],
    sort_order: 2,
  },

  // RSVP
  {
    id: "ins-rsvp-1",
    item_id: "sui-rsvp",
    image_url: PH("QR pairing", IVORY, COCOA),
    caption: "Printed card with an embossed QR — paper and digital, one act.",
    credit: "Bond Street Press",
    style_tags: ["minimalist", "modern", "qr"],
    sort_order: 0,
  },
  {
    id: "ins-rsvp-2",
    item_id: "sui-rsvp",
    image_url: PH("Deadline bold", COCOA, IVORY),
    caption: "Deadline set in the largest type on the card — the real headline.",
    credit: "Oak & Press",
    style_tags: ["typographic", "bold"],
    sort_order: 1,
  },

  // Details
  {
    id: "ins-details-1",
    item_id: "sui-details",
    image_url: PH("Two column", IVORY, HENNA),
    caption: "Two-column layout — dress code left, logistics right.",
    credit: "Ananya Studio archives",
    style_tags: ["two-column", "editorial"],
    sort_order: 0,
  },
  {
    id: "ins-details-2",
    item_id: "sui-details",
    image_url: PH("Foldout map", GOLD, COCOA),
    caption: "Foldout card with a hand-drawn map on the inside spread.",
    credit: "Studio Sindh",
    style_tags: ["foldout", "illustrated"],
    sort_order: 1,
  },

  // Mehendi
  {
    id: "ins-mehendi-1",
    item_id: "sui-mehendi-insert",
    image_url: PH("Henna motif", HENNA, IVORY),
    caption: "Hand-drawn mehendi motif, saffron ink, garden-casual palette.",
    credit: "Ananya Studio commission",
    style_tags: ["mehendi-motif", "warm", "hand-drawn"],
    sort_order: 0,
  },
  {
    id: "ins-mehendi-2",
    item_id: "sui-mehendi-insert",
    image_url: PH("Painted leaf", IVORY, HENNA),
    caption: "Minimal leaf illustration, afternoon tone, sage type.",
    credit: "Oak & Press",
    style_tags: ["botanical", "minimal"],
    sort_order: 1,
  },

  // Sangeet
  {
    id: "ins-sangeet-1",
    item_id: "sui-sangeet-insert",
    image_url: PH("Jewel tones", SINDOOR, GOLD),
    caption: "Deep magenta on ivory with a thin gold rule.",
    credit: "Bond Street Press",
    style_tags: ["jewel-tones", "foil", "evening"],
    sort_order: 0,
  },
  {
    id: "ins-sangeet-2",
    item_id: "sui-sangeet-insert",
    image_url: PH("Midnight script", COCOA, GOLD),
    caption: "Modern script on midnight stock with pearlescent foil.",
    credit: "Studio Sindh",
    style_tags: ["script", "foil", "modern"],
    sort_order: 1,
  },

  // Reception
  {
    id: "ins-reception-1",
    item_id: "sui-reception-insert",
    image_url: PH("Gold on plum", SINDOOR, GOLD),
    caption: "Gold foil on deep plum, art-deco rule at the top.",
    credit: "Ananya Studio archives",
    style_tags: ["art-deco", "foil", "plum"],
    sort_order: 0,
  },
  {
    id: "ins-reception-2",
    item_id: "sui-reception-insert",
    image_url: PH("Type only", IVORY, COCOA),
    caption: "Warm ivory, type-only card with a vintage dance motif.",
    credit: "Oak & Press",
    style_tags: ["typographic", "vintage"],
    sort_order: 1,
  },

  // Map
  {
    id: "ins-map-1",
    item_id: "sui-map",
    image_url: PH("Ink illustration", IVORY, COCOA),
    caption: "Ink-line illustration, compass rose, three landmark icons.",
    credit: "Studio Sindh",
    style_tags: ["illustrated", "ink", "compass"],
    sort_order: 0,
  },
  {
    id: "ins-map-2",
    item_id: "sui-map",
    image_url: PH("Watercolor", HENNA, COCOA),
    caption: "Soft watercolor wash over illustrated buildings and roads.",
    credit: "Ananya Studio commission",
    style_tags: ["watercolor", "illustrated", "soft"],
    sort_order: 1,
  },

  // Accommodation
  {
    id: "ins-accom-1",
    item_id: "sui-accommodation",
    image_url: PH("Clean typographic", IVORY, COCOA),
    caption: "Clean typographic card, gold pinstripe, deadline in bold.",
    credit: "Bond Street Press",
    style_tags: ["typographic", "minimalist"],
    sort_order: 0,
  },

  // Outer envelope
  {
    id: "ins-env-1",
    item_id: "sui-envelope-outer",
    image_url: PH("Marbled liner", IVORY, SINDOOR),
    caption: "Cream envelope with a sindoor marbled liner at the flap.",
    credit: "Ananya Studio archives",
    style_tags: ["marbled", "liner", "traditional"],
    sort_order: 0,
  },
  {
    id: "ins-env-2",
    item_id: "sui-envelope-outer",
    image_url: PH("Pointed pen", IVORY, COCOA),
    caption: "Addressed in pointed pen calligraphy, no printed elements.",
    credit: "The Calligrapher's Hand",
    style_tags: ["calligraphy", "handwritten"],
    sort_order: 1,
  },

  // Enclosure
  {
    id: "ins-enc-1",
    item_id: "sui-enclosure",
    image_url: PH("Wax seal", IVORY, GOLD),
    caption: "Monogrammed wax seal in antique gold over an ivory belly band.",
    credit: "Bond Street Press",
    style_tags: ["wax-seal", "monogram", "gold"],
    sort_order: 0,
  },
  {
    id: "ins-enc-2",
    item_id: "sui-enclosure",
    image_url: PH("Silk ribbon", SINDOOR, IVORY),
    caption: "Hand-tied silk ribbon, sindoor red, over a wrapped stack of cards.",
    credit: "Studio Sindh",
    style_tags: ["ribbon", "silk", "hand-tied"],
    sort_order: 1,
  },

  // Program
  {
    id: "ins-program-1",
    item_id: "sui-program",
    image_url: PH("Ribbon booklet", IVORY, GOLD),
    caption: "Booklet bound with a ribbon in the palette color.",
    credit: "Ananya Studio archives",
    style_tags: ["booklet", "ribbon"],
    sort_order: 0,
  },
  {
    id: "ins-program-2",
    item_id: "sui-program",
    image_url: PH("Facing translation", IVORY, COCOA),
    caption: "Facing-page translation — Hindi on the left, English on the right.",
    credit: "Studio Sindh",
    style_tags: ["bilingual", "facing-page"],
    sort_order: 1,
  },

  // Menu
  {
    id: "ins-menu-1",
    item_id: "sui-menu",
    image_url: PH("Gold rule", IVORY, GOLD),
    caption: "Warm ivory with a gold rule, dietary icons in sage.",
    credit: "Bond Street Press",
    style_tags: ["gold-rule", "dietary-icons"],
    sort_order: 0,
  },
  {
    id: "ins-menu-2",
    item_id: "sui-menu",
    image_url: PH("Chef's notes", COCOA, IVORY),
    caption: "Dish names followed by a one-line chef's note per course.",
    credit: "Oak & Press",
    style_tags: ["editorial", "chef-notes"],
    sort_order: 1,
  },

  // Place card
  {
    id: "ins-place-1",
    item_id: "sui-place",
    image_url: PH("Tented calligraphy", IVORY, COCOA),
    caption: "Tented card, ivory cotton, pointed-pen calligraphy.",
    credit: "The Calligrapher's Hand",
    style_tags: ["tented", "calligraphy"],
    sort_order: 0,
  },

  // Table numbers
  {
    id: "ins-table-1",
    item_id: "sui-table-numbers",
    image_url: PH("Brass stand", IVORY, GOLD),
    caption: "Double-sided card in a brass stand, large numeral in the invitation serif.",
    credit: "Studio Sindh",
    style_tags: ["brass", "double-sided"],
    sort_order: 0,
  },

  // Welcome bag insert
  {
    id: "ins-welcome-1",
    item_id: "sui-welcome-bag",
    image_url: PH("Love note", IVORY, COCOA),
    caption: "Folded card — love note on one side, itinerary on the reverse.",
    credit: "Ananya Studio archives",
    style_tags: ["folded", "itinerary"],
    sort_order: 0,
  },

  // Seating chart
  {
    id: "ins-seating-1",
    item_id: "sui-seating",
    image_url: PH("Acrylic chart", COCOA, IVORY),
    caption: "Single acrylic board, names in white ink, brass easel.",
    credit: "Bond Street Press",
    style_tags: ["acrylic", "large-format"],
    sort_order: 0,
  },

  // Thank You
  {
    id: "ins-ty-1",
    item_id: "sui-thank-you",
    image_url: PH("Photo mount", IVORY, HENNA),
    caption: "Folded card with a photograph tucked into a corner mount inside.",
    credit: "Ananya Studio archives",
    style_tags: ["photo", "corner-mount"],
    sort_order: 0,
  },

  // At-Home
  {
    id: "ins-ath-1",
    item_id: "sui-at-home",
    image_url: PH("Calling card", IVORY, COCOA),
    caption: "Calling-card-style insert, minimal type, small and considered.",
    credit: "Oak & Press",
    style_tags: ["calling-card", "minimal"],
    sort_order: 0,
  },

  // Favor Tag
  {
    id: "ins-favor-1",
    item_id: "sui-favor-tag",
    image_url: PH("Gold twine", IVORY, GOLD),
    caption: "Cream cotton tag, rounded corner, tied with gold twine.",
    credit: "Bond Street Press",
    style_tags: ["tag", "twine", "gold"],
    sort_order: 0,
  },
];

// ── Add-on cross-sell relationships ───────────────────────────────────────
// Curated based on how real luxury suites are bundled — what designers pair
// as a matter of course, what couples tend to add after seeing the first
// proof, and what reads as a natural upgrade path.

export const SEED_STATIONERY_SUITE_ADDONS: StationerySuiteAddon[] = [
  // Save the Date → Main Invitation
  {
    id: "add-std-main",
    item_id: "sui-save-the-date",
    addon_item_id: "sui-main-invitation",
    relationship: "pairs_well",
    recommendation_copy:
      "Design the main invitation now so your visual identity carries from the Save the Date forward.",
    sort_order: 0,
  },
  // Main Invitation → the usual insert stack
  {
    id: "add-main-rsvp",
    item_id: "sui-main-invitation",
    addon_item_id: "sui-rsvp",
    relationship: "pairs_well",
    recommendation_copy: "Every main invitation needs a reply card. Design them as a matched pair.",
    sort_order: 0,
  },
  {
    id: "add-main-details",
    item_id: "sui-main-invitation",
    addon_item_id: "sui-details",
    relationship: "pairs_well",
    recommendation_copy:
      "Keep logistics off the main card — a Details insert carries the dress code and venue notes cleanly.",
    sort_order: 1,
  },
  {
    id: "add-main-mehendi",
    item_id: "sui-main-invitation",
    addon_item_id: "sui-mehendi-insert",
    relationship: "often_added",
    recommendation_copy: "Most multi-event weddings add a Mehendi insert with the main invitation.",
    sort_order: 2,
  },
  {
    id: "add-main-sangeet",
    item_id: "sui-main-invitation",
    addon_item_id: "sui-sangeet-insert",
    relationship: "often_added",
    recommendation_copy: "Pair with a Sangeet insert — different tone, same palette.",
    sort_order: 3,
  },
  {
    id: "add-main-reception",
    item_id: "sui-main-invitation",
    addon_item_id: "sui-reception-insert",
    relationship: "often_added",
    recommendation_copy: "A Reception insert gives your colleague-tier guests their own dedicated card.",
    sort_order: 4,
  },
  {
    id: "add-main-envelope",
    item_id: "sui-main-invitation",
    addon_item_id: "sui-envelope-outer",
    relationship: "pairs_well",
    recommendation_copy: "The envelope is the first touch. Commission it at the same time as the card.",
    sort_order: 5,
  },
  {
    id: "add-main-enclosure",
    item_id: "sui-main-invitation",
    addon_item_id: "sui-enclosure",
    relationship: "upgrade",
    recommendation_copy: "A belly band and wax seal turn a stack of cards into a sealed letter.",
    sort_order: 6,
  },

  // RSVP
  {
    id: "add-rsvp-main",
    item_id: "sui-rsvp",
    addon_item_id: "sui-main-invitation",
    relationship: "pairs_well",
    recommendation_copy: "Always mailed together — design in the same round.",
    sort_order: 0,
  },

  // Details → Map + Accommodation
  {
    id: "add-details-map",
    item_id: "sui-details",
    addon_item_id: "sui-map",
    relationship: "pairs_well",
    recommendation_copy: "A map card carries venue logistics off the Details card.",
    sort_order: 0,
  },
  {
    id: "add-details-accom",
    item_id: "sui-details",
    addon_item_id: "sui-accommodation",
    relationship: "often_added",
    recommendation_copy: "For destination weddings, an Accommodation card is essential.",
    sort_order: 1,
  },

  // Inserts cross-pair (mehendi ↔ sangeet ↔ reception)
  {
    id: "add-mehendi-sangeet",
    item_id: "sui-mehendi-insert",
    addon_item_id: "sui-sangeet-insert",
    relationship: "pairs_well",
    recommendation_copy: "Design the Sangeet card in the same round — the inserts share a palette.",
    sort_order: 0,
  },
  {
    id: "add-sangeet-reception",
    item_id: "sui-sangeet-insert",
    addon_item_id: "sui-reception-insert",
    relationship: "pairs_well",
    recommendation_copy: "Your evening events want consistent visual tone.",
    sort_order: 0,
  },
  {
    id: "add-reception-mehendi",
    item_id: "sui-reception-insert",
    addon_item_id: "sui-mehendi-insert",
    relationship: "pairs_well",
    recommendation_copy: "Cover the full event slate — Mehendi through Reception.",
    sort_order: 0,
  },

  // Map → Accommodation
  {
    id: "add-map-accom",
    item_id: "sui-map",
    addon_item_id: "sui-accommodation",
    relationship: "pairs_well",
    recommendation_copy: "The map is the shuttle; the accommodation card is the hotel. They arrive together.",
    sort_order: 0,
  },

  // Accommodation → Map
  {
    id: "add-accom-map",
    item_id: "sui-accommodation",
    addon_item_id: "sui-map",
    relationship: "pairs_well",
    recommendation_copy: "Pair the hotel block with a map card that marks shuttle pickup.",
    sort_order: 0,
  },

  // Envelope → Enclosure
  {
    id: "add-env-enc",
    item_id: "sui-envelope-outer",
    addon_item_id: "sui-enclosure",
    relationship: "pairs_well",
    recommendation_copy: "Envelope and enclosure are bought and designed together.",
    sort_order: 0,
  },

  // Program → Menu + Place cards
  {
    id: "add-program-menu",
    item_id: "sui-program",
    addon_item_id: "sui-menu",
    relationship: "pairs_well",
    recommendation_copy: "Day-of pieces should share typography. Design program and menu in one pass.",
    sort_order: 0,
  },
  {
    id: "add-program-place",
    item_id: "sui-program",
    addon_item_id: "sui-place",
    relationship: "pairs_well",
    recommendation_copy: "Program at the seat, place card on the table — matched suite, one moment.",
    sort_order: 1,
  },

  // Menu → Place + Table numbers
  {
    id: "add-menu-place",
    item_id: "sui-menu",
    addon_item_id: "sui-place",
    relationship: "pairs_well",
    recommendation_copy: "Place cards and menu cards live on the same table. Design together.",
    sort_order: 0,
  },
  {
    id: "add-menu-table",
    item_id: "sui-menu",
    addon_item_id: "sui-table-numbers",
    relationship: "pairs_well",
    recommendation_copy: "Round out the tablescape — table numbers anchor the menu aesthetic.",
    sort_order: 1,
  },

  // Place → Table numbers + Seating chart
  {
    id: "add-place-table",
    item_id: "sui-place",
    addon_item_id: "sui-table-numbers",
    relationship: "pairs_well",
    recommendation_copy: "Place cards direct to table numbers — they should match in type and weight.",
    sort_order: 0,
  },
  {
    id: "add-place-seating",
    item_id: "sui-place",
    addon_item_id: "sui-seating",
    relationship: "upgrade",
    recommendation_copy: "A seating chart at the entrance replaces the escort-card table for a bolder gesture.",
    sort_order: 1,
  },

  // Welcome bag → Map
  {
    id: "add-welcome-map",
    item_id: "sui-welcome-bag",
    addon_item_id: "sui-map",
    relationship: "pairs_well",
    recommendation_copy: "Tuck a map card into the welcome bag — orients guests the moment they arrive.",
    sort_order: 0,
  },

  // Thank You → At-Home + Favor Tag
  {
    id: "add-ty-ath",
    item_id: "sui-thank-you",
    addon_item_id: "sui-at-home",
    relationship: "pairs_well",
    recommendation_copy: "Enclose the At-Home card inside the Thank You — one envelope, two pieces of correspondence.",
    sort_order: 0,
  },
  {
    id: "add-ty-favor",
    item_id: "sui-thank-you",
    addon_item_id: "sui-favor-tag",
    relationship: "pairs_well",
    recommendation_copy: "If you printed favor tags, the Thank You often borrows their illustration at a larger scale.",
    sort_order: 1,
  },

  // At-Home → Thank You
  {
    id: "add-ath-ty",
    item_id: "sui-at-home",
    addon_item_id: "sui-thank-you",
    relationship: "pairs_well",
    recommendation_copy: "At-Home cards are enclosed inside the Thank You — commission them as a pair.",
    sort_order: 0,
  },

  // Favor tag → Menu
  {
    id: "add-favor-menu",
    item_id: "sui-favor-tag",
    addon_item_id: "sui-menu",
    relationship: "pairs_well",
    recommendation_copy: "Favor tag and menu card share the same small-card production run.",
    sort_order: 0,
  },
];

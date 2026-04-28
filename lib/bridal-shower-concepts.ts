// ── Bridal Shower concept library ──────────────────────────────────────────
// The "Phase 2 / Phase 3" content layer: complete, executable shower
// concepts. Each one is a full event blueprint — concept narrative, menu
// (with signature drink recipes), activities, minute-by-minute timeline,
// décor direction, budget breakdown, planning checklist, and invitation
// guidance.
//
// The Concepts tab filters this list against the stored Bride Brief to
// pick 3–5 strong matches. Tapping a concept opens its deep-dive.
//
// Voice is the spec's editorial stylist-meets-practical-friend: specific,
// warm, opinionated, not Pinterest-y.

import type {
  BridePersonality,
  BudgetTier,
  ShowerConcept,
  ShowerFormat,
  VenueType,
} from "@/types/bridal-shower";
import { useBridalShowerStore } from "@/stores/bridal-shower-store";
import { useMemo } from "react";

// ── Concept 1: The Garden Luncheon ────────────────────────────────────────

const GARDEN_LUNCHEON: ShowerConcept = {
  id: "garden_luncheon",
  name: "The Garden Luncheon",
  tagline: "Linen tablecloths, wildflower arrangements, and a long table under the trees.",
  narrative:
    "Picture a long table set under a canopy of string lights in a backyard or garden — linen runners, mismatched vintage plates, wildflower arrangements in bud vases, and handwritten place cards. Guests arrive to a welcome drink station (lavender lemonade and rosé), settle into conversation over a seasonal salad and a beautiful main course plated family-style, and spend the afternoon in that golden-hour glow where everyone's a little flushed from the wine and the toasts are making people cry in the best way. It's the kind of shower that feels like it happened effortlessly — which means someone planned it perfectly.",
  heroPalette: ["#E8DDC7", "#A9B89A", "#D4A853", "#EDE4D3"],
  tags: ["works_at_home", "mixed_generations", "food_forward", "photogenic", "spring_summer"],
  personalities: ["earthy_relaxed", "sentimental", "classic_elegant"],
  formats: ["outdoor", "backyard", "afternoon_tea"],
  venueTypes: ["outdoors", "home"],
  budgetTiers: ["750_1500", "1500_3000", "3000_5000"],
  maxGuests: 35,
  seasons: ["spring", "summer", "fall"],

  menu: {
    welcomeDrink: "Lavender Rosé Spritz",
    welcomeDrinkRecipe:
      "2 oz rosé, 1 oz lavender simple syrup, topped with sparkling water and a lavender sprig. Per 20 guests (assume 2 drinks each): 2 bottles rosé, 2 cups lavender syrup, 2L sparkling water, fresh lavender from the farmers market. Batch the base the morning of; add sparkling only at service.",
    mocktail: "Lavender Lemonade",
    mocktailRecipe:
      "Fresh lemon juice, lavender simple syrup, sparkling water, lavender sprig garnish. For 20 guests: 25 lemons, 2 cups lavender syrup, 4L sparkling water. Equally beautiful in a glass — nobody feels like they're on the kids' table.",
    appetizers: [
      "Whipped ricotta crostini with honey, thyme, and flaky salt",
      "Seasonal fruit board with burrata, prosciutto, and figs",
      "Marinated olives & Marcona almonds (easy + no prep)",
    ],
    mainCourse:
      "Herb-crusted chicken with lemon + a big bowl of orzo salad (or, for vegetarian-forward groups: spring risotto with peas, asparagus, and parmesan)",
    mainStyle: "family_style",
    sides: [
      "Shaved fennel & citrus salad with arugula",
      "Roasted heirloom carrots with tahini and dukkah",
      "Warm focaccia with olive oil + balsamic",
    ],
    dessert:
      "Lemon olive oil cake with whipped crème fraîche + a bowl of strawberries. Skip the tiered cake — a single beautiful dessert on a cake stand says more.",
    drinksGuidance:
      "Rosé and a crisp white (sauv blanc or albariño), plus the signature spritz and the lavender lemonade. Plan on 2 bottles of wine per 3 guests for a 3-hour event. Ice matters — buy twice what you think.",
    dietaryNotes:
      "The risotto main handles vegetarian with no extra effort. Ask about gluten-free and offer a GF crostini alternative (rice crackers) and confirm the orzo side can be swapped for a GF grain. Vegan: the marinated olives, fruit, and a simple green salad cover it without a separate meal.",
  },
  activities: [
    {
      id: "a1",
      title: "Recipe card station",
      description:
        "Pretty cards at each place setting: guests write their favorite recipe (or date-night idea, or one-line piece of marriage advice) for a keepsake box. Low-pressure, sentimental, and everyone participates without needing to perform.",
      kind: "interactive",
      timeMinutes: 20,
      multiGenerationalFriendly: true,
    },
    {
      id: "a2",
      title: "How did you meet the bride?",
      description:
        "Place cards with conversation starters face-down at each seat. Opens up naturally over appetizers — no one announces it, it just gets people talking across generations.",
      kind: "icebreaker",
      timeMinutes: 0,
      multiGenerationalFriendly: true,
    },
    {
      id: "a3",
      title: "Toast round (opt-in)",
      description:
        "Over dessert, the MOH invites anyone who wants to share a toast or memory. Keep it warm, not performative — 2–3 prepared speakers, then open the floor. No microphone, no pressure.",
      kind: "low_key",
      timeMinutes: 25,
      multiGenerationalFriendly: true,
    },
    {
      id: "a4",
      title: "Polaroid guest book",
      description:
        "A polaroid camera on a side table. Guests take a photo, slot it into a linen album with a note for the bride. She opens it later, at home, with wine.",
      kind: "low_key",
      timeMinutes: 0,
      multiGenerationalFriendly: true,
    },
  ],
  timeline: [
    { time: "10:00 AM", title: "Setup complete", body: "Tables set, music on low (Norah Jones–Kacey Musgraves vibe), welcome drinks ready." },
    { time: "11:00 AM", title: "Guests arrive", body: "Welcome drinks poured, appetizers out. Mingling only — don't rush this. Let people settle." },
    { time: "11:45 AM", title: "To the table", body: "Place cards matter here. Mix friend groups; put the outgoing next to the quieter; keep the bride's mom near the bride." },
    { time: "12:00 PM", title: "Family-style lunch", body: "All dishes hit the table at once. Short warm toast from the host before anyone starts eating — don't make the bride cry yet, save that for later." },
    { time: "12:45 PM", title: "Recipe card station", body: "Everyone's fed, relaxed, drink in hand — the sweet spot. 15–20 minutes max. Don't let it drag." },
    { time: "1:15 PM", title: "Dessert + coffee + toasts", body: "This is where the tears happen. MOH first, then the bride's mom, then open the floor. Keep it genuine." },
    { time: "2:00 PM", title: "Natural wrap", body: "No formal ending. Small groups on the patio finishing a bottle of wine — the best showers end this way." },
  ],
  decor: {
    palette: [
      { label: "Cream", hex: "#EDE4D3" },
      { label: "Sage", hex: "#A9B89A" },
      { label: "Warm gold", hex: "#D4A853" },
      { label: "Terracotta", hex: "#C4766E" },
    ],
    florals:
      "Wildflower bundles in bud vases, runner-style down the center of the table. 8–12 small vessels beats one big arrangement. If peonies are out of budget, garden roses or ranunculus in colored glass do the same work at half the price.",
    tableSetting:
      "Linen runner (not full tablecloth — let the wood show), mismatched vintage plates (rented or thrifted), simple clear glassware, gold flatware if you can rent it. Place cards hand-lettered on small cards — Etsy seller or a friend with good handwriting.",
    signage:
      "One hand-lettered welcome sign on a thrifted frame at the entrance + printed menus at each place. That's it — skip the neon sign, skip the photo wall.",
    statementMoment:
      "The tablescape is the statement. Everything else — the welcome vignette, the drink station — is secondary. Spend on flowers and linens here.",
    skipThese:
      "No balloon arch. No photo wall. No favor boxes (nobody remembers). No dessert table — one beautiful cake on a stand is enough. No hashtag sign.",
  },
  budget: {
    saveOn: "Buy-don't-rent plates (thrifted or Facebook Marketplace, resell after). Grocery-store flowers arranged in thrifted glass. Canva menus printed at home.",
    splurgeOn: "A florist for the table runner (even $300 of florals transforms it) and good wine. Food and flowers are what people remember.",
    lines: [
      { label: "Food (catering or DIY)", pct: 35, note: "~$30/pp for 20 guests feels right at this tier" },
      { label: "Drinks (wine, bubbles, spritz)", pct: 15, note: "~2 bottles per 3 guests" },
      { label: "Florals", pct: 18, note: "Runner + bud vases + one welcome vignette" },
      { label: "Rentals (linens, plates, chairs)", pct: 15, note: "Or thrifted if DIY" },
      { label: "Paper goods", pct: 5, note: "Invites, menus, place cards, recipe cards" },
      { label: "Favors & activities", pct: 4, note: "Polaroid film, recipe card materials" },
      { label: "Buffer (ice, last-minute)", pct: 8, note: "You will need this" },
    ],
  },
  checklist: [
    { id: "c1", phase: "6_8_weeks", label: "Finalize guest list with bride or MOB" },
    { id: "c2", phase: "6_8_weeks", label: "Confirm backyard / garden venue + weather backup" },
    { id: "c3", phase: "6_8_weeks", label: "Book caterer (or assign dishes if DIY)" },
    { id: "c4", phase: "6_8_weeks", label: "Send invitations (paper matters here)" },
    { id: "c5", phase: "4_6_weeks", label: "Confirm florist + palette" },
    { id: "c6", phase: "4_6_weeks", label: "Reserve rentals (linens, plates, glassware)" },
    { id: "c7", phase: "4_6_weeks", label: "Source recipe cards + polaroid film" },
    { id: "c8", phase: "4_6_weeks", label: "Design + print menus and place cards" },
    { id: "c9", phase: "2_weeks", label: "Follow up on non-responses — final RSVP count" },
    { id: "c10", phase: "2_weeks", label: "Confirm final head count with caterer" },
    { id: "c11", phase: "2_weeks", label: "Collect dietary restrictions" },
    { id: "c12", phase: "2_weeks", label: "Finalize toasts — who's speaking in what order" },
    { id: "c13", phase: "day_before", label: "Batch the welcome spritz base + lavender syrup" },
    { id: "c14", phase: "day_before", label: "Pick up flowers + arrange in bud vases" },
    { id: "c15", phase: "day_before", label: "Set the table (or pre-stage everything)" },
    { id: "c16", phase: "day_of", label: "Arrive 3 hours early — linens, florals, place cards" },
    { id: "c17", phase: "day_of", label: "Appoint the 'don't let the bride help' person" },
    { id: "c18", phase: "day_of", label: "Start music 30 min before guests arrive" },
  ],
  invitation: {
    sendAt: "6–8 weeks out (8–10 if anyone is traveling)",
    toneExample:
      '"Please join us for a garden luncheon honoring Priya — Saturday, May 16, at noon. Long table, fresh flowers, a slow afternoon. Dress: something you\'d wear to a good lunch."',
    format: "Paper invitations worth the spend here — the tone sets the whole event. Paperless Post 'paper' cards work if the budget\'s tight.",
  },
};

// ── Concept 2: Citrus & Champagne ─────────────────────────────────────────

const CITRUS_CHAMPAGNE: ShowerConcept = {
  id: "citrus_champagne",
  name: "Citrus & Champagne",
  tagline: "Bright, modern brunch with a champagne tower and a lemon-everything menu.",
  narrative:
    "Energetic, photogenic, and a little bit bold. Think fresh lemons stacked in footed compotes, blue-and-white striped napkins, a tower of coupe glasses for the champagne pour, and a brunch menu where lemon is the throughline — lemon ricotta pancakes, lemon chicken piccata, lemon olive oil cake. Upbeat music, mimosas within arm's reach, and a vibe that says 'this is a party, not a program.' Perfect when the bride is the one who actually enjoys being the center of attention.",
  heroPalette: ["#F5E563", "#1B3A6B", "#FDF6E3", "#FFC947"],
  tags: ["photogenic", "crowd_friendly", "spring_summer", "food_forward"],
  personalities: ["life_of_party", "creative_eclectic", "foodie"],
  formats: ["brunch", "party"],
  venueTypes: ["home", "restaurant", "venue_space", "outdoors"],
  budgetTiers: ["750_1500", "1500_3000", "3000_5000", "5000_plus"],
  maxGuests: 60,
  seasons: ["spring", "summer"],

  menu: {
    welcomeDrink: "The Lemon Drop Fizz",
    welcomeDrinkRecipe:
      "1.5 oz vodka, 1 oz elderflower liqueur, 1 oz fresh lemon juice, top with prosecco + thyme sprig. For 25 guests (2 drinks each): 2 bottles vodka, 2 bottles elderflower, 40 lemons, 5 bottles prosecco. Pre-batch the base; add prosecco at service only.",
    mocktail: "Meyer Lemon & Rosemary Soda",
    mocktailRecipe:
      "Fresh meyer lemon juice, rosemary simple syrup, sparkling water, rosemary sprig. For 25 guests: 20 meyer lemons, 2 cups rosemary syrup, 4L sparkling water. Serve in the same coupe as the cocktail so no one feels othered.",
    appetizers: [
      "Lemon ricotta crostini with pistachio + honey",
      "Smoked salmon pinwheels with dill crème fraîche",
      "Prosciutto-wrapped melon with cracked pepper",
    ],
    mainCourse:
      "Lemon ricotta pancakes with blueberry compote + a savory strata (spinach, gruyère, caramelized onion) so nobody has to choose",
    mainStyle: "buffet",
    sides: [
      "Roasted potatoes with lemon + herbs",
      "Fresh fruit salad with mint syrup",
      "Arugula salad with parmesan + lemon vinaigrette",
    ],
    dessert:
      "Lemon olive oil cake + a bowl of lemon curd shortbread cookies. Bonus: a champagne tower reveal right before cake.",
    drinksGuidance:
      "Champagne bar is the move — set up a self-serve station with orange juice, grapefruit juice, and the signature lemon syrup. 3 bottles of prosecco per 4 guests for a 3-hour event. Plenty of still water with lemon on the tables.",
    dietaryNotes:
      "The strata can be made vegetarian (skip any meat additions). GF pancakes if you ask the caterer. Vegan is harder here — plan a dedicated small plate (roasted veg, avocado toast triangles) rather than trying to swap the whole menu.",
  },
  activities: [
    {
      id: "a1",
      title: "Champagne tower reveal",
      description:
        "Build a 4–5 level coupe tower and pour it at peak brunch energy (usually right before dessert). Get the photographer or designated phone-person ready — this is the shot.",
      kind: "experience",
      timeMinutes: 10,
      multiGenerationalFriendly: true,
    },
    {
      id: "a2",
      title: "He said / she said",
      description:
        "Pre-record the partner answering questions about the couple. MOH reads the question, bride guesses, real answer plays. Works if the groom is cooperative — skip if not, it falls flat dry.",
      kind: "classic_game",
      timeMinutes: 15,
      multiGenerationalFriendly: false,
      skipIf: "The groom didn't record anything, or the crowd includes conservative grandparents who wouldn't laugh at the punchlines.",
    },
    {
      id: "a3",
      title: "Advice card station",
      description:
        "Marriage advice or date-night-idea cards at each seat. Low-effort, universally participates, reads beautifully in the photos.",
      kind: "interactive",
      timeMinutes: 15,
      multiGenerationalFriendly: true,
    },
    {
      id: "a4",
      title: "Photo corner (not a wall)",
      description:
        "One styled corner — lemon tree in a pot, blue-and-white backdrop, polaroid camera on a stool. No elaborate arch, no hashtag sign. Just a photo moment that doesn't demand attention.",
      kind: "low_key",
      timeMinutes: 0,
      multiGenerationalFriendly: true,
    },
  ],
  timeline: [
    { time: "10:00 AM", title: "Setup complete", body: "Champagne bar stocked, buffet staged cold, playlist on (Latin jazz → 70s pop as energy builds)." },
    { time: "10:45 AM", title: "Guests arrive", body: "Champagne bar is self-serve. Appetizers out. 20 minutes of mingling — don't start food too early." },
    { time: "11:15 AM", title: "Brunch buffet opens", body: "Host makes a warm, short toast welcoming everyone, then lets people eat." },
    { time: "12:00 PM", title: "He said / she said", body: "Energy's peaked — run the game now. 15 minutes, not 30." },
    { time: "12:20 PM", title: "Advice cards + mingling", body: "Everyone fills out cards at their seats while the table gets cleared for dessert." },
    { time: "12:45 PM", title: "Champagne tower pour + cake", body: "The moment. MOH says a few words as the tower is poured. Photographer ready." },
    { time: "1:15 PM", title: "Toasts (opt-in)", body: "Short and sweet. Bride's mom, MOH, maybe one friend — don't let it drag." },
    { time: "1:45 PM", title: "Wind-down", body: "Coffee refreshed. Music drops tempo. People linger — don't clean up in front of them." },
  ],
  decor: {
    palette: [
      { label: "Lemon yellow", hex: "#F5E563" },
      { label: "Navy stripe", hex: "#1B3A6B" },
      { label: "Cream", hex: "#FDF6E3" },
      { label: "Marigold", hex: "#FFC947" },
    ],
    florals:
      "Lemon branches in tall footed compotes — they're structural, photograph brilliantly, and double as décor and menu theming. White ranunculus or garden roses in clear glass on the table.",
    tableSetting:
      "Blue-and-white striped napkins (cloth, not paper — rent them), clear glass plates on white chargers, clean lines. Coupes for the champagne tower + regular champagne flutes as backup.",
    signage:
      "A hand-lettered menu card at each seat, a small sign pointing to the champagne bar, and that's it. Printed menus worth the spend — they anchor the theme.",
    statementMoment:
      "The champagne tower. Everything else supports it. Position it so it's visible on arrival but the pour happens at peak moment.",
    skipThese:
      "No giant LEMON balloon column. No citrus-print tablecloth (too loud against lemon branches). No ribbon bouquet from gifts. No custom cocktail napkins with initials.",
  },
  budget: {
    saveOn: "Lemons from a restaurant supply (1/3 the price of Whole Foods), self-serve champagne bar instead of hired bartender, Canva menus.",
    splurgeOn: "Real coupe glasses for the tower (rent, don't buy — 50+ for a 5-level tower), good prosecco, and a florist for the lemon branches.",
    lines: [
      { label: "Food (catering or home-cooked)", pct: 30, note: "Brunch is cheaper than dinner by 30%" },
      { label: "Champagne + drinks", pct: 22, note: "The tower + bar — this is the show" },
      { label: "Florals", pct: 15, note: "Lemon branches + table flowers" },
      { label: "Rentals (coupes, napkins, chargers)", pct: 14, note: "Coupes are the non-negotiable" },
      { label: "Paper goods", pct: 6, note: "Menus, invites, advice cards" },
      { label: "Favors / activities", pct: 5, note: "Polaroid film, small favors if any" },
      { label: "Buffer", pct: 8, note: "Ice, last-minute fruit, backup prosecco" },
    ],
  },
  checklist: [
    { id: "c1", phase: "6_8_weeks", label: "Lock guest list + venue" },
    { id: "c2", phase: "6_8_weeks", label: "Record partner's 'he said / she said' answers" },
    { id: "c3", phase: "6_8_weeks", label: "Send invites (digital fine here — Paperless Post)" },
    { id: "c4", phase: "6_8_weeks", label: "Reserve coupe glasses (book early — 50+ is not a standard rental stock)" },
    { id: "c5", phase: "4_6_weeks", label: "Confirm caterer or finalize DIY cooking assignments" },
    { id: "c6", phase: "4_6_weeks", label: "Order lemons in bulk + prosecco" },
    { id: "c7", phase: "4_6_weeks", label: "Design + print menus, advice cards, invites" },
    { id: "c8", phase: "4_6_weeks", label: "Confirm florist (lemon branches need a special order)" },
    { id: "c9", phase: "2_weeks", label: "Final RSVP count — follow up hard" },
    { id: "c10", phase: "2_weeks", label: "Dietary restriction check with all guests" },
    { id: "c11", phase: "2_weeks", label: "Practice building the champagne tower once" },
    { id: "c12", phase: "day_before", label: "Batch lemon drop base; make rosemary syrup" },
    { id: "c13", phase: "day_before", label: "Prep the strata (assemble, bake morning-of)" },
    { id: "c14", phase: "day_before", label: "Arrange lemon branches; set the table" },
    { id: "c15", phase: "day_of", label: "Build the champagne tower 1 hour before guests arrive" },
    { id: "c16", phase: "day_of", label: "Designate tower-pourer + photographer for the moment" },
    { id: "c17", phase: "day_of", label: "Keep water + coffee flowing — brunch bartenders forget this" },
  ],
  invitation: {
    sendAt: "6–8 weeks out",
    toneExample:
      '"Citrus & champagne — come celebrate Priya. Sunday, May 17, 11 AM. Dress the part: yellows, whites, or blue stripes encouraged (not required)."',
    format: "Digital invitations are totally fine here — Paperless Post or a bold email. Save the paper spend for the menus.",
  },
};

// ── Concept 3: The Sunday Supper ──────────────────────────────────────────

const SUNDAY_SUPPER: ShowerConcept = {
  id: "sunday_supper",
  name: "The Sunday Supper",
  tagline: "Candlelit dinner party at a farm table. Family-style Italian. Everyone brings a bottle of wine.",
  narrative:
    "Intimate, warm, and unapologetically slow. This is the dinner you'd throw for someone whose love language is 'everyone around the table.' Taper candles low, bread warm, a pot of something simmering on the stove, wine opened early. Guests arrive hungry, toasts happen naturally over second helpings, and nobody looks at their phone for three hours. Best for smaller, tighter groups where the bride's favorite thing about her friends is the way conversation goes until midnight.",
  heroPalette: ["#6B2B3A", "#D4A853", "#2C1810", "#F5E6D3"],
  tags: ["intimate", "food_forward", "fall_winter", "low_lift"],
  personalities: ["foodie", "sentimental", "earthy_relaxed"],
  formats: ["dinner_party", "backyard"],
  venueTypes: ["home", "restaurant"],
  budgetTiers: ["300_750", "750_1500", "1500_3000"],
  maxGuests: 18,
  seasons: ["fall", "winter", "spring"],

  menu: {
    welcomeDrink: "Negroni Sbagliato (with prosecco)",
    welcomeDrinkRecipe:
      "1 oz Campari, 1 oz sweet vermouth, topped with prosecco + orange twist. For 12 guests (1.5 drinks each, it's a sipper): 1 bottle Campari, 1 bottle sweet vermouth, 2 bottles prosecco. Served in a rocks glass with a big ice cube.",
    mocktail: "Italian Bitter Soda",
    mocktailRecipe:
      "Sanpellegrino Aranciata + a splash of pomegranate + orange twist. Feels adult and intentional. For 12 guests: 6 bottles Aranciata, 1 bottle pomegranate juice.",
    appetizers: [
      "Focaccia from the best local bakery + good olive oil + flaky salt",
      "A cheese + charcuterie board (aged parmesan, taleggio, sopressata, honeycomb)",
      "Marinated olives warmed with rosemary and orange peel",
    ],
    mainCourse:
      "Braised short rib ragù over pappardelle — can simmer all afternoon, serves 12 from one big pot. (Vegetarian alternative: mushroom ragù with the same technique.)",
    mainStyle: "family_style",
    sides: [
      "Big Caesar with shaved parmesan + anchovies on the side for those who want them",
      "Roasted broccolini with lemon + chili flake",
    ],
    dessert:
      "Affogato at the table — vanilla ice cream, a shot of hot espresso poured over, an amaretti cookie on the side. Nothing baked, zero stress, and it's theatre.",
    drinksGuidance:
      "Wine is the point. A good Chianti or Montepulciano, a lighter Italian white (Vermentino or Soave). Plan 1 bottle per 2 guests for dinner. Ask guests to bring a bottle they love — makes them part of the evening.",
    dietaryNotes:
      "The mushroom ragù swap handles vegetarian. GF pasta works fine at the same cook time. Vegan means a dedicated dish — a good olive-oil-braised chickpea stew with the same pappardelle technique is a love letter, not a concession.",
  },
  activities: [
    {
      id: "a1",
      title: "The memory box",
      description:
        "A linen box on the side table. Each guest writes a favorite memory with the bride on a card, folds it in. She reads them at home, with wine, over the next week. This is the kind of thing she'll keep forever.",
      kind: "low_key",
      timeMinutes: 0,
      multiGenerationalFriendly: true,
    },
    {
      id: "a2",
      title: "Around-the-table toasts",
      description:
        "Between the main and dessert, go around the table — each person says one sentence about the bride. Warm, quick, everybody participates. Start with someone confident so it sets the tone.",
      kind: "low_key",
      timeMinutes: 15,
      multiGenerationalFriendly: true,
    },
    {
      id: "a3",
      title: "Wine introduction",
      description:
        "If guests brought bottles, they introduce them before pouring — 'this is the wine we drank on my first anniversary' kind of thing. Makes the wine the conversation instead of the activity.",
      kind: "icebreaker",
      timeMinutes: 10,
      multiGenerationalFriendly: true,
    },
  ],
  timeline: [
    { time: "5:30 PM", title: "Setup complete", body: "Candles lit, ragù simmering, focaccia warming, table set. Music: Italian film soundtracks into slow jazz." },
    { time: "6:00 PM", title: "Guests arrive", body: "Negronis poured as they walk in. Standing apps — focaccia, cheese board. Everyone settles into the living room." },
    { time: "6:45 PM", title: "To the table", body: "Candles already lit, bread already torn, wine already opened. No transition moment — just sit down." },
    { time: "7:00 PM", title: "First course: Caesar", body: "Host makes a short toast, nothing rehearsed. Wine introductions if guests brought bottles." },
    { time: "7:30 PM", title: "Main: ragù at the table", body: "Serve family-style from the pot. Eat slowly. This course should last 45 minutes." },
    { time: "8:30 PM", title: "Around-the-table toasts", body: "Between main and dessert. The bride's mom should go last, right before dessert lands." },
    { time: "8:50 PM", title: "Affogato", body: "Espresso poured at the table, one cup at a time. Showstopper that cost $12 in ice cream." },
    { time: "9:30 PM+", title: "Linger", body: "Pour the last of the wine. Couches. Someone will suggest playing music. Let it go until it ends itself." },
  ],
  decor: {
    palette: [
      { label: "Deep burgundy", hex: "#6B2B3A" },
      { label: "Warm gold", hex: "#D4A853" },
      { label: "Chocolate", hex: "#2C1810" },
      { label: "Cream", hex: "#F5E6D3" },
    ],
    florals:
      "Small, low arrangements in brass or amber glass — olive branches, blush garden roses, a few dahlias if in season. Nothing tall enough to block eye contact across the table.",
    tableSetting:
      "Linen napkins (cream or burgundy), simple white or cream plates, thrifted vintage wine glasses (mismatch is the point), taper candles in brass holders — lots of them. 8–10 candles on a table for 12 beats one pair of pillars every time.",
    signage:
      "A small handwritten menu at each place if you're feeling it. Otherwise nothing — the table speaks for itself.",
    statementMoment:
      "The candlelight. Invest in enough tapers to actually light the room (the table lights should do most of the work).",
    skipThese:
      "No signature drink sign. No printed welcome sign. No photo backdrop. No favors. The point is that none of that exists.",
  },
  budget: {
    saveOn: "Cook it yourself — ragù + pasta for 12 is under $100 in groceries. Thrifted vintage glassware. BYOB for the wine.",
    splurgeOn: "Tapers (buy in bulk from a candle supply — not Target). One good focaccia from the best bakery in town. A case of decent wine.",
    lines: [
      { label: "Food (groceries)", pct: 30, note: "Short rib + pasta + produce for 12" },
      { label: "Drinks", pct: 20, note: "Case of wine, Campari, prosecco, espresso" },
      { label: "Candles", pct: 12, note: "Yes really — you need 20+" },
      { label: "Florals", pct: 12, note: "Small, low, warm tones" },
      { label: "Linens + vessels", pct: 10, note: "Thrift shop + your own collection" },
      { label: "Focaccia + cheese board", pct: 10, note: "Worth buying not making" },
      { label: "Buffer", pct: 6, note: "Extra wine, espresso pods" },
    ],
  },
  checklist: [
    { id: "c1", phase: "6_8_weeks", label: "Lock the guest list (keep it under 16 — the magic ceiling)" },
    { id: "c2", phase: "6_8_weeks", label: "Decide on home vs. private dining room" },
    { id: "c3", phase: "6_8_weeks", label: "Send invitations (can be casual — a group text is fine)" },
    { id: "c4", phase: "4_6_weeks", label: "Source taper candles in bulk" },
    { id: "c5", phase: "4_6_weeks", label: "Thrift for wine glasses / brass holders if needed" },
    { id: "c6", phase: "4_6_weeks", label: "Plan wine pairings + ask guests to bring a bottle" },
    { id: "c7", phase: "4_6_weeks", label: "Prep the memory box" },
    { id: "c8", phase: "2_weeks", label: "Confirm final RSVPs + dietary needs" },
    { id: "c9", phase: "2_weeks", label: "Order focaccia from the bakery" },
    { id: "c10", phase: "2_weeks", label: "Final grocery list — buy what stores well early" },
    { id: "c11", phase: "day_before", label: "Start the ragù (tastes better day-of-rest)" },
    { id: "c12", phase: "day_before", label: "Pick up flowers + focaccia" },
    { id: "c13", phase: "day_before", label: "Set the table" },
    { id: "c14", phase: "day_of", label: "Reheat ragù by 4 PM; boil pasta water at 7:15" },
    { id: "c15", phase: "day_of", label: "Light all candles 15 minutes before guests arrive" },
    { id: "c16", phase: "day_of", label: "Open the wine an hour before dinner" },
  ],
  invitation: {
    sendAt: "4–6 weeks out (it's a small, close group — shorter lead time is fine)",
    toneExample:
      '"Sunday supper for Priya — candles, ragù, and a too-long dinner. Bring a bottle you love. Sunday the 17th, arrive at 6."',
    format: "Casual. Paper invitation would feel over-produced for the vibe. A handwritten note or a warm email is exactly right.",
  },
};

// ── Concept 4: The Workshop ───────────────────────────────────────────────

const WORKSHOP: ShowerConcept = {
  id: "workshop",
  name: "The Workshop",
  tagline: "Hands-on flower arranging or pottery class, followed by wine and small bites.",
  narrative:
    "When the bride would genuinely rather do something than sit through games. Book a private class — flower arranging, pottery, perfume blending, pasta making, paint-and-sip — and let the activity be the entertainment. Follow with wine and small plates at the studio or a nearby restaurant. Guests leave with something they made and a story instead of a favor bag. Perfect for smaller groups of close friends; awkward for multi-generational showers where grandma can't kneel at a wheel.",
  heroPalette: ["#8B4513", "#D4A853", "#F5E6D3", "#6B7B5A"],
  tags: ["experience_focused", "intimate", "low_lift"],
  personalities: ["creative_eclectic", "earthy_relaxed", "foodie"],
  formats: ["experience"],
  venueTypes: ["experience"],
  budgetTiers: ["750_1500", "1500_3000", "3000_5000"],
  maxGuests: 16,
  seasons: ["spring", "summer", "fall", "winter"],

  menu: {
    welcomeDrink: "Post-workshop rosé",
    welcomeDrinkRecipe:
      "A chilled rosé and a dry sparkling (Cava or crémant) served when hands are clean. No signature cocktail — the event is the workshop, not the bar. For 12 guests: 3 bottles rosé, 2 bottles sparkling, 1 bottle non-alc alternative.",
    mocktail: "Herbal spritz",
    mocktailRecipe:
      "Seedlip Garden or Lyre's non-alc aperitif + tonic + cucumber. Feels grown up next to the rosé, not juvenile.",
    appetizers: [
      "A grazing board: cheese, charcuterie, seasonal fruit, nuts, fig jam",
      "Whipped feta dip with warm pita",
      "Olive tapenade + crostini",
    ],
    mainCourse:
      "Nothing formal — small plates that can sit out for 90 minutes: caprese skewers, mini tartines, a salad.",
    mainStyle: "stations",
    sides: [],
    dessert:
      "Mini desserts — lemon bars, chocolate truffles, almond cookies — on a single platter. Handheld, low-commit.",
    drinksGuidance:
      "2 bottles of wine per 3 guests is plenty — people usually drink less when they've just worked on something. Sparkling water with citrus available throughout.",
    dietaryNotes:
      "The grazing model is naturally accommodating — vegetarian, GF, vegan are all easy to slot onto the board as labeled items. Confirm with the workshop venue that food is allowed; some studios are strict.",
  },
  activities: [
    {
      id: "a1",
      title: "The workshop itself",
      description:
        "The activity IS the activity. Flower arranging (2 hours), pottery hand-building (2.5 hours), pasta making (2 hours), perfume blending (1.5 hours). Book a private session — the venue runs it, you don't plan a thing.",
      kind: "experience",
      timeMinutes: 120,
      multiGenerationalFriendly: false,
      skipIf: "The guest list includes anyone with mobility issues (check pottery especially) or strong fragrance sensitivities (perfume).",
    },
    {
      id: "a2",
      title: "Toast over wine",
      description:
        "After the workshop, when everyone's proud of what they made, 1–2 short toasts. Keep it brief — this isn't the sit-down dinner vibe.",
      kind: "low_key",
      timeMinutes: 10,
      multiGenerationalFriendly: true,
    },
    {
      id: "a3",
      title: "Take-home showcase",
      description:
        "Before leaving, each guest shows their creation + says one word about what they'd wish for the bride. Ties the activity to the celebration, feels organic.",
      kind: "low_key",
      timeMinutes: 15,
      multiGenerationalFriendly: true,
    },
  ],
  timeline: [
    { time: "1:45 PM", title: "Arrive at studio", body: "Host arrives 15 minutes early to set out the grazing board + confirm the class with the instructor." },
    { time: "2:00 PM", title: "Guests arrive + aprons on", body: "No welcome drink yet — focus needs to be on the workshop. Waters out." },
    { time: "2:15 PM", title: "Workshop begins", body: "Instructor runs the session. Host stays out of the way." },
    { time: "4:15 PM", title: "Clean hands + wine poured", body: "Rosé out, grazing board opened. People naturally gather around their pieces." },
    { time: "4:45 PM", title: "Toasts + showcase", body: "Each guest briefly shows their piece + shares a wish. MOH wraps with a short toast to the bride." },
    { time: "5:30 PM", title: "Wind down", body: "People start packing their creations. Bride gets to keep her favorite. No forced ending." },
  ],
  decor: {
    palette: [
      { label: "Terracotta", hex: "#8B4513" },
      { label: "Honey", hex: "#D4A853" },
      { label: "Cream", hex: "#F5E6D3" },
      { label: "Sage", hex: "#6B7B5A" },
    ],
    florals:
      "If flower arranging is the activity, the flowers ARE the décor. Otherwise: 2–3 small bud vases with whatever's seasonal. Don't compete with the workshop.",
    tableSetting:
      "The studio sets up its own workspace. For the food: a single long table with a linen runner + the grazing board as the visual focus.",
    signage:
      "None needed. The workshop is legible — no signs required.",
    statementMoment:
      "What each guest made. Let the creations be the photo moments.",
    skipThese:
      "No paper goods. No custom napkins. No favors — they already made one. Absolutely no décor that competes with the workshop aesthetic.",
  },
  budget: {
    saveOn: "Grazing board instead of plated food saves 40% on catering. No florist needed. No paper goods.",
    splurgeOn: "The workshop itself — book a reputable instructor in a beautiful space. This is what the whole event is.",
    lines: [
      { label: "Workshop / instructor fee", pct: 50, note: "Usually $75–$125/pp for private group" },
      { label: "Food (grazing board)", pct: 20, note: "From a good charcuterie + grocery" },
      { label: "Drinks (wine + non-alc)", pct: 15, note: "Rosé-forward + sparkling" },
      { label: "Small plates", pct: 8, note: "Caprese, tartines, salad" },
      { label: "Dessert tray", pct: 4, note: "From a bakery — no DIY needed" },
      { label: "Buffer", pct: 3, note: "Tip for instructor, parking" },
    ],
  },
  checklist: [
    { id: "c1", phase: "6_8_weeks", label: "Research + book the workshop (private group availability fills fast)" },
    { id: "c2", phase: "6_8_weeks", label: "Confirm capacity + accessibility with the venue" },
    { id: "c3", phase: "6_8_weeks", label: "Confirm food + drink allowance at the studio" },
    { id: "c4", phase: "6_8_weeks", label: "Send invitations — include what to wear / expect" },
    { id: "c5", phase: "4_6_weeks", label: "Order grazing board + small plates (local caterer or Costco + arrangement)" },
    { id: "c6", phase: "4_6_weeks", label: "Wine + non-alc run" },
    { id: "c7", phase: "2_weeks", label: "Final headcount to the instructor" },
    { id: "c8", phase: "2_weeks", label: "Collect allergies (especially fragrance for perfume workshops)" },
    { id: "c9", phase: "day_before", label: "Confirm instructor arrival time; check parking" },
    { id: "c10", phase: "day_of", label: "Arrive 30 minutes early to set food" },
    { id: "c11", phase: "day_of", label: "Bring wine glasses (most studios don't stock them)" },
    { id: "c12", phase: "day_of", label: "Tip the instructor in cash" },
  ],
  invitation: {
    sendAt: "6–8 weeks out — workshops require commitment",
    toneExample:
      '"Let\'s make something for Priya. Private flower arranging class + rosé. Saturday May 16, 2 PM. Wear something you don\'t mind getting flower-stem water on."',
    format: "Digital is fine. Tell people what to wear and what to expect — it\'s an activity, not a seated event.",
  },
};

// ── Concept 5: Backyard Elegance ──────────────────────────────────────────

const BACKYARD_ELEGANCE: ShowerConcept = {
  id: "backyard_elegance",
  name: "Backyard Elegance",
  tagline: "Transform someone's patio into something that looks like it belongs in a magazine.",
  narrative:
    "The shower at home that doesn't feel like 'just at someone's house.' Rented chairs, a proper linen-draped table, real glassware, a caterer or one excellent dish from a trusted restaurant, and lighting that makes everyone look soft. The venue is free; the money goes into making it beautiful. Works for any personality, handles mixed generations, scales from 15 to 35 without breaking — and feels personal because someone's actually hosted it.",
  heroPalette: ["#E8D4C0", "#D4A853", "#EDE4D3", "#7A8B6E"],
  tags: ["works_at_home", "mixed_generations", "spring_summer", "crowd_friendly"],
  personalities: ["classic_elegant", "sentimental", "earthy_relaxed"],
  formats: ["backyard", "outdoor", "afternoon_tea"],
  venueTypes: ["home", "outdoors"],
  budgetTiers: ["300_750", "750_1500", "1500_3000"],
  maxGuests: 35,
  seasons: ["spring", "summer", "fall"],

  menu: {
    welcomeDrink: "Garden Paloma",
    welcomeDrinkRecipe:
      "1.5 oz blanco tequila, 0.5 oz lime juice, 2 oz grapefruit juice, splash of soda, grapefruit wheel + rosemary. For 20 guests (2 each): 2 bottles tequila, 20 grapefruits, 10 limes, soda water, fresh rosemary.",
    mocktail: "Grapefruit Rosemary Soda",
    mocktailRecipe:
      "Fresh grapefruit juice, rosemary simple syrup, sparkling water. Served identically to the Paloma so it feels part of the bar, not an afterthought.",
    appetizers: [
      "Ricotta + honey + thyme crostini",
      "Heirloom tomato + peach salad with burrata",
      "Smoky deviled eggs (make-ahead, crowd-pleaser)",
    ],
    mainCourse:
      "Grilled lemon chicken + a beautiful green herb salad + a grain bowl (farro, roasted veg, herbs) that vegetarians can own without feeling sidelined",
    mainStyle: "plated",
    sides: [
      "Corn + cherry tomato salad",
      "Warm crusty bread + good butter",
    ],
    dessert:
      "Strawberry shortcake assembled at the table — biscuits, fresh strawberries macerated with a little sugar, whipped cream. Interactive, seasonal, beautiful.",
    drinksGuidance:
      "A signature Paloma batch at arrival + rosé and sauv blanc with lunch. 2 bottles wine per 3 guests for a 3-hour event. Ice matters — buy twice what you think.",
    dietaryNotes:
      "The grain bowl is the vegetarian main without any extra work. GF: swap shortcake biscuit for a GF version (available at most grocery bakeries). Vegan: a coconut whipped cream for the shortcake + plenty of vegetable sides is a complete meal.",
  },
  activities: [
    {
      id: "a1",
      title: "Place cards + conversation starters",
      description:
        "Mix friend groups on purpose. A small card at each place asks one shared question — 'what's the first memory you have of the bride?' — that gets the table going without feeling forced.",
      kind: "icebreaker",
      timeMinutes: 0,
      multiGenerationalFriendly: true,
    },
    {
      id: "a2",
      title: "Advice & wishes cards",
      description:
        "A linen basket of cards — 'marriage advice' or 'date night idea' or 'a wish for you both.' Guests fill out as many as they want throughout the event. MOH collects at the end.",
      kind: "interactive",
      timeMinutes: 0,
      multiGenerationalFriendly: true,
    },
    {
      id: "a3",
      title: "Opening gifts (optional)",
      description:
        "If the bride wants this: designate one person to write down every gift, another to collect ribbons for a 'rehearsal bouquet.' If she doesn't: display gifts on a table, let her open later.",
      kind: "classic_game",
      timeMinutes: 30,
      multiGenerationalFriendly: true,
      skipIf: "The bride finds it excruciating — and some do. Ask in advance.",
    },
    {
      id: "a4",
      title: "Mother of the bride toast",
      description:
        "Short, warm, genuine. Place her toast near the end of dessert so it lands as the emotional peak, not a mid-event interruption.",
      kind: "low_key",
      timeMinutes: 5,
      multiGenerationalFriendly: true,
    },
  ],
  timeline: [
    { time: "11:00 AM", title: "Setup complete", body: "Tables + chairs in place, linens on, florals arranged, Paloma batch in the fridge, music ready." },
    { time: "12:00 PM", title: "Guests arrive", body: "Palomas poured, appetizers on a side table. 20–25 minutes of standing mingling — let people settle." },
    { time: "12:30 PM", title: "To the table", body: "Place cards matter. Mix generations and friend groups on purpose. MOH gives a warm short welcome before service." },
    { time: "12:45 PM", title: "Lunch served", body: "Plated (not buffet — keeps the multi-gen crowd seated). Wine poured, conversation going." },
    { time: "1:30 PM", title: "Gift opening or gift table reveal", body: "If opening: keep it moving. If not: reveal the gift table for photos afterward. Don't push past 20–25 minutes." },
    { time: "2:00 PM", title: "Strawberry shortcake at the table", body: "Assembled in front of guests — small theatre, huge flavor. Coffee and tea out." },
    { time: "2:15 PM", title: "Mother of the bride toast + MOH toast", body: "The emotional peak. Keep it genuine. Hand tissues." },
    { time: "2:45 PM", title: "Wind-down + gift table moment", body: "Guests see the gift display, take photos with the bride, linger on the patio." },
    { time: "3:30 PM", title: "Natural wrap", body: "No formal ending. People will cluster and chat — let it." },
  ],
  decor: {
    palette: [
      { label: "Peach", hex: "#E8D4C0" },
      { label: "Warm gold", hex: "#D4A853" },
      { label: "Cream", hex: "#EDE4D3" },
      { label: "Sage", hex: "#7A8B6E" },
    ],
    florals:
      "One medium floral arrangement as a table centerpiece + 2–3 accent arrangements (welcome table, dessert table, maybe bar). Peonies + garden roses + eucalyptus if budget allows; ranunculus + stock + sage leaves if saving.",
    tableSetting:
      "Linen tablecloth (full coverage for the elegance), linen or cotton napkins, real glassware (rent), plates you own or rent, and cloth napkins tied with a sprig of herb and a place card tucked in.",
    signage:
      "Hand-lettered welcome sign at the entrance + menus at each place. Skip the fake neon, skip the hashtag. One photo-ready vignette at the entrance doubles as décor and orientation.",
    statementMoment:
      "The tablescape. This is where the money and attention goes. Everything else can be simple.",
    skipThese:
      "No balloon arch. No dessert table with 8 desserts. No photo wall with fake vines. No monogram napkins. No favor bags that'll be forgotten on the chair.",
  },
  budget: {
    saveOn: "Use someone's backyard (or a relative's). Thrifted or owned plates. Grocery-store flowers if DIY'd well. Canva-designed paper.",
    splurgeOn: "A florist for the centerpiece, rented chairs (plastic folding kills the vibe), and either the food OR the drinks — pick one to be exceptional.",
    lines: [
      { label: "Food (catering or restaurant drop-off)", pct: 32, note: "~$30–$40/pp plated" },
      { label: "Drinks", pct: 15, note: "Palomas + rosé + sauv blanc + non-alc" },
      { label: "Florals", pct: 18, note: "1 statement + 2–3 accents" },
      { label: "Rentals (chairs, linens, glassware)", pct: 18, note: "Chairs are the non-negotiable" },
      { label: "Paper goods", pct: 5, note: "Invites, menus, place cards, advice cards" },
      { label: "Welcome vignette + signage", pct: 5, note: "Rented frame, florals, sign" },
      { label: "Buffer", pct: 7, note: "Ice, last-minute groceries, emergencies" },
    ],
  },
  checklist: [
    { id: "c1", phase: "6_8_weeks", label: "Confirm the backyard host + weather backup plan" },
    { id: "c2", phase: "6_8_weeks", label: "Lock guest list with bride or MOB" },
    { id: "c3", phase: "6_8_weeks", label: "Book caterer OR plan restaurant drop-off (or DIY cooking)" },
    { id: "c4", phase: "6_8_weeks", label: "Send invitations (paper for this vibe)" },
    { id: "c5", phase: "6_8_weeks", label: "Ask bride: gift opening yes or no?" },
    { id: "c6", phase: "4_6_weeks", label: "Book florist" },
    { id: "c7", phase: "4_6_weeks", label: "Reserve chair + linen rentals" },
    { id: "c8", phase: "4_6_weeks", label: "Design + print paper suite (invites, menus, place cards, advice cards)" },
    { id: "c9", phase: "2_weeks", label: "Final RSVP count — follow up on outstanding" },
    { id: "c10", phase: "2_weeks", label: "Confirm caterer head count + dietary needs" },
    { id: "c11", phase: "2_weeks", label: "Write + assign toasts (MOH, mother of bride, optional)" },
    { id: "c12", phase: "2_weeks", label: "Plan + share day-of roles (setup, greeter, gift-tracker, drink refills)" },
    { id: "c13", phase: "day_before", label: "Batch Paloma base + rosemary syrup" },
    { id: "c14", phase: "day_before", label: "Pick up florals + linens + any rentals" },
    { id: "c15", phase: "day_before", label: "Pre-stage the table setup if weather allows" },
    { id: "c16", phase: "day_of", label: "Arrive 4 hours early — rentals delivered, table set, florals placed" },
    { id: "c17", phase: "day_of", label: "Assign the 'don't let the bride help' friend" },
    { id: "c18", phase: "day_of", label: "Start music + Paloma batch in fridge 60 min before guests" },
  ],
  invitation: {
    sendAt: "6–8 weeks out (8–10 if guests are traveling in)",
    toneExample:
      '"Please join us for a garden luncheon in honor of Priya. Saturday, May 16, at noon. Nathan & Kavita\'s garden, 1204 Oak Lane. Dress: garden-party soft — florals, pastels, or whatever makes you feel good."',
    format: "Paper invitations match the event tone. Minted, Paperless Post \'paper,\' or a simple letterpress card from Etsy.",
  },
};

// ── Registry ──────────────────────────────────────────────────────────────

export const BRIDAL_SHOWER_CONCEPTS: ShowerConcept[] = [
  GARDEN_LUNCHEON,
  CITRUS_CHAMPAGNE,
  SUNDAY_SUPPER,
  WORKSHOP,
  BACKYARD_ELEGANCE,
];

export function getConceptById(id: string): ShowerConcept | undefined {
  return BRIDAL_SHOWER_CONCEPTS.find((c) => c.id === id);
}

// ── Matching ──────────────────────────────────────────────────────────────
// Score each concept against the stored Bride Brief. Higher is better.
// Returns the full list sorted by score so the Concepts tab can render
// top matches + "also consider" fallbacks.

export interface ConceptMatch {
  concept: ShowerConcept;
  score: number; // 0–100
  matchReasons: string[]; // Short editorial tags: "Perfect for mixed gen", "Fits your budget"
}

export function rankConcepts(brief: {
  bridePersonality: BridePersonality[];
  format: ShowerFormat | null;
  venueType: VenueType | null;
  budgetTier: BudgetTier | null;
  guestCount: string | null;
  guestComposition: string[];
}): ConceptMatch[] {
  return BRIDAL_SHOWER_CONCEPTS.map((concept) => {
    let score = 0;
    const reasons: string[] = [];

    // Personality — biggest signal (0–40)
    const personalityHits = brief.bridePersonality.filter((p) =>
      concept.personalities.includes(p),
    ).length;
    if (brief.bridePersonality.length > 0) {
      const rawPct = personalityHits / brief.bridePersonality.length;
      score += rawPct * 40;
      if (rawPct >= 0.5) reasons.push("Matches her personality");
    } else {
      score += 20;
    }

    // Format (0–20)
    if (brief.format && concept.formats.includes(brief.format)) {
      score += 20;
      reasons.push("Fits the format");
    } else if (!brief.format) {
      score += 10;
    }

    // Venue (0–15)
    if (brief.venueType && concept.venueTypes.includes(brief.venueType)) {
      score += 15;
      reasons.push("Works at your venue");
    } else if (!brief.venueType) {
      score += 8;
    }

    // Budget (0–15)
    if (brief.budgetTier && concept.budgetTiers.includes(brief.budgetTier as BudgetTier)) {
      score += 15;
      reasons.push("Fits your budget");
    } else if (!brief.budgetTier) {
      score += 8;
    }

    // Guest count cap (0–10)
    const countMidpoint: Record<string, number> = {
      under_10: 8,
      "10_20": 15,
      "20_35": 27,
      "35_50": 42,
      "50_plus": 60,
    };
    const midpoint = brief.guestCount ? countMidpoint[brief.guestCount] : null;
    if (midpoint !== null && midpoint <= concept.maxGuests) {
      score += 10;
      if (midpoint <= concept.maxGuests * 0.7) {
        reasons.push("Right for your crowd size");
      }
    } else if (midpoint !== null && midpoint > concept.maxGuests) {
      score -= 15;
      reasons.push("Too many guests");
    }

    // Multi-generational bonus for concepts that handle it well
    const multiGen = brief.guestComposition.includes("multi_generational");
    const handlesMultiGen =
      concept.tags.includes("mixed_generations") ||
      concept.activities.every((a) => a.multiGenerationalFriendly);
    if (multiGen && handlesMultiGen) {
      score += 5;
      reasons.push("Perfect for mixed generations");
    } else if (multiGen && !handlesMultiGen) {
      score -= 8;
    }

    return {
      concept,
      score: Math.max(0, Math.min(100, Math.round(score))),
      matchReasons: reasons.slice(0, 3),
    };
  }).sort((a, b) => b.score - a.score);
}

// ── React hook for the Concepts tab ───────────────────────────────────────

export function useRankedConcepts(): ConceptMatch[] {
  const brief = useBridalShowerStore((s) => s.brief);
  return useMemo(
    () =>
      rankConcepts({
        bridePersonality: brief.bridePersonality,
        format: brief.format,
        venueType: brief.venueType,
        budgetTier: brief.budgetTier,
        guestCount: brief.guestCount,
        guestComposition: brief.guestComposition,
      }),
    [
      brief.bridePersonality,
      brief.format,
      brief.venueType,
      brief.budgetTier,
      brief.guestCount,
      brief.guestComposition,
    ],
  );
}

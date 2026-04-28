// ── Austin deep-dive ──────────────────────────────────────────────────────
// Editorial guide for the party/unexpected Austin bachelorette — live music,
// lake days, taco crawls, and honest warnings about the heat and SXSW.

import type { DestinationDetail } from "@/types/bachelorette";

export const austinDetail: DestinationDetail = {
  destinationId: "austin",
  tagline: "Honky-tonks, breakfast tacos, and lake days",
  heroQuote:
    "Austin's the rare bachelorette city that's genuinely fun without trying — just don't come in August.",
  bestMonthsTimeline: {
    january: "shoulder",
    february: "shoulder",
    march: "avoid",
    april: "peak",
    may: "shoulder",
    june: "shoulder",
    july: "avoid",
    august: "avoid",
    september: "shoulder",
    october: "peak",
    november: "peak",
    december: "shoulder",
  },
  whatToPack:
    "Boots (real ones — you'll walk a lot). Swimsuit for the lake or pool. A layer for cold-AC restaurants. March: sunscreen, a long-sleeve for cool nights. October: same.",

  itinerary: [
    {
      label: "Day 1 — Tacos and a South Congress Walk",
      headline: "Eat breakfast tacos even if you arrive at 3 PM. Walk SoCo. Find live music.",
      narrative:
        "Don't over-plan your Austin arrival. The city rewards wandering. Stay East Austin or South Congress — both are walkable and have the character that downtown high-rises lack.",
      beats: [
        {
          time: "Afternoon",
          title: "Breakfast tacos (yes, at 3 PM)",
          body: "Veracruz All Natural (East 7th or Mueller) or Joe's Bakery on E 7th. The migas taco is the move. Get the group a dozen to split and debate.",
        },
        {
          time: "Early evening",
          title: "South Congress walk — shops, then a drink",
          body: "Walk from Barton Springs up South Congress. Browse Allens Boots (buy nothing or buy one thing), stop for a photo at the 'I love you so much' mural, grab margaritas at Perla's patio.",
        },
        {
          time: "8:30 PM",
          title: "Dinner at Comedor or Launderette",
          body: "Comedor is the currently-hot Mexican fine dining — book early. Launderette is the reliable-and-still-cool East Austin pick, vibes high, food consistent. Either way, reserve.",
          reservationNote: "Book 3+ weeks out",
        },
        {
          time: "10:30 PM",
          title: "Rainey Street bar crawl",
          body: "Start at Icenhauer's for the patio, move to Bungalow if anyone wants dancing, end at The Driskill's bar if the group wants to slow down. Rainey is walkable end-to-end.",
        },
      ],
    },
    {
      label: "Day 2 — Lake Day or Park Day",
      headline: "Morning tacos again, lake boat or Barton Springs, nice dinner, live music.",
      narrative:
        "The Austin Big Day. Lake Travis in warm months, Barton Springs year-round. Choose ONE water activity — don't try to do both. Book a boat early; the peak-season Saturdays go 8+ weeks out.",
      beats: [
        {
          time: "9:00 AM",
          title: "Brunch at Sour Duck or Ellos",
          body: "Sour Duck (East Austin) is counter-service, cheap, excellent pastries and a patio for groups of 8+. Ellos is more of a sit-down brunch scene in East Austin.",
          reservationNote: "Walk-in — arrive by 9:30",
        },
        {
          time: "11:30 AM",
          title: "Lake Travis party boat (May–October)",
          body: "Book a 4–6 hour pontoon with captain — Action Water Sportz or Austin Boats. Budget $150–$250/pp all-in. BYO food and drinks. The group that doesn't pre-buy groceries regrets it.",
          reservationNote: "6–8 weeks out for Saturdays in June–Aug",
        },
        {
          time: "11:30 AM",
          title: "Alternative: Barton Springs + Zilker Park",
          body: "If boating feels like too much, Barton Springs is a natural spring-fed pool that's 68°F year-round ($8 entry). Bring a picnic, stay 3 hours, then walk across Zilker Park.",
        },
        {
          time: "7:00 PM",
          title: "Dinner at Suerte or Odd Duck",
          body: "Suerte is the Mexican-Oaxacan place locals genuinely love and is still hard to get into. Odd Duck is the farm-to-table standby — the menu changes weekly, never fails. Both handle 8–10 well.",
          reservationNote: "Book 4+ weeks out",
        },
        {
          time: "10:00 PM",
          title: "Live music — pick your venue",
          body: "Continental Club for blues and country. White Horse (East Austin) for honky-tonk dancing with locals, not a Broadway-style tourist scene. The Elephant Room for jazz. Covers run $10–$30; show up 30 mins before the headline act.",
        },
      ],
    },
    {
      label: "Day 3 — Slow and Out",
      headline: "One good brunch, maybe a mural walk, airport.",
      narrative:
        "Austin's Day 3 works because it's low-lift. Slow brunch, one photo moment, out. Don't schedule an activity after 11 AM — you'll regret it.",
      beats: [
        {
          time: "9:30 AM",
          title: "Brunch at Josephine House",
          body: "The prettiest patio in Clarksville. Group-sized, shaded, and the tomato toast is the signature order. It's not trying, which is why it works.",
          reservationNote: "Book 1 week out",
        },
        {
          time: "11:30 AM",
          title: "Mural walk — East Austin or South Austin",
          body: "Short walking loop past the best murals — HOPE Outdoor Gallery (if relocated it'll be at Carson Creek), the bat mural, 'Hi How Are You.' 45 mins total, good group photos.",
        },
        {
          time: "1:30 PM",
          title: "Check out, airport",
          body: "AUS is 20–30 mins from East Austin depending on traffic. Leave buffer; the airport backs up on Sundays.",
        },
      ],
    },
  ],

  restaurants: [
    {
      category: "must_book",
      name: "Suerte",
      neighborhood: "East Austin",
      priceRange: "$$$",
      vibe: "Oaxacan-leaning Mexican with a corn-to-dough process that's actually a production",
      whyBach: "The rare restaurant that's both locally loved and genuinely scene-y. Tables of 6–8 get real attention; larger groups work on weeknights.",
      reservation: "Book 4+ weeks out",
      groupSize: "Up to 10 on weeknights",
      insiderTip: "Ask for the suadero tostadas — they're technically an appetizer and the best bite on the menu.",
    },
    {
      category: "brunch",
      name: "Sour Duck Market",
      neighborhood: "East Austin",
      priceRange: "$$",
      vibe: "Counter-service bakery-brunch in an open-air patio",
      whyBach: "Casual but great; pastries are serious. Table of 8–10 fits without anyone stressing about reservations.",
      reservation: "Walk-in — arrive by 9:30 AM",
      insiderTip: "The breakfast sandwich gets the love, but the hot honey biscuit sandwich is the move.",
    },
    {
      category: "late_night",
      name: "White Horse",
      neighborhood: "East Austin",
      priceRange: "$",
      vibe: "Dive honky-tonk with live country 7 nights, real dancing",
      whyBach: "This is where locals actually go. Two-step dance lessons early in the evening; wild by midnight. Food truck out back opens late.",
      reservation: "No reservations — cover varies",
      insiderTip: "Cash-only for cover. Bring small bills.",
    },
    {
      category: "instagram",
      name: "Perla's",
      neighborhood: "South Congress",
      priceRange: "$$$",
      vibe: "The pastel-awning patio everyone has on their feed",
      whyBach: "Oysters + rosé under the awning. Book the patio specifically or it's just a normal restaurant.",
      reservation: "Book 2–3 weeks out; request patio in notes",
      groupSize: "Up to 12 on the patio",
      insiderTip: "Go around 4:30 for happy hour pricing on oysters.",
    },
    {
      category: "local_secret",
      name: "Veracruz All Natural",
      neighborhood: "Multiple (East 7th, Mueller)",
      priceRange: "$",
      vibe: "Taco-trailer-turned-local-institution, arguably the best breakfast taco in the city",
      whyBach: "Not a bachelorette spot, which is the point. You go here, take a photo, and leave with more credibility than anyone who only ate at Sour Duck.",
      reservation: "Walk-in, counter service",
      insiderTip: "The migas taco. Order two.",
    },
    {
      category: "group_friendly",
      name: "Launderette",
      neighborhood: "East Austin",
      priceRange: "$$$",
      vibe: "Former laundromat, now a reliably great East Austin dinner",
      whyBach: "Handles parties of 10–12 without anyone feeling squeezed. Menu is broadly approachable — good for mixed-preference groups.",
      reservation: "Book 3+ weeks out",
      groupSize: "Up to 14",
    },
  ],

  activities: [
    {
      category: "classic_bach",
      title: "Lake Travis party boat",
      body: "The signature Austin bach activity. 4–6 hour charter with a captain. Pontoon or larger party boat depending on group size. BYO food, drinks, and a Bluetooth speaker that actually works.",
      costPerPerson: "$150–$250",
      groupSize: "8–20",
      bookAhead: "6–8 weeks for peak weekends",
      timeOfDay: "11 AM–5 PM",
      weatherSensitive: true,
    },
    {
      category: "chill",
      title: "Barton Springs Pool",
      body: "68°F spring-fed pool in the middle of the city. Bring a picnic, stay 3 hours, swim laps if anyone's bored. Free-ish. Zilker Park surrounds it.",
      costPerPerson: "$8",
      groupSize: "Any",
      timeOfDay: "Morning or late afternoon (avoid peak sun)",
      weatherSensitive: true,
    },
    {
      category: "food_drink",
      title: "Taco crawl (self-guided)",
      body: "Hit 3 taco spots across East Austin: Veracruz All Natural, Nixta Taqueria, Suerte (ask for the tasting flight at the bar). Walk or Uber between. Two hours, max.",
      costPerPerson: "$40–$60",
      groupSize: "Any",
      timeOfDay: "Late morning or afternoon",
    },
    {
      category: "nightlife",
      title: "Rainey Street bar crawl",
      body: "Formerly residential bungalows turned into bars. Walkable end-to-end. Icenhauer's → Banger's → Bungalow → Container Bar. Don't over-structure it; Rainey is about wandering.",
      costPerPerson: "$50–$90 (drinks)",
      groupSize: "Any",
      timeOfDay: "9 PM–1 AM",
    },
    {
      category: "classic_bach",
      title: "Broken Spoke two-step lesson",
      body: "Iconic old-school Texas dance hall. Wednesday–Saturday, they teach a group two-step lesson at 8 PM before the band plays. Actually fun. Actually a real Texas experience.",
      costPerPerson: "$20–$30",
      groupSize: "Any",
      bookAhead: "Walk-in on weeknights; reserve a table on Fri/Sat",
      timeOfDay: "Evening",
    },
    {
      category: "culture",
      title: "South Congress + mural walk",
      body: "Self-guided. Start at Jo's Coffee for a margarita and the 'I love you so much' mural photo, walk up South Congress past Allens Boots, Uncommon Objects, Tecovas. 90 minutes.",
      costPerPerson: "Free",
      groupSize: "Any",
      timeOfDay: "Late afternoon",
    },
    {
      category: "unique",
      title: "Bat-watching at the Congress Ave bridge",
      body: "Sunset, March–November: 1.5 million bats emerge from under the Congress Ave bridge. Sounds silly, is genuinely incredible. Arrive 30 mins before sunset. Free from the lawn; paid boat tours are nicer but optional.",
      costPerPerson: "Free (or $20 for a boat)",
      groupSize: "Any",
      bookAhead: "None for lawn viewing",
      timeOfDay: "Sunset",
      weatherSensitive: true,
    },
  ],

  stays: [
    {
      type: "airbnb",
      title: "East Austin bungalow (6–10 BR)",
      neighborhood: "East Austin",
      body: "The Austin bachelorette default. Walkable to a lot of the food and bars; character homes with yards. Look for ones with a hot tub — it changes the whole trip.",
      priceNote: "$600–$1,200/night — about $200–$400/pp for 3 nights split by 8",
    },
    {
      type: "boutique",
      title: "Hotel Saint Cecilia",
      neighborhood: "South Congress",
      body: "Iconic boutique hotel — rock-and-roll vibe, private pool, bungalow-style rooms. Expensive but unforgettable. Better for a small crew (4–6) with budget.",
      priceNote: "$550–$900/night/room",
    },
    {
      type: "boutique",
      title: "South Congress Hotel",
      neighborhood: "South Congress",
      body: "Walkable to everything on SoCo, rooftop pool, solid restaurants on the property. Best balance of price, design, and location for 4–8 people.",
      priceNote: "$400–$650/night/room",
    },
    {
      type: "budget",
      title: "Native Hostel + social bar",
      neighborhood: "East Downtown",
      body: "If the group is under 30 and wants social energy, Native is a design-y hostel with a real bar. Private rooms available. Truly affordable.",
      priceNote: "$120–$250/night/room",
    },
  ],

  practical: {
    gettingThere:
      "AUS airport is 20 mins from East Austin, 25 from South Congress. Most major carriers. Drive-to from DFW (3.5 hrs), Houston (2.5 hrs), San Antonio (1.5 hrs).",
    gettingAround:
      "Uber/Lyft are reliable. Rainey Street and South Congress are walkable internally, but the neighborhoods aren't walkable to each other. A scooter rental is viable for short hops; a rental car is useful if you're lake-daying.",
    localTips: [
      "Avoid mid-March — SXSW turns the city into a chaotic tech-bro conference.",
      "ACL Festival weekends (early October) also book up; either embrace it or go the week before.",
      "Outdoor anything in July/August is a real risk — 100°F is routine.",
      "Austin closes earlier than you'd think (last call is 2 AM, many kitchens close at 10 PM).",
      "Don't rent a car for downtown — parking is hostile.",
    ],
    bookingTimeline:
      "10–12 weeks out for peak weekends (April, October, any football home game). Lake boats are the first thing to book — they sell out fastest. Suerte, Comedor, and Odd Duck are the next.",
  },
};

// ── Scottsdale deep-dive ──────────────────────────────────────────────────
// Editorial guide for the pamper/bougie desert bachelorette — resort pools,
// Old Town nightlife, and a realistic take on how brutal summer heat is.

import type { DestinationDetail } from "@/types/bachelorette";

export const scottsdaleDetail: DestinationDetail = {
  destinationId: "scottsdale",
  tagline: "Desert spa days, pool cabanas, tequila at sunset",
  heroQuote:
    "If Nashville is the group chat at 2 AM, Scottsdale is the group chat at the pool at 2 PM.",
  bestMonthsTimeline: {
    january: "peak",
    february: "peak",
    march: "peak",
    april: "peak",
    may: "shoulder",
    june: "avoid",
    july: "avoid",
    august: "avoid",
    september: "shoulder",
    october: "peak",
    november: "peak",
    december: "peak",
  },
  whatToPack:
    "Three swimsuits. Wide-brim hat. A light long-sleeve for the 15-minute moment of 65°F at sunset. Going-out outfits for Old Town — it's dressier than you'd guess.",

  itinerary: [
    {
      label: "Day 1 — Arrive & Settle",
      headline: "Check into the resort, drift to the pool, dinner at the resort or walk to Old Town.",
      narrative:
        "Scottsdale bachelorettes tend to anchor around a resort — so Day 1 is about actually using it. Skip the temptation to over-plan. You didn't fly to Arizona to run around.",
      beats: [
        {
          time: "Afternoon",
          title: "Check in + pool",
          body: "Most resorts (Hermosa Inn, Andaz, Mountain Shadows) let you pool-side before rooms are ready. Order the group-size margarita flight, claim shaded loungers, nobody moves until dinner.",
        },
        {
          time: "7:30 PM",
          title: "Dinner at Postino WineCafe (Old Town)",
          body: "Casual, group-friendly, and the bruschetta board + $20 wine-and-bruschetta weeknight deal is the single best value in the city. Walk from any Old Town resort.",
          reservationNote: "Reservations recommended — 1 week out",
        },
        {
          time: "10:00 PM",
          title: "Easy first-night drinks",
          body: "Cozy into Second Story Liquor Bar (speakeasy-style, quiet) or if the crew's energetic, W Scottsdale's Living Room lobby bar for a scene. Don't go hard tonight — Day 2 is for that.",
        },
      ],
    },
    {
      label: "Day 2 — Spa & Pool & Out",
      headline: "Morning hike if you must, spa, pool cabana, nice dinner, Old Town.",
      narrative:
        "The signature Scottsdale day. One activity in the morning, spa/pool in the afternoon, big dinner, then Old Town. The luxe version of a bachelorette — structured but not hectic.",
      beats: [
        {
          time: "7:00 AM",
          title: "Sunrise hike — Camelback or Pinnacle Peak",
          body: "Optional, for the early risers. Pinnacle Peak is easier (1.75mi round trip) and has gentler grades. Camelback's Echo Canyon trail is a real scramble — not flip-flop territory. Either way, be off the mountain by 9:00 AM in warmer months.",
          reservationNote: "Free — arrive at the trailhead by 6:30 for parking",
        },
        {
          time: "10:30 AM",
          title: "Brunch at Breakfast Club Scottsdale",
          body: "The yellow-chair-wall one everyone posts. Wait is real but the actual food is good. Book ahead if you can or send someone to put the name in at 9:45.",
          reservationNote: "Limited reservations — waitlist Sat/Sun",
        },
        {
          time: "1:00 PM",
          title: "Spa at Well & Being (Fairmont) or Joya Spa (Omni Montelucia)",
          body: "Well & Being is the more modern, airy option; Joya is Moorish-tiled and more 'transport me elsewhere.' Book a signature massage + facial combo — most spas offer group add-ons like a reserved cabana with cava.",
          reservationNote: "Book 4–6 weeks out for 4+ simultaneous treatments",
        },
        {
          time: "4:30 PM",
          title: "Pool cabana + sunset",
          body: "Back to the resort. The shift from daylight to golden hour in Scottsdale is cinema. Someone will cry and blame it on the margaritas.",
        },
        {
          time: "7:30 PM",
          title: "Dinner at FnB or Mora Italian",
          body: "FnB is the James Beard locals-love pick — farm-driven, seasonal, a real meal. Mora Italian is louder, more scene-y, handles groups better. Both need reservations.",
          reservationNote: "4+ weeks out",
        },
        {
          time: "10:30 PM",
          title: "Old Town — drinks and dancing",
          body: "Bottled Blonde is the classic Old Town 'girls in their 20s' bachelorette move — high energy, pizza at the bar, expect a wait. For 30s+ crowds, skip to The Mission's downstairs bar, then Culinary Dropout if someone wants shuffleboard energy.",
        },
      ],
    },
    {
      label: "Day 3 — Reset & Go",
      headline: "Slow brunch, a single photo op, airport.",
      narrative:
        "Everyone will be in various states of wrecked. Don't plan anything strenuous. One nice brunch, maybe 20 minutes of photos somewhere scenic, then fly home.",
      beats: [
        {
          time: "10:00 AM",
          title: "Brunch at Orange Sky or The Henry",
          body: "Orange Sky (Talking Stick Resort, rooftop) has views and is rarely crowded. The Henry in Biltmore is the reliable 'we can seat 12' all-day option. Pick based on proximity to your rental.",
          reservationNote: "Book 1 week out",
        },
        {
          time: "12:30 PM",
          title: "Desert Botanical Garden photo loop",
          body: "If anyone has the energy. One hour on the main loop ($30 entry), excellent backdrops. Skip entirely in July/August — do it early morning or not at all.",
        },
        {
          time: "2:30 PM",
          title: "Check out, airport",
          body: "PHX is 20 mins from Scottsdale. Share rides.",
        },
      ],
    },
  ],

  restaurants: [
    {
      category: "must_book",
      name: "FnB Restaurant",
      neighborhood: "Old Town",
      priceRange: "$$$",
      vibe: "Farm-driven, vegetable-forward, chef-owned — a real meal",
      whyBach: "Consistently excellent without being stuffy; handles a table of 10–12 without dumbing down the menu.",
      reservation: "Book 4+ weeks out",
      groupSize: "Up to 12",
      insiderTip: "Ask about the vegetable tasting — it's what the James Beard write-ups reference.",
    },
    {
      category: "brunch",
      name: "Breakfast Club Scottsdale",
      neighborhood: "Old Town",
      priceRange: "$$",
      vibe: "Sunny yellow-chair brunch spot, Instagram-famous",
      whyBach: "The brunch your group chat expects. Food is genuinely good — get the avocado crab Benedict.",
      reservation: "Limited reservations — put name in by 9:30 AM for weekend walk-ins",
      insiderTip: "The yellow chair wall is by the front door; timing matters for the photo.",
    },
    {
      category: "late_night",
      name: "Bottled Blonde",
      neighborhood: "Old Town",
      priceRange: "$$",
      vibe: "High-energy dance-until-2AM pizzeria-slash-club",
      whyBach: "Built for bachelorettes — reserved tables near the DJ, pizza until close, cover is waived with table booking.",
      reservation: "Table service required on weekends — book 3–4 weeks out",
      groupSize: "10–15 fits a standard table",
    },
    {
      category: "instagram",
      name: "The Phoenician Mountain View Terrace",
      neighborhood: "Paradise Valley",
      priceRange: "$$$",
      vibe: "Resort sunset cocktail terrace — Camelback Mountain as your backdrop",
      whyBach: "Magic-hour group photo with the mountain. Drinks are resort-priced but the moment is worth one round.",
      reservation: "Walk-in — arrive 45 mins before sunset for the good tables",
      insiderTip: "You don't need to be a hotel guest, but valet will ask — say you're there for the terrace.",
    },
    {
      category: "local_secret",
      name: "Cafe Monarch",
      neighborhood: "Old Town",
      priceRange: "$$$$",
      vibe: "Intimate four-course prix fixe, ivy-draped patio",
      whyBach: "If your crew is small (4–6) and wants one very nice meal, this is the city's most photographed patio.",
      reservation: "Book 6+ weeks out — small venue",
      groupSize: "Best for 4–8",
    },
    {
      category: "group_friendly",
      name: "Postino Wine Cafe",
      neighborhood: "Multiple",
      priceRange: "$$",
      vibe: "Casual, communal, bruschetta-and-wine — the reliable group default",
      whyBach: "Tues–Sun 8 PM: $6 bottles + $6 bruschetta boards. Multiple locations. No reservations stress.",
      reservation: "Call ahead for 8+; walk-in for smaller groups",
      groupSize: "Up to 15 with a long table",
      insiderTip: "The Old Town location has a rooftop that's better at sunset.",
    },
  ],

  activities: [
    {
      category: "chill",
      title: "Spa day at Well & Being (Fairmont Scottsdale Princess)",
      body: "Modern, airy, genuinely good spa. Book a group package — signature massage + facial + use of the rooftop pool and relaxation lounges for the whole day.",
      costPerPerson: "$280–$420",
      groupSize: "4–10 (they can do simultaneous treatments for up to 8)",
      bookAhead: "4–6 weeks",
      timeOfDay: "Afternoon",
    },
    {
      category: "classic_bach",
      title: "Pool cabana day",
      body: "The quintessential Scottsdale move. Andaz, W, Mountain Shadows, or the resort you're staying at — reserve a cabana and plan for day-drinking from 11 to 5. Most cabanas have a food & drink minimum that 8 people clear without trying.",
      costPerPerson: "$75–$150 incl minimum",
      groupSize: "6–12",
      bookAhead: "3 weeks",
      timeOfDay: "11 AM–5 PM",
      weatherSensitive: true,
    },
    {
      category: "adventure",
      title: "Sunrise hot air balloon",
      body: "Rainbow Ryders or Hot Air Expeditions. 1-hour flight over the Sonoran Desert at sunrise. Bring a jacket — it's cold at altitude even in summer. End with a champagne landing.",
      costPerPerson: "$200–$260",
      groupSize: "4–8 per basket",
      bookAhead: "3–4 weeks",
      timeOfDay: "5:00 AM launch",
      weatherSensitive: true,
    },
    {
      category: "adventure",
      title: "Camelback Mountain hike",
      body: "Echo Canyon trail — 1.2 miles up, very steep, real scrambles. Not a casual walk. Arrive by 6:30 AM for parking. Worth it once.",
      costPerPerson: "Free",
      groupSize: "Any — but only fit hikers",
      timeOfDay: "Sunrise",
      weatherSensitive: true,
    },
    {
      category: "food_drink",
      title: "Tequila tasting at Fate Brewing or Pedal Haus",
      body: "Scottsdale has deeper tequila than beer culture, but the breweries with mezcal/tequila flights are underrated as a mid-afternoon activity. Better alternative: a private tasting at The Mission.",
      costPerPerson: "$45–$85",
      groupSize: "6–12",
      bookAhead: "2 weeks",
      timeOfDay: "Late afternoon",
    },
    {
      category: "unique",
      title: "Taliesin West tour (Frank Lloyd Wright)",
      body: "FLW's desert studio and school. 90-min guided tour. A genuinely surprising hour — even people who don't care about architecture come out impressed.",
      costPerPerson: "$55",
      groupSize: "Any",
      bookAhead: "1 week",
      timeOfDay: "Morning (10 AM tours are best)",
    },
    {
      category: "culture",
      title: "Desert Botanical Garden + lunch at Gertrude's",
      body: "The good-weather morning move. Walking loop through the garden, then lunch on the patio at Gertrude's. Not bachelorette-coded, which is kind of the point.",
      costPerPerson: "$60 (entry + lunch)",
      groupSize: "Any",
      timeOfDay: "9 AM–1 PM",
      weatherSensitive: true,
    },
  ],

  stays: [
    {
      type: "resort",
      title: "Andaz Scottsdale Resort & Bungalows",
      neighborhood: "Paradise Valley",
      body: "Individual bungalows, mid-century design, the prettiest resort pool in the city. Walkable to nothing but shuttle-able to Old Town. Worth it if your group wants the 'we're on vacation' feel.",
      priceNote: "$500–$900/night/bungalow — doubles for 2 or 3-bedroom suites for small groups",
    },
    {
      type: "resort",
      title: "Mountain Shadows",
      neighborhood: "Paradise Valley",
      body: "Mid-priced-for-the-area, modern, Camelback views. Excellent pool that's calmer than the Andaz scene. Closer to Old Town.",
      priceNote: "$400–$650/night/room",
    },
    {
      type: "airbnb",
      title: "Old Town Scottsdale Airbnbs (4–6 BR)",
      neighborhood: "Old Town",
      body: "Walkable to restaurants and nightlife — which is the reason to choose Airbnb here. Look for places with a private pool; it's not optional in the desert.",
      priceNote: "$700–$1,400/night — ~$200–$350/pp for 3 nights for a group of 10",
    },
    {
      type: "boutique",
      title: "Hermosa Inn",
      neighborhood: "Paradise Valley",
      body: "Small, historic, adobe casitas. Not built for a big group but exceptional for a 4–6 person bachelorette that wants something intimate and design-forward.",
      priceNote: "$400–$700/night/casita",
    },
    {
      type: "budget",
      title: "Hotel Valley Ho",
      neighborhood: "Old Town",
      body: "Iconic mid-century, walkable, and the pool scene is half the fun. Rooms are small but you're barely in them. The most 'value for the vibe' option.",
      priceNote: "$300–$500/night/room",
    },
  ],

  practical: {
    gettingThere:
      "PHX airport is 20 mins from Scottsdale (15 from Old Town). Most major airlines hub. Drive-to from SoCal (6–7 hours from LA) is doable but unusual for bachelorettes.",
    gettingAround:
      "Uber/Lyft are reliable and cheap for in-city. Old Town is walkable internally. A rental car is helpful if you're staying in Paradise Valley and doing hikes or day trips, otherwise skip it.",
    localTips: [
      "Sun exposure is real — SPF reapplication isn't a joke, even in 'cool' months.",
      "Hydrate more than you think you need. The dry air dehydrates you without warning.",
      "Old Town is dressier than Phoenix proper — dress for 'cocktail casual' not 'tourist.'",
      "If you're pool-day-ing in June–Aug, be in the pool by 11 AM or it's too hot by noon.",
      "Taco shops close early (9 PM common) — late-night food options are thinner than you'd think.",
    ],
    bookingTimeline:
      "8–12 weeks out for Jan–April (peak season). 4–6 weeks for Oct–Dec. Spa reservations are the first to fill — book those before dinner. Resort pool cabanas go 3+ weeks out on weekends.",
  },
};

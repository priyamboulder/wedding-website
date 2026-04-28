// ── Nashville deep-dive ───────────────────────────────────────────────────
// Editorial guide content for the Nashville destination. Voice: warm,
// opinionated, specific — like a well-traveled friend. Rules of thumb:
// name actual venues, flag reservations, be honest about tourist traps.

import type { DestinationDetail } from "@/types/bachelorette";

export const nashvilleDetail: DestinationDetail = {
  destinationId: "nashville",
  tagline: "Live music, BBQ smoke, and rooftop pools",
  heroQuote:
    "If you want a city where the soundtrack is live and the pedal tavern is unironic — this is it.",
  bestMonthsTimeline: {
    january: "avoid",
    february: "avoid",
    march: "shoulder",
    april: "peak",
    may: "peak",
    june: "shoulder",
    july: "avoid",
    august: "avoid",
    september: "peak",
    october: "peak",
    november: "shoulder",
    december: "shoulder",
  },
  whatToPack:
    "Boots you can actually walk in, a statement going-out outfit, matching day outfits for Broadway, and something for the pool. Summer: bring humidity hair backup.",

  itinerary: [
    {
      label: "Day 1 — Arrive & Set the Tone",
      headline: "Check in, eat something legendary, walk the chaos of Broadway.",
      narrative:
        "Land, drop bags, and don't over-plan this day — it's about getting the group in sync. Stay East Nashville or Germantown if you want walkable and cute; skip any rental directly on Broadway unless you're okay falling asleep to bachelorette screams.",
      beats: [
        {
          time: "Afternoon",
          title: "Check in + refresh",
          body: "Aim to arrive by 3 PM so everyone has time to settle. Get a group photo on the porch before anyone's tired — you'll use it.",
        },
        {
          time: "Early evening",
          title: "Dinner at Hattie B's (first night rule)",
          body: "Hot chicken that's worth the hype. The Midtown location has the shortest lines but is still a 20-min wait — put your name in while walking over. Do the medium — 'hot' is sincere.",
          reservationNote: "No reservations — arrive before 6:30 to beat the rush",
        },
        {
          time: "Night",
          title: "Broadway walk, but pick your spots",
          body: "Skip the neon tourist traps with cover charges. Start at Robert's Western World for genuinely good honky-tonk (and a $6 fried bologna sandwich), move to Acme Feed & Seed rooftop for the view, wrap at Whiskey Row if you still want dancing. Be done by 1 AM — you'll need Day 2.",
        },
      ],
    },
    {
      label: "Day 2 — The Big Day",
      headline: "Brunch, pool/pedal-tavern, statement dinner, one more round.",
      narrative:
        "The classic Nashville bachelorette day. Get to brunch early, commit to ONE daytime group activity (pedal tavern OR pool OR both if you're ambitious), then nice dinner and a cocktail bar to close. Avoid over-scheduling — the best memories happen when there's slack in the day.",
      beats: [
        {
          time: "9:30 AM",
          title: "Brunch at Biscuit Love (the Gulch)",
          body: "The original location. Go at 9:30 or you'll wait 45+ mins. Order the Bonuts (fried biscuit donuts) for the table — people who say they're not that hungry will eat six.",
          reservationNote: "Walk-in only — waitlist via their app 20 mins before you arrive",
        },
        {
          time: "12:00 PM",
          title: "Pedal tavern OR pool day",
          body: "Pedal tavern is the classic bach activity and it IS fun — book Nashville Pedal Tavern, the smaller groups are more fun than the giant parties. If pedaling's not your crew's thing, book cabana day passes at Virgin Hotel rooftop or Graduate Nashville's pool — both take the bachelor-y edge off.",
          reservationNote: "Both book out 3–4 weeks on peak-season weekends",
        },
        {
          time: "7:30 PM",
          title: "Dinner at The 404 Kitchen",
          body: "This is the 'dress up and take real photos' meal. Cozy, low-lit, Italian-leaning new American — and they handle groups of 10–14 without making you feel rushed. Get the branzino and let them pair wine.",
          reservationNote: "Book 4 weeks out for Friday/Saturday",
        },
        {
          time: "10:30 PM",
          title: "Cocktails at Bastion or Attaboy",
          body: "After dinner, skip Broadway — go speakeasy. Attaboy is reservations-only and feels special. Bastion is louder, more danceable, and has late-night wood-fired pizza if anyone's still hungry.",
          reservationNote: "Attaboy: book via text per their Instagram DMs",
        },
      ],
    },
    {
      label: "Day 3 — Farewell",
      headline: "Slow brunch, one photo op, airport.",
      narrative:
        "Keep Day 3 loose. One nice brunch together, maybe one photo moment, then staggered check-out. Don't try to squeeze in a new activity — you'll all be tired in the best way.",
      beats: [
        {
          time: "10:00 AM",
          title: "Brunch at Pinewood Social",
          body: "Big enough for a group of 12 without a private room, vibe-y without being stuffy. Bowling lanes downstairs if anyone wants one last activity before flights.",
          reservationNote: "Book for the group 2 weeks out",
        },
        {
          time: "12:30 PM",
          title: "Matching pajama group photo",
          body: "Back at the rental. The one photo your group chat will reference for years.",
        },
        {
          time: "2:00 PM",
          title: "Check out, airport runs",
          body: "BNA is 15 mins from most neighborhoods. Share rides — don't all book separate Ubers.",
        },
      ],
    },
  ],

  restaurants: [
    {
      category: "must_book",
      name: "The 404 Kitchen",
      neighborhood: "The Gulch",
      priceRange: "$$$",
      vibe: "Low-lit, handsome, Italian-leaning new American",
      whyBach: "Handles groups of 10–14 without a private room, and the room is photogenic enough that everyone's dinner photos will look good.",
      reservation: "Book 4+ weeks out for Fri/Sat",
      groupSize: "Up to 14 comfortably",
      insiderTip: "Ask to sit in the main room, not the annex.",
    },
    {
      category: "brunch",
      name: "Biscuit Love",
      neighborhood: "The Gulch",
      priceRange: "$$",
      vibe: "The iconic biscuit brunch — fried biscuit donuts are the order",
      whyBach: "The brunch everyone's Instagram story expects to see — get it out of the way early Day 2.",
      reservation: "Walk-in only — waitlist app",
      insiderTip: "Arrive 9:30 or you're waiting 45+ mins.",
    },
    {
      category: "late_night",
      name: "Bastion",
      neighborhood: "Wedgewood-Houston",
      priceRange: "$$",
      vibe: "Tiny bar up front, warehouse lounge in the back",
      whyBach: "Opens late, stays lively past midnight, and the pizza is legitimately great when you're 4 drinks in.",
      reservation: "Walk-in at the bar; book the back lounge 3 weeks out",
      insiderTip: "The 'bar' menu at the front is short but the move.",
    },
    {
      category: "instagram",
      name: "White Limozeen (Graduate Nashville)",
      neighborhood: "Midtown",
      priceRange: "$$$",
      vibe: "Pink, Dolly-coded rooftop bar with skyline view",
      whyBach: "Unhinged pink aesthetic, group photo gold, drinks are fine.",
      reservation: "Walk-in weekdays, line-and-cover weekends",
      insiderTip: "Go for sunset — photos are noticeably better before dark.",
    },
    {
      category: "local_secret",
      name: "Arnold's Country Kitchen",
      neighborhood: "8th Ave South",
      priceRange: "$",
      vibe: "Classic Nashville meat-and-three cafeteria — no frills",
      whyBach: "Lunch only, Mon–Fri, cash-and-card line. Go when you need to stop and actually eat vegetables.",
      reservation: "No reservations — open 10:30am–2:45pm, M–F",
      insiderTip: "Closed weekends — slot it on a Day 1 Friday arrival if you land in time.",
    },
    {
      category: "group_friendly",
      name: "Pinewood Social",
      neighborhood: "SoBro",
      priceRange: "$$",
      vibe: "All-day social spot — brunch, bowling, patio, coffee bar",
      whyBach: "Handles 12+ people without making you feel rushed; bowling lanes are a built-in activity if energy dips.",
      reservation: "Book the group 2+ weeks out",
      groupSize: "Up to 20 with a long table",
      insiderTip: "The pool outside is for hotel guests — don't try.",
    },
  ],

  activities: [
    {
      category: "classic_bach",
      title: "Nashville Pedal Tavern",
      body: "The iconic group bike bar on wheels. Honestly fun — 2-hour route hits several stops on request. Bring cash for the driver tip.",
      costPerPerson: "$50–$75",
      groupSize: "8–15 (book a private one)",
      bookAhead: "3–4 weeks on peak weekends",
      timeOfDay: "Afternoon (2–4 PM is the sweet spot)",
      weatherSensitive: true,
    },
    {
      category: "chill",
      title: "Virgin Hotel rooftop pool cabana",
      body: "Elevated day-drinking with a view and shade. The cabana fee covers drinks/food minimums that a group of 10 easily clears. Better than the pedal tavern if the crew leans chill.",
      costPerPerson: "$80–$120 incl minimum spend",
      groupSize: "6–12",
      bookAhead: "2–3 weeks",
      timeOfDay: "12–5 PM",
      weatherSensitive: true,
    },
    {
      category: "food_drink",
      title: "Bachelorette cocktail class at Attaboy",
      body: "Private mixology class in the speakeasy. Each person leaves with two signature drinks they made themselves. More fun than it sounds.",
      costPerPerson: "$95",
      groupSize: "6–12",
      bookAhead: "6 weeks — limited slots",
      timeOfDay: "Late afternoon",
    },
    {
      category: "nightlife",
      title: "Honky-tonk crawl (guided or DIY)",
      body: "Robert's Western World → Acme rooftop → Whiskey Row. Skip anywhere with a $20 cover. A guided crawl (~$50/pp) adds a 'skip the line' pass, which matters on peak weekends.",
      costPerPerson: "$50 for guided, $0 for DIY",
      groupSize: "Any",
      timeOfDay: "8 PM–12 AM",
    },
    {
      category: "culture",
      title: "Hatch Show Print workshop",
      body: "The iconic letterpress shop does group workshops where you print your own matching poster. Surprisingly fun and you leave with a real memento.",
      costPerPerson: "$45–$65",
      groupSize: "6–15",
      bookAhead: "4+ weeks",
      timeOfDay: "Morning or afternoon",
    },
    {
      category: "unique",
      title: "Sound check at the Ryman Auditorium",
      body: "Occasionally open for backstage sound-check tours; always open for daytime self-guided visits. Standing on the stage where Patsy Cline performed hits differently after a weekend of live music.",
      costPerPerson: "$30",
      groupSize: "Any",
      timeOfDay: "10 AM–3 PM",
    },
    {
      category: "chill",
      title: "Group massages at Salt Sanctuary",
      body: "If Day 3 morning needs a reset before flights. They can slot 4–6 simultaneous appointments with advance booking.",
      costPerPerson: "$120–$180",
      groupSize: "4–8",
      bookAhead: "4 weeks",
      timeOfDay: "Morning",
    },
  ],

  stays: [
    {
      type: "airbnb",
      title: "East Nashville Airbnb (group of 8–12)",
      neighborhood: "East Nashville",
      body: "Walkable to Five Points restaurants, 10 mins by Uber to Broadway when you want it, and genuinely quiet at night. Look for 4–5 bedroom homes with a back patio — those are the ones that work for a group.",
      priceNote: "$500–$900/night split — about $150–$280/pp for 3 nights",
    },
    {
      type: "boutique",
      title: "The Dive Motel",
      neighborhood: "Dickerson Pike",
      body: "Themed disco-era motel with a real 24-hour lobby party. Rooms are small but the photo ops and pool area scale well for a group of 8–10 who book adjacent rooms.",
      priceNote: "$300–$450/night/room",
    },
    {
      type: "resort",
      title: "Virgin Hotel Nashville",
      neighborhood: "Music Row",
      body: "The rooftop alone justifies it. Group rate on 5+ rooms if you call directly. Midtown location means you walk to most nightlife.",
      priceNote: "$350–$550/night/room; group rate negotiable",
    },
    {
      type: "budget",
      title: "Germantown Airbnbs",
      neighborhood: "Germantown",
      body: "Historic row houses in a walkable food neighborhood. Not as cheap as outer suburbs but much cheaper than Gulch — and you're 8 mins from everything. Best price/walkability ratio.",
      priceNote: "$350–$600/night for a 3–4 bedroom",
    },
  ],

  practical: {
    gettingThere:
      "BNA airport is 15 minutes from downtown — no need for a rental. Most major airlines hub here.",
    gettingAround:
      "Uber/Lyft are reliable and cheap for city rides. Downtown and East Nashville are walkable internally. Don't rent a car unless you're doing day trips.",
    localTips: [
      "Broadway past 10 PM is chaos — fun once, skip it on Night 2.",
      "Tip generously at honky-tonks — the bands don't get paid base.",
      "Sunday NFL season: Titans home games make downtown a zoo. Check the schedule.",
      "Hot chicken heat is real — 'medium' is a respectable choice.",
      "Many rentals have noise ordinances — you will get fined if the group chants at 2 AM on a porch.",
    ],
    bookingTimeline:
      "8–12 weeks out for peak season (April–May, Sept–Oct). 4–6 weeks minimum for anything on a Saturday. Pedal tavern and dinner at The 404 Kitchen are the first two things to reserve.",
  },
};

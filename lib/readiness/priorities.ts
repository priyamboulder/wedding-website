// ──────────────────────────────────────────────────────────────────────────
// Priority generation for the "Am I Ready?" tool.
//
// Given an assessment answer, this returns the ranked Top-5 things the
// couple should be doing right now, plus a "what can wait" list that
// tells them what NOT to worry about.
//
// Rules-based, no ML. Each category has variants by timeline window so
// the copy reads like a planner who knows the calendar, not a templated
// to-do list.
// ──────────────────────────────────────────────────────────────────────────

import type {
  AssessmentAnswer,
  CanWaitItem,
  PriorityItem,
  TimelineOption,
} from "@/types/readiness";

type Window = "asap" | "tight" | "mid" | "early" | "very-early" | "no-date";

function timelineWindow(timeline: TimelineOption): Window {
  switch (timeline) {
    case "less-than-3-months":
      return "asap";
    case "3-6-months":
      return "tight";
    case "6-12-months":
      return "mid";
    case "12-18-months":
      return "early";
    case "18-plus-months":
      return "very-early";
    case "no-date":
      return "no-date";
    case "already-happened":
      return "no-date";
  }
}

interface Candidate {
  id: string;
  weight: number;
  build: () => Omit<PriorityItem, "rank">;
}

export function generatePriorities(answer: AssessmentAnswer): PriorityItem[] {
  const win = timelineWindow(answer.timeline);
  const candidates: Candidate[] = [];

  // ── Date (only when no date is set) ─────────────────────────────────────
  if (win === "no-date") {
    candidates.push({
      id: "date",
      weight: 1000,
      build: () => ({
        id: "date",
        action: "Pick a date — or at least a season — this month.",
        why: "Until you have a date or a tight window, nothing else can move. Venues won't hold quotes, photographers can't check availability, and family travel can't be planned.",
        timeframe: "This month — narrow it to a 3-week window if a single date is too much.",
        budgetNote:
          "Peak South Asian wedding season in DFW (Oct–March) carries a 15–25% premium across vendors. An off-peak Friday or Sunday saves real money without losing the moment.",
      }),
    });
  }

  // ── Budget conversation ─────────────────────────────────────────────────
  if (
    answer.budget === "havent-talked" ||
    answer.budget === "rough-range" ||
    answer.budget === "one-side-only" ||
    answer.budget === "complicated"
  ) {
    const tight = win === "asap" || win === "tight";
    const weight =
      answer.budget === "havent-talked"
        ? 950
        : answer.budget === "complicated"
          ? 800
          : tight
            ? 760
            : 600;
    candidates.push({
      id: "budget",
      weight,
      build: () => ({
        id: "budget",
        action:
          answer.budget === "havent-talked"
            ? "Have the real budget conversation with both families — within two weeks."
            : "Convert your rough budget into a specific number both families have signed off on.",
        why: "You can't book a single vendor without it. 'We'll figure it out' is not a number, and every vendor inquiry will ask for one. This is the single conversation that unlocks everything else.",
        timeframe:
          tight
            ? "This week. Schedule a call or dinner with both sets of parents — don't leave it open-ended."
            : "Schedule a call or dinner with both sets of parents within the next two weeks.",
        budgetNote:
          "Come prepared with a rough breakdown: venue (20%), food (25–30%), decor (10–15%), photo/video (8–10%), attire (8–12%), music (3–5%), everything else (15–20%). These are starting points, not rules.",
      }),
    });
  }

  // ── Venue ───────────────────────────────────────────────────────────────
  if (
    answer.venue !== "signed-deposited" &&
    answer.venue !== "destination-package"
  ) {
    const weight =
      win === "asap"
        ? 980
        : win === "tight"
          ? 900
          : win === "mid"
            ? 800
            : win === "early"
              ? 500
              : 350;
    candidates.push({
      id: "venue",
      weight,
      build: () => {
        if (win === "asap") {
          return {
            id: "venue",
            action: "Call every venue on your list TODAY.",
            why: "At under 3 months, you're shopping cancellation dates and weekday availability. It's not impossible — but you need to move fast and stay flexible on the date.",
            timeframe: "This week — make calls, not emails.",
            budgetNote:
              "Negotiating leverage is thinner at this timeline. Budget for the asking rate, and have your deposit ready when you walk in.",
          };
        }
        if (win === "tight") {
          return {
            id: "venue",
            action: "Lock down your venue in the next two weeks.",
            why: "Every weekend you wait at this timeline narrows what's left. Top DFW venues are already booking peak season weekends out, and your caterer + decorator can't be booked until your venue is.",
            timeframe: "Tour this weekend, decide next, deposit the week after.",
            budgetNote:
              "Most venues require 25–50% to hold a date. Get the deposit ready in advance so you're not waiting on a wire transfer once you decide.",
          };
        }
        if (win === "mid") {
          return {
            id: "venue",
            action: "Book your venue this month, not next month.",
            why: "Top DFW venues book 8–12 months out for peak season. At your timeline, every month you wait pushes you toward the second-tier list.",
            timeframe: "Schedule tours this week. Deposit within 4 weeks.",
            budgetNote:
              "Venue is typically 15–25% of total budget. DFW Indian-friendly venues run $5K–$15K (banquet hall) to $25K–$80K (luxury hotel/estate).",
          };
        }
        if (win === "early") {
          return {
            id: "venue",
            action: "Make venue research your top priority this quarter.",
            why: "You're in the sweet spot to get first pick. Top venues for South Asian weddings book 12–18 months out, and starting now means you choose the date — instead of the date choosing you.",
            timeframe: "Build a shortlist of 5 venues this month. Tour 3 next month.",
            budgetNote:
              "Get firm quotes that itemize what's included. Indian weddings need outside catering, late-night noise allowances, and baraat staging — confirm each.",
          };
        }
        return {
          id: "venue",
          action: "Start a venue shortlist — just for research.",
          why: "Don't book yet, but knowing the field gives you context for everything else. Pricing, availability, what's included — all of this informs the budget conversation.",
          timeframe: "This quarter. No pressure to commit.",
        };
      },
    });
  }

  // ── Photographer ────────────────────────────────────────────────────────
  if (!answer.vendorsBooked.includes("photographer")) {
    const weight =
      win === "asap"
        ? 920
        : win === "tight"
          ? 850
          : win === "mid"
            ? 760
            : win === "early"
              ? 620
              : 200;
    if (weight >= 200) {
      candidates.push({
        id: "photographer",
        weight,
        build: () => {
          if (win === "asap" || win === "tight") {
            return {
              id: "photographer",
              action: "Book your photographer this week.",
              why: "Top South Asian wedding photographers in DFW book 12–18 months out — at your timeline you're racing for whoever's left who actually knows the difference between a baraat and a vidaai. Don't compromise on cultural fluency.",
              timeframe: "Send inquiry emails today. Decide within a week.",
              budgetNote:
                "$3,000–$5,000 for solid coverage; $6,000–$12,000+ for premium photographers with second shooters and multi-day packages.",
            };
          }
          if (win === "mid") {
            return {
              id: "photographer",
              action: "Lock down your photographer — this month.",
              why: "At 6–12 months out, the best South Asian wedding photographers in DFW are already booking your dates. They need to know how to shoot a baraat, capture mehndi details, and handle multi-day coverage.",
              timeframe: "Inquiries out this week. Booking within 4 weeks.",
              budgetNote:
                "$3,000–$5,000 for solid; $6,000–$12,000+ for premium with multi-day coverage.",
            };
          }
          return {
            id: "photographer",
            action: "Start following photographers — booking comes next quarter.",
            why: "You don't need to commit yet, but the best ones are already booking your year. Build a shortlist now so you're ready to move when the budget conversation closes.",
            timeframe: "Follow 10 photographers on Instagram this month. Inquire within 3 months.",
            budgetNote: undefined,
          };
        },
      });
    }
  }

  // ── Caterer (only meaningful once venue is in motion) ───────────────────
  if (
    !answer.vendorsBooked.includes("caterer") &&
    (answer.venue === "signed-deposited" ||
      answer.venue === "venue-in-mind" ||
      answer.venue === "destination-package")
  ) {
    const weight =
      win === "asap" ? 870 : win === "tight" ? 780 : win === "mid" ? 700 : 400;
    candidates.push({
      id: "caterer",
      weight,
      build: () => ({
        id: "caterer",
        action: "Book your caterer — your venue is locked, this is the next domino.",
        why: "Top Indian caterers in DFW book 6–12 months out for peak season, and the good ones know what they're doing across regional cuisines (North Indian, South Indian, Gujarati, Punjabi). Generic caterers will disappoint your aunties.",
        timeframe: "Schedule tastings within 3 weeks.",
        budgetNote:
          "Plate cost for full Indian catering: $75–$150 per guest at the mid tier; $150–$300+ at premium. Multi-day events compound fast — get quotes for every event, not just the reception.",
      }),
    });
  }

  // ── Attire (urgent if from India) ───────────────────────────────────────
  if (answer.attire !== "ordered") {
    const fromIndia =
      answer.attire === "from-india" || answer.attire === "havent-thought";
    const weight = fromIndia
      ? win === "asap"
        ? 780
        : win === "tight"
          ? 720
          : win === "mid"
            ? 680
            : 350
      : win === "asap"
        ? 600
        : win === "tight"
          ? 500
          : 280;

    candidates.push({
      id: "attire",
      weight,
      build: () => {
        if (fromIndia && (win === "mid" || win === "tight")) {
          return {
            id: "attire",
            action:
              "If you're getting anything from India — start NOW.",
            why: "Lehengas and sherwanis from India need 3–4 months for tailoring, 2–4 weeks for international shipping, plus 1–2 rounds of domestic alterations. That's 5–6 months minimum. At your timeline, every week of delay is a week off the buffer.",
            timeframe:
              "If traveling: book the trip in the next 4–6 weeks. If ordering online: start browsing designers this week.",
            budgetNote:
              "Bridal lehenga from India: $2K–$8K mid-tier, $5K–$25K+ designer. Groom's sherwani: $500–$3K. Don't forget sangeet, reception, and family coordination outfits.",
          };
        }
        if (win === "asap") {
          return {
            id: "attire",
            action: "Buy off-the-rack — there's no time for custom anything.",
            why: "At under 3 months, anything custom from India is off the table. Look at US-based South Asian boutiques (DFW has several), trunk shows, and ready-to-wear collections from Indian designers with US fulfillment.",
            timeframe: "This week — get appointments at 2–3 boutiques.",
            budgetNote: undefined,
          };
        }
        return {
          id: "attire",
          action: "Start outfit shopping this month.",
          why: "Even domestic shopping needs 3–4 months for alterations and styling. The longer you wait, the fewer good options remain — the most popular designers and styles sell through fast for peak season.",
          timeframe: "Book 2–3 boutique appointments in the next 2 weeks.",
          budgetNote: fromIndia
            ? "If anything is coming from India, allow 5–6 months end-to-end (tailoring + shipping + alterations)."
            : undefined,
        };
      },
    });
  }

  // ── Guest list ──────────────────────────────────────────────────────────
  if (
    answer.guestList === "havent-started" ||
    answer.guestList === "rough-number" ||
    answer.guestList === "parents-handling"
  ) {
    const tight = win === "asap" || win === "tight";
    const weight = tight ? 820 : win === "mid" ? 680 : 500;
    candidates.push({
      id: "guest-list",
      weight,
      build: () => ({
        id: "guest-list",
        action: "Get your guest list to at least a draft — even a range works.",
        why: "Your caterer wants a number. Your venue layout depends on a number. Your invitation timeline is built around a number. 'We don't know yet' is the most expensive answer in wedding planning — vendors quote conservatively when they have to guess.",
        timeframe: tight
          ? "Sit down with parents this weekend. Final by next."
          : "Sit down with parents this week. A range like 200–275 unlocks your next decisions.",
        budgetNote:
          "DFW Indian wedding rule of thumb: $100–$250 per guest covers food + venue + basic decor. A 300-person wedding at $150/head = $45K in just those three categories.",
      }),
    });
  }

  // ── Family alignment ────────────────────────────────────────────────────
  if (
    answer.familyAlignment === "tension" ||
    answer.familyAlignment === "work-in-progress"
  ) {
    candidates.push({
      id: "family",
      weight:
        answer.familyAlignment === "tension"
          ? 720
          : 540,
      build: () => ({
        id: "family",
        action: "Get both families in the same room about scale and style.",
        why: "Family misalignment is the #1 reason South Asian weddings spiral over budget and over scope. You can fix every other gap with money or time — but you cannot vendor your way out of two families with different visions of the wedding. Start the conversation now, not three weeks before the cards go out.",
        timeframe:
          "Schedule a call or dinner in the next 2 weeks. Bring a one-page document with the three big variables: number of events, guest count range, total budget.",
        budgetNote: undefined,
      }),
    });
  }

  // ── Decorator ───────────────────────────────────────────────────────────
  if (
    !answer.vendorsBooked.includes("decorator") &&
    (win === "asap" || win === "tight" || win === "mid")
  ) {
    candidates.push({
      id: "decorator",
      weight: win === "asap" ? 700 : win === "tight" ? 600 : 480,
      build: () => ({
        id: "decorator",
        action: "Start sourcing your decorator/florist.",
        why: "South Asian weddings live and die on mandap design, stage decor, and floral installations. The good DFW decorators book 4–8 months out, and you'll want 2–3 rounds of mood boards before deposit.",
        timeframe:
          win === "asap"
            ? "This week — request quotes from 3 decorators."
            : "Within 3 weeks. Mood-board this weekend.",
        budgetNote:
          "Decor + florals typically run 10–15% of total budget. Mandap alone is often $5K–$25K depending on scale and floral density.",
      }),
    });
  }

  // ── HMUA ────────────────────────────────────────────────────────────────
  if (
    !answer.vendorsBooked.includes("hmua") &&
    (win === "asap" || win === "tight")
  ) {
    candidates.push({
      id: "hmua",
      weight: win === "asap" ? 620 : 460,
      build: () => ({
        id: "hmua",
        action: "Book your hair & makeup artist.",
        why: "South Asian bridal HMUA is its own specialty — dupatta-setting, multiple looks across events, working with henna and heavy jewelry. Top artists book 2–4 months out and won't take last-minute slots.",
        timeframe: "This month. Schedule a trial 2–3 months before the wedding.",
        budgetNote:
          "$800–$2,500 for bridal HMUA across multiple events; $150–$400 per family member.",
      }),
    });
  }

  // ── Mehndi (only urgent at the very end) ────────────────────────────────
  if (
    !answer.vendorsBooked.includes("mehndi") &&
    (win === "asap" || win === "tight")
  ) {
    candidates.push({
      id: "mehndi",
      weight: win === "asap" ? 540 : 380,
      build: () => ({
        id: "mehndi",
        action: "Book your mehndi artist.",
        why: "Top mehndi artists in DFW book 2–4 months out for peak season, especially the ones who can do bridal-level intricacy and travel for the actual event. Don't leave this to the last 6 weeks.",
        timeframe: "This month.",
        budgetNote: "$400–$1,500 for bridal mehndi; $200–$600 per family member group.",
      }),
    });
  }

  // ── Pick top 5 ──────────────────────────────────────────────────────────
  candidates.sort((a, b) => b.weight - a.weight);
  const top = candidates.slice(0, 5);

  return top.map((c, idx) => ({ ...c.build(), rank: idx + 1 }));
}

// ── "What can wait" — anti-anxiety section ────────────────────────────────

const WAITS: Record<
  string,
  Pick<CanWaitItem, "label" | "detail">
> = {
  mehndi: {
    label: "Mehndi artist",
    detail: "You have time. Book at 3–4 months out — earlier is fine, but not urgent.",
  },
  hmua: {
    label: "Hair & makeup",
    detail: "Top HMUA books 2–4 months out. Trials at 2–3 months. Don't book before that — your inspiration will shift.",
  },
  dj: {
    label: "DJ / music",
    detail: "3–6 month booking window. Picking a setlist or sangeet performances? That's a 1-month-out problem.",
  },
  decorator: {
    label: "Decorator",
    detail: "Start mood-boarding now if you want — but actual booking belongs at 4–8 months out.",
  },
  photographer: {
    label: "Photographer",
    detail: "Plenty of runway at this timeline. Build a shortlist this quarter.",
  },
  invitations: {
    label: "Invitations",
    detail: "Indian wedding invites go out 8–10 weeks before the wedding. Save-the-dates 4–6 months out.",
  },
  favors: {
    label: "Favors & welcome bags",
    detail: "This is a 4–6 weeks before territory. Seriously, don't start yet.",
  },
  seating: {
    label: "Seating chart",
    detail: "This is a 3-weeks-before problem. Resist the urge — your guest list will shift until then anyway.",
  },
  timeline: {
    label: "Day-of timeline",
    detail: "Don't build hour-by-hour until 6–8 weeks out. (Use our Weekend Visualizer for the rough shape now.)",
  },
  registry: {
    label: "Registry",
    detail: "Open it 4–6 months out, around when save-the-dates ship.",
  },
};

export function generateCanWait(answer: AssessmentAnswer): CanWaitItem[] {
  const win = timelineWindow(answer.timeline);
  const list: CanWaitItem[] = [];

  // Always-safe-to-defer items (the long tail of details that consume mental
  // energy way before they're due).
  list.push(WAITS.favors, WAITS.seating);

  if (win === "very-early" || win === "early") {
    list.unshift(WAITS.mehndi, WAITS.hmua, WAITS.dj);
    if (!answer.vendorsBooked.includes("decorator")) list.push(WAITS.decorator);
    list.push(WAITS.invitations, WAITS.registry, WAITS.timeline);
  } else if (win === "mid") {
    if (!answer.vendorsBooked.includes("hmua")) list.unshift(WAITS.hmua);
    if (!answer.vendorsBooked.includes("mehndi")) list.unshift(WAITS.mehndi);
    list.push(WAITS.timeline, WAITS.registry);
  } else if (win === "tight") {
    list.push(WAITS.timeline);
    if (!answer.vendorsBooked.includes("dj")) list.push(WAITS.dj);
  } else if (win === "asap") {
    // At < 3 months, almost nothing can "wait" — but we still want to give
    // them permission to ignore the small stuff.
    list.unshift(WAITS.seating);
  } else if (win === "no-date") {
    return [
      {
        label: "Literally everything except the date",
        detail:
          "Until you have a date or season, all other planning is fiction. Don't research vendors, don't pick a venue, don't browse outfits. Pick the date first.",
      },
    ];
  }

  // De-dupe by label.
  const seen = new Set<string>();
  return list.filter((item) => {
    if (seen.has(item.label)) return false;
    seen.add(item.label);
    return true;
  });
}

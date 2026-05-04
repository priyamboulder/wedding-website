// ──────────────────────────────────────────────────────────────────────────
// Ashtakoota Guna Milan + dosha analysis.
//
// Eight kootas, 36 max. Plus Nadi/Bhakoot/Manglik dosha checks with the
// classical parihar (cancellation) conditions. All inputs are derived
// BirthCharts; the heavy astronomical lifting happens in ./birth-chart.
// ──────────────────────────────────────────────────────────────────────────

import type {
  BirthChart,
  DoshaResult,
  KootaResult,
  MatchResult,
  ScoreTier,
} from "@/types/kundli";

import {
  planetaryRelationship,
  RASHIS,
  RASHI_BY_NAME,
  vashyaCompatibility,
  yoniCompatibility,
} from "./nakshatras";

// ── 1. Varna Koota (max 1) ──
// Hierarchy: Brahmin > Kshatriya > Vaishya > Shudra. The traditional rule
// awards the point when the groom's varna is equal to or higher than the
// bride's. For same-sex / non-gendered use we treat partnerA as the
// "higher" reference; the report exposes a note about the gendered origin.
const VARNA_RANK: Record<string, number> = {
  Brahmin: 4,
  Kshatriya: 3,
  Vaishya: 2,
  Shudra: 1,
};

function varnaKoota(a: BirthChart, b: BirthChart): KootaResult {
  const aRank = VARNA_RANK[a.nakshatra.varna];
  const bRank = VARNA_RANK[b.nakshatra.varna];
  // Strict traditional rule: partnerA's Varna must equal or exceed partnerB's.
  const obtained = aRank >= bRank ? 1 : 0;
  return {
    key: "varna",
    name: "Varna",
    plainName: "Spiritual & Values Alignment",
    obtained,
    max: 1,
    status: obtained === 1 ? "favorable" : "partial",
    traditionalNote:
      obtained === 1
        ? `Partner A's Varna (${a.nakshatra.varna}) equals or exceeds Partner B's (${b.nakshatra.varna}). Compatible.`
        : `Partner A's Varna (${a.nakshatra.varna}) is lower than Partner B's (${b.nakshatra.varna}). Traditionally a soft mismatch; modern practice considers this minor.`,
    plainNote:
      obtained === 1
        ? "You share a compatible spiritual and value framework."
        : "A small mismatch in the traditional Varna hierarchy. In modern interpretation, this is one of the least weighted dimensions and rarely material.",
  };
}

// ── 2. Vashya Koota (max 2) ──
function vashyaKoota(a: BirthChart, b: BirthChart): KootaResult {
  const aV = RASHI_BY_NAME.get(a.rashi)!.vashya;
  const bV = RASHI_BY_NAME.get(b.rashi)!.vashya;
  const score = vashyaCompatibility(aV, bV);
  const obtained = Math.round(score * 10) / 10;
  return {
    key: "vashya",
    name: "Vashya",
    plainName: "Mutual Influence & Adaptability",
    obtained,
    max: 2,
    status:
      obtained === 2 ? "favorable" : obtained >= 1 ? "partial" : "neutral",
    traditionalNote:
      obtained === 2
        ? `Both partners share Vashya class (${aV}). Strong mutual influence.`
        : obtained >= 1
          ? `Vashya classes ${aV} and ${bV} are friendly. Partial points.`
          : `Vashya classes ${aV} and ${bV} sit apart in the traditional grouping.`,
    plainNote:
      obtained === 2
        ? "You're naturally aligned in how you adapt to each other."
        : obtained >= 1
          ? "Mutual adjustment comes with some give-and-take. Not a concern."
          : "One partner may need to adapt more than the other. Awareness is enough.",
  };
}

// ── 3. Tara Koota (max 3) ──
// Count Nakshatras forward from each partner to the other; divide by 9.
// Even remainder → favorable, odd → unfavorable. We compute both directions
// and take the average, which is the standard textbook approach.
function taraKoota(a: BirthChart, b: BirthChart): KootaResult {
  const fromA = ((b.nakshatra.id - a.nakshatra.id) + 27) % 27;
  const remA = (fromA % 9);
  const fromB = ((a.nakshatra.id - b.nakshatra.id) + 27) % 27;
  const remB = (fromB % 9);
  const aFav = remA % 2 === 0 ? 1.5 : 0;
  const bFav = remB % 2 === 0 ? 1.5 : 0;
  const obtained = aFav + bFav;
  return {
    key: "tara",
    name: "Tara",
    plainName: "Destiny & Wellbeing",
    obtained,
    max: 3,
    status:
      obtained === 3 ? "favorable" : obtained >= 1.5 ? "partial" : "challenging",
    traditionalNote:
      obtained === 3
        ? "Both partners' Taras count to favorable remainders. Mutual wellbeing supported."
        : obtained >= 1.5
          ? "One direction yields a favorable Tara; the other does not. Half points."
          : "Both Tara counts fall on unfavorable remainders. Tradition recommends specific remedies.",
    plainNote:
      obtained === 3
        ? "Your stars indicate strong mutual support for each other's health and longevity."
        : obtained >= 1.5
          ? "Mixed signals on this dimension — generally fine in practice."
          : "Below average on Tara. Worth discussing with a family pandit.",
  };
}

// ── 4. Yoni Koota (max 4) ──
function yoniKoota(a: BirthChart, b: BirthChart): KootaResult {
  const obtained = yoniCompatibility(a.nakshatra.yoni, b.nakshatra.yoni);
  return {
    key: "yoni",
    name: "Yoni",
    plainName: "Physical & Intimate Compatibility",
    obtained,
    max: 4,
    status:
      obtained === 4
        ? "favorable"
        : obtained === 3
          ? "favorable"
          : obtained === 2
            ? "neutral"
            : obtained === 1
              ? "partial"
              : "challenging",
    traditionalNote: `Yoni: ${a.nakshatra.yoni} (${a.nakshatra.yoniGender}) ↔ ${b.nakshatra.yoni} (${b.nakshatra.yoniGender}). ${obtained}/4 points.`,
    plainNote:
      obtained >= 3
        ? "Strong physical and energetic compatibility per the animal symbology."
        : obtained === 2
          ? "Moderate compatibility on this symbolic dimension. Take it lightly — the Yoni model is metaphorical."
          : obtained === 1
            ? "Some friction in the symbolic Yoni pairing. This dimension is least predictive of real-world chemistry."
            : "The Yoni pairing is traditionally classed as enemies. Awareness, not alarm.",
  };
}

// ── 5. Graha Maitri Koota (max 5) ──
function grahaMaitriKoota(a: BirthChart, b: BirthChart): KootaResult {
  const aR = RASHI_BY_NAME.get(a.rashi)!.ruler;
  const bR = RASHI_BY_NAME.get(b.rashi)!.ruler;
  const fromA = planetaryRelationship(aR, bR);
  const fromB = planetaryRelationship(bR, aR);
  // Score table per standard Panchang:
  //   self/self or friend/friend = 5
  //   friend/neutral or neutral/friend = 4
  //   neutral/neutral = 3
  //   friend/enemy or enemy/friend = 1
  //   neutral/enemy or enemy/neutral = 0.5
  //   enemy/enemy = 0
  let obtained = 0;
  const pair = [fromA, fromB].sort().join("|");
  if (pair === "friend|friend" || pair === "self|self") obtained = 5;
  else if (pair === "friend|self" || pair === "self|friend") obtained = 5;
  else if (pair === "friend|neutral" || pair === "neutral|friend") obtained = 4;
  else if (pair === "neutral|neutral") obtained = 3;
  else if (pair === "enemy|friend" || pair === "friend|enemy") obtained = 1;
  else if (pair === "enemy|neutral" || pair === "neutral|enemy") obtained = 0.5;
  else if (pair === "enemy|enemy") obtained = 0;
  else obtained = 3; // safety default

  return {
    key: "grahaMaitri",
    name: "Graha Maitri",
    plainName: "Mental & Intellectual Friendship",
    obtained,
    max: 5,
    status:
      obtained >= 4
        ? "favorable"
        : obtained >= 3
          ? "neutral"
          : obtained >= 1
            ? "partial"
            : "challenging",
    traditionalNote: `Moon-sign rulers: ${aR} ↔ ${bR}. Relationship: ${fromA}/${fromB}. ${obtained}/5 points.`,
    plainNote:
      obtained >= 4
        ? "Excellent intellectual rapport. One of the strongest factors for day-to-day mental harmony."
        : obtained >= 3
          ? "Neutral mental compatibility — neither friction nor amplification. Most couples land here."
          : obtained >= 1
            ? "Some friction in mental wavelength. Conscious communication helps."
            : "The Moon-sign rulers are mutually unfriendly. Effort is required to bridge mental styles.",
  };
}

// ── 6. Gana Koota (max 6) ──
function ganaKoota(a: BirthChart, b: BirthChart): KootaResult {
  const aG = a.nakshatra.gana;
  const bG = b.nakshatra.gana;
  let obtained = 0;
  if (aG === bG) obtained = 6;
  else if (
    (aG === "Deva" && bG === "Manushya") ||
    (aG === "Manushya" && bG === "Deva")
  )
    obtained = 5;
  else if (
    (aG === "Manushya" && bG === "Rakshasa") ||
    (aG === "Rakshasa" && bG === "Manushya")
  )
    obtained = 1;
  else obtained = 0; // Deva-Rakshasa
  return {
    key: "gana",
    name: "Gana",
    plainName: "Temperament & Behavior",
    obtained,
    max: 6,
    status:
      obtained === 6
        ? "favorable"
        : obtained === 5
          ? "favorable"
          : obtained === 1
            ? "partial"
            : "challenging",
    traditionalNote: `Gana: ${aG} ↔ ${bG}. ${obtained}/6 points.`,
    plainNote:
      obtained >= 5
        ? "Naturally aligned temperaments. Conflict styles, emotional rhythms, and life approaches harmonize."
        : obtained === 1
          ? "Different behavioral natures. Real-world impact depends heavily on each partner's self-awareness."
          : "Strong temperamental contrast. Tradition flags this; awareness and acceptance are the practical remedies.",
  };
}

// ── 7. Bhakoot Koota (max 7) ──
// Award 7 unless the Moon signs fall on a Bhakoot Dosha axis (2-12, 5-9,
// or 6-8). We measure the count distance both ways.
function bhakootKoota(a: BirthChart, b: BirthChart): KootaResult {
  const aPos = a.rashiId;
  const bPos = b.rashiId;
  const fwd = ((bPos - aPos) + 12) % 12; // 0..11
  const dist = fwd + 1; // count-from-A: 1..12 (1 = same sign)
  const distB = ((aPos - bPos + 12) % 12) + 1;
  const dosha = (d: number) =>
    d === 2 || d === 12 || d === 5 || d === 9 || d === 6 || d === 8;
  const present = dosha(dist) || dosha(distB);
  const obtained = present ? 0 : 7;
  return {
    key: "bhakoot",
    name: "Bhakoot",
    plainName: "Emotional Bonding & Prosperity",
    obtained,
    max: 7,
    status: present ? "challenging" : "favorable",
    traditionalNote: present
      ? `Moon signs ${a.rashi} and ${b.rashi} fall on a Bhakoot Dosha axis. 0/7.`
      : `Moon signs ${a.rashi} and ${b.rashi} do not form a Bhakoot Dosha axis. 7/7.`,
    plainNote: present
      ? "A traditional axis of friction — but this dimension is heavily weighted in the math, and many happy couples sit here."
      : "No Bhakoot Dosha. The Moon signs sit in a harmonious arrangement, supporting emotional warmth and shared prosperity.",
  };
}

// ── 8. Nadi Koota (max 8) — most important ──
function nadiKoota(a: BirthChart, b: BirthChart): KootaResult {
  const same = a.nakshatra.nadi === b.nakshatra.nadi;
  const obtained = same ? 0 : 8;
  return {
    key: "nadi",
    name: "Nadi",
    plainName: "Health & Genetic Harmony",
    obtained,
    max: 8,
    status: same ? "challenging" : "favorable",
    traditionalNote: same
      ? `Both partners share Nadi: ${a.nakshatra.nadi}. Nadi Dosha present. 0/8.`
      : `Different Nadis: ${a.nakshatra.nadi} ↔ ${b.nakshatra.nadi}. Full points.`,
    plainNote: same
      ? "Nadi Dosha is the most heavily weighted dimension in the system. It's traditionally associated with health considerations and often comes with cancellation conditions — see the dosha analysis below."
      : "Different Nadis indicate complementary physical constitutions. Tradition associates this with wellbeing and harmony.",
  };
}

// ── Doshas ──

function nadiDosha(a: BirthChart, b: BirthChart): DoshaResult {
  const present = a.nakshatra.nadi === b.nakshatra.nadi;
  const cancellationReasons: string[] = [];
  if (present) {
    if (a.rashi === b.rashi && a.nakshatra.id !== b.nakshatra.id) {
      cancellationReasons.push(
        "Same Moon sign but different Nakshatras — Nadi Dosha cancelled.",
      );
    }
    if (a.nakshatra.id === b.nakshatra.id && a.rashi !== b.rashi) {
      cancellationReasons.push(
        "Same Nakshatra but different Moon signs — Nadi Dosha cancelled.",
      );
    }
    if (a.nakshatra.id === b.nakshatra.id && a.pada !== b.pada) {
      cancellationReasons.push(
        "Same Nakshatra but different Padas — Nadi Dosha cancelled.",
      );
    }
  }
  return {
    key: "nadi",
    name: "Nadi Dosha",
    present,
    cancelled: present && cancellationReasons.length > 0,
    cancellationReasons,
    summary: !present
      ? `Different Nadis (${a.nakshatra.nadi} ↔ ${b.nakshatra.nadi}) — no Nadi Dosha. Full 8 points awarded.`
      : cancellationReasons.length > 0
        ? `Both partners share ${a.nakshatra.nadi} Nadi, but cancellation conditions apply. The dosha effect is considered neutralized.`
        : `Both partners share ${a.nakshatra.nadi} Nadi. No cancellation conditions found. Tradition associates this with health considerations.`,
    remedyNote:
      present && cancellationReasons.length === 0
        ? "Customary remedy: Nadi Nivaran Puja, performed by a family pandit. Many couples with this dosha have happy, healthy marriages — this is one input, not a verdict."
        : undefined,
  };
}

function bhakootDosha(a: BirthChart, b: BirthChart): DoshaResult {
  const aPos = a.rashiId;
  const bPos = b.rashiId;
  const dist = ((bPos - aPos + 12) % 12) + 1;
  const distB = ((aPos - bPos + 12) % 12) + 1;
  const dosha = (d: number) =>
    d === 2 || d === 12 || d === 5 || d === 9 || d === 6 || d === 8;
  const present = dosha(dist) || dosha(distB);
  const cancellationReasons: string[] = [];
  if (present) {
    // Standard parihars: same Rashi lord, or mutually friendly Rashi lords.
    const aRuler = RASHI_BY_NAME.get(a.rashi)!.ruler;
    const bRuler = RASHI_BY_NAME.get(b.rashi)!.ruler;
    if (aRuler === bRuler) {
      cancellationReasons.push(
        `Both Moon signs share the same lord (${aRuler}) — Bhakoot Dosha cancelled.`,
      );
    } else {
      const rel = planetaryRelationship(aRuler, bRuler);
      if (rel === "friend") {
        cancellationReasons.push(
          `Moon-sign lords ${aRuler} and ${bRuler} are mutual friends — Bhakoot Dosha cancelled.`,
        );
      }
    }
  }
  return {
    key: "bhakoot",
    name: "Bhakoot Dosha",
    present,
    cancelled: present && cancellationReasons.length > 0,
    cancellationReasons,
    summary: !present
      ? "Moon signs do not form a Bhakoot Dosha axis."
      : cancellationReasons.length > 0
        ? "Bhakoot Dosha is technically present but cancellation conditions apply. The dosha effect is considered neutralized."
        : "Moon signs form a Bhakoot Dosha axis (2-12, 5-9, or 6-8). Tradition associates this with friction in family/financial matters.",
    remedyNote:
      present && cancellationReasons.length === 0
        ? "If your family observes this tradition, a Vishnu Sahasranama recitation or Mahamrityunjaya Japa is the customary remedy."
        : undefined,
  };
}

function manglikDosha(_a: BirthChart, _b: BirthChart): DoshaResult {
  // Honest assessment: Manglik analysis requires Mars's house placement
  // across the full birth chart, which we don't compute (Moon-position-only
  // tool by design). We report this honestly rather than guessing.
  return {
    key: "manglik",
    name: "Manglik (Mangal) Dosha",
    present: false,
    cancelled: false,
    cancellationReasons: [],
    summary:
      "Manglik Dosha analysis requires Mars's exact house placement across both partners' birth charts — a calculation beyond the Moon-position scope of this tool. For a definitive Manglik assessment, consult an astrologer with both partners' full Janam Kundli charts.",
    remedyNote:
      "If Manglik status is a concern in your family, share both partners' birth details (date, time, place) with an astrologer — they'll compute Mars's bhava placement and any cancellation conditions like both-Manglik-cancellation, age-based cancellation, or specific aspect-based parihar.",
  };
}

// ── Tier classification ──
function classifyTier(total: number): {
  tier: ScoreTier;
  label: string;
  blurb: string;
} {
  if (total >= 32)
    return {
      tier: "exceptional",
      label: "Exceptional — A Celestial Match",
      blurb:
        "Extremely rare and highly auspicious. Strong harmony across nearly every dimension — emotional, mental, physical, and spiritual.",
    };
  if (total >= 25)
    return {
      tier: "excellent",
      label: "Excellent Match",
      blurb:
        "Very strong compatibility. Minor areas worth awareness, but the overall picture is overwhelmingly positive.",
    };
  if (total >= 18)
    return {
      tier: "good",
      label: "Good Compatibility",
      blurb:
        "A solid foundation. Most successful Vedic-matched marriages fall in this range. Specific dimensions benefit from understanding and conscious effort.",
    };
  if (total >= 12)
    return {
      tier: "manageable",
      label: "Manageable — With Awareness",
      blurb:
        "Below the traditional 18-point threshold but not a dealbreaker. Specific doshas may need attention. Many such matches succeed with consultation and remedy.",
    };
  return {
    tier: "challenging",
    label: "Challenging — Seek Guidance",
    blurb:
      "Significant compatibility gaps in the Vedic framework. A detailed consultation with an experienced astrologer is advised. Many happy marriages exist with low Guna scores — this is one input among many, not a verdict.",
  };
}

function buildSummary(
  partnerAName: string,
  _partnerBName: string,
  kootas: KootaResult[],
  total: number,
  tier: ReturnType<typeof classifyTier>,
  doshas: DoshaResult[],
): string {
  const strong = kootas
    .filter((k) => k.status === "favorable" && k.obtained / k.max >= 0.85)
    .sort((a, b) => b.max - a.max)
    .slice(0, 2);
  const weak = kootas
    .filter((k) => k.status !== "favorable" && k.obtained / k.max < 0.6)
    .sort((a, b) => b.max - a.max)
    .slice(0, 1);

  const activeDoshas = doshas.filter((d) => d.present && !d.cancelled && d.key !== "manglik");

  const strongPart = strong.length
    ? `The strongest dimensions are ${strong
        .map((s) => s.name + " (" + s.plainName.toLowerCase() + ")")
        .join(" and ")} — these tend to drive day-to-day harmony.`
    : "";

  const weakPart = weak.length
    ? ` The one area to be aware of is ${weak[0].name} (${weak[0].plainName.toLowerCase()}).`
    : "";

  const doshaPart = activeDoshas.length
    ? ` ${activeDoshas
        .map((d) => d.name + " is present without cancellation")
        .join(", ")} — review the dosha section for context and traditional remedies.`
    : " No active doshas were detected.";

  return `${partnerAName ? partnerAName + ", with" : "With"} a score of ${total} of 36, your Ashtakoota compatibility is in the ${tier.label.split("—")[0].trim()} range. ${strongPart}${weakPart}${doshaPart} As always, this is one meaningful input alongside everything else you know about your relationship.`;
}

export function calculateMatch(
  partnerA: BirthChart,
  partnerB: BirthChart,
  partnerAName = "",
  partnerBName = "",
): MatchResult {
  const kootas: KootaResult[] = [
    varnaKoota(partnerA, partnerB),
    vashyaKoota(partnerA, partnerB),
    taraKoota(partnerA, partnerB),
    yoniKoota(partnerA, partnerB),
    grahaMaitriKoota(partnerA, partnerB),
    ganaKoota(partnerA, partnerB),
    bhakootKoota(partnerA, partnerB),
    nadiKoota(partnerA, partnerB),
  ];
  const total = Math.round(
    kootas.reduce((sum, k) => sum + k.obtained, 0) * 10,
  ) / 10;
  const max = kootas.reduce((sum, k) => sum + k.max, 0); // 36
  const tierInfo = classifyTier(total);
  const doshas: DoshaResult[] = [
    nadiDosha(partnerA, partnerB),
    bhakootDosha(partnerA, partnerB),
    manglikDosha(partnerA, partnerB),
  ];

  return {
    partnerA,
    partnerB,
    partnerAName,
    partnerBName,
    kootas,
    total,
    max,
    tier: tierInfo.tier,
    tierLabel: tierInfo.label,
    tierBlurb: tierInfo.blurb,
    doshas,
    summary: buildSummary(
      partnerAName,
      partnerBName,
      kootas,
      total,
      tierInfo,
      doshas,
    ),
  };
}

// Re-export so callers can introspect.
export { RASHIS };

// Rashi compatibility derived from underlying Vedic dimensions:
// - Element (fire/earth/air/water): same element = harmony, opposite = challenge
// - Modality (chara/sthira/dvi-svabhava): different modalities help balance
// - Lord-planet friendship (Graha Maitri): planet relationships inform Rashi compat
// - Bhakoot (relative position): 6/8 and 9/5 placements have known stress
//
// This produces all 144 pairings without hand-writing every one.

export type Element = 'fire' | 'earth' | 'air' | 'water';
export type Modality = 'chara' | 'sthira' | 'dvi';

export type Rashi = {
  key: string;
  name: string;
  english: string;
  element: Element;
  modality: Modality;
  lord: string;
  // Friendly lords (Graha Maitri — natural friends in Vedic astrology).
  friends: string[];
  // Hostile lords (natural enemies).
  enemies: string[];
};

export const RASHIS: Rashi[] = [
  { key: 'mesh', name: 'Mesh', english: 'Aries', element: 'fire', modality: 'chara', lord: 'Mars', friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury'] },
  { key: 'vrishabha', name: 'Vrishabha', english: 'Taurus', element: 'earth', modality: 'sthira', lord: 'Venus', friends: ['Mercury', 'Saturn'], enemies: ['Sun', 'Moon'] },
  { key: 'mithuna', name: 'Mithuna', english: 'Gemini', element: 'air', modality: 'dvi', lord: 'Mercury', friends: ['Sun', 'Venus'], enemies: ['Moon'] },
  { key: 'karka', name: 'Karka', english: 'Cancer', element: 'water', modality: 'chara', lord: 'Moon', friends: ['Sun', 'Mercury'], enemies: ['Mars', 'Saturn'] },
  { key: 'simha', name: 'Simha', english: 'Leo', element: 'fire', modality: 'sthira', lord: 'Sun', friends: ['Mars', 'Jupiter', 'Moon'], enemies: ['Saturn', 'Venus'] },
  { key: 'kanya', name: 'Kanya', english: 'Virgo', element: 'earth', modality: 'dvi', lord: 'Mercury', friends: ['Sun', 'Venus'], enemies: ['Moon'] },
  { key: 'tula', name: 'Tula', english: 'Libra', element: 'air', modality: 'chara', lord: 'Venus', friends: ['Mercury', 'Saturn'], enemies: ['Sun', 'Moon'] },
  { key: 'vrishchika', name: 'Vrishchika', english: 'Scorpio', element: 'water', modality: 'sthira', lord: 'Mars', friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury'] },
  { key: 'dhanu', name: 'Dhanu', english: 'Sagittarius', element: 'fire', modality: 'dvi', lord: 'Jupiter', friends: ['Sun', 'Mars', 'Moon'], enemies: ['Venus', 'Mercury'] },
  { key: 'makara', name: 'Makara', english: 'Capricorn', element: 'earth', modality: 'chara', lord: 'Saturn', friends: ['Venus', 'Mercury'], enemies: ['Sun', 'Moon', 'Mars'] },
  { key: 'kumbha', name: 'Kumbha', english: 'Aquarius', element: 'air', modality: 'sthira', lord: 'Saturn', friends: ['Venus', 'Mercury'], enemies: ['Sun', 'Moon', 'Mars'] },
  { key: 'meena', name: 'Meena', english: 'Pisces', element: 'water', modality: 'dvi', lord: 'Jupiter', friends: ['Sun', 'Mars', 'Moon'], enemies: ['Venus', 'Mercury'] },
];

const ELEMENT_HARMONY: Record<Element, Record<Element, number>> = {
  fire: { fire: 4, earth: 2, air: 4, water: 2 },
  earth: { fire: 2, earth: 4, air: 2, water: 4 },
  air: { fire: 4, earth: 2, air: 4, water: 2 },
  water: { fire: 2, earth: 4, air: 2, water: 4 },
};

const ELEMENT_NOTES: Record<string, string> = {
  'fire-fire': 'Twin flames — passionate but combustible. Channel the heat into shared adventures, not arguments.',
  'fire-air': 'Air feeds fire. The most natural pairing — air partner makes fire bigger; fire partner makes air feel real.',
  'air-fire': 'Fire feeds on air. The most natural pairing — fire partner gives air ideas a reason to act.',
  'earth-earth': 'Solid as a fortress. The risk: getting too set in routine. Keep adventure on the calendar.',
  'earth-water': 'Water nourishes earth. Deep, slow-building intimacy. Patient love.',
  'water-earth': 'Earth contains water. Stability that lets emotion settle and grow.',
  'water-water': 'Deep mirrors — emotionally fluent but at risk of reinforcing each other\'s storms. Build outside support systems.',
  'air-air': 'A meeting of minds. Endless conversation. Don\'t forget to actually plan things — both of you avoid commitment.',
  'fire-earth': 'Friction across the divide — fire wants now, earth wants forever. Workable but requires both to translate.',
  'earth-fire': 'Friction across the divide — earth wants forever, fire wants now. Workable but requires both to translate.',
  'fire-water': 'Steam. Fire excites, water cools — sometimes a beautiful balance, sometimes mutual exhaustion.',
  'water-fire': 'Steam. Water cools, fire excites — sometimes a beautiful balance, sometimes mutual exhaustion.',
  'earth-air': 'Different operating systems. Earth wants tangible; air wants ideas. Bridge through shared projects.',
  'air-earth': 'Different operating systems. Air wants ideas; earth wants tangible. Bridge through shared projects.',
};

function modalityNote(a: Modality, b: Modality): string {
  if (a === b && a === 'chara')
    return 'Both initiators — lots of starts, fewer finishes. Designate who follows through on what.';
  if (a === b && a === 'sthira')
    return 'Both fixed — stable foundation, but resistant to change. Plan flexibility in deliberately.';
  if (a === b && a === 'dvi')
    return 'Both adaptable — endlessly accommodating, sometimes to a fault. Practice having opinions.';
  if (a !== b) return 'Complementary modalities — one of you initiates, one stabilizes, one adapts. Natural team dynamic.';
  return '';
}

function lordRelation(a: Rashi, b: Rashi): { score: number; note: string } {
  if (a.lord === b.lord)
    return { score: 3, note: `Both ruled by ${a.lord} — instant familiarity in temperament.` };
  if (a.friends.includes(b.lord) && b.friends.includes(a.lord))
    return { score: 3, note: `${a.lord} and ${b.lord} are natural friends — you share underlying values.` };
  if (a.enemies.includes(b.lord) || b.enemies.includes(a.lord))
    return { score: 1, note: `${a.lord} and ${b.lord} are traditional opposites — expect friction over priorities.` };
  return { score: 2, note: `${a.lord} and ${b.lord} are neutral — no built-in pull or push.` };
}

function rashiDistance(aIdx: number, bIdx: number): number {
  // 1-indexed Vedic distance: from rashi A to rashi B clockwise.
  return ((bIdx - aIdx + 12) % 12) + 1;
}

function bhakootNote(distA: number): string | null {
  // 6/8 and 5/9 (and 2/12) placements are stressful in Bhakoot.
  if (distA === 6 || distA === 8) return 'Bhakoot stress (6/8 placement) — can bring health and finance friction. Manage with shared calendars.';
  if (distA === 5 || distA === 9) return 'Bhakoot stress (5/9 placement) — values and family dynamics may clash. Talk often.';
  if (distA === 2 || distA === 12) return 'Adjacent placement — small daily-life mismatches add up. Communicate the small stuff.';
  if (distA === 1) return 'Same rashi — a comfortable mirror.';
  if (distA === 7) return 'Direct opposite — magnetic attraction with built-in tension. The classic spicy pairing.';
  return null;
}

export type CompatResult = {
  score: number; // 1–5
  summary: string;
  strengths: string[];
  watch: string[];
  details: { lordNote: string; modalityNote: string; bhakootNote: string | null };
};

export function checkCompat(aKey: string, bKey: string): CompatResult | null {
  const aIdx = RASHIS.findIndex((r) => r.key === aKey);
  const bIdx = RASHIS.findIndex((r) => r.key === bKey);
  if (aIdx < 0 || bIdx < 0) return null;
  const a = RASHIS[aIdx]!;
  const b = RASHIS[bIdx]!;

  const elementScore = ELEMENT_HARMONY[a.element][b.element];
  const elementNote =
    ELEMENT_NOTES[`${a.element}-${b.element}`] ?? '';
  const lord = lordRelation(a, b);
  const modNote = modalityNote(a.modality, b.modality);

  const distA = rashiDistance(aIdx, bIdx);
  const bNote = bhakootNote(distA);
  const bhakootPenalty = bNote && (distA === 6 || distA === 8) ? -1 : 0;

  // Combine: element (1-4) + lord (1-3) → 2-7 → normalize to 1-5 stars
  const raw = elementScore + lord.score + bhakootPenalty;
  const score = Math.min(5, Math.max(1, Math.round((raw / 7) * 5)));

  const strengths: string[] = [];
  const watch: string[] = [];

  if (elementScore >= 4) strengths.push(elementNote);
  else watch.push(elementNote);

  if (lord.score >= 3) strengths.push(lord.note);
  else if (lord.score === 1) watch.push(lord.note);

  if (a.modality !== b.modality) strengths.push(modNote);
  else if (modNote) watch.push(modNote);

  if (bNote && (distA === 7 || distA === 1)) strengths.push(bNote);
  else if (bNote) watch.push(bNote);

  let summary: string;
  if (score >= 5)
    summary = `${a.name} and ${b.name} pair beautifully — element, modality, and planetary lords all line up.`;
  else if (score === 4)
    summary = `${a.name} and ${b.name} are a strong match with one or two areas to navigate consciously.`;
  else if (score === 3)
    summary = `${a.name} and ${b.name} have real chemistry but also real differences. Workable with self-awareness.`;
  else if (score === 2)
    summary = `${a.name} and ${b.name} face structural friction. Many couples make this work — it just takes more deliberate effort.`;
  else
    summary = `${a.name} and ${b.name} have significant differences across multiple dimensions. Worth a deeper Kundli analysis before drawing conclusions.`;

  return {
    score,
    summary,
    strengths,
    watch,
    details: { lordNote: lord.note, modalityNote: modNote, bhakootNote: bNote },
  };
}

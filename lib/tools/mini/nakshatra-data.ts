// Traditional 27 Nakshatras × 4 padas = 108 syllables. Each syllable is the
// transliterated romanization commonly used for Hindi/Sanskrit baby naming.
// Used by Name → Nakshatra and (later) Moon Sign tools.

export type Nakshatra = {
  key: string;
  name: string;
  rashi: string; // Moon sign
  ruler: string; // Ruling planet
  deity: string;
  meaning: string;
  // Lowercase, normalized syllables for first-syllable matching.
  syllables: string[];
};

export const NAKSHATRAS: Nakshatra[] = [
  { key: 'ashwini', name: 'Ashwini', rashi: 'Mesh (Aries)', ruler: 'Ketu', deity: 'Ashwini Kumaras', meaning: 'The horse-headed twins — healers, swift movers.', syllables: ['chu', 'che', 'cho', 'la'] },
  { key: 'bharani', name: 'Bharani', rashi: 'Mesh (Aries)', ruler: 'Venus', deity: 'Yama', meaning: 'The bearer — discipline, transformation.', syllables: ['li', 'lu', 'le', 'lo'] },
  { key: 'krittika', name: 'Krittika', rashi: 'Mesh / Vrishabha', ruler: 'Sun', deity: 'Agni', meaning: 'The cutter — sharp intellect, fiery focus.', syllables: ['a', 'ee', 'u', 'ay'] },
  { key: 'rohini', name: 'Rohini', rashi: 'Vrishabha (Taurus)', ruler: 'Moon', deity: 'Brahma', meaning: 'The reddish one — beauty, fertility, growth.', syllables: ['o', 'va', 'vi', 'vu'] },
  { key: 'mrigashira', name: 'Mrigashira', rashi: 'Vrishabha / Mithuna', ruler: 'Mars', deity: 'Soma', meaning: 'The deer-head — searching, gentle curiosity.', syllables: ['ve', 'vo', 'ka', 'ki'] },
  { key: 'ardra', name: 'Ardra', rashi: 'Mithuna (Gemini)', ruler: 'Rahu', deity: 'Rudra', meaning: 'The moist one — storms, transformation.', syllables: ['ku', 'gha', 'nga', 'chha'] },
  { key: 'punarvasu', name: 'Punarvasu', rashi: 'Mithuna / Karka', ruler: 'Jupiter', deity: 'Aditi', meaning: 'Return of the light — renewal, optimism.', syllables: ['ke', 'ko', 'ha', 'hi'] },
  { key: 'pushya', name: 'Pushya', rashi: 'Karka (Cancer)', ruler: 'Saturn', deity: 'Brihaspati', meaning: 'The nourisher — wisdom, support, the most auspicious nakshatra.', syllables: ['hu', 'he', 'ho', 'da'] },
  { key: 'ashlesha', name: 'Ashlesha', rashi: 'Karka (Cancer)', ruler: 'Mercury', deity: 'Nagas', meaning: 'The embracer — intuition, mystery, hidden power.', syllables: ['di', 'du', 'de', 'do'] },
  { key: 'magha', name: 'Magha', rashi: 'Simha (Leo)', ruler: 'Ketu', deity: 'Pitris (ancestors)', meaning: 'The mighty — royalty, lineage, ancestral pride.', syllables: ['ma', 'mi', 'mu', 'me'] },
  { key: 'purva-phalguni', name: 'Purva Phalguni', rashi: 'Simha (Leo)', ruler: 'Venus', deity: 'Bhaga', meaning: 'The first reddish one — pleasure, love, leisure.', syllables: ['mo', 'ta', 'ti', 'tu'] },
  { key: 'uttara-phalguni', name: 'Uttara Phalguni', rashi: 'Simha / Kanya', ruler: 'Sun', deity: 'Aryaman', meaning: 'The latter reddish one — partnership, contracts.', syllables: ['te', 'to', 'pa', 'pi'] },
  { key: 'hasta', name: 'Hasta', rashi: 'Kanya (Virgo)', ruler: 'Moon', deity: 'Savitur', meaning: 'The hand — skill, craftsmanship, manifestation.', syllables: ['pu', 'sha', 'na', 'tha'] },
  { key: 'chitra', name: 'Chitra', rashi: 'Kanya / Tula', ruler: 'Mars', deity: 'Vishwakarma', meaning: 'The brilliant — beauty, art, design.', syllables: ['pe', 'po', 'ra', 'ri'] },
  { key: 'swati', name: 'Swati', rashi: 'Tula (Libra)', ruler: 'Rahu', deity: 'Vayu', meaning: 'The independent one — freedom, movement, balance.', syllables: ['ru', 're', 'ro', 'ta'] },
  { key: 'vishakha', name: 'Vishakha', rashi: 'Tula / Vrishchika', ruler: 'Jupiter', deity: 'Indra-Agni', meaning: 'The forked branch — purposeful pursuit.', syllables: ['ti', 'tu', 'te', 'to'] },
  { key: 'anuradha', name: 'Anuradha', rashi: 'Vrishchika (Scorpio)', ruler: 'Saturn', deity: 'Mitra', meaning: 'Following Radha — friendship, devotion, loyalty.', syllables: ['na', 'ni', 'nu', 'ne'] },
  { key: 'jyeshtha', name: 'Jyeshtha', rashi: 'Vrishchika (Scorpio)', ruler: 'Mercury', deity: 'Indra', meaning: 'The eldest — authority, protection, seniority.', syllables: ['no', 'ya', 'yi', 'yu'] },
  { key: 'mula', name: 'Mula', rashi: 'Dhanu (Sagittarius)', ruler: 'Ketu', deity: 'Nirriti', meaning: 'The root — getting to the bottom of things.', syllables: ['ye', 'yo', 'bha', 'bhi'] },
  { key: 'purva-ashadha', name: 'Purva Ashadha', rashi: 'Dhanu (Sagittarius)', ruler: 'Venus', deity: 'Apas (waters)', meaning: 'The early invincible — purification, victory.', syllables: ['bhu', 'dha', 'pha', 'dha'] },
  { key: 'uttara-ashadha', name: 'Uttara Ashadha', rashi: 'Dhanu / Makara', ruler: 'Sun', deity: 'Vishvedevas', meaning: 'The later invincible — final victory, lasting work.', syllables: ['bhe', 'bho', 'ja', 'ji'] },
  { key: 'shravana', name: 'Shravana', rashi: 'Makara (Capricorn)', ruler: 'Moon', deity: 'Vishnu', meaning: 'The listener — learning, connection, communication.', syllables: ['khi', 'khu', 'khe', 'kho'] },
  { key: 'dhanishta', name: 'Dhanishta', rashi: 'Makara / Kumbha', ruler: 'Mars', deity: 'Eight Vasus', meaning: 'The wealthiest — abundance, music, rhythm.', syllables: ['ga', 'gi', 'gu', 'ge'] },
  { key: 'shatabhisha', name: 'Shatabhisha', rashi: 'Kumbha (Aquarius)', ruler: 'Rahu', deity: 'Varuna', meaning: 'The hundred healers — secrecy, healing, mysticism.', syllables: ['go', 'sa', 'si', 'su'] },
  { key: 'purva-bhadrapada', name: 'Purva Bhadrapada', rashi: 'Kumbha / Meena', ruler: 'Jupiter', deity: 'Aja Ekapada', meaning: 'The early auspicious feet — fierce intensity.', syllables: ['se', 'so', 'da', 'di'] },
  { key: 'uttara-bhadrapada', name: 'Uttara Bhadrapada', rashi: 'Meena (Pisces)', ruler: 'Saturn', deity: 'Ahirbudhnya', meaning: 'The later auspicious feet — depth, wisdom, calm.', syllables: ['du', 'tha', 'jha', 'ya'] },
  { key: 'revati', name: 'Revati', rashi: 'Meena (Pisces)', ruler: 'Mercury', deity: 'Pushan', meaning: 'The wealthy one — completion, safe passage.', syllables: ['de', 'do', 'cha', 'chi'] },
];

// Normalize first 1–3 letters of a name to one of our syllables.
function normalize(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

export function findNakshatraForName(name: string): Nakshatra | null {
  const n = normalize(name);
  if (!n) return null;

  // Try 3-char, 2-char, 1-char prefix matches in order. Diphthongs come first.
  for (const len of [3, 2, 1]) {
    if (n.length < len) continue;
    const prefix = n.slice(0, len);
    for (const nak of NAKSHATRAS) {
      if (nak.syllables.includes(prefix)) return nak;
    }
  }

  // Fallback — try matching just the first vowel/cluster.
  const first = n[0];
  for (const nak of NAKSHATRAS) {
    if (nak.syllables.some((s) => s.startsWith(first!))) return nak;
  }
  return null;
}

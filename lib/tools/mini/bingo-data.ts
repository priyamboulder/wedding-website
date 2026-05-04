// Wedding bingo item pool. Mix of universal + South-Asian-specific +
// personalizable squares. Items are drawn at random for each card.

export type BingoCeremony = 'hindu' | 'sikh' | 'muslim' | 'fusion' | 'western';

const UNIVERSAL: string[] = [
  'Someone cries during the ceremony',
  'A toast goes too long',
  'Someone requests a song the DJ doesn\'t have',
  'Kids run wild on the dance floor',
  'Someone says "you\'re next!"',
  'Aunty takes too many photos',
  'Someone\'s phone rings during the ceremony',
  'Speech makes someone cry',
  'Cake is cut at the wrong moment',
  'Best man tells embarrassing story',
  'Someone gives unsolicited marriage advice',
  'Power flickers',
  'Open bar runs out of one specific liquor',
  'Surprise dance number',
];

const SOUTH_ASIAN: string[] = [
  'Someone adjusts the groom\'s sehra',
  'Aunty comments on the food',
  'Uncle requests one more song during baraat',
  'Someone says "ladka kitna achha hai"',
  'Mehndi smudge spotted',
  'Guest asks "when\'s the food?"',
  'Someone falls asleep during the ceremony',
  'Dupatta adjustment emergency',
  'Baraat runs 20 minutes late',
  'Someone dances to Kala Chashma',
  'Guest asks bride "are you nervous?"',
  'Pandit pauses for "translation"',
  'Two aunties wear the same lehenga',
  'A cousin films TikTok during pheras',
  'Someone declares the food "better than the last wedding"',
  'Dhol player gets a tip',
  'Bhangra circle forms',
  'Nani wants to leave at 10 PM',
  'Someone asks where the bar is at the ceremony',
];

const PERSONALIZED_TEMPLATES = [
  '{A} tears up during vows',
  "{B}'s mom cries",
  'Someone mispronounces {LAST}',
  '{A} forgets a step',
  '{B} adjusts the {A} dupatta',
];

function applyTemplate(
  template: string,
  nameA: string,
  nameB: string,
  lastName: string,
): string {
  return template
    .replace(/\{A\}/g, nameA || 'the bride')
    .replace(/\{B\}/g, nameB || 'the partner')
    .replace(/\{LAST\}/g, lastName || 'the last name');
}

// Pseudo-random shuffle seeded by the card index so cards are deterministic
// (re-renders don't reshuffle), but distinct across the set.
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function buildCard(
  index: number,
  ceremony: BingoCeremony,
  nameA: string,
  nameB: string,
  lastName: string,
): string[] {
  const pool: string[] = [...UNIVERSAL];
  if (ceremony !== 'western') pool.push(...SOUTH_ASIAN);

  // Add 1-2 personalized squares per card if names provided
  const hasPersonal = nameA || nameB || lastName;
  if (hasPersonal) {
    const personalCount = Math.min(2, PERSONALIZED_TEMPLATES.length);
    const shuffledTemplates = seededShuffle(
      PERSONALIZED_TEMPLATES,
      index * 7 + 1,
    );
    for (let i = 0; i < personalCount; i++) {
      pool.push(
        applyTemplate(shuffledTemplates[i]!, nameA, nameB, lastName),
      );
    }
  }

  const shuffled = seededShuffle(pool, index * 31 + 17);
  // 24 squares + 1 FREE in the center
  const cells: string[] = [];
  for (let i = 0; i < 25; i++) {
    if (i === 12) cells.push('FREE');
    else cells.push(shuffled[cells.length] ?? 'FREE');
  }
  return cells;
}

// Warm, slightly funny copy for small moments inside the workspace.
// The fun friend who is ALSO incredibly organized.

export const emptyStates = {
  checklist: {
    title: 'Every wedding starts somewhere.',
    body: 'Your first task is right here.',
  },
  vendors: {
    title: 'Your dream team is out there.',
    body: "Let's find them.",
    scrawl: "try the vendor roulette — it's weirdly fun",
  },
  workspaces: {
    title: 'Not sure where to start?',
    body: "That's literally what the quiz is for.",
  },
  guests: {
    title: 'No guests yet.',
    body: 'Enjoy the silence while it lasts.',
  },
  registry: {
    title: 'No gifts yet.',
    body: 'But shagun season is coming.',
  },
  studio: {
    title: 'Your wedding brand starts',
    body: 'with a single monogram.',
  },
  community: {
    title: 'Welcome to The Planning Circle.',
    body: 'These brides get it.',
  },
} as const;

export const aiSuggestions = [
  'Compare 3 florists for mandap decor by end of month',
  'Psst — your photography workspace quiz only takes 90 seconds',
  "3 vendors haven't responded in 5 days. Nudge them?",
  'Your guest list just hit 300. Time to tell the caterer?',
  "You've been in Phase 1 for 2 weeks. Ready to move to Branding & Identity?",
  "The Sharma family still isn't on the list. Your mom will notice.",
  'Add the Sharma family — 4 people, groom\u2019s side, Jaipur',
] as const;

export type Celebration = {
  title: string;
  body: string;
};

export const celebrations = {
  phaseComplete: (phaseName: string, phaseNumber: number, total = 13): Celebration => ({
    title: `${phaseName} \u2014 done.`,
    body: `That\u2019s ${phaseNumber} of ${total}. You\u2019re flying.`,
  }),
  vendorBooked: (vendorName: string): Celebration => ({
    title: `${vendorName} is officially on the team.`,
    body: 'One less thing to worry about.',
  }),
  halfRsvp: (): Celebration => ({
    title: 'Half your guests have confirmed.',
    body: 'The aunties are committed.',
  }),
  firstPin: (): Celebration => ({
    title: 'Your first pin.',
    body: 'The moodboard era begins.',
  }),
  briefGenerated: (): Celebration => ({
    title: 'The Brief is ready.',
    body: 'Your vendor is about to be very impressed.',
  }),
} as const;

export const loadingMessages = [
  'Crunching your checklist\u2026',
  'Finding your vendors\u2026',
  'Building your brief\u2026',
  'Preparing your moodboard\u2026',
] as const;

export const loadingGuests = (count: number) =>
  `Loading your guest list\u2026 all ${count} of them`;

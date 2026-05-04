export type EditorialTab =
  | 'editorial'
  | 'real-weddings'
  | 'magazine'
  | 'confessional'
  | 'grapevine';

export type ArticleCategory =
  | 'Planning Tips'
  | 'Style & Inspiration'
  | 'Culture & Traditions'
  | 'Vendor Spotlights'
  | 'Budgeting'
  | 'Family Dynamics';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  readingTime: string;
  date: string;
  author: string;
  featured?: boolean;
  scrawl?: string;
  gradientColors: [string, string];
}

export interface RealWedding {
  id: string;
  coupleNames: string;
  summary: string;
  events: string[];
  scrawl?: string;
  gradientColors: [string, string];
}

export interface MagazineIssue {
  id: string;
  title: string;
  issueNumber: string;
  date: string;
  pageCount: number;
  articleCount: number;
  description: string;
  coverTeasers: string[];
  gradientColors: [string, string];
}

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  'Planning Tips',
  'Style & Inspiration',
  'Culture & Traditions',
  'Vendor Spotlights',
  'Budgeting',
  'Family Dynamics',
];

export const ARTICLES: Article[] = [
  {
    id: 'caterer-multi-day-menus',
    title: 'What your caterer wishes you knew about multi-day menus',
    excerpt:
      "Four ceremonies, four menus. How to brief a caterer so the mehndi lunch doesn't feel like a dress rehearsal for the reception.",
    category: 'Planning Tips',
    readingTime: '9 MIN',
    date: 'APRIL 2026',
    author: 'Naina Reddy',
    featured: true,
    scrawl: 'this one went viral for a reason',
    gradientColors: ['#993556', '#4B1528'],
  },
  {
    id: 'sangeet-set-list',
    title: 'The anatomy of a great sangeet set list',
    excerpt:
      "Why the song order matters more than the songs. A choreographer's framework for keeping the floor full from the first dhol to the last drop.",
    category: 'Style & Inspiration',
    readingTime: '7 MIN',
    date: 'APRIL 2026',
    author: 'Tara Mehta',
    scrawl: 'bookmark this one',
    gradientColors: ['#FBEAF0', '#D4537E'],
  },
  {
    id: 'invite-them-conversation',
    title: "Navigating the 'but we have to invite them' conversation",
    excerpt:
      "The guest list isn't a math problem — it's a diplomacy exercise. Scripts and boundaries for the conversations nobody warns you about.",
    category: 'Family Dynamics',
    readingTime: '6 MIN',
    date: 'MARCH 2026',
    author: 'Priya Iyer',
    scrawl: 'your mom needs to read this',
    gradientColors: ['#E0D0F0', '#8A6070'],
  },
  {
    id: 'photographer-brief-not-pinterest',
    title: 'Why your photographer needs a brief, not a Pinterest board',
    excerpt:
      "A photographer can't shoot mood. They can shoot moments. Here's how to translate everything you saved into something they can actually deliver.",
    category: 'Vendor Spotlights',
    readingTime: '8 MIN',
    date: 'MARCH 2026',
    author: 'Aman Kapoor',
    gradientColors: ['#F5E6C8', '#D4A853'],
  },
  {
    id: 'destination-rajasthan-2026',
    title: 'The real cost of a destination wedding in Rajasthan (2026)',
    excerpt:
      'Line-itemed, vendor-by-vendor, from a planner who has booked Suryagarh seven times. The numbers nobody puts on a brochure.',
    category: 'Budgeting',
    readingTime: '12 MIN',
    date: 'MARCH 2026',
    author: 'Rhea Bhandari',
    scrawl: 'spreadsheet inside',
    gradientColors: ['#FFD8B8', '#993556'],
  },
  {
    id: 'haldi-home-vs-venue',
    title: "Haldi at home vs. venue: what nobody tells you",
    excerpt:
      'The most photographed ceremony of the week is also the most underplanned. Why where you do it changes everything from the lighting to the laundry.',
    category: 'Culture & Traditions',
    readingTime: '5 MIN',
    date: 'FEBRUARY 2026',
    author: 'Meher Singh',
    gradientColors: ['#F5E6C8', '#D4A853'],
  },
  {
    id: 'mil-no-traditional-mandap',
    title: "How to tell your MIL you don't want a traditional mandap",
    excerpt:
      "Spoiler: it's not a fight, it's a translation. The framing that turns 'we don't want one' into 'here's what we want instead.'",
    category: 'Family Dynamics',
    readingTime: '7 MIN',
    date: 'FEBRUARY 2026',
    author: 'Priya Iyer',
    scrawl: "screenshot this",
    gradientColors: ['#FBEAF0', '#8A6070'],
  },
  {
    id: 'questions-decorator-forgets',
    title: 'The 10 questions every bride forgets to ask her decorator',
    excerpt:
      "What time do they actually start? Who lights the diyas? When does the mandap come down? The unsexy questions that decide how the day feels.",
    category: 'Planning Tips',
    readingTime: '6 MIN',
    date: 'FEBRUARY 2026',
    author: 'Naina Reddy',
    scrawl: "save this for the call",
    gradientColors: ['#C8EDDA', '#4B1528'],
  },
  {
    id: 'film-vs-digital-photographer',
    title: "Film vs. digital: a photographer's honest take for 2026 weddings",
    excerpt:
      "Film looks beautiful on Instagram. It also costs three times as much and takes six weeks to deliver. A working photographer on when each is worth it.",
    category: 'Vendor Spotlights',
    readingTime: '10 MIN',
    date: 'JANUARY 2026',
    author: 'Aman Kapoor',
    gradientColors: ['#C8DFF5', '#4B1528'],
  },
  {
    id: 'wedding-brand-feels-like-you',
    title: 'Building a wedding brand that actually feels like you',
    excerpt:
      "Not a logo. A point of view. How to brief invites, signage, and stationery so the whole week speaks the same language.",
    category: 'Style & Inspiration',
    readingTime: '8 MIN',
    date: 'JANUARY 2026',
    author: 'Tara Mehta',
    gradientColors: ['#E0D0F0', '#D4537E'],
  },
  {
    id: 'mehndi-not-small-event',
    title: "The mehndi is not a 'small event' — here's how to plan it",
    excerpt:
      "Five hours, two hundred guests, one bride who can't move her hands. Why the mehndi quietly outscales every other day if you let it.",
    category: 'Culture & Traditions',
    readingTime: '7 MIN',
    date: 'DECEMBER 2025',
    author: 'Meher Singh',
    scrawl: 'plan it like a wedding',
    gradientColors: ['#FFD8B8', '#D4A853'],
  },
  {
    id: 'wedding-budgets-real-data',
    title: 'Wedding budgets: what Indian couples actually spend (real data)',
    excerpt:
      'We pulled anonymized numbers from 400 Marigold weddings. The averages, the outliers, and the categories everyone underestimates.',
    category: 'Budgeting',
    readingTime: '11 MIN',
    date: 'DECEMBER 2025',
    author: 'Rhea Bhandari',
    scrawl: 'the spreadsheet you wanted',
    gradientColors: ['#4B1528', '#D4A853'],
  },
];

export const REAL_WEDDINGS: RealWedding[] = [
  {
    id: 'priya-arjun',
    coupleNames: 'Priya & Arjun',
    summary: 'December 2026 · The Leela Palace, Udaipur · 300 guests',
    events: ['Haldi', 'Mehendi', 'Sangeet', 'Ceremony', 'Reception'],
    scrawl: 'the mandap alone is worth the click',
    gradientColors: ['#993556', '#D4A853'],
  },
  {
    id: 'aisha-kabir',
    coupleNames: 'Aisha & Kabir',
    summary: 'March 2026 · Taj Falaknuma, Hyderabad · 200 guests',
    events: ['Nikkah', 'Walima', 'Reception'],
    scrawl: 'the walima table setting — chef\'s kiss',
    gradientColors: ['#F5E6C8', '#4B1528'],
  },
  {
    id: 'meera-dev',
    coupleNames: 'Meera & Dev',
    summary: 'February 2026 · Suryagarh, Jaisalmer · 150 guests',
    events: ['Pithi', 'Sangeet', 'Ceremony'],
    gradientColors: ['#FFD8B8', '#993556'],
  },
  {
    id: 'ananya-rohan',
    coupleNames: 'Ananya & Rohan',
    summary: 'November 2025 · Four Seasons, Mumbai · 450 guests',
    events: ['Haldi', 'Mehendi', 'Sangeet', 'Ceremony', 'Reception', 'After-party'],
    scrawl: 'wait till you see the sangeet outfits',
    gradientColors: ['#FBEAF0', '#D4537E'],
  },
  {
    id: 'zara-aditya',
    coupleNames: 'Zara & Aditya',
    summary: 'January 2026 · Private Villa, Goa · 80 guests',
    events: ['Welcome Dinner', 'Ceremony', 'Beach Party'],
    scrawl: 'small. perfect. unbothered.',
    gradientColors: ['#C8DFF5', '#8A6070'],
  },
  {
    id: 'simran-jai',
    coupleNames: 'Simran & Jai',
    summary: 'April 2026 · Umaid Bhawan, Jodhpur · 250 guests',
    events: ['Pithi', 'Haldi', 'Sangeet', 'Ceremony', 'Reception'],
    scrawl: 'umaid bhawan in monsoon — yes, really',
    gradientColors: ['#E0D0F0', '#4B1528'],
  },
];

export const MAGAZINE_ISSUES: MagazineIssue[] = [
  {
    id: 'summer-issue',
    title: 'The Summer Issue',
    issueNumber: 'ISSUE 03',
    date: 'JUNE 2026',
    pageCount: 84,
    articleCount: 12,
    description:
      'Long-form reporting on the weddings, vendors, and conversations defining the season — plus the visual essays you\'ll come back to.',
    coverTeasers: [
      'Inside a 3-day Udaipur celebration',
      'The rise of the anti-mandap',
      '12 caterers redefining the plate',
      "Real talk: what vendors won't say on a call",
    ],
    gradientColors: ['#993556', '#D4A853'],
  },
  {
    id: 'first-look',
    title: 'The First Look',
    issueNumber: 'ISSUE 02',
    date: 'MARCH 2026',
    pageCount: 72,
    articleCount: 10,
    description:
      'Photography, outfits, and the rhythm of the wedding week — a love letter to the moments most magazines miss.',
    coverTeasers: [
      "Photography trends that aren't trends",
      "A bride's guide to actually enjoying her own wedding",
      'The outfit timeline nobody gives you',
    ],
    gradientColors: ['#4B1528', '#E0D0F0'],
  },
  {
    id: 'issue-one',
    title: 'Issue One',
    issueNumber: 'ISSUE 01',
    date: 'DECEMBER 2025',
    pageCount: 64,
    articleCount: 8,
    description:
      'Where it began. The founding manifesto, the first features, and the vendors that taught us what good actually looks like.',
    coverTeasers: [
      'Why we built The Marigold',
      'The brief that changed everything',
      "Meet the vendors we can't stop recommending",
    ],
    gradientColors: ['#FBEAF0', '#993556'],
  },
];

export const LIVE_EVENT: { active: boolean; speaker: string; topic: string } = {
  active: true,
  speaker: 'Marcy Blum',
  topic: 'Ask Marcy Blum anything — join now',
};

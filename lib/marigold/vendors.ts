export type VendorCategory =
  | 'Photography'
  | 'Décor & Florals'
  | 'HMUA'
  | 'Catering'
  | 'Entertainment'
  | 'Wardrobe'
  | 'Stationery'
  | 'Venues'
  | 'Videography'
  | 'Mehendi'
  | 'Cake & Sweets';

export type VendorBadge = 'top-match' | 'rising-star';

export type TravelAvailability =
  | 'Local only'
  | 'Travels regionally'
  | 'Travels nationally'
  | 'Destination';

export interface PublicVendor {
  id: string;
  name: string;
  category: VendorCategory;
  specialty: string;
  city: string;
  travelAvailability: TravelAvailability;
  styleTags: string[];
  badge?: VendorBadge;
  scrawl?: string;
  gradientColors: [string, string];
}

export const VENDOR_CATEGORIES: VendorCategory[] = [
  'Photography',
  'Décor & Florals',
  'HMUA',
  'Catering',
  'Entertainment',
  'Wardrobe',
  'Stationery',
  'Venues',
  'Videography',
  'Mehendi',
  'Cake & Sweets',
];

export const VENDORS: PublicVendor[] = [
  {
    id: 'aarav-kapoor-photography',
    name: 'Aarav Kapoor Photography',
    category: 'Photography',
    specialty: 'Cinematic & editorial wedding photography',
    city: 'Mumbai',
    travelAvailability: 'Travels nationally',
    styleTags: ['editorial', 'film-grain', 'moody'],
    badge: 'top-match',
    scrawl: '3 month waitlist',
    gradientColors: ['#FBEAF0', '#FFD8B8'],
  },
  {
    id: 'lensbloom-studio',
    name: 'Lensbloom Studio',
    category: 'Photography',
    specialty: 'Documentary-style storytelling, candid first',
    city: 'Delhi',
    travelAvailability: 'Travels nationally',
    styleTags: ['candid', 'documentary', 'warm'],
    gradientColors: ['#FFD8B8', '#F5E6C8'],
  },
  {
    id: 'mira-and-co',
    name: 'Mira & Co.',
    category: 'Photography',
    specialty: 'Bridal portraiture with painterly tones',
    city: 'London',
    travelAvailability: 'Destination',
    styleTags: ['portraiture', 'painterly', 'romantic'],
    badge: 'rising-star',
    gradientColors: ['#E0D0F0', '#FBEAF0'],
  },

  {
    id: 'bloom-and-petal',
    name: 'Bloom & Petal Co.',
    category: 'Décor & Florals',
    specialty: 'Luxury mandap design and floral installations',
    city: 'Jaipur',
    travelAvailability: 'Travels nationally',
    styleTags: ['luxury', 'traditional', 'grand'],
    badge: 'top-match',
    scrawl: 'brides are obsessed',
    gradientColors: ['#E0D0F0', '#C4A8E0'],
  },
  {
    id: 'wildflower-decor',
    name: 'Wildflower Décor Co.',
    category: 'Décor & Florals',
    specialty: 'Garden-inspired florals & whimsical mandaps',
    city: 'Udaipur',
    travelAvailability: 'Travels regionally',
    styleTags: ['whimsical', 'garden', 'soft-pastel'],
    gradientColors: ['#C8EDDA', '#F5E6C8'],
  },
  {
    id: 'marigold-house',
    name: 'Marigold House',
    category: 'Décor & Florals',
    specialty: 'Modern minimal stages with maximalist florals',
    city: 'Mumbai',
    travelAvailability: 'Travels nationally',
    styleTags: ['minimal', 'sculptural', 'modern'],
    scrawl: 'booked through 2027',
    gradientColors: ['#FFD8B8', '#FBEAF0'],
  },

  {
    id: 'soha-beauty-atelier',
    name: 'Soha Beauty Atelier',
    category: 'HMUA',
    specialty: 'Soft glam bridal with natural skin finishes',
    city: 'Delhi',
    travelAvailability: 'Travels regionally',
    styleTags: ['soft-glam', 'natural-skin', 'modern-bride'],
    badge: 'rising-star',
    gradientColors: ['#FBEAF0', '#E0D0F0'],
  },
  {
    id: 'kohl-and-rouge',
    name: 'Kohl & Rouge',
    category: 'HMUA',
    specialty: 'Editorial bridal looks for camera-first weddings',
    city: 'Mumbai',
    travelAvailability: 'Destination',
    styleTags: ['editorial', 'high-glam', 'bold'],
    badge: 'top-match',
    scrawl: 'her IG is unreal',
    gradientColors: ['#FFD8B8', '#FBEAF0'],
  },
  {
    id: 'roop-bridal',
    name: 'Roop Bridal',
    category: 'HMUA',
    specialty: 'Traditional South Asian bridal artistry',
    city: 'Toronto',
    travelAvailability: 'Travels nationally',
    styleTags: ['traditional', 'classic', 'red-lip'],
    gradientColors: ['#F5E6C8', '#FFD8B8'],
  },

  {
    id: 'spice-route-catering',
    name: 'Spice Route Catering',
    category: 'Catering',
    specialty: 'Pan-Indian menus with regional specialty stations',
    city: 'Mumbai',
    travelAvailability: 'Travels nationally',
    styleTags: ['regional', 'live-stations', 'crowd-favorite'],
    badge: 'top-match',
    gradientColors: ['#F5E6C8', '#C8EDDA'],
  },
  {
    id: 'brass-and-bloom',
    name: 'Brass & Bloom',
    category: 'Catering',
    specialty: 'Modern fusion plating, four-event menu design',
    city: 'New York',
    travelAvailability: 'Destination',
    styleTags: ['fusion', 'plated', 'modern'],
    scrawl: 'they did the Khanna wedding',
    gradientColors: ['#FFD8B8', '#F5E6C8'],
  },
  {
    id: 'thali-collective',
    name: 'Thali Collective',
    category: 'Catering',
    specialty: 'Heirloom Gujarati & Marwari thali experiences',
    city: 'Ahmedabad',
    travelAvailability: 'Travels regionally',
    styleTags: ['heirloom', 'thali', 'traditional'],
    gradientColors: ['#C8EDDA', '#F5E6C8'],
  },

  {
    id: 'dj-saavan',
    name: 'DJ Saavan',
    category: 'Entertainment',
    specialty: 'Bollywood-meets-house sets, sangeet specialist',
    city: 'Mumbai',
    travelAvailability: 'Destination',
    styleTags: ['bollywood', 'house', 'high-energy'],
    badge: 'rising-star',
    scrawl: 'the dance floor is ALWAYS full',
    gradientColors: ['#E0D0F0', '#C8DFF5'],
  },
  {
    id: 'dholbeats-collective',
    name: 'Dholbeats Collective',
    category: 'Entertainment',
    specialty: 'Live dhol, baraat processions, percussion ensembles',
    city: 'Delhi',
    travelAvailability: 'Travels nationally',
    styleTags: ['live-percussion', 'baraat', 'traditional'],
    gradientColors: ['#FFD8B8', '#FBEAF0'],
  },
  {
    id: 'the-veena-trio',
    name: 'The Veena Trio',
    category: 'Entertainment',
    specialty: 'Classical fusion ensemble for ceremony & cocktails',
    city: 'Bangalore',
    travelAvailability: 'Travels nationally',
    styleTags: ['classical', 'fusion', 'elegant'],
    gradientColors: ['#F5E6C8', '#E0D0F0'],
  },

  {
    id: 'silk-and-script',
    name: 'Silk & Script',
    category: 'Wardrobe',
    specialty: 'Couture lehengas with hand-embroidered detailing',
    city: 'Delhi',
    travelAvailability: 'Travels nationally',
    styleTags: ['couture', 'hand-embroidered', 'heirloom'],
    badge: 'top-match',
    gradientColors: ['#FBEAF0', '#E0D0F0'],
  },
  {
    id: 'sherwani-society',
    name: 'Sherwani Society',
    category: 'Wardrobe',
    specialty: 'Modern bespoke sherwanis & groom styling',
    city: 'Mumbai',
    travelAvailability: 'Travels regionally',
    styleTags: ['bespoke', 'modern-groom', 'tailored'],
    gradientColors: ['#C8DFF5', '#F5E6C8'],
  },
  {
    id: 'banaras-by-meera',
    name: 'Banaras by Meera',
    category: 'Wardrobe',
    specialty: 'Heritage Banarasi sarees & bridal trousseau curation',
    city: 'Varanasi',
    travelAvailability: 'Travels nationally',
    styleTags: ['heritage', 'banarasi', 'trousseau'],
    scrawl: 'the saree of dreams',
    gradientColors: ['#F5E6C8', '#FFD8B8'],
  },

  {
    id: 'paper-and-gilt',
    name: 'Paper & Gilt',
    category: 'Stationery',
    specialty: 'Letterpress invitations with gold foil & wax seals',
    city: 'London',
    travelAvailability: 'Destination',
    styleTags: ['letterpress', 'gold-foil', 'heirloom'],
    badge: 'top-match',
    gradientColors: ['#F5E6C8', '#FBEAF0'],
  },
  {
    id: 'inkblot-studio',
    name: 'Inkblot Studio',
    category: 'Stationery',
    specialty: 'Illustrated invitation suites & wedding signage',
    city: 'Bangalore',
    travelAvailability: 'Travels nationally',
    styleTags: ['illustrated', 'whimsical', 'custom'],
    gradientColors: ['#C8EDDA', '#FBEAF0'],
  },

  {
    id: 'leela-palace-udaipur',
    name: 'The Leela Palace Udaipur',
    category: 'Venues',
    specialty: 'Lakefront palace destination weddings',
    city: 'Udaipur',
    travelAvailability: 'Local only',
    styleTags: ['palace', 'lakefront', 'destination'],
    badge: 'top-match',
    scrawl: 'literal fairytale',
    gradientColors: ['#FBEAF0', '#F5E6C8'],
  },
  {
    id: 'amanbagh',
    name: 'Amanbagh',
    category: 'Venues',
    specialty: 'Intimate Mughal-style estate weddings',
    city: 'Jaipur',
    travelAvailability: 'Local only',
    styleTags: ['intimate', 'mughal', 'estate'],
    gradientColors: ['#F5E6C8', '#FFD8B8'],
  },
  {
    id: 'the-broadview-toronto',
    name: 'The Broadview',
    category: 'Venues',
    specialty: 'Rooftop & ballroom hybrid for diaspora weddings',
    city: 'Toronto',
    travelAvailability: 'Local only',
    styleTags: ['urban', 'rooftop', 'modern'],
    gradientColors: ['#C8DFF5', '#FBEAF0'],
  },

  {
    id: 'reel-stories-films',
    name: 'Reel Stories Films',
    category: 'Videography',
    specialty: 'Cinematic feature films & same-day edits',
    city: 'Mumbai',
    travelAvailability: 'Destination',
    styleTags: ['cinematic', 'same-day-edit', 'narrative'],
    badge: 'top-match',
    gradientColors: ['#E0D0F0', '#C8DFF5'],
  },
  {
    id: 'frame-and-flicker',
    name: 'Frame & Flicker',
    category: 'Videography',
    specialty: 'Super 8 + digital hybrid wedding films',
    city: 'New York',
    travelAvailability: 'Destination',
    styleTags: ['super-8', 'hybrid', 'nostalgic'],
    scrawl: 'the most beautiful film I\u2019ve ever seen',
    gradientColors: ['#FFD8B8', '#F5E6C8'],
  },

  {
    id: 'henna-by-asha',
    name: 'Henna by Asha',
    category: 'Mehendi',
    specialty: 'Intricate Rajasthani-meets-Arabic bridal mehendi',
    city: 'Jaipur',
    travelAvailability: 'Travels nationally',
    styleTags: ['rajasthani', 'intricate', 'bridal'],
    badge: 'top-match',
    gradientColors: ['#C8EDDA', '#F5E6C8'],
  },
  {
    id: 'mehendi-mafia',
    name: 'Mehendi Mafia',
    category: 'Mehendi',
    specialty: 'Modern minimal mehendi with portrait detailing',
    city: 'London',
    travelAvailability: 'Destination',
    styleTags: ['modern', 'minimal', 'portrait'],
    badge: 'rising-star',
    gradientColors: ['#FBEAF0', '#E0D0F0'],
  },

  {
    id: 'sugarflour-bakery',
    name: 'Sugarflour Bakery',
    category: 'Cake & Sweets',
    specialty: 'Couture wedding cakes & dessert tablescapes',
    city: 'Mumbai',
    travelAvailability: 'Travels regionally',
    styleTags: ['couture-cake', 'dessert-table', 'sculptural'],
    scrawl: 'the cake was the centerpiece',
    gradientColors: ['#FBEAF0', '#FFD8B8'],
  },
  {
    id: 'ghasitaram-modern',
    name: 'Ghasitaram Modern',
    category: 'Cake & Sweets',
    specialty: 'Reimagined mithai boxes & wedding favor design',
    city: 'Mumbai',
    travelAvailability: 'Travels nationally',
    styleTags: ['mithai', 'favors', 'modern-traditional'],
    badge: 'top-match',
    gradientColors: ['#F5E6C8', '#FFD8B8'],
  },
];

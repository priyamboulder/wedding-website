export type ProductTab = 'curated' | 'marketplace' | 'exhibitions';

export type CuratedCategory =
  | 'Bridal Wear'
  | "Groom's Wear"
  | 'Jewelry'
  | 'Décor & Props'
  | 'Stationery'
  | 'Beauty'
  | 'Cake & Sweets'
  | 'Gifts & Favors';

export type MarketplaceCategory =
  | 'Bridal Lehengas & Sarees'
  | "Groom's Sherwanis"
  | 'Jewelry & Accessories'
  | 'Décor & Props'
  | 'Stationery'
  | 'Miscellaneous';

export type ProductCondition =
  | 'new-with-tags'
  | 'worn-once'
  | 'gently-used'
  | 'well-loved';

export type ExhibitionStatus = 'live' | 'coming-soon' | 'archived';

export interface PublicProduct {
  id: string;
  name: string;
  category: CuratedCategory | MarketplaceCategory;
  brand?: string;
  price: string;
  originalPrice?: string;
  type: 'curated' | 'marketplace';
  condition?: ProductCondition;
  sellerName?: string;
  sellerCity?: string;
  sellerMemberSince?: string;
  creatorPick?: boolean;
  creatorName?: string;
  moduleTag?: string;
  scrawl?: string;
  gradientColors: [string, string];
}

export interface Exhibition {
  id: string;
  name: string;
  description: string;
  curatorName: string;
  designerCount?: number;
  pieceCount?: number;
  dateRange: string;
  status: ExhibitionStatus;
  countdownEnd?: string;
  scrawl?: string;
  gradientColors: [string, string];
}

export const CURATED_CATEGORIES: CuratedCategory[] = [
  'Bridal Wear',
  "Groom's Wear",
  'Jewelry',
  'Décor & Props',
  'Stationery',
  'Beauty',
  'Cake & Sweets',
  'Gifts & Favors',
];

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  'Bridal Lehengas & Sarees',
  "Groom's Sherwanis",
  'Jewelry & Accessories',
  'Décor & Props',
  'Stationery',
  'Miscellaneous',
];

export const CURATED_PRODUCTS: PublicProduct[] = [
  {
    id: 'sabya-banarasi-lehenga',
    name: 'Hand-embroidered Banarasi Lehenga',
    category: 'Bridal Wear',
    brand: 'Sabyasachi · via Net-a-Porter',
    price: '₹2,45,000',
    type: 'curated',
    creatorPick: true,
    creatorName: 'Naina Reddy',
    moduleTag: 'ATTIRE & STYLING',
    scrawl: "editor's obsession",
    gradientColors: ['#FBEAF0', '#C4A8E0'],
  },
  {
    id: 'polki-choker-emerald',
    name: 'Polki Choker Set with Emerald Drops',
    category: 'Jewelry',
    brand: 'Jewels by Radhika',
    price: '₹89,000',
    type: 'curated',
    creatorPick: true,
    creatorName: 'Riya Khurana',
    moduleTag: 'ATTIRE & STYLING',
    scrawl: 'you NEED this',
    gradientColors: ['#E0D0F0', '#C8DFF5'],
  },
  {
    id: 'dried-flower-mandap-panel',
    name: 'Dried Flower Mandap Panel (set of 4)',
    category: 'Décor & Props',
    brand: 'Bloom & Petal',
    price: '₹32,000',
    type: 'curated',
    moduleTag: 'DÉCOR',
    gradientColors: ['#C8EDDA', '#F5E6C8'],
  },
  {
    id: 'letterpress-invite-suite',
    name: 'Letterpress Invitation Suite (set of 100)',
    category: 'Stationery',
    brand: 'Paper & Gilt',
    price: '₹1,68,000',
    type: 'curated',
    creatorPick: true,
    creatorName: 'Naina Reddy',
    moduleTag: 'STATIONERY',
    scrawl: 'gold foil obsessed',
    gradientColors: ['#F5E6C8', '#FBEAF0'],
  },
  {
    id: 'manish-malhotra-sherwani',
    name: 'Ivory Brocade Sherwani with Safa',
    category: "Groom's Wear",
    brand: 'Manish Malhotra',
    price: '₹1,85,000',
    type: 'curated',
    moduleTag: 'ATTIRE & STYLING',
    gradientColors: ['#F5E6C8', '#FFD8B8'],
  },
  {
    id: 'kundan-jhumkas',
    name: 'Heirloom Kundan Jhumkas',
    category: 'Jewelry',
    brand: 'Amrapali',
    price: '₹52,000',
    type: 'curated',
    moduleTag: 'ATTIRE & STYLING',
    scrawl: 'selling fast',
    gradientColors: ['#FFD8B8', '#FBEAF0'],
  },
  {
    id: 'brass-mandap-urlis',
    name: 'Brass Mandap Urlis (set of 6)',
    category: 'Décor & Props',
    brand: 'Kulture',
    price: '₹28,000',
    type: 'curated',
    creatorPick: true,
    creatorName: 'Bloom & Petal',
    moduleTag: 'DÉCOR',
    gradientColors: ['#F5E6C8', '#C8EDDA'],
  },
  {
    id: 'bridal-glow-kit',
    name: 'Bridal Glow Skincare Ritual Kit',
    category: 'Beauty',
    brand: 'Forest Essentials',
    price: '₹14,800',
    type: 'curated',
    moduleTag: 'BEAUTY',
    scrawl: 'start 6 weeks before',
    gradientColors: ['#FBEAF0', '#FFD8B8'],
  },
  {
    id: 'rose-gulkand-mithai',
    name: 'Rose & Gulkand Mithai Box (12 pieces)',
    category: 'Cake & Sweets',
    brand: 'Ghasitaram Modern',
    price: '₹3,200',
    type: 'curated',
    moduleTag: 'CATERING',
    gradientColors: ['#FBEAF0', '#FFD8B8'],
  },
  {
    id: 'silk-pouches-favor',
    name: 'Hand-stitched Silk Favor Pouches (set of 50)',
    category: 'Gifts & Favors',
    brand: 'Good Earth',
    price: '₹18,500',
    type: 'curated',
    moduleTag: 'GIFTING',
    gradientColors: ['#C8EDDA', '#FBEAF0'],
  },
  {
    id: 'kanjivaram-saree',
    name: 'Vintage Kanjivaram Silk Saree',
    category: 'Bridal Wear',
    brand: 'Banaras by Meera',
    price: '₹1,25,000',
    type: 'curated',
    creatorPick: true,
    creatorName: 'Meera Banerjee',
    moduleTag: 'ATTIRE & STYLING',
    scrawl: 'her grandmother wore one like this',
    gradientColors: ['#FFD8B8', '#F5E6C8'],
  },
  {
    id: 'meena-bangles',
    name: 'Meenakari Lac Bangles (set of 24)',
    category: 'Jewelry',
    brand: 'Tribe by Amrapali',
    price: '₹16,800',
    type: 'curated',
    moduleTag: 'ATTIRE & STYLING',
    gradientColors: ['#E0D0F0', '#FBEAF0'],
  },
  {
    id: 'marigold-toran',
    name: 'Fresh Marigold & Mango Leaf Toran',
    category: 'Décor & Props',
    brand: 'Wildflower Décor Co.',
    price: '₹8,400',
    type: 'curated',
    moduleTag: 'DÉCOR',
    scrawl: 'every doorway, please',
    gradientColors: ['#C8EDDA', '#F5E6C8'],
  },
  {
    id: 'monogram-cocktail-napkins',
    name: 'Monogrammed Cocktail Napkins (250 ct)',
    category: 'Stationery',
    brand: 'Inkblot Studio',
    price: '₹14,000',
    type: 'curated',
    moduleTag: 'STATIONERY',
    gradientColors: ['#C8DFF5', '#FBEAF0'],
  },
  {
    id: 'henna-mehendi-cones',
    name: 'Organic Henna Cones (party pack)',
    category: 'Beauty',
    brand: 'Henna by Asha',
    price: '₹4,200',
    type: 'curated',
    moduleTag: 'BEAUTY',
    gradientColors: ['#C8EDDA', '#FFD8B8'],
  },
  {
    id: 'almond-katli-tower',
    name: 'Almond Katli Mithai Tower',
    category: 'Cake & Sweets',
    brand: 'Sugarflour Bakery',
    price: '₹22,500',
    type: 'curated',
    creatorPick: true,
    creatorName: 'Riya Khurana',
    moduleTag: 'CATERING',
    scrawl: 'replaces the cake',
    gradientColors: ['#F5E6C8', '#FFD8B8'],
  },
  {
    id: 'engraved-silver-coins',
    name: 'Engraved Silver Return Gift Coins (set of 100)',
    category: 'Gifts & Favors',
    brand: 'Jaipur Jewels',
    price: '₹78,000',
    type: 'curated',
    moduleTag: 'GIFTING',
    gradientColors: ['#F5E6C8', '#E0D0F0'],
  },
  {
    id: 'dupatta-only-ivory',
    name: 'Hand-zardozi Ivory Dupatta',
    category: 'Bridal Wear',
    brand: 'Silk & Script',
    price: '₹65,000',
    type: 'curated',
    creatorPick: true,
    creatorName: 'Naina Reddy',
    moduleTag: 'ATTIRE & STYLING',
    scrawl: "you NEED this dupatta",
    gradientColors: ['#FBEAF0', '#F5E6C8'],
  },
];

export const MARKETPLACE_LISTINGS: PublicProduct[] = [
  {
    id: 'mm-reception-lehenga',
    name: 'Manish Malhotra Reception Lehenga — Worn Once',
    category: 'Bridal Lehengas & Sarees',
    price: '₹1,20,000',
    originalPrice: '₹4,50,000',
    type: 'marketplace',
    condition: 'worn-once',
    sellerName: 'Priya',
    sellerCity: 'Mumbai',
    sellerMemberSince: '2024',
    scrawl: "still has the tags on",
    gradientColors: ['#FBEAF0', '#C4A8E0'],
  },
  {
    id: 'sabya-fuchsia-saree',
    name: 'Sabyasachi Fuchsia Silk Saree',
    category: 'Bridal Lehengas & Sarees',
    price: '₹95,000',
    originalPrice: '₹2,80,000',
    type: 'marketplace',
    condition: 'gently-used',
    sellerName: 'Aanya',
    sellerCity: 'Bengaluru',
    sellerMemberSince: '2023',
    gradientColors: ['#FFD8B8', '#FBEAF0'],
  },
  {
    id: 'cream-sherwani-safa',
    name: 'Cream Brocade Sherwani + Safa Set',
    category: "Groom's Sherwanis",
    price: '₹38,000',
    originalPrice: '₹1,40,000',
    type: 'marketplace',
    condition: 'new-with-tags',
    sellerName: 'Karan',
    sellerCity: 'Delhi',
    sellerMemberSince: '2025',
    scrawl: "wedding got postponed, his loss your win",
    gradientColors: ['#F5E6C8', '#FFD8B8'],
  },
  {
    id: 'pista-green-sherwani',
    name: 'Pista Green Velvet Sherwani',
    category: "Groom's Sherwanis",
    price: '₹24,000',
    originalPrice: '₹85,000',
    type: 'marketplace',
    condition: 'worn-once',
    sellerName: 'Rohan',
    sellerCity: 'Hyderabad',
    sellerMemberSince: '2024',
    gradientColors: ['#C8EDDA', '#F5E6C8'],
  },
  {
    id: 'polki-choker-set-resale',
    name: 'Polki Choker + Maang Tikka Set',
    category: 'Jewelry & Accessories',
    price: '₹68,000',
    originalPrice: '₹1,80,000',
    type: 'marketplace',
    condition: 'gently-used',
    sellerName: 'Meera',
    sellerCity: 'Jaipur',
    sellerMemberSince: '2022',
    scrawl: "one bride's 'wore it once' is another bride's dream",
    gradientColors: ['#E0D0F0', '#FBEAF0'],
  },
  {
    id: 'kundan-jhumkas-resale',
    name: 'Heirloom Kundan Jhumkas',
    category: 'Jewelry & Accessories',
    price: '₹19,500',
    originalPrice: '₹52,000',
    type: 'marketplace',
    condition: 'well-loved',
    sellerName: 'Sanya',
    sellerCity: 'Pune',
    sellerMemberSince: '2024',
    gradientColors: ['#FFD8B8', '#FBEAF0'],
  },
  {
    id: 'brass-urli-set-resale',
    name: 'Brass Mandap Urlis (set of 6)',
    category: 'Décor & Props',
    price: '₹9,500',
    originalPrice: '₹28,000',
    type: 'marketplace',
    condition: 'gently-used',
    sellerName: 'Ananya',
    sellerCity: 'Chennai',
    sellerMemberSince: '2023',
    gradientColors: ['#F5E6C8', '#C8EDDA'],
  },
  {
    id: 'phoolon-ki-chaadar',
    name: 'Phoolon ki Chaadar Frame (used once)',
    category: 'Décor & Props',
    price: '₹6,800',
    originalPrice: '₹22,000',
    type: 'marketplace',
    condition: 'worn-once',
    sellerName: 'Tanvi',
    sellerCity: 'Udaipur',
    sellerMemberSince: '2025',
    scrawl: "her vidaai was beautiful btw",
    gradientColors: ['#FFD8B8', '#FBEAF0'],
  },
  {
    id: 'extra-invites-letterpress',
    name: 'Letterpress Invitations (40 unused)',
    category: 'Stationery',
    price: '₹4,200',
    originalPrice: '₹16,800',
    type: 'marketplace',
    condition: 'new-with-tags',
    sellerName: 'Isha',
    sellerCity: 'Bengaluru',
    sellerMemberSince: '2024',
    gradientColors: ['#F5E6C8', '#FBEAF0'],
  },
  {
    id: 'haldi-yellow-suit',
    name: 'Haldi Day Yellow Anarkali',
    category: 'Bridal Lehengas & Sarees',
    price: '₹14,500',
    originalPrice: '₹42,000',
    type: 'marketplace',
    condition: 'worn-once',
    sellerName: 'Naina',
    sellerCity: 'Delhi',
    sellerMemberSince: '2025',
    gradientColors: ['#F5E6C8', '#FFD8B8'],
  },
  {
    id: 'pagdi-collection',
    name: 'Baraat Pagdis (set of 12, mixed colors)',
    category: 'Miscellaneous',
    price: '₹3,800',
    type: 'marketplace',
    condition: 'gently-used',
    sellerName: 'Vikram',
    sellerCity: 'Amritsar',
    sellerMemberSince: '2023',
    scrawl: "save your uncles the rental fee",
    gradientColors: ['#FFD8B8', '#FBEAF0'],
  },
  {
    id: 'mehendi-stencils',
    name: 'Custom Mehendi Stencils + Hennas',
    category: 'Miscellaneous',
    price: '₹1,800',
    originalPrice: '₹5,400',
    type: 'marketplace',
    condition: 'gently-used',
    sellerName: 'Pooja',
    sellerCity: 'Mumbai',
    sellerMemberSince: '2024',
    gradientColors: ['#C8EDDA', '#FFD8B8'],
  },
];

export const EXHIBITIONS: Exhibition[] = [
  {
    id: 'monsoon-edit-2026',
    name: 'The Monsoon Edit — Summer Bridal Collection',
    description:
      '48 hours of curated picks from 12 emerging designers — lehengas, jewelry, and trousseau pieces only here.',
    curatorName: 'Naina Reddy',
    designerCount: 12,
    pieceCount: 184,
    dateRange: 'Apr 26 – Apr 28, 2026',
    status: 'live',
    countdownEnd: '2026-04-28T23:59:00Z',
    scrawl: 'set a reminder, seriously',
    gradientColors: ['#A0234E', '#D4537E'],
  },
  {
    id: 'sangeet-sound-studio',
    name: 'Sangeet Sound Studio — Music & Performance Picks',
    description:
      'Bookable DJs, dhol troupes, and choreographers — all in one weekend-only browse window. Think Bridal Asia but from your couch.',
    curatorName: 'Riya Khurana',
    designerCount: 18,
    pieceCount: 96,
    dateRange: 'May 14 – May 16, 2026',
    status: 'coming-soon',
    scrawl: 'think Bridal Asia but from your couch',
    gradientColors: ['#D2A14A', '#FFD8B8'],
  },
  {
    id: 'bridal-asia-virtual-2026',
    name: 'Bridal Asia 2026 — Virtual Edition',
    description:
      '32 designers · 412 pieces · archived. Featured items still carry the Bridal Asia stamp forever.',
    curatorName: 'Bridal Asia Team',
    designerCount: 32,
    pieceCount: 412,
    dateRange: 'Mar 1 – Mar 3, 2026',
    status: 'archived',
    scrawl: 'closed but the stamp lives forever',
    gradientColors: ['#7A5278', '#C4A8E0'],
  },
];

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  'new-with-tags': 'New with tags',
  'worn-once': 'Worn once',
  'gently-used': 'Gently used',
  'well-loved': 'Well loved',
};

// ── Cake & Sweets catalog + seed data ──────────────────────────────────────
// Read-only data that powers the dessert discovery experience across the
// Vision & Mood, Cake Design, and Mithai tabs. Extensible by appending rows
// to each array — id stability matters since reactions persist against ids.

// ── Reaction primitive ─────────────────────────────────────────────────────

export type DessertReaction = "love" | "not_this";

// ── Flavor-profile quiz (Vision & Mood) ───────────────────────────────────

export interface FlavorProfile {
  id: string;
  label: string;
  description: string;
  emoji: string;
}

export const FLAVOR_PROFILES: FlavorProfile[] = [
  { id: "chocolate", label: "Chocolate & rich", description: "Dark ganache, truffle centers, cocoa-dusted cakes.", emoji: "🍫" },
  { id: "fruity", label: "Fruity & fresh", description: "Berry compotes, citrus curds, seasonal fruit garnishes.", emoji: "🍓" },
  { id: "nutty", label: "Nutty & warm", description: "Pistachio, almond, hazelnut, pecan praline.", emoji: "🥜" },
  { id: "floral", label: "Floral & delicate", description: "Rose, cardamom, saffron, lavender, orange-blossom.", emoji: "🌸" },
  { id: "spiced", label: "Spiced & aromatic", description: "Chai, cinnamon, clove, nutmeg, masala warmth.", emoji: "🌶️" },
  { id: "creamy", label: "Creamy & classic", description: "Vanilla bean, buttercream, custards, kheer notes.", emoji: "🍦" },
];

// ── Tradition cards (Vision & Mood) ───────────────────────────────────────

export interface TraditionDirection {
  id: "mithai" | "western" | "fusion";
  label: string;
  description: string;
  emoji: string;
}

export const TRADITION_DIRECTIONS: TraditionDirection[] = [
  {
    id: "mithai",
    label: "Traditional mithai spread",
    description: "Thalis of ladoo, barfi, jalebi — the sweets you grew up with, centered.",
    emoji: "🪔",
  },
  {
    id: "western",
    label: "Western cake & pastries",
    description: "Tiered cake, macarons, tarts, a pastry bar of modern showstoppers.",
    emoji: "🎂",
  },
  {
    id: "fusion",
    label: "Fusion of both",
    description: "Rose-pistachio cake, gulab jamun cheesecake, chai macarons — east meets west.",
    emoji: "✨",
  },
];

// ── Allergen toggles (Vision & Mood, shared across tabs) ──────────────────

export interface AllergenOption {
  id: "nut_free" | "gluten_free" | "dairy_free" | "egg_free" | "soy_free" | "vegan";
  label: string;
  flag: string; // short form used as chip on item cards
}

export const ALLERGEN_OPTIONS: AllergenOption[] = [
  { id: "nut_free", label: "Nut-free", flag: "NF" },
  { id: "gluten_free", label: "Gluten-free", flag: "GF" },
  { id: "dairy_free", label: "Dairy-free", flag: "DF" },
  { id: "egg_free", label: "Egg-free", flag: "EF" },
  { id: "soy_free", label: "Soy-free", flag: "SF" },
  { id: "vegan", label: "Vegan", flag: "V" },
];

// ── Cake inspiration gallery (Cake Design tab) ────────────────────────────

export interface CakeInspiration {
  id: string;
  name: string;
  description: string;
  image_url: string;
  tags: string[];
}

export const CAKE_INSPIRATIONS: CakeInspiration[] = [
  {
    id: "traditional-tiered",
    name: "Traditional tiered",
    description: "Three-tier white buttercream, cascading fresh florals.",
    image_url: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=640&q=70",
    tags: ["classic", "elegant"],
  },
  {
    id: "modern-minimalist",
    name: "Modern minimalist",
    description: "Clean lines, single-color fondant, metallic accent base.",
    image_url: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=640&q=70",
    tags: ["modern", "clean"],
  },
  {
    id: "floral-cascade",
    name: "Floral cascade",
    description: "Sugar flowers tumbling across uneven tiers.",
    image_url: "https://images.unsplash.com/photo-1519654793190-2e8a4806f1f2?w=640&q=70",
    tags: ["romantic", "garden"],
  },
  {
    id: "geometric",
    name: "Geometric",
    description: "Hexagonal tiers, ruler-sharp edges, geometric gold leaf.",
    image_url: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=640&q=70",
    tags: ["art-deco", "modern"],
  },
  {
    id: "naked-semi-naked",
    name: "Naked / semi-naked",
    description: "Exposed sponge, thin buttercream crumb coat, fresh fruit.",
    image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=640&q=70",
    tags: ["rustic", "organic"],
  },
  {
    id: "hand-painted",
    name: "Hand-painted",
    description: "Watercolor motifs, brushstroke florals, painterly detail.",
    image_url: "https://images.unsplash.com/photo-1562777717-dc6984f65a63?w=640&q=70",
    tags: ["artistic", "whimsical"],
  },
  {
    id: "fondant-sculpture",
    name: "Fondant sculpture",
    description: "Ornate piping, pearl drapery, sculptural couture fondant.",
    image_url: "https://images.unsplash.com/photo-1549892634-12eef26807e0?w=640&q=70",
    tags: ["opulent", "couture"],
  },
  {
    id: "indian-motif",
    name: "Indian motif",
    description: "Paisley, mandap arches, marigold garlands hand-piped.",
    image_url: "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=640&q=70",
    tags: ["south-asian", "cultural"],
  },
  {
    id: "marigold-drip",
    name: "Marigold drip",
    description: "Saffron drip, marigold petals, gold leaf crown.",
    image_url: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=640&q=70",
    tags: ["south-asian", "warm"],
  },
  {
    id: "chocolate-drip",
    name: "Chocolate drip",
    description: "Glossy ganache waterfall, berries, chocolate shards.",
    image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=640&q=70",
    tags: ["indulgent", "modern"],
  },
  {
    id: "pearl-beaded",
    name: "Pearl & beaded",
    description: "Edible pearl piping, lace detail, ivory couture fondant.",
    image_url: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=640&q=70",
    tags: ["opulent", "vintage"],
  },
  {
    id: "fusion-fondant",
    name: "Fusion fondant",
    description: "Cardamom sponge, rose fondant, pistachio rubble tier.",
    image_url: "https://images.unsplash.com/photo-1562440499-64c9a111f713?w=640&q=70",
    tags: ["fusion", "fragrant"],
  },
];

// ── Dessert catalog (Mithai tab, Dessert Tables tab) ──────────────────────

export type DessertCategory = "indian" | "western" | "fusion";

export interface DessertItem {
  id: string;
  name: string;
  description: string;
  category: DessertCategory;
  dietary_default?: AllergenOption["id"][]; // baseline flags that apply naturally
  emoji: string;
}

export const DESSERT_CATALOG: DessertItem[] = [
  // ── Indian mithai ──────────────────────────────────────────────────────
  { id: "kaju-katli", name: "Kaju katli", description: "Silver-leafed cashew diamonds.", category: "indian", emoji: "💠" },
  { id: "gulab-jamun", name: "Gulab jamun", description: "Warm milk dumplings soaked in rose syrup.", category: "indian", dietary_default: ["nut_free"], emoji: "🟤" },
  { id: "rasgulla", name: "Rasgulla", description: "Chenna spheres in light cardamom syrup.", category: "indian", dietary_default: ["nut_free"], emoji: "⚪" },
  { id: "jalebi", name: "Jalebi", description: "Crisp saffron spirals, live-fried, warm.", category: "indian", dietary_default: ["nut_free", "egg_free"], emoji: "🍥" },
  { id: "barfi-pista", name: "Pista barfi", description: "Pistachio fudge squares, edible silver.", category: "indian", emoji: "🟢" },
  { id: "barfi-coconut", name: "Coconut barfi", description: "Coconut & milk solids, rose-water kiss.", category: "indian", dietary_default: ["nut_free"], emoji: "🥥" },
  { id: "barfi-chocolate", name: "Chocolate barfi", description: "Cocoa-rich fudge with a khoya base.", category: "indian", emoji: "🍫" },
  { id: "ladoo-motichoor", name: "Motichoor ladoo", description: "Tiny boondi pearls, saffron, ghee.", category: "indian", emoji: "🟠" },
  { id: "ladoo-besan", name: "Besan ladoo", description: "Roasted chickpea flour, ghee, cardamom.", category: "indian", dietary_default: ["egg_free"], emoji: "🟡" },
  { id: "ladoo-boondi", name: "Boondi ladoo", description: "Chickpea pearls bound in sugar syrup.", category: "indian", emoji: "🟤" },
  { id: "peda", name: "Peda", description: "Milk-solid fudge, saffron and pistachio.", category: "indian", emoji: "⭕" },
  { id: "sandesh", name: "Sandesh", description: "Bengali chenna sweet, delicate and cool.", category: "indian", emoji: "🤍" },
  { id: "rasmalai", name: "Rasmalai", description: "Chenna rounds in saffron-cardamom cream.", category: "indian", emoji: "🥛" },
  { id: "chamcham", name: "Chamcham", description: "Oval chenna sweets in rose syrup.", category: "indian", emoji: "🌸" },
  { id: "halwa-gajar", name: "Gajar halwa", description: "Slow-cooked carrot halwa with khoya.", category: "indian", emoji: "🥕" },
  { id: "halwa-moong", name: "Moong dal halwa", description: "Ghee-rich lentil halwa, festive.", category: "indian", emoji: "🟡" },
  { id: "halwa-sooji", name: "Sooji halwa", description: "Warm semolina halwa with nuts.", category: "indian", emoji: "🌾" },
  { id: "malpua", name: "Malpua", description: "Crisp pancakes soaked in syrup, rabri side.", category: "indian", emoji: "🥞" },
  { id: "rabri", name: "Rabri", description: "Thickened milk with nuts and rose.", category: "indian", emoji: "🥛" },
  { id: "kheer", name: "Kheer", description: "Rice pudding, cardamom, slivered pistachio.", category: "indian", emoji: "🍚" },
  { id: "kulfi", name: "Kulfi", description: "Dense malai ice-cream on sticks.", category: "indian", emoji: "🍢" },
  { id: "paan-station", name: "Sweet paan station", description: "Live paan-wala, silver-leafed, chaat-style.", category: "indian", emoji: "🌿" },
  { id: "modak", name: "Modak", description: "Jaggery-coconut dumplings, steamed.", category: "indian", dietary_default: ["nut_free"], emoji: "🎐" },
  { id: "soan-papdi", name: "Soan papdi", description: "Flaky cardamom threads, melt-in-mouth.", category: "indian", emoji: "🟨" },
  { id: "mysore-pak", name: "Mysore pak", description: "Ghee-laden gram-flour fudge, South Indian.", category: "indian", dietary_default: ["nut_free"], emoji: "🟫" },
  { id: "basundi", name: "Basundi", description: "Reduced milk with saffron, served chilled.", category: "indian", emoji: "🍨" },

  // ── Western ────────────────────────────────────────────────────────────
  { id: "cupcakes", name: "Cupcakes", description: "Mini individual cakes, tower or tray.", category: "western", emoji: "🧁" },
  { id: "macarons", name: "Macarons", description: "French almond shells, pastel ganache centers.", category: "western", dietary_default: ["gluten_free"], emoji: "🔴" },
  { id: "cookies", name: "Sugar cookies", description: "Iced sugar cookies, monogram-printable.", category: "western", emoji: "🍪" },
  { id: "brownies", name: "Brownies", description: "Fudgy squares, sea-salt caramel option.", category: "western", emoji: "🟫" },
  { id: "cake-pops", name: "Cake pops", description: "Dipped cake balls on sticks, dressed.", category: "western", emoji: "🍭" },
  { id: "donuts", name: "Donuts", description: "Glazed rings, filled, wall or tower.", category: "western", emoji: "🍩" },
  { id: "mini-cheesecakes", name: "Mini cheesecakes", description: "Individual jars, fruit-topped.", category: "western", emoji: "🍰" },
  { id: "cannoli", name: "Cannoli", description: "Crisp shells, ricotta-pistachio filling.", category: "western", emoji: "🥐" },
  { id: "churros", name: "Churros", description: "Live-fried churros, cinnamon sugar, sauces.", category: "western", dietary_default: ["nut_free"], emoji: "🥖" },
  { id: "creme-brulee", name: "Crème brûlée", description: "Torched sugar crust, vanilla custard.", category: "western", dietary_default: ["gluten_free", "nut_free"], emoji: "🔥" },
  { id: "tart-fruit", name: "Fruit tarts", description: "Pastry shells, cream, seasonal fruit jewels.", category: "western", emoji: "🥧" },
  { id: "tart-chocolate", name: "Chocolate tarts", description: "Dark ganache, sea-salt flake, gold.", category: "western", emoji: "🍫" },
  { id: "tart-lemon", name: "Lemon tarts", description: "Torched meringue, sharp lemon curd.", category: "western", emoji: "🍋" },
  { id: "profiteroles", name: "Profiteroles", description: "Cream-filled choux, warm chocolate drizzle.", category: "western", emoji: "🥐" },
  { id: "eclairs", name: "Éclairs", description: "Choux logs, cream, varied ganache tops.", category: "western", emoji: "🥖" },
  { id: "tiramisu-cups", name: "Tiramisu cups", description: "Individual espresso-mascarpone cups.", category: "western", emoji: "☕" },
  { id: "smores-station", name: "S'mores station", description: "Live fire-pit, graham, marshmallow, chocolate.", category: "western", emoji: "🔥" },
  { id: "gelato-bar", name: "Gelato / ice-cream bar", description: "Attended cart, Italian gelato flights.", category: "western", emoji: "🍨" },

  // ── Fusion ─────────────────────────────────────────────────────────────
  { id: "chai-macarons", name: "Chai-spiced macarons", description: "Chai-steeped ganache, almond shells.", category: "fusion", dietary_default: ["gluten_free"], emoji: "☕" },
  { id: "cardamom-brulee", name: "Cardamom crème brûlée", description: "Cardamom custard, torched sugar top.", category: "fusion", dietary_default: ["gluten_free", "nut_free"], emoji: "🌿" },
  { id: "rose-pistachio-cake", name: "Rose pistachio cake", description: "Rose sponge, pistachio crémeux layers.", category: "fusion", emoji: "🌹" },
  { id: "mango-panna-cotta", name: "Mango lassi panna cotta", description: "Mango-yogurt set, cardamom crumb.", category: "fusion", dietary_default: ["gluten_free"], emoji: "🥭" },
  { id: "gulab-jamun-cheesecake", name: "Gulab jamun cheesecake", description: "Cheesecake base, gulab jamun jewel top.", category: "fusion", emoji: "🎂" },
  { id: "saffron-kulfi-pops", name: "Saffron kulfi pops", description: "Kulfi on elegant sticks, pistachio dip.", category: "fusion", emoji: "🍡" },
  { id: "chai-cookies", name: "Masala chai cookies", description: "Spiced shortbread, sugar-dusted, chai notes.", category: "fusion", emoji: "🍪" },
  { id: "ras-malai-cake", name: "Rasmalai cake", description: "Saffron-milk soaked sponge, pistachio.", category: "fusion", emoji: "🥛" },
  { id: "paan-truffles", name: "Paan truffles", description: "Paan-cream dipped in white chocolate.", category: "fusion", emoji: "🌿" },
  { id: "jalebi-cheesecake-bites", name: "Jalebi cheesecake bites", description: "Mini jalebi crowns on cheesecake squares.", category: "fusion", emoji: "🍥" },
];

// ── Dessert-table display styles ──────────────────────────────────────────

export const DISPLAY_STYLES: { id: string; label: string }[] = [
  { id: "platter", label: "Platter" },
  { id: "individual_boxes", label: "Individual boxes" },
  { id: "live_station", label: "Live station" },
  { id: "chef_attended", label: "Chef-attended" },
  { id: "tiered_stand", label: "Tiered stand" },
  { id: "tower", label: "Tower" },
  { id: "jar_cup", label: "Jar / cup" },
];

// ── Cake-cutting song suggestions (AI stub) ───────────────────────────────

export interface SuggestedSong {
  id: string;
  title: string;
  artist: string;
  genre: "bollywood" | "western" | "fusion";
  vibe: string;
}

export const SUGGESTED_CUTTING_SONGS: SuggestedSong[] = [
  { id: "s1", title: "Tum Hi Ho", artist: "Arijit Singh", genre: "bollywood", vibe: "romantic, classic" },
  { id: "s2", title: "Perfect", artist: "Ed Sheeran", genre: "western", vibe: "timeless, sweet" },
  { id: "s3", title: "Tera Ban Jaunga", artist: "Akhil Sachdeva", genre: "bollywood", vibe: "tender, vow-like" },
  { id: "s4", title: "A Thousand Years", artist: "Christina Perri", genre: "western", vibe: "cinematic, soft" },
  { id: "s5", title: "Kabira", artist: "Arijit Singh, Tochi Raina", genre: "bollywood", vibe: "sufi, emotional" },
  { id: "s6", title: "Thinking Out Loud", artist: "Ed Sheeran", genre: "western", vibe: "swaying, warm" },
  { id: "s7", title: "Raabta", artist: "Pritam & Arijit Singh", genre: "bollywood", vibe: "playful, lyrical" },
  { id: "s8", title: "All of Me", artist: "John Legend", genre: "western", vibe: "piano, declarative" },
  { id: "s9", title: "Channa Mereya (Unplugged)", artist: "Arijit Singh", genre: "bollywood", vibe: "bittersweet, rich" },
  { id: "s10", title: "Marry You", artist: "Bruno Mars", genre: "western", vibe: "upbeat, giddy" },
  { id: "s11", title: "Maana Ke Hum Yaar Nahin", artist: "Parineeti Chopra", genre: "bollywood", vibe: "soft, intimate" },
  { id: "s12", title: "Can't Help Falling in Love", artist: "Elvis Presley", genre: "western", vibe: "iconic, slow" },
  { id: "s13", title: "Kesariya (Acoustic)", artist: "Arijit Singh", genre: "fusion", vibe: "warm, saffron" },
  { id: "s14", title: "Ae Dil Hai Mushkil", artist: "Arijit Singh", genre: "bollywood", vibe: "soaring, grand" },
  { id: "s15", title: "Señorita", artist: "Shawn Mendes & Camila", genre: "fusion", vibe: "playful, sultry" },
];

// ── Texture options (tasting questionnaire) ───────────────────────────────

export const TEXTURE_OPTIONS: { id: string; label: string }[] = [
  { id: "moist", label: "Moist" },
  { id: "dense", label: "Dense" },
  { id: "light", label: "Light & airy" },
  { id: "fluffy", label: "Fluffy" },
  { id: "crumbly", label: "Crumbly" },
  { id: "chewy", label: "Chewy" },
  { id: "flaky", label: "Flaky" },
  { id: "creamy", label: "Creamy" },
  { id: "fudgy", label: "Fudgy" },
  { id: "crisp", label: "Crisp" },
];

// ── Suggested moments (existing Vision tab starters) ──────────────────────
// Re-exported so the Vision tab can find them alongside catalog data.
export const SUGGESTED_MOMENTS = [
  "The cutting of the cake — both of us, hands over hands, mom in the frame.",
  "The first piece of mithai offered to elders, feet touched.",
  "The late-night jalebi run when the dance floor thins out.",
  "Guests leaning in over the dessert table, phones out, eyes wide.",
];

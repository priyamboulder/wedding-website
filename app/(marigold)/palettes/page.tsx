'use client';

// ── The Marigold · Color Palette Explorer ───────────────────────────────
// A two-view discovery engine: browse curated wedding color palettes, then
// fall into a single palette and scroll real weddings, decor, attire, and
// stationery shot in that color world. Visual language follows the
// homepage exactly — polaroid stacks, scrawl accents, magazine pull-quotes.

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

// ── Data ───────────────────────────────────────────────────────────────
//
// All content lives here so the page renders without any backend
// dependency. Image URLs use Unsplash's source endpoint with topic queries
// — they resolve to real wedding/decor/fashion/stationery photography.

type Wedding = {
  couple: string;
  city: string;
  guests: number;
  events: string[];
  hook: string;
  image: string;
};

type DecorItem = {
  title: string;
  materials: string;
  image: string;
};

type AttireItem = {
  title: string;
  meta: string;
  designer: string;
  badge: string;
  image: string;
};

type StationeryItem = {
  title: string;
  detail: string;
  image: string;
};

type Palette = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  swatches: string[];
  primary: string; // CTA button color
  sticker: { label: string; tone: 'pink' | 'gold' | 'wine' };
  hero: string; // landing-card hero image
  collage: string[]; // 3 images for the deep-hero stack
  weddings: Wedding[];
  decor: DecorItem[];
  attire: AttireItem[];
  stationery: StationeryItem[];
};

// Helper for unsplash placeholder photography. The `sig=` query keeps each
// card stable across re-renders so a card's image doesn't shuffle on
// hover/state change.
const u = (sig: string, w = 900, h = 1100, query = 'indian-wedding') =>
  `https://source.unsplash.com/featured/${w}x${h}/?${encodeURIComponent(query)}&sig=${encodeURIComponent(sig)}`;

const PALETTES: Palette[] = [
  {
    slug: 'rani-pink-emerald',
    name: 'Rani Pink & Emerald',
    tagline: 'bold tradition, lush sophistication',
    description:
      'The classic North Indian power couple — magenta and forest green, the way your nani would wear them, but with a 2026 sensibility. Saturated, ceremonial, photographs like a dream.',
    swatches: ['#C8235A', '#0F5132', '#F4C95D', '#F9E8E0', '#5C0F2D'],
    primary: '#C8235A',
    sticker: { label: 'Most Saved', tone: 'pink' },
    hero: u('rani-hero', 900, 1100, 'indian-bride-pink-green'),
    collage: [
      u('rani-c1', 700, 900, 'indian-bride-pink'),
      u('rani-c2', 700, 900, 'mehendi-green'),
      u('rani-c3', 700, 900, 'wedding-mandap-pink'),
    ],
    weddings: [
      {
        couple: 'Aanya & Kabir',
        city: 'Frisco, TX',
        guests: 320,
        events: ['Mehendi', 'Sangeet', 'Reception'],
        hook: 'A magenta lehenga, an emerald sherwani, and a baraat that closed half of Legacy West.',
        image: u('rani-w1', 800, 700, 'indian-wedding-pink-green'),
      },
      {
        couple: 'Riya & Arjun',
        city: 'Plano, TX',
        guests: 280,
        events: ['Haldi', 'Pheras', 'Reception'],
        hook: "Forest-green velvet mandap with rani-pink tuberoses — Riya's mom called it 'the wedding she'd plan again.'",
        image: u('rani-w2', 800, 700, 'indian-wedding-emerald'),
      },
    ],
    decor: [
      {
        title: 'Velvet Pheras Mandap',
        materials: 'Emerald velvet panels, rani-pink rose garlands, antique gold frame',
        image: u('rani-d1', 700, 900, 'wedding-mandap-velvet'),
      },
      {
        title: 'Garland Cascade',
        materials: 'Marigold, rose, rajnigandha — 12-foot drape, cluster-tied',
        image: u('rani-d2', 700, 700, 'rose-garland-wedding'),
      },
      {
        title: 'Reception Tablescape',
        materials: 'Hot-pink linen, brass thalis, taper candles, peony center',
        image: u('rani-d3', 700, 800, 'wedding-tablescape-pink'),
      },
      {
        title: 'Sangeet Stage',
        materials: 'Mirror panels, neon scribble signage, pink chiffon ceiling',
        image: u('rani-d4', 700, 1000, 'sangeet-stage-pink'),
      },
      {
        title: 'Reception Lounge',
        materials: 'Emerald velvet sofas, brass coffee tables, pink pampas',
        image: u('rani-d5', 700, 700, 'wedding-lounge-emerald'),
      },
    ],
    attire: [
      {
        title: 'Bridal Lehenga',
        meta: 'Magenta raw silk, gold zardozi, dupatta in emerald net',
        designer: 'Sabyasachi · custom',
        badge: 'Bride',
        image: u('rani-a1', 700, 900, 'sabyasachi-lehenga-pink'),
      },
      {
        title: "Groom's Sherwani",
        meta: 'Forest-green silk, gold thread embroidery, rani-pink stole',
        designer: 'Manish Malhotra',
        badge: 'Groom',
        image: u('rani-a2', 700, 900, 'sherwani-emerald'),
      },
      {
        title: 'Bridesmaid Lehengas',
        meta: 'Dusty pink georgette, ivory dupatta, gold border',
        designer: 'Anita Dongre',
        badge: 'Wedding Party',
        image: u('rani-a3', 700, 900, 'bridesmaid-lehenga-pink'),
      },
      {
        title: 'Reception Sari',
        meta: 'Emerald Banarasi silk, gold tissue pallu, ruby borders',
        designer: 'Raw Mango',
        badge: 'Reception',
        image: u('rani-a4', 700, 900, 'banarasi-sari-emerald'),
      },
    ],
    stationery: [
      {
        title: 'Invitation Suite',
        detail: 'Letterpress on cream cotton, gold foil borders, magenta wax seal',
        image: u('rani-s1', 700, 900, 'wedding-invitation-pink-gold'),
      },
      {
        title: 'Save the Date',
        detail: 'Hand-painted peacock motif, emerald envelope, pink calligraphy',
        image: u('rani-s2', 700, 900, 'save-the-date-peacock'),
      },
      {
        title: 'Reception Menu',
        detail: 'Emerald cardstock, gold edging, calligraphed in Devanagari',
        image: u('rani-s3', 700, 900, 'wedding-menu-card'),
      },
    ],
  },
  {
    slug: 'ivory-champagne-gold',
    name: 'Ivory & Champagne Gold',
    tagline: 'quiet luxury, ceremonial restraint',
    description:
      'For couples who want their photography to look like a perfume ad. Ivory, antique gold, blush undertones — the palette that lets the people in the room be the loudest thing.',
    swatches: ['#F5EFE2', '#E0CB97', '#C4A265', '#FFFDF5', '#8C6E47'],
    primary: '#C4A265',
    sticker: { label: 'Editor Pick', tone: 'gold' },
    hero: u('ivory-hero', 900, 1100, 'ivory-wedding-bride'),
    collage: [
      u('ivory-c1', 700, 900, 'wedding-ceremony-ivory'),
      u('ivory-c2', 700, 900, 'wedding-decor-gold'),
      u('ivory-c3', 700, 900, 'bridal-portrait-ivory'),
    ],
    weddings: [
      {
        couple: 'Maya & Dev',
        city: 'Southlake, TX',
        guests: 220,
        events: ['Pheras', 'Reception'],
        hook: 'A champagne-and-cream estate wedding where the only color was the saffron mandap fire.',
        image: u('ivory-w1', 800, 700, 'wedding-ivory-cream'),
      },
      {
        couple: 'Priya & Rohan',
        city: 'Fort Worth, TX',
        guests: 180,
        events: ['Haldi', 'Pheras'],
        hook: "Heirloom Banarasi sari, gold mandap, and Priya's nani's pearls. Quiet, exact, gorgeous.",
        image: u('ivory-w2', 800, 700, 'wedding-pearl-ivory'),
      },
    ],
    decor: [
      {
        title: 'Carved Wood Mandap',
        materials: 'Antique teak, ivory drape, white phalaenopsis cascade',
        image: u('ivory-d1', 700, 900, 'wood-mandap-ivory'),
      },
      {
        title: 'Tablescape',
        materials: 'Cream linen, gold flatware, white tuberose, taper candles',
        image: u('ivory-d2', 700, 700, 'wedding-table-cream-gold'),
      },
      {
        title: 'Ceiling Drape',
        materials: 'Hand-pleated chiffon, brass medallions, fairy lights',
        image: u('ivory-d3', 700, 900, 'wedding-ceiling-drape'),
      },
      {
        title: 'Welcome Lounge',
        materials: 'Cream tufted sofas, gold mirror, jasmine garland arch',
        image: u('ivory-d4', 700, 900, 'wedding-lounge-cream'),
      },
    ],
    attire: [
      {
        title: 'Bridal Lehenga',
        meta: 'Ivory raw silk, hand-cut gold zari, champagne organza dupatta',
        designer: 'Anamika Khanna',
        badge: 'Bride',
        image: u('ivory-a1', 700, 900, 'ivory-lehenga'),
      },
      {
        title: 'Groom Sherwani',
        meta: 'Cream silk, antique gold buttoning, ivory pagdi',
        designer: 'Tarun Tahiliani',
        badge: 'Groom',
        image: u('ivory-a2', 700, 900, 'cream-sherwani'),
      },
      {
        title: 'Reception Gown',
        meta: 'Champagne tulle, hand-set crystal, sweep train',
        designer: 'Falguni Shane Peacock',
        badge: 'Reception',
        image: u('ivory-a3', 700, 900, 'champagne-gown'),
      },
    ],
    stationery: [
      {
        title: 'Engraved Invitation',
        detail: 'Ivory cotton, gold engraving, vellum overlay, wax seal',
        image: u('ivory-s1', 700, 900, 'wedding-invitation-ivory'),
      },
      {
        title: 'Programme Booklet',
        detail: 'Cream cardstock, gold foil monogram, silk tassel',
        image: u('ivory-s2', 700, 900, 'wedding-programme'),
      },
      {
        title: 'Place Cards',
        detail: 'Hand-calligraphed names, gold-leaf edge, dried jasmine sprig',
        image: u('ivory-s3', 700, 900, 'place-card-calligraphy'),
      },
    ],
  },
  {
    slug: 'royal-blue-antique-gold',
    name: 'Royal Blue & Antique Gold',
    tagline: 'palace energy with bite',
    description:
      'Sapphire, navy, peacock — paired with weathered gold instead of the shiny stuff. Reads regal, never costume-y. Best at golden hour and after dark.',
    swatches: ['#1A3A6E', '#0E1E47', '#C4A265', '#F4E5C2', '#243B7A'],
    primary: '#1A3A6E',
    sticker: { label: 'Trending', tone: 'wine' },
    hero: u('royal-hero', 900, 1100, 'indian-wedding-blue-gold'),
    collage: [
      u('royal-c1', 700, 900, 'wedding-blue-gold'),
      u('royal-c2', 700, 900, 'sherwani-blue'),
      u('royal-c3', 700, 900, 'wedding-evening-decor'),
    ],
    weddings: [
      {
        couple: 'Sana & Imran',
        city: 'Irving, TX',
        guests: 380,
        events: ['Mehendi', 'Sangeet', 'Nikah', 'Reception'],
        hook: 'Sapphire-blue mehendi, gold-thread nikah backdrop, and a baraat that arrived on a vintage Rolls-Royce.',
        image: u('royal-w1', 800, 700, 'wedding-blue-decor'),
      },
      {
        couple: 'Tara & Vikram',
        city: 'Allen, TX',
        guests: 260,
        events: ['Sangeet', 'Pheras'],
        hook: 'Peacock-blue lehenga, sherwani in matching navy, mandap dripping in gold tassels.',
        image: u('royal-w2', 800, 700, 'wedding-peacock-blue'),
      },
    ],
    decor: [
      {
        title: 'Sangeet Stage',
        materials: 'Royal-blue velvet curtain, antique-gold chandelier, mirror floor',
        image: u('royal-d1', 700, 900, 'sangeet-stage-blue'),
      },
      {
        title: 'Mandap Drape',
        materials: 'Hand-knotted gold tassels, navy silk panels, brass uprights',
        image: u('royal-d2', 700, 900, 'mandap-blue-gold'),
      },
      {
        title: 'Reception Centerpiece',
        materials: 'Antique gold urn, white and blue thistle, eucalyptus drape',
        image: u('royal-d3', 700, 700, 'wedding-centerpiece-blue'),
      },
      {
        title: 'Lighting Plan',
        materials: 'Warm uplights, brass lanterns, candle clusters on raised platforms',
        image: u('royal-d4', 700, 900, 'wedding-lighting-warm'),
      },
    ],
    attire: [
      {
        title: 'Bridal Lehenga',
        meta: 'Sapphire raw silk, antique-gold zardozi, peacock-motif dupatta',
        designer: 'Rimple & Harpreet Narula',
        badge: 'Bride',
        image: u('royal-a1', 700, 900, 'lehenga-blue-gold'),
      },
      {
        title: 'Groom Sherwani',
        meta: 'Navy raw silk, gold dabka, antique brooch and stole',
        designer: 'Raghavendra Rathore',
        badge: 'Groom',
        image: u('royal-a2', 700, 900, 'sherwani-navy-gold'),
      },
      {
        title: 'Bridesmaid Saris',
        meta: 'Peacock-blue Kanjivaram, gold border, contrast blouse',
        designer: 'Ekaya Banaras',
        badge: 'Wedding Party',
        image: u('royal-a3', 700, 900, 'kanjivaram-blue'),
      },
    ],
    stationery: [
      {
        title: 'Invitation Suite',
        detail: 'Navy cardstock, gold foil mughal-arch design, ribbon tied',
        image: u('royal-s1', 700, 900, 'invitation-blue-gold'),
      },
      {
        title: 'Welcome Box',
        detail: 'Royal-blue silk box, gold-stamped welcome letter, brass key',
        image: u('royal-s2', 700, 900, 'wedding-welcome-box'),
      },
      {
        title: 'Reception Menu',
        detail: 'Vellum overlay on navy, gold-edged, calligraphed in English and Urdu',
        image: u('royal-s3', 700, 900, 'wedding-menu-blue'),
      },
    ],
  },
  {
    slug: 'marigold-burgundy',
    name: 'Marigold & Burgundy',
    tagline: 'festive warmth, ceremonial depth',
    description:
      "The palette of haldi-soaked afternoons and burgundy-velvet evenings. Saffron and deep wine, with copper holding the room together. The Marigold's namesake — and our most-saved.",
    swatches: ['#E8A341', '#7A1B2E', '#C4541F', '#F2D6A6', '#3F0F1F'],
    primary: '#7A1B2E',
    sticker: { label: 'Our Namesake', tone: 'gold' },
    hero: u('marigold-hero', 900, 1100, 'haldi-ceremony'),
    collage: [
      u('marigold-c1', 700, 900, 'haldi-yellow'),
      u('marigold-c2', 700, 900, 'wedding-burgundy'),
      u('marigold-c3', 700, 900, 'marigold-flowers'),
    ],
    weddings: [
      {
        couple: 'Diya & Rohan',
        city: 'McKinney, TX',
        guests: 290,
        events: ['Haldi', 'Mehendi', 'Pheras'],
        hook: 'A backyard haldi that turned into a marigold-strewn pheras. Burgundy velvet at dusk, copper diyas everywhere.',
        image: u('marigold-w1', 800, 700, 'haldi-marigold'),
      },
      {
        couple: 'Sahana & Karthik',
        city: 'Grapevine, TX',
        guests: 210,
        events: ['Sangeet', 'Pheras', 'Reception'],
        hook: "Burgundy lehenga, saffron pagdi, and a baraat horse named 'Mango.' Real story.",
        image: u('marigold-w2', 800, 700, 'wedding-burgundy-gold'),
      },
    ],
    decor: [
      {
        title: 'Marigold Curtain',
        materials: '8,000 fresh marigolds, hemp cord, floor-to-ceiling',
        image: u('marigold-d1', 700, 900, 'marigold-flower-curtain'),
      },
      {
        title: 'Haldi Setup',
        materials: 'Yellow gerbera, copper urli, banana-leaf table runners',
        image: u('marigold-d2', 700, 700, 'haldi-decor-yellow'),
      },
      {
        title: 'Burgundy Tablescape',
        materials: 'Wine-velvet runner, copper goblets, marigold heads',
        image: u('marigold-d3', 700, 800, 'wedding-table-burgundy'),
      },
      {
        title: 'Diya Wall',
        materials: 'Hand-thrown clay diyas, marigold strings, copper plate backing',
        image: u('marigold-d4', 700, 900, 'diya-wall'),
      },
    ],
    attire: [
      {
        title: 'Haldi Lehenga',
        meta: 'Marigold cotton silk, mirror work, organza dupatta',
        designer: 'Punit Balana',
        badge: 'Haldi',
        image: u('marigold-a1', 700, 900, 'haldi-yellow-lehenga'),
      },
      {
        title: 'Bridal Lehenga',
        meta: 'Deep burgundy raw silk, gold gota patti, marigold-orange dupatta',
        designer: 'Sabyasachi',
        badge: 'Bride',
        image: u('marigold-a2', 700, 900, 'burgundy-lehenga'),
      },
      {
        title: 'Groom Achkan',
        meta: 'Burgundy velvet, gold thread cuff, saffron stole',
        designer: 'Shantanu & Nikhil',
        badge: 'Groom',
        image: u('marigold-a3', 700, 900, 'achkan-burgundy'),
      },
    ],
    stationery: [
      {
        title: 'Invitation Box',
        detail: 'Burgundy velvet box, copper-foil card, marigold pressed inside',
        image: u('marigold-s1', 700, 900, 'wedding-invitation-velvet'),
      },
      {
        title: 'Save the Date',
        detail: 'Saffron envelope, burgundy wax seal, hand-illustrated diya',
        image: u('marigold-s2', 700, 900, 'save-the-date-marigold'),
      },
      {
        title: 'Mehendi Menu',
        detail: 'Hand-block-printed yellow paper, mehendi-pattern border',
        image: u('marigold-s3', 700, 900, 'mehendi-menu'),
      },
    ],
  },
  {
    slug: 'sage-terracotta',
    name: 'Sage & Terracotta',
    tagline: 'sun-warmed, garden-spilled',
    description:
      'For couples who want their wedding to feel like a long Sunday lunch in a Tuscan villa. Sage, dusty terracotta, dried-grass beige — earthy, romantic, never trend-chasing.',
    swatches: ['#A4B494', '#C76F4B', '#E8C8A0', '#6E8466', '#5C2E1E'],
    primary: '#6E8466',
    sticker: { label: 'New This Season', tone: 'pink' },
    hero: u('sage-hero', 900, 1100, 'sage-terracotta-wedding'),
    collage: [
      u('sage-c1', 700, 900, 'wedding-sage-green'),
      u('sage-c2', 700, 900, 'wedding-terracotta'),
      u('sage-c3', 700, 900, 'wedding-garden-italy'),
    ],
    weddings: [
      {
        couple: 'Mira & Aarav',
        city: 'Grapevine, TX',
        guests: 140,
        events: ['Pheras', 'Reception'],
        hook: "An olive-grove ceremony in the Hill Country. Mira's dupatta was hand-dyed sage, Aarav's sherwani was the color of Texas dirt at sunset.",
        image: u('sage-w1', 800, 700, 'wedding-olive-sage'),
      },
      {
        couple: 'Anjali & Sameer',
        city: 'Fort Worth, TX',
        guests: 110,
        events: ['Mehendi', 'Pheras'],
        hook: 'Ranch-house mehendi with dried-grass garlands and terracotta urns. Aunties said it looked like a Pinterest board come to life. They meant it as a compliment.',
        image: u('sage-w2', 800, 700, 'wedding-ranch-terracotta'),
      },
    ],
    decor: [
      {
        title: 'Olive-Branch Mandap',
        materials: 'Live olive branches, terracotta urns, beeswax tapers',
        image: u('sage-d1', 700, 900, 'olive-branch-mandap'),
      },
      {
        title: 'Tablescape',
        materials: 'Linen runner, terracotta charger, dried wheat, fig garland',
        image: u('sage-d2', 700, 700, 'wedding-table-sage-terracotta'),
      },
      {
        title: 'Welcome Arch',
        materials: 'Pampas grass, eucalyptus, dried palm, jute rope',
        image: u('sage-d3', 700, 900, 'wedding-pampas-arch'),
      },
      {
        title: 'Mehendi Lounge',
        materials: 'Sage cushions, bamboo low tables, hand-painted ceramic bowls',
        image: u('sage-d4', 700, 900, 'mehendi-lounge'),
      },
    ],
    attire: [
      {
        title: 'Bridal Lehenga',
        meta: 'Hand-dyed sage chanderi, terracotta thread embroidery, ivory dupatta',
        designer: 'Raw Mango',
        badge: 'Bride',
        image: u('sage-a1', 700, 900, 'lehenga-sage-green'),
      },
      {
        title: 'Groom Bandhgala',
        meta: 'Burnt-terracotta linen, hand-stitched buttons, sage pocket square',
        designer: 'Antar-Agni',
        badge: 'Groom',
        image: u('sage-a2', 700, 900, 'bandhgala-terracotta'),
      },
      {
        title: 'Bridesmaid Saris',
        meta: 'Soft-sage handloom cotton, contrast terracotta border',
        designer: 'Eka',
        badge: 'Wedding Party',
        image: u('sage-a3', 700, 900, 'sari-sage-cotton'),
      },
    ],
    stationery: [
      {
        title: 'Invitation Suite',
        detail: 'Handmade kozo paper, sage ink, dried botanical pressed in',
        image: u('sage-s1', 700, 900, 'invitation-handmade-paper'),
      },
      {
        title: 'Welcome Card',
        detail: 'Terracotta cardstock, olive-leaf illustration, twine-bound',
        image: u('sage-s2', 700, 900, 'wedding-welcome-card'),
      },
      {
        title: 'Mehendi Menu',
        detail: 'Block-printed motif on linen-textured paper, sprig of rosemary',
        image: u('sage-s3', 700, 900, 'mehendi-menu-paper'),
      },
    ],
  },
  {
    slug: 'lavender-soft-gold',
    name: 'Lavender & Soft Gold',
    tagline: 'soft girl shaadi energy',
    description:
      "Pale lilac, soft buttery gold, hints of lavender-blush. The palette that made every couple's mom say, 'wait, this is actually beautiful.' Made for spring pheras and afternoon receptions.",
    swatches: ['#C9B6E4', '#F4E5B5', '#E5D5F0', '#9B7BC4', '#D4A853'],
    primary: '#9B7BC4',
    sticker: { label: 'Spring Picks', tone: 'pink' },
    hero: u('lavender-hero', 900, 1100, 'lavender-wedding'),
    collage: [
      u('lavender-c1', 700, 900, 'lavender-bride'),
      u('lavender-c2', 700, 900, 'lilac-wedding-decor'),
      u('lavender-c3', 700, 900, 'wedding-pastel'),
    ],
    weddings: [
      {
        couple: 'Naina & Aryan',
        city: 'Plano, TX',
        guests: 200,
        events: ['Mehendi', 'Pheras', 'Reception'],
        hook: 'A lavender-field engagement that turned into a lilac-mandap pheras. Naina wore three lehengas. We forgive her.',
        image: u('lavender-w1', 800, 700, 'wedding-lavender-bride'),
      },
      {
        couple: 'Ishani & Veer',
        city: 'Allen, TX',
        guests: 160,
        events: ['Sangeet', 'Pheras'],
        hook: "Pale lilac sangeet stage, soft-gold uplights, and a 12-piece string section playing 'Tum Hi Ho' as their first dance.",
        image: u('lavender-w2', 800, 700, 'wedding-lilac-sangeet'),
      },
    ],
    decor: [
      {
        title: 'Lilac Floral Mandap',
        materials: 'Fresh lilac, lisianthus, dusty miller, gold frame',
        image: u('lavender-d1', 700, 900, 'lilac-mandap'),
      },
      {
        title: 'Tablescape',
        materials: 'Lavender linen, gold rim glassware, sweet-pea posies',
        image: u('lavender-d2', 700, 700, 'wedding-table-lavender'),
      },
      {
        title: 'Aisle Runner',
        materials: 'Petal-strewn cream, lavender-stem markers, brass lanterns',
        image: u('lavender-d3', 700, 900, 'wedding-aisle-petals'),
      },
    ],
    attire: [
      {
        title: 'Bridal Lehenga',
        meta: 'Pale-lilac georgette, hand-embroidered pearls, soft-gold dupatta',
        designer: 'Manish Malhotra',
        badge: 'Bride',
        image: u('lavender-a1', 700, 900, 'lehenga-lavender-pearl'),
      },
      {
        title: 'Groom Sherwani',
        meta: 'Soft-gold raw silk, lilac stole, mother-of-pearl buttons',
        designer: 'Kunal Rawal',
        badge: 'Groom',
        image: u('lavender-a2', 700, 900, 'sherwani-soft-gold'),
      },
      {
        title: 'Reception Sari',
        meta: 'Lilac chiffon, gold tissue border, crystal-set blouse',
        designer: 'Tarun Tahiliani',
        badge: 'Reception',
        image: u('lavender-a3', 700, 900, 'sari-lilac-gold'),
      },
    ],
    stationery: [
      {
        title: 'Invitation Suite',
        detail: 'Lilac handmade paper, gold foil, dried-lavender stem inside',
        image: u('lavender-s1', 700, 900, 'invitation-lavender'),
      },
      {
        title: 'RSVP Card',
        detail: 'Pale-purple cardstock, gold-embossed monogram, hand-tied ribbon',
        image: u('lavender-s2', 700, 900, 'rsvp-card-purple'),
      },
      {
        title: 'Reception Menu',
        detail: 'Vellum on lilac, gold script, pressed dried floral corner',
        image: u('lavender-s3', 700, 900, 'wedding-menu-lavender'),
      },
    ],
  },
  {
    slug: 'dusty-rose-deep-teal',
    name: 'Dusty Rose & Deep Teal',
    tagline: 'old-world, candlelit, a little moody',
    description:
      'Muted rose and inky teal — the color of Rajasthani frescoes lit by candlelight. Reads vintage, never sweet. Best for evening pheras and havelis (or convincing imitations of them).',
    swatches: ['#C99094', '#1F4D4F', '#7E3F45', '#E5C4C0', '#0E2A2B'],
    primary: '#1F4D4F',
    sticker: { label: 'Editor Pick', tone: 'wine' },
    hero: u('teal-hero', 900, 1100, 'rajasthan-wedding'),
    collage: [
      u('teal-c1', 700, 900, 'haveli-wedding'),
      u('teal-c2', 700, 900, 'dusty-rose-decor'),
      u('teal-c3', 700, 900, 'wedding-teal-rose'),
    ],
    weddings: [
      {
        couple: 'Kavya & Yash',
        city: 'Frisco, TX',
        guests: 240,
        events: ['Sangeet', 'Pheras', 'Reception'],
        hook: 'A teal-and-rose mandap with hand-painted fresco panels. Kavya commissioned the panels herself. They live in their dining room now.',
        image: u('teal-w1', 800, 700, 'wedding-fresco-teal'),
      },
      {
        couple: 'Reema & Nikhil',
        city: 'Southlake, TX',
        guests: 180,
        events: ['Pheras', 'Reception'],
        hook: 'Dusty-rose lehenga, deep-teal sherwani, and 600 candles arranged like a star map. The photos broke their photographer.',
        image: u('teal-w2', 800, 700, 'wedding-candlelit-rose'),
      },
    ],
    decor: [
      {
        title: 'Fresco Mandap',
        materials: 'Hand-painted teal panels, dusty-rose curtain, brass diyas',
        image: u('teal-d1', 700, 900, 'fresco-mandap'),
      },
      {
        title: 'Candlelit Aisle',
        materials: '400 pillar candles, teal runner, dusty-rose petals',
        image: u('teal-d2', 700, 700, 'wedding-candlelit-aisle'),
      },
      {
        title: 'Tablescape',
        materials: 'Teal velvet runner, antique-brass thalis, dried rose center',
        image: u('teal-d3', 700, 800, 'wedding-table-teal-rose'),
      },
      {
        title: 'Reception Stage',
        materials: 'Rajasthani jali screens, dusty-rose drape, brass lantern wall',
        image: u('teal-d4', 700, 900, 'wedding-stage-jali'),
      },
    ],
    attire: [
      {
        title: 'Bridal Lehenga',
        meta: 'Dusty-rose velvet, gold gota, deep-teal dupatta',
        designer: 'Anita Dongre',
        badge: 'Bride',
        image: u('teal-a1', 700, 900, 'lehenga-dusty-rose'),
      },
      {
        title: 'Groom Sherwani',
        meta: 'Deep-teal silk, antique-gold thread, rose-stone buttoning',
        designer: 'Sabyasachi',
        badge: 'Groom',
        image: u('teal-a2', 700, 900, 'sherwani-teal'),
      },
      {
        title: 'Bridesmaid Lehengas',
        meta: 'Dusty-rose chanderi, hand-block teal border',
        designer: 'Anita Dongre',
        badge: 'Wedding Party',
        image: u('teal-a3', 700, 900, 'bridesmaid-rose-teal'),
      },
    ],
    stationery: [
      {
        title: 'Invitation Suite',
        detail: 'Teal cotton paper, dusty-rose foil, miniature painting motif',
        image: u('teal-s1', 700, 900, 'invitation-teal-rose'),
      },
      {
        title: 'Welcome Folder',
        detail: 'Block-printed teal, gold-leaf border, hand-tied silk thread',
        image: u('teal-s2', 700, 900, 'wedding-welcome-folder'),
      },
      {
        title: 'Reception Menu',
        detail: 'Deep-teal cardstock, dusty-rose calligraphy, gold edge',
        image: u('teal-s3', 700, 900, 'menu-card-teal'),
      },
    ],
  },
  {
    slug: 'midnight-blue-copper',
    name: 'Midnight Blue & Copper',
    tagline: 'sangeet-but-make-it-electric',
    description:
      'Inky midnight blue with hammered copper. Reads contemporary, photographs cinematic, makes every uplight look intentional. Built for after-dark sangeets and reception finales.',
    swatches: ['#0C1A3A', '#B87333', '#1F2D5C', '#E5A26B', '#0A1428'],
    primary: '#B87333',
    sticker: { label: 'Most Saved', tone: 'gold' },
    hero: u('midnight-hero', 900, 1100, 'sangeet-night-wedding'),
    collage: [
      u('midnight-c1', 700, 900, 'sangeet-night'),
      u('midnight-c2', 700, 900, 'reception-copper'),
      u('midnight-c3', 700, 900, 'wedding-evening-blue'),
    ],
    weddings: [
      {
        couple: 'Anika & Rohan',
        city: 'Frisco, TX',
        guests: 350,
        events: ['Sangeet', 'Reception'],
        hook: 'A midnight-blue ballroom, copper draping the ceiling, and a 20-minute sangeet performance that became a TikTok moment.',
        image: u('midnight-w1', 800, 700, 'sangeet-blue-copper'),
      },
      {
        couple: 'Pooja & Sid',
        city: 'Plano, TX',
        guests: 230,
        events: ['Pheras', 'Reception'],
        hook: 'Reception in a converted warehouse, copper pipe sculptures, midnight-blue lehenga that disappeared into the dance floor.',
        image: u('midnight-w2', 800, 700, 'wedding-warehouse-blue'),
      },
    ],
    decor: [
      {
        title: 'Copper Pipe Sculpture',
        materials: 'Welded copper geometry, hanging Edison bulbs, blue uplights',
        image: u('midnight-d1', 700, 900, 'copper-sculpture-wedding'),
      },
      {
        title: 'Sangeet Dance Floor',
        materials: 'Mirrored midnight-blue floor, copper truss, smoke machine',
        image: u('midnight-d2', 700, 700, 'sangeet-dance-floor'),
      },
      {
        title: 'Reception Tablescape',
        materials: 'Midnight-blue linen, hammered-copper chargers, blue thistle',
        image: u('midnight-d3', 700, 800, 'wedding-table-blue-copper'),
      },
      {
        title: 'Bar Backdrop',
        materials: 'Copper-pipe shelving, midnight-blue velvet, neon scribble sign',
        image: u('midnight-d4', 700, 900, 'wedding-bar-copper'),
      },
    ],
    attire: [
      {
        title: 'Bridal Lehenga',
        meta: 'Midnight-blue velvet, hand-set copper crystal, copper sequin dupatta',
        designer: 'Falguni Shane Peacock',
        badge: 'Bride',
        image: u('midnight-a1', 700, 900, 'lehenga-midnight-blue'),
      },
      {
        title: 'Groom Sherwani',
        meta: 'Copper raw silk, midnight-blue stole, contrast pagdi',
        designer: 'Kunal Rawal',
        badge: 'Groom',
        image: u('midnight-a2', 700, 900, 'sherwani-copper'),
      },
      {
        title: 'Reception Gown',
        meta: 'Midnight-blue jersey, copper sequined train, off-shoulder',
        designer: 'Gaurav Gupta',
        badge: 'Reception',
        image: u('midnight-a3', 700, 900, 'reception-gown-blue-copper'),
      },
    ],
    stationery: [
      {
        title: 'Invitation Suite',
        detail: 'Matte midnight-blue cardstock, copper foil, geometric monogram',
        image: u('midnight-s1', 700, 900, 'invitation-blue-copper'),
      },
      {
        title: 'Sangeet Pass',
        detail: 'Copper-edged ticket, midnight-blue velvet pouch, holographic seal',
        image: u('midnight-s2', 700, 900, 'sangeet-pass'),
      },
      {
        title: 'Reception Menu',
        detail: 'Foil-stamped midnight blue, copper script, deckle edge',
        image: u('midnight-s3', 700, 900, 'menu-midnight-blue'),
      },
    ],
  },
];

// ── Categories ────────────────────────────────────────────────────────

type CategoryId = 'weddings' | 'decor' | 'attire' | 'stationery';

const CATEGORIES: { id: CategoryId; label: string; scrawl: string; heading: string }[] = [
  { id: 'weddings', label: 'Real Weddings', scrawl: 'shot in this palette', heading: 'Weddings <em>that lived</em> here' },
  { id: 'decor', label: 'Décor & Florals', scrawl: 'mandaps, tablescapes, lounges', heading: 'How it <em>shows up</em> in the room' },
  { id: 'attire', label: 'Lehengas & Attire', scrawl: 'bridal, groom, wedding party', heading: 'What you <em>wear</em> in this color story' },
  { id: 'stationery', label: 'Invitations & Stationery', scrawl: 'paper, foil, calligraphy', heading: 'On <em>paper</em>, made permanent' },
];

// ── Component ────────────────────────────────────────────────────────

export default function ColorPaletteExplorer() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryId>('weddings');
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const palette = useMemo(
    () => PALETTES.find((p) => p.slug === activeSlug) ?? null,
    [activeSlug],
  );

  // Reset to weddings tab + scroll-to-top whenever a palette is opened.
  useEffect(() => {
    if (palette) {
      setCategory('weddings');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [palette]);

  // Auto-dismiss toast.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className={styles.page}>
      <span className={`${styles.dot} ${styles.dot1}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot2}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot3}`} aria-hidden="true" />
      <span className={`${styles.dot} ${styles.dot4}`} aria-hidden="true" />
      <span className={`${styles.ring} ${styles.ring1}`} aria-hidden="true" />
      <span className={`${styles.ring} ${styles.ring2}`} aria-hidden="true" />

      {palette === null ? (
        <Landing onPick={setActiveSlug} savedSlug={savedSlug} />
      ) : (
        <DeepDive
          palette={palette}
          category={category}
          onCategory={setCategory}
          onBack={() => setActiveSlug(null)}
          onSave={() => {
            setSavedSlug(palette.slug);
            setToast(`${palette.name} saved to your workspace`);
          }}
          alreadySaved={savedSlug === palette.slug}
        />
      )}

      {toast && (
        <div className={styles.savedToast} role="status" aria-live="polite">
          ✿ {toast}
        </div>
      )}
    </div>
  );
}

// ── Landing view ─────────────────────────────────────────────────────

function Landing({
  onPick,
  savedSlug,
}: {
  onPick: (slug: string) => void;
  savedSlug: string | null;
}) {
  return (
    <div className={styles.view}>
      <header className={styles.landingHero}>
        <span className={styles.scrawl}>find your color story</span>
        <h1 className={styles.heading}>
          Palettes for every kind of <em>shaadi</em>
        </h1>
        <p className={styles.sub}>
          Eight curated color worlds, each one a lookbook of real weddings, décor,
          lehengas, and stationery. Pick the one that feels closest — fall in,
          keep scrolling.
        </p>
        <span className={styles.metaRow}>
          <span className={styles.pulse} aria-hidden="true" />
          eight palettes · updated weekly
        </span>
      </header>

      <ul className={styles.landingGrid} aria-label="Color palettes">
        {PALETTES.map((p) => (
          <li key={p.slug} style={{ listStyle: 'none' }}>
            <Link
              href={`/palettes/${p.slug}`}
              className={styles.paletteCard}
              aria-label={`Open ${p.name} palette`}
            >
              <span
                className={`${styles.paletteCardSticker} ${
                  p.sticker.tone === 'gold'
                    ? styles.paletteCardStickerGold
                    : p.sticker.tone === 'wine'
                    ? styles.paletteCardStickerWine
                    : ''
                }`}
              >
                {savedSlug === p.slug ? 'Saved ✿' : p.sticker.label}
              </span>

              <div className={styles.heroFrame}>
                <img
                  src={p.hero}
                  alt=""
                  className={styles.heroImage}
                  loading="lazy"
                />
                <div className={styles.heroOverlay} aria-hidden="true" />
                <div className={styles.heroSwatchStrip} aria-hidden="true">
                  {p.swatches.map((c) => (
                    <span key={c} style={{ background: c }} />
                  ))}
                </div>
              </div>

              <div className={styles.cardBody}>
                <h2 className={styles.cardName}>{p.name}</h2>
                <span className={styles.cardTagline}>{p.tagline}</span>
                <span className={styles.cardCta}>Fall in</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Deep-dive view ───────────────────────────────────────────────────

function DeepDive({
  palette,
  category,
  onCategory,
  onBack,
  onSave,
  alreadySaved,
}: {
  palette: Palette;
  category: CategoryId;
  onCategory: (c: CategoryId) => void;
  onBack: () => void;
  onSave: () => void;
  alreadySaved: boolean;
}) {
  const counts: Record<CategoryId, number> = {
    weddings: palette.weddings.length,
    decor: palette.decor.length,
    attire: palette.attire.length,
    stationery: palette.stationery.length,
  };

  return (
    <div className={styles.view} key={palette.slug}>
      <section className={styles.deepHero}>
        <div className={styles.deepHeroInner}>
          <div>
            <button type="button" className={styles.backLink} onClick={onBack}>
              All palettes
            </button>
            <span className={styles.deepEyebrow}>{palette.tagline}</span>
            <h1 className={styles.deepTitle}>
              {palette.name.split(' & ').map((part, i, arr) => (
                <span key={part}>
                  {i === arr.length - 1 ? <em>{part}</em> : <>{part}{' & '}</>}
                </span>
              ))}
            </h1>
            <p className={styles.deepDescription}>{palette.description}</p>
            <div className={styles.swatchCluster} aria-label="Palette swatches">
              {palette.swatches.map((hex) => (
                <div key={hex} className={styles.swatchChip}>
                  <span
                    className={styles.swatchSquare}
                    style={{ background: hex }}
                    aria-hidden="true"
                  />
                  <span className={styles.swatchHex}>{hex}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.heroCollage} aria-hidden="true">
            <div className={`${styles.collageCard} ${styles.collageCard1}`}>
              <img src={palette.collage[0]} alt="" loading="lazy" />
              <span className={styles.collageCaption}>palette in motion</span>
            </div>
            <div className={`${styles.collageCard} ${styles.collageCard2}`}>
              <img src={palette.collage[1]} alt="" loading="lazy" />
            </div>
            <div className={`${styles.collageCard} ${styles.collageCard3}`}>
              <img src={palette.collage[2]} alt="" loading="lazy" />
              <span className={styles.collageCaption}>{palette.tagline}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky tabs */}
      <nav className={styles.tabBar} aria-label="Browse this palette">
        <div className={styles.tabBarInner}>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`${styles.tab} ${category === c.id ? styles.tabActive : ''}`}
              onClick={() => onCategory(c.id)}
              aria-pressed={category === c.id}
            >
              {c.label}
              <span className={styles.tabCount}>{counts[c.id]}</span>
            </button>
          ))}
        </div>
      </nav>

      <CategorySection palette={palette} category={category} />

      {/* Bottom CTA */}
      <section className={styles.cta}>
        <div
          className={styles.ctaInner}
          style={{ ['--ctaColor' as string]: palette.primary }}
        >
          <span className={styles.ctaScrawl}>love this one?</span>
          <h2 className={styles.ctaHeading}>
            Save <em>{palette.name}</em> to your workspace
          </h2>
          <p className={styles.ctaSub}>
            We'll pin this palette to your planning circle so vendors, moodboards,
            and your shopping picks all start from the same color story.
          </p>
          <button
            type="button"
            className={styles.ctaButton}
            onClick={onSave}
            disabled={alreadySaved}
            style={{ background: palette.primary }}
          >
            {alreadySaved ? 'Saved' : 'Save this palette'}
          </button>
          <button type="button" className={styles.ctaSecondary} onClick={onBack}>
            keep browsing palettes
          </button>
        </div>
      </section>
    </div>
  );
}

// ── Category section (switches between the four content types) ───────

function CategorySection({
  palette,
  category,
}: {
  palette: Palette;
  category: CategoryId;
}) {
  const meta = CATEGORIES.find((c) => c.id === category)!;

  return (
    <section className={styles.section} key={category}>
      <div className={styles.sectionHeading}>
        <span className={styles.scrawl}>{meta.scrawl}</span>
        <h2 dangerouslySetInnerHTML={{ __html: meta.heading }} />
      </div>

      {category === 'weddings' && (
        <div className={styles.weddingsGrid}>
          {palette.weddings.map((w, i) => (
            <article
              key={w.couple}
              className={styles.weddingCard}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className={styles.weddingMedia}>
                <img src={w.image} alt={w.couple} loading="lazy" />
                <span className={styles.weddingSticker}>{w.guests} guests</span>
              </div>
              <div className={styles.weddingBody}>
                <div className={styles.weddingPills}>
                  {w.events.map((e) => (
                    <span key={e} className={styles.weddingPill}>{e}</span>
                  ))}
                </div>
                <h3 className={styles.weddingNames}>
                  {(() => {
                    const [a, b] = w.couple.split(' & ');
                    return (<><span>{a}</span> <em>&</em> <span>{b}</span></>);
                  })()}
                </h3>
                <p className={styles.weddingMeta}>{w.city}</p>
                <p className={styles.weddingHook}>{w.hook}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {category === 'decor' && (
        <div className={styles.decorGrid}>
          {palette.decor.map((d, i) => (
            <article
              key={d.title}
              className={styles.decorCard}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <img src={d.image} alt={d.title} className={styles.decorImg} loading="lazy" />
              <div className={styles.decorCaption}>
                <h3 className={styles.decorTitle}>{d.title}</h3>
                <p className={styles.decorMaterials}>{d.materials}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {category === 'attire' && (
        <div className={styles.attireGrid}>
          {palette.attire.map((a, i) => (
            <article
              key={a.title}
              className={styles.attireCard}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={styles.attireMedia}>
                <img src={a.image} alt={a.title} loading="lazy" />
                <span className={styles.attireBadge}>{a.badge}</span>
              </div>
              <div className={styles.attireBody}>
                <h3 className={styles.attireTitle}>{a.title}</h3>
                <p className={styles.attireMeta}>{a.meta}</p>
                <span className={styles.attireDesigner}>{a.designer}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {category === 'stationery' && (
        <div className={styles.stationeryGrid}>
          {palette.stationery.map((s, i) => (
            <article
              key={s.title}
              className={styles.stationeryCard}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className={styles.stationeryMedia}>
                <img src={s.image} alt={s.title} loading="lazy" />
              </div>
              <h3 className={styles.stationeryTitle}>{s.title}</h3>
              <p className={styles.stationeryDetail}>{s.detail}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

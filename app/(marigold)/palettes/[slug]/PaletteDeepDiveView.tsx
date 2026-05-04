'use client';

// ── The Marigold · Color Palette Deep Dive ────────────────────────────
// Self-contained editorial deep-dive for a single palette inside The
// Studio. Tailwind utilities for layout/spacing; inline styles for brand
// values (colors + display/script fonts). Matches the homepage and the
// Planning Circle blog visual language exactly.

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

// ── Brand tokens (mirror the marigold-root CSS variables) ────────────
const T = {
  cream: '#FFF8F2',
  blush: '#FBEAF0',
  wine: '#4B1528',
  wineDeep: '#3A0F1E',
  pink: '#D4537E',
  hotPink: '#ED93B1',
  deepPink: '#993556',
  mauve: '#8A6070',
  gold: '#D4A853',
  goldLight: '#F5E6C8',
};

const F = {
  display: '"Cormorant Garamond","Playfair Display",Georgia,serif',
  serif: '"Fraunces",Georgia,serif',
  script: '"Caveat",cursive',
  syne: '"Syne","Inter",sans-serif',
  body: '"Space Grotesk","Inter",sans-serif',
};

// ── Image helper (Unsplash placeholders) ─────────────────────────────
const u = (sig: string, w = 900, h = 1100, q = 'indian-wedding') =>
  `https://source.unsplash.com/featured/${w}x${h}/?${encodeURIComponent(q)}&sig=${encodeURIComponent(sig)}`;

// ── Types ────────────────────────────────────────────────────────────

type Tone = 'pink' | 'gold' | 'wine';
type WeddingEvent = 'haldi' | 'mehendi' | 'sangeet' | 'reception' | 'ceremony';
type DecorKind = 'mandaps' | 'tablescapes' | 'florals' | 'lighting' | 'lounges';
type AttireKind = 'bridal' | 'groom' | 'bridesmaids' | 'accessories';
type InviteKind = 'full-suites' | 'save-the-dates' | 'menus' | 'programs';
type BadgeLabel = 'EDITOR PICK' | 'MOST SAVED' | 'TRENDING' | 'NEW' | 'OUR NAMESAKE';

type Wedding = {
  id: string;
  couple: string;
  city: string; // DFW area
  date: string;
  venue: string;
  guests: number;
  events: WeddingEvent[];
  hook: string;
  image: string;
  badge?: BadgeLabel;
  aspect?: 'tall' | 'wide' | 'square';
};

type Decor = {
  id: string;
  title: string;
  materials: string;
  kind: DecorKind;
  image: string;
  badge?: BadgeLabel;
  hook?: string;
  aspect?: 'tall' | 'wide' | 'square';
};

type Attire = {
  id: string;
  title: string;
  designer: string;
  meta: string;
  kind: AttireKind;
  image: string;
  badge?: BadgeLabel;
  hook?: string;
};

type Invite = {
  id: string;
  title: string;
  detail: string;
  kind: InviteKind;
  image: string;
  badge?: BadgeLabel;
};

type Palette = {
  slug: string;
  name: string; // "Rani Pink & Emerald" — second half italicised in display
  italicWord: string; // word/phrase to italicize ("Emerald")
  tagline: string;
  description: string;
  swatches: { hex: string; label: string }[];
  primary: string; // CTA color
  accent: string; // secondary brand pick from the palette
  badge: { label: BadgeLabel; tone: Tone };
  comingUp: { label: string; body: string };
  weddings: Wedding[];
  decor: Decor[];
  attire: Attire[];
  invites: Invite[];
};

// ── Palette catalogue ────────────────────────────────────────────────
// 8 palettes (matches the landing). Rich content for the 4 hero picks;
// tighter but still complete editorial sets for the others.

const PALETTES: Palette[] = [
  // ───────────────────────────────────────────────────── RANI × EMERALD
  {
    slug: 'rani-pink-emerald',
    name: 'Rani Pink & Emerald',
    italicWord: 'Emerald',
    tagline: 'bold tradition, lush sophistication',
    description:
      "The classic North Indian power couple — magenta and forest green, the way your nani would wear them, but with a 2026 sensibility. Saturated, ceremonial, photographs like a dream. This is the palette the algorithm wants you to have, and for once, the algorithm is right.",
    swatches: [
      { hex: '#C8235A', label: 'Rani Pink' },
      { hex: '#0F5132', label: 'Emerald' },
      { hex: '#F4C95D', label: 'Marigold' },
      { hex: '#F9E8E0', label: 'Rose Mist' },
      { hex: '#5C0F2D', label: 'Wine' },
    ],
    primary: '#C8235A',
    accent: '#0F5132',
    badge: { label: 'MOST SAVED', tone: 'pink' },
    comingUp: {
      label: 'a real wedding in this palette',
      body: 'Aanya & Kabir, Frisco, December 2026. Set a reminder →',
    },
    weddings: [
      {
        id: 'aanya-kabir',
        couple: 'Aanya & Kabir',
        city: 'Frisco, TX',
        date: 'December 2026',
        venue: 'The Westin Stonebriar',
        guests: 320,
        events: ['mehendi', 'sangeet', 'reception'],
        hook: 'a magenta lehenga, an emerald sherwani, and a baraat that closed half of legacy west',
        image: u('rani-w1', 900, 1100, 'indian-wedding-pink-green'),
        badge: 'EDITOR PICK',
        aspect: 'tall',
      },
      {
        id: 'riya-arjun',
        couple: 'Riya & Arjun',
        city: 'Plano, TX',
        date: 'November 2026',
        venue: 'Renaissance Dallas at Plano Legacy West',
        guests: 280,
        events: ['haldi', 'ceremony', 'reception'],
        hook: "her mom called it 'the wedding she'd plan again'",
        image: u('rani-w2', 900, 700, 'indian-wedding-emerald'),
        aspect: 'wide',
      },
      {
        id: 'sana-karan',
        couple: 'Sana & Karan',
        city: 'Southlake, TX',
        date: 'February 2027',
        venue: 'Hotel Drover (Fort Worth)',
        guests: 220,
        events: ['mehendi', 'sangeet', 'ceremony'],
        hook: 'pink rose canopy, emerald velvet jaipur tents',
        image: u('rani-w3', 800, 800, 'indian-wedding-mehendi'),
        aspect: 'square',
      },
      {
        id: 'meera-vir',
        couple: 'Meera & Vir',
        city: 'McKinney, TX',
        date: 'October 2026',
        venue: 'Stonebridge Ranch Country Club',
        guests: 260,
        events: ['sangeet', 'ceremony', 'reception'],
        hook: 'an emerald-mandap pheras nobody could photograph wrong',
        image: u('rani-w4', 900, 1100, 'wedding-mandap-green'),
        badge: 'TRENDING',
        aspect: 'tall',
      },
      {
        id: 'tara-rohan',
        couple: 'Tara & Rohan',
        city: 'Irving, TX',
        date: 'January 2027',
        venue: 'Four Seasons Resort and Club Dallas',
        guests: 380,
        events: ['mehendi', 'sangeet', 'reception'],
        hook: 'the sangeet ended with phupho leading the dhol circle. you had to be there.',
        image: u('rani-w5', 900, 700, 'indian-sangeet-pink'),
        aspect: 'wide',
      },
      {
        id: 'naina-aarav',
        couple: 'Naina & Aarav',
        city: 'Allen, TX',
        date: 'March 2027',
        venue: 'The Watters Creek Atrium',
        guests: 180,
        events: ['ceremony', 'reception'],
        hook: 'small wedding, rani-pink lehenga, every detail intentional',
        image: u('rani-w6', 800, 900, 'indian-bride-pink'),
        aspect: 'tall',
      },
    ],
    decor: [
      {
        id: 'rani-d1',
        title: 'Velvet Pheras Mandap',
        materials: 'Emerald velvet panels, rani-pink rose garlands, antique gold frame',
        kind: 'mandaps',
        image: u('rani-d1', 800, 1000, 'wedding-mandap-velvet'),
        badge: 'MOST SAVED',
        hook: 'the mandap alone is worth the click',
        aspect: 'tall',
      },
      {
        id: 'rani-d2',
        title: 'Garland Cascade',
        materials: 'Marigold, rose, rajnigandha — 12-foot drape, cluster-tied',
        kind: 'florals',
        image: u('rani-d2', 800, 800, 'rose-garland-wedding'),
        aspect: 'square',
      },
      {
        id: 'rani-d3',
        title: 'Hot-Pink Reception Tablescape',
        materials: 'Hot-pink linen, brass thalis, taper candles, peony center',
        kind: 'tablescapes',
        image: u('rani-d3', 800, 900, 'wedding-tablescape-pink'),
        hook: 'the centerpiece you screenshot',
      },
      {
        id: 'rani-d4',
        title: 'Mirror-Panel Sangeet Stage',
        materials: 'Mirror panels, neon scribble signage, pink chiffon ceiling',
        kind: 'mandaps',
        image: u('rani-d4', 800, 1100, 'sangeet-stage-pink'),
        aspect: 'tall',
      },
      {
        id: 'rani-d5',
        title: 'Emerald Velvet Lounge',
        materials: 'Emerald velvet sofas, brass coffee tables, pink pampas',
        kind: 'lounges',
        image: u('rani-d5', 800, 800, 'wedding-lounge-emerald'),
        aspect: 'square',
      },
      {
        id: 'rani-d6',
        title: 'Brass Lantern Aisle',
        materials: 'Antique brass lanterns, candles, marigold strewn runner',
        kind: 'lighting',
        image: u('rani-d6', 800, 1100, 'wedding-aisle-lanterns'),
        aspect: 'tall',
      },
      {
        id: 'rani-d7',
        title: 'Peony & Tuberose Centerpiece',
        materials: 'Garden roses, peonies, tuberose, brass urli',
        kind: 'florals',
        image: u('rani-d7', 800, 900, 'wedding-flowers-pink'),
        badge: 'NEW',
      },
      {
        id: 'rani-d8',
        title: 'Crystal Chandelier Sky',
        materials: 'Layered crystal chandeliers, draped pink chiffon, warm uplights',
        kind: 'lighting',
        image: u('rani-d8', 800, 1100, 'wedding-chandelier-pink'),
        aspect: 'tall',
      },
    ],
    attire: [
      {
        id: 'rani-a1',
        title: 'Bridal Lehenga',
        designer: 'Sabyasachi · custom',
        meta: 'Magenta raw silk, gold zardozi, dupatta in emerald net',
        kind: 'bridal',
        image: u('rani-a1', 800, 1100, 'sabyasachi-lehenga-pink'),
        badge: 'EDITOR PICK',
        hook: 'she changed three times. every look was a moment.',
      },
      {
        id: 'rani-a2',
        title: "Groom's Sherwani",
        designer: 'Manish Malhotra',
        meta: 'Forest-green silk, gold thread embroidery, rani-pink stole',
        kind: 'groom',
        image: u('rani-a2', 800, 1100, 'sherwani-emerald'),
      },
      {
        id: 'rani-a3',
        title: 'Bridesmaid Lehengas',
        designer: 'Anita Dongre',
        meta: 'Dusty pink georgette, ivory dupatta, gold border',
        kind: 'bridesmaids',
        image: u('rani-a3', 800, 1100, 'bridesmaid-lehenga-pink'),
      },
      {
        id: 'rani-a4',
        title: 'Reception Banarasi Sari',
        designer: 'Raw Mango',
        meta: 'Emerald Banarasi silk, gold tissue pallu, ruby borders',
        kind: 'bridal',
        image: u('rani-a4', 800, 1100, 'banarasi-sari-emerald'),
        badge: 'MOST SAVED',
      },
      {
        id: 'rani-a5',
        title: 'Polki Choker & Maang Tikka',
        designer: 'Sunita Shekhawat',
        meta: 'Uncut diamonds, emerald drops, pearl strings',
        kind: 'accessories',
        image: u('rani-a5', 800, 1100, 'indian-jewelry-polki'),
      },
      {
        id: 'rani-a6',
        title: 'Groom Pagdi & Sehra',
        designer: 'Tarun Tahiliani',
        meta: 'Emerald silk pagdi, pearl sehra, gold brooch',
        kind: 'accessories',
        image: u('rani-a6', 800, 1100, 'groom-pagdi-emerald'),
      },
    ],
    invites: [
      {
        id: 'rani-s1',
        title: 'Letterpress Invitation Suite',
        detail: 'Letterpress on cream cotton, gold foil borders, magenta wax seal',
        kind: 'full-suites',
        image: u('rani-s1', 800, 1100, 'wedding-invitation-pink-gold'),
        badge: 'EDITOR PICK',
      },
      {
        id: 'rani-s2',
        title: 'Peacock Save the Date',
        detail: 'Hand-painted peacock motif, emerald envelope, pink calligraphy',
        kind: 'save-the-dates',
        image: u('rani-s2', 800, 1100, 'save-the-date-peacock'),
      },
      {
        id: 'rani-s3',
        title: 'Reception Menu Card',
        detail: 'Emerald cardstock, gold edging, calligraphed in Devanagari',
        kind: 'menus',
        image: u('rani-s3', 800, 1100, 'wedding-menu-card'),
      },
      {
        id: 'rani-s4',
        title: 'Pheras Programme',
        detail: 'Booklet on cotton paper, gold tassel, ritual translations side-by-side',
        kind: 'programs',
        image: u('rani-s4', 800, 1100, 'wedding-programme'),
      },
    ],
  },

  // ────────────────────────────────────────────── MARIGOLD × BURGUNDY
  {
    slug: 'marigold-burgundy',
    name: 'Marigold & Burgundy',
    italicWord: 'Burgundy',
    tagline: 'festive warmth, ceremonial depth',
    description:
      "The palette of haldi-soaked afternoons and burgundy-velvet evenings. Saffron and deep wine, with copper holding the room together. The Marigold's namesake — and our most-saved.",
    swatches: [
      { hex: '#E8A341', label: 'Marigold' },
      { hex: '#7A1B2E', label: 'Burgundy' },
      { hex: '#C4541F', label: 'Copper' },
      { hex: '#F2D6A6', label: 'Cream' },
      { hex: '#3F0F1F', label: 'Wine Deep' },
    ],
    primary: '#7A1B2E',
    accent: '#E8A341',
    badge: { label: 'OUR NAMESAKE', tone: 'gold' },
    comingUp: {
      label: 'a real wedding in this palette',
      body: 'Diya & Rohan, McKinney, October 2026. Set a reminder →',
    },
    weddings: [
      {
        id: 'diya-rohan',
        couple: 'Diya & Rohan',
        city: 'McKinney, TX',
        date: 'October 2026',
        venue: 'Stonebridge Ranch Country Club',
        guests: 290,
        events: ['haldi', 'mehendi', 'ceremony'],
        hook: 'a backyard haldi that turned into a marigold-strewn pheras',
        image: u('mari-w1', 900, 1100, 'haldi-marigold'),
        badge: 'OUR NAMESAKE',
        aspect: 'tall',
      },
      {
        id: 'sahana-karthik',
        couple: 'Sahana & Karthik',
        city: 'Grapevine, TX',
        date: 'November 2026',
        venue: 'Gaylord Texan Resort',
        guests: 210,
        events: ['sangeet', 'ceremony', 'reception'],
        hook: "burgundy lehenga, saffron pagdi, and a baraat horse named 'mango.' real story.",
        image: u('mari-w2', 900, 700, 'wedding-burgundy-gold'),
        aspect: 'wide',
      },
      {
        id: 'priya-arnav',
        couple: 'Priya & Arnav',
        city: 'Plano, TX',
        date: 'September 2026',
        venue: 'The Westin Dallas Stonebriar',
        guests: 240,
        events: ['mehendi', 'sangeet', 'reception'],
        hook: 'a copper-pipe sangeet stage that won her dad over (he was hard to win)',
        image: u('mari-w3', 800, 1000, 'sangeet-copper'),
        badge: 'TRENDING',
        aspect: 'tall',
      },
      {
        id: 'tanvi-imran',
        couple: 'Tanvi & Imran',
        city: 'Fort Worth, TX',
        date: 'October 2026',
        venue: 'The Worthington Renaissance',
        guests: 320,
        events: ['mehendi', 'reception'],
        hook: 'an interfaith reception with marigold strings two stories tall',
        image: u('mari-w4', 800, 800, 'wedding-marigold-strings'),
        aspect: 'square',
      },
      {
        id: 'kiran-yash',
        couple: 'Kiran & Yash',
        city: 'Irving, TX',
        date: 'January 2027',
        venue: 'Four Seasons Resort Las Colinas',
        guests: 360,
        events: ['sangeet', 'ceremony', 'reception'],
        hook: 'a copper-foiled mandap that the photographer cried over',
        image: u('mari-w5', 900, 700, 'wedding-mandap-copper'),
        aspect: 'wide',
      },
      {
        id: 'aaliya-dev',
        couple: 'Aaliya & Dev',
        city: 'Southlake, TX',
        date: 'March 2027',
        venue: "Hotel Vin's Harvest Hall",
        guests: 160,
        events: ['ceremony', 'reception'],
        hook: 'the haldi-yellow tablescape we keep saving for inspo files',
        image: u('mari-w6', 800, 1000, 'haldi-tablescape'),
        aspect: 'tall',
      },
    ],
    decor: [
      {
        id: 'mari-d1',
        title: 'Marigold Curtain',
        materials: '8,000 fresh marigolds, hemp cord, floor-to-ceiling',
        kind: 'florals',
        image: u('mari-d1', 800, 1100, 'marigold-flower-curtain'),
        badge: 'MOST SAVED',
        hook: 'this one went viral for a reason',
        aspect: 'tall',
      },
      {
        id: 'mari-d2',
        title: 'Haldi Setup',
        materials: 'Yellow gerbera, copper urli, banana-leaf table runners',
        kind: 'tablescapes',
        image: u('mari-d2', 800, 800, 'haldi-decor-yellow'),
        aspect: 'square',
      },
      {
        id: 'mari-d3',
        title: 'Burgundy Tablescape',
        materials: 'Wine-velvet runner, copper goblets, marigold heads',
        kind: 'tablescapes',
        image: u('mari-d3', 800, 900, 'wedding-table-burgundy'),
      },
      {
        id: 'mari-d4',
        title: 'Diya Wall',
        materials: 'Hand-thrown clay diyas, marigold strings, copper plate backing',
        kind: 'lighting',
        image: u('mari-d4', 800, 1100, 'diya-wall'),
        aspect: 'tall',
      },
      {
        id: 'mari-d5',
        title: 'Copper Pipe Mandap',
        materials: 'Welded copper geometry, marigold drape, saffron cushions',
        kind: 'mandaps',
        image: u('mari-d5', 800, 1000, 'mandap-copper-marigold'),
        badge: 'TRENDING',
        aspect: 'tall',
      },
      {
        id: 'mari-d6',
        title: 'Haldi Lounge',
        materials: 'Saffron cushions, woven jute floor, banana-leaf accents',
        kind: 'lounges',
        image: u('mari-d6', 800, 800, 'haldi-lounge'),
        aspect: 'square',
      },
      {
        id: 'mari-d7',
        title: 'Edison Bulb Canopy',
        materials: 'Hundreds of Edison bulbs, jute rope, copper hooks',
        kind: 'lighting',
        image: u('mari-d7', 800, 1100, 'edison-bulb-canopy'),
        aspect: 'tall',
      },
      {
        id: 'mari-d8',
        title: 'Brass Urli Centerpiece',
        materials: 'Brass urli, marigold heads, floating diyas',
        kind: 'florals',
        image: u('mari-d8', 800, 800, 'urli-marigold'),
      },
    ],
    attire: [
      {
        id: 'mari-a1',
        title: 'Haldi Lehenga',
        designer: 'Punit Balana',
        meta: 'Marigold cotton silk, mirror work, organza dupatta',
        kind: 'bridal',
        image: u('mari-a1', 800, 1100, 'haldi-yellow-lehenga'),
      },
      {
        id: 'mari-a2',
        title: 'Bridal Lehenga',
        designer: 'Sabyasachi',
        meta: 'Deep burgundy raw silk, gold gota patti, marigold-orange dupatta',
        kind: 'bridal',
        image: u('mari-a2', 800, 1100, 'burgundy-lehenga'),
        badge: 'EDITOR PICK',
        hook: 'every photo of this lehenga should be a magazine cover',
      },
      {
        id: 'mari-a3',
        title: 'Groom Achkan',
        designer: 'Shantanu & Nikhil',
        meta: 'Burgundy velvet, gold thread cuff, saffron stole',
        kind: 'groom',
        image: u('mari-a3', 800, 1100, 'achkan-burgundy'),
      },
      {
        id: 'mari-a4',
        title: 'Groom Pagdi',
        designer: 'Custom by Atelier Kotia',
        meta: 'Saffron silk, marigold thread, pearl center stone',
        kind: 'accessories',
        image: u('mari-a4', 800, 1100, 'groom-pagdi-saffron'),
      },
      {
        id: 'mari-a5',
        title: 'Bridesmaid Saris',
        designer: 'Ekaya Banaras',
        meta: 'Saffron Banarasi silk, copper border, contrast blouse',
        kind: 'bridesmaids',
        image: u('mari-a5', 800, 1100, 'sari-saffron'),
      },
      {
        id: 'mari-a6',
        title: 'Choodiyaan & Kaleere',
        designer: 'Mrinalini Chandra',
        meta: 'Copper-set kundan, marigold stones, hand-drop kaleere',
        kind: 'accessories',
        image: u('mari-a6', 800, 1100, 'indian-bangles-kaleere'),
      },
    ],
    invites: [
      {
        id: 'mari-s1',
        title: 'Burgundy Velvet Invitation Box',
        detail: 'Burgundy velvet box, copper-foil card, marigold pressed inside',
        kind: 'full-suites',
        image: u('mari-s1', 800, 1100, 'wedding-invitation-velvet'),
        badge: 'MOST SAVED',
      },
      {
        id: 'mari-s2',
        title: 'Saffron Save the Date',
        detail: 'Saffron envelope, burgundy wax seal, hand-illustrated diya',
        kind: 'save-the-dates',
        image: u('mari-s2', 800, 1100, 'save-the-date-marigold'),
      },
      {
        id: 'mari-s3',
        title: 'Mehendi Menu',
        detail: 'Hand-block-printed yellow paper, mehendi-pattern border',
        kind: 'menus',
        image: u('mari-s3', 800, 1100, 'mehendi-menu'),
      },
      {
        id: 'mari-s4',
        title: 'Sangeet Programme',
        detail: 'Letterpress on copper-flecked stock, bound with jute',
        kind: 'programs',
        image: u('mari-s4', 800, 1100, 'sangeet-programme'),
      },
    ],
  },

  // ────────────────────────────────────────────── ROYAL BLUE × GOLD
  {
    slug: 'royal-blue-antique-gold',
    name: 'Royal Blue & Antique Gold',
    italicWord: 'Antique Gold',
    tagline: 'palace energy with bite',
    description:
      'Sapphire, navy, peacock — paired with weathered gold instead of the shiny stuff. Reads regal, never costume-y. Best at golden hour and after dark.',
    swatches: [
      { hex: '#1A3A6E', label: 'Royal Blue' },
      { hex: '#0E1E47', label: 'Midnight' },
      { hex: '#C4A265', label: 'Antique Gold' },
      { hex: '#F4E5C2', label: 'Cream' },
      { hex: '#243B7A', label: 'Sapphire' },
    ],
    primary: '#1A3A6E',
    accent: '#C4A265',
    badge: { label: 'TRENDING', tone: 'wine' },
    comingUp: {
      label: 'a real wedding in this palette',
      body: 'Sana & Imran, Irving, January 2027. Set a reminder →',
    },
    weddings: [
      {
        id: 'sana-imran',
        couple: 'Sana & Imran',
        city: 'Irving, TX',
        date: 'January 2027',
        venue: 'Four Seasons Resort Las Colinas',
        guests: 380,
        events: ['mehendi', 'sangeet', 'ceremony', 'reception'],
        hook: 'baraat arrived on a vintage rolls-royce. the photos are unreal.',
        image: u('royal-w1', 900, 1100, 'wedding-blue-decor'),
        badge: 'TRENDING',
        aspect: 'tall',
      },
      {
        id: 'tara-vikram',
        couple: 'Tara & Vikram',
        city: 'Allen, TX',
        date: 'February 2027',
        venue: 'Watters Creek Atrium',
        guests: 260,
        events: ['sangeet', 'ceremony'],
        hook: 'peacock-blue lehenga, sherwani in matching navy, mandap dripping in gold tassels',
        image: u('royal-w2', 900, 700, 'wedding-peacock-blue'),
        aspect: 'wide',
      },
      {
        id: 'isha-veer',
        couple: 'Isha & Veer',
        city: 'Frisco, TX',
        date: 'October 2026',
        venue: 'The Westin Stonebriar',
        guests: 300,
        events: ['mehendi', 'reception'],
        hook: 'the navy-velvet sangeet stage with brass moon cutouts',
        image: u('royal-w3', 800, 1000, 'sangeet-navy-velvet'),
        aspect: 'tall',
      },
      {
        id: 'amrita-zayd',
        couple: 'Amrita & Zayd',
        city: 'Plano, TX',
        date: 'December 2026',
        venue: 'The Renaissance Plano Legacy West',
        guests: 240,
        events: ['ceremony', 'reception'],
        hook: 'a 12-piece string section played qawwali. nobody dared talk through it.',
        image: u('royal-w4', 800, 800, 'wedding-blue-string-quartet'),
        badge: 'EDITOR PICK',
        aspect: 'square',
      },
      {
        id: 'maya-ishan',
        couple: 'Maya & Ishan',
        city: 'Southlake, TX',
        date: 'November 2026',
        venue: 'Marriott Hotel & Golf Club at Champions Circle',
        guests: 200,
        events: ['mehendi', 'sangeet'],
        hook: 'gold-thread mehendi backdrop, sapphire chiffon ceiling',
        image: u('royal-w5', 900, 700, 'mehendi-gold-blue'),
        aspect: 'wide',
      },
    ],
    decor: [
      {
        id: 'royal-d1',
        title: 'Sangeet Stage',
        materials: 'Royal-blue velvet curtain, antique-gold chandelier, mirror floor',
        kind: 'mandaps',
        image: u('royal-d1', 800, 1100, 'sangeet-stage-blue'),
        badge: 'EDITOR PICK',
        aspect: 'tall',
      },
      {
        id: 'royal-d2',
        title: 'Mandap Drape',
        materials: 'Hand-knotted gold tassels, navy silk panels, brass uprights',
        kind: 'mandaps',
        image: u('royal-d2', 800, 1000, 'mandap-blue-gold'),
        hook: 'we still think about this mandap',
        aspect: 'tall',
      },
      {
        id: 'royal-d3',
        title: 'Antique Centerpiece',
        materials: 'Antique gold urn, white and blue thistle, eucalyptus drape',
        kind: 'florals',
        image: u('royal-d3', 800, 800, 'wedding-centerpiece-blue'),
        aspect: 'square',
      },
      {
        id: 'royal-d4',
        title: 'Lighting Plan',
        materials: 'Warm uplights, brass lanterns, candle clusters on raised platforms',
        kind: 'lighting',
        image: u('royal-d4', 800, 1000, 'wedding-lighting-warm'),
      },
      {
        id: 'royal-d5',
        title: 'Velvet Lounge',
        materials: 'Royal-blue velvet sofas, brass coffee tables, white peonies',
        kind: 'lounges',
        image: u('royal-d5', 800, 800, 'wedding-lounge-velvet-blue'),
      },
      {
        id: 'royal-d6',
        title: 'Reception Tablescape',
        materials: 'Navy linen, gold flatware, antique-brass thalis, blue-thistle posies',
        kind: 'tablescapes',
        image: u('royal-d6', 800, 1000, 'reception-table-blue-gold'),
      },
      {
        id: 'royal-d7',
        title: 'Brass Lantern Aisle',
        materials: 'Tall brass lanterns, navy runner, white phalaenopsis',
        kind: 'lighting',
        image: u('royal-d7', 800, 1100, 'brass-lantern-aisle'),
        aspect: 'tall',
      },
      {
        id: 'royal-d8',
        title: 'Peacock Floral Arch',
        materials: 'Peacock blooms, dried palm, gold-foil monogram',
        kind: 'florals',
        image: u('royal-d8', 800, 800, 'peacock-arch'),
        badge: 'NEW',
      },
    ],
    attire: [
      {
        id: 'royal-a1',
        title: 'Bridal Lehenga',
        designer: 'Rimple & Harpreet Narula',
        meta: 'Sapphire raw silk, antique-gold zardozi, peacock-motif dupatta',
        kind: 'bridal',
        image: u('royal-a1', 800, 1100, 'lehenga-blue-gold'),
        badge: 'EDITOR PICK',
      },
      {
        id: 'royal-a2',
        title: 'Groom Sherwani',
        designer: 'Raghavendra Rathore',
        meta: 'Navy raw silk, gold dabka, antique brooch and stole',
        kind: 'groom',
        image: u('royal-a2', 800, 1100, 'sherwani-navy-gold'),
      },
      {
        id: 'royal-a3',
        title: 'Bridesmaid Saris',
        designer: 'Ekaya Banaras',
        meta: 'Peacock-blue Kanjivaram, gold border, contrast blouse',
        kind: 'bridesmaids',
        image: u('royal-a3', 800, 1100, 'kanjivaram-blue'),
      },
      {
        id: 'royal-a4',
        title: 'Reception Gown',
        designer: 'Gaurav Gupta',
        meta: 'Midnight crepe, antique-gold sequin train, off-shoulder',
        kind: 'bridal',
        image: u('royal-a4', 800, 1100, 'reception-gown-midnight'),
      },
      {
        id: 'royal-a5',
        title: 'Polki Necklace Set',
        designer: 'Hazoorilal Legacy',
        meta: 'Antique-gold polki, sapphire centerpiece, pearl drops',
        kind: 'accessories',
        image: u('royal-a5', 800, 1100, 'polki-necklace-blue'),
        badge: 'MOST SAVED',
      },
      {
        id: 'royal-a6',
        title: 'Groom Sehra & Brooch',
        designer: 'Custom · Tarun Tahiliani',
        meta: 'Gold sehra, antique-gold brooch with sapphire',
        kind: 'accessories',
        image: u('royal-a6', 800, 1100, 'groom-sehra-gold'),
      },
    ],
    invites: [
      {
        id: 'royal-s1',
        title: 'Mughal-Arch Invitation Suite',
        detail: 'Navy cardstock, gold foil mughal-arch design, ribbon tied',
        kind: 'full-suites',
        image: u('royal-s1', 800, 1100, 'invitation-blue-gold'),
        badge: 'EDITOR PICK',
      },
      {
        id: 'royal-s2',
        title: 'Welcome Box',
        detail: 'Royal-blue silk box, gold-stamped welcome letter, brass key',
        kind: 'save-the-dates',
        image: u('royal-s2', 800, 1100, 'wedding-welcome-box'),
      },
      {
        id: 'royal-s3',
        title: 'Reception Menu',
        detail: 'Vellum overlay on navy, gold-edged, calligraphed in English and Urdu',
        kind: 'menus',
        image: u('royal-s3', 800, 1100, 'wedding-menu-blue'),
      },
      {
        id: 'royal-s4',
        title: 'Pheras Programme',
        detail: 'Bound book on cotton paper, gold-block print, sapphire ribbon',
        kind: 'programs',
        image: u('royal-s4', 800, 1100, 'wedding-programme-blue'),
      },
    ],
  },

  // ─────────────────────────────────────────── IVORY × CHAMPAGNE GOLD
  {
    slug: 'ivory-champagne-gold',
    name: 'Ivory & Champagne Gold',
    italicWord: 'Champagne Gold',
    tagline: 'quiet luxury, ceremonial restraint',
    description:
      'For couples who want their photography to look like a perfume ad. Ivory, antique gold, blush undertones — the palette that lets the people in the room be the loudest thing.',
    swatches: [
      { hex: '#F5EFE2', label: 'Ivory' },
      { hex: '#E0CB97', label: 'Champagne' },
      { hex: '#C4A265', label: 'Antique Gold' },
      { hex: '#FFFDF5', label: 'Cream' },
      { hex: '#8C6E47', label: 'Bronze' },
    ],
    primary: '#C4A265',
    accent: '#8C6E47',
    badge: { label: 'EDITOR PICK', tone: 'gold' },
    comingUp: {
      label: 'a real wedding in this palette',
      body: 'Maya & Dev, Southlake, October 2026. Set a reminder →',
    },
    weddings: [
      {
        id: 'maya-dev',
        couple: 'Maya & Dev',
        city: 'Southlake, TX',
        date: 'October 2026',
        venue: 'The Aristide Mansfield',
        guests: 220,
        events: ['ceremony', 'reception'],
        hook: 'a champagne-and-cream estate wedding where the only color was the saffron mandap fire',
        image: u('ivory-w1', 900, 1100, 'wedding-ivory-cream'),
        badge: 'EDITOR PICK',
        aspect: 'tall',
      },
      {
        id: 'priya-rohan-i',
        couple: 'Priya & Rohan',
        city: 'Fort Worth, TX',
        date: 'November 2026',
        venue: 'The Worthington Renaissance',
        guests: 180,
        events: ['haldi', 'ceremony'],
        hook: "her nani's pearls, an heirloom banarasi, and a gold mandap. quiet, exact, gorgeous.",
        image: u('ivory-w2', 900, 700, 'wedding-pearl-ivory'),
        aspect: 'wide',
      },
      {
        id: 'leena-amir',
        couple: 'Leena & Amir',
        city: 'Frisco, TX',
        date: 'February 2027',
        venue: 'The Westin Stonebriar',
        guests: 240,
        events: ['ceremony', 'reception'],
        hook: 'an interfaith ceremony with ivory orchid arches that took three days to set',
        image: u('ivory-w3', 800, 800, 'wedding-orchid-ivory'),
        aspect: 'square',
      },
      {
        id: 'anaya-rishi',
        couple: 'Anaya & Rishi',
        city: 'Allen, TX',
        date: 'March 2027',
        venue: 'Watters Creek Atrium',
        guests: 160,
        events: ['ceremony', 'reception'],
        hook: 'her reception dress was vintage Falguni — found in her aunt\'s closet',
        image: u('ivory-w4', 800, 1000, 'reception-ivory-gown'),
        badge: 'TRENDING',
        aspect: 'tall',
      },
    ],
    decor: [
      {
        id: 'ivory-d1',
        title: 'Carved Wood Mandap',
        materials: 'Antique teak, ivory drape, white phalaenopsis cascade',
        kind: 'mandaps',
        image: u('ivory-d1', 800, 1100, 'wood-mandap-ivory'),
        badge: 'MOST SAVED',
        hook: 'we want this in our living room',
        aspect: 'tall',
      },
      {
        id: 'ivory-d2',
        title: 'Cream Tablescape',
        materials: 'Cream linen, gold flatware, white tuberose, taper candles',
        kind: 'tablescapes',
        image: u('ivory-d2', 800, 800, 'wedding-table-cream-gold'),
        aspect: 'square',
      },
      {
        id: 'ivory-d3',
        title: 'Ceiling Drape',
        materials: 'Hand-pleated chiffon, brass medallions, fairy lights',
        kind: 'lighting',
        image: u('ivory-d3', 800, 1100, 'wedding-ceiling-drape'),
        aspect: 'tall',
      },
      {
        id: 'ivory-d4',
        title: 'Welcome Lounge',
        materials: 'Cream tufted sofas, gold mirror, jasmine garland arch',
        kind: 'lounges',
        image: u('ivory-d4', 800, 1000, 'wedding-lounge-cream'),
      },
      {
        id: 'ivory-d5',
        title: 'Orchid Centerpiece',
        materials: 'White phalaenopsis, gold urn, ivory taper candles',
        kind: 'florals',
        image: u('ivory-d5', 800, 800, 'orchid-centerpiece'),
      },
      {
        id: 'ivory-d6',
        title: 'Brass Candle Wall',
        materials: 'Brass votive grid, ivory pillar candles, white roses below',
        kind: 'lighting',
        image: u('ivory-d6', 800, 1100, 'brass-candle-wall'),
        aspect: 'tall',
      },
    ],
    attire: [
      {
        id: 'ivory-a1',
        title: 'Bridal Lehenga',
        designer: 'Anamika Khanna',
        meta: 'Ivory raw silk, hand-cut gold zari, champagne organza dupatta',
        kind: 'bridal',
        image: u('ivory-a1', 800, 1100, 'ivory-lehenga'),
        badge: 'EDITOR PICK',
      },
      {
        id: 'ivory-a2',
        title: 'Groom Sherwani',
        designer: 'Tarun Tahiliani',
        meta: 'Cream silk, antique gold buttoning, ivory pagdi',
        kind: 'groom',
        image: u('ivory-a2', 800, 1100, 'cream-sherwani'),
      },
      {
        id: 'ivory-a3',
        title: 'Reception Gown',
        designer: 'Falguni Shane Peacock',
        meta: 'Champagne tulle, hand-set crystal, sweep train',
        kind: 'bridal',
        image: u('ivory-a3', 800, 1100, 'champagne-gown'),
      },
      {
        id: 'ivory-a4',
        title: 'Bridesmaid Saris',
        designer: 'Raw Mango',
        meta: 'Ivory chanderi, gold-tissue border, pearl-set blouse',
        kind: 'bridesmaids',
        image: u('ivory-a4', 800, 1100, 'sari-ivory-pearl'),
      },
    ],
    invites: [
      {
        id: 'ivory-s1',
        title: 'Engraved Invitation',
        detail: 'Ivory cotton, gold engraving, vellum overlay, wax seal',
        kind: 'full-suites',
        image: u('ivory-s1', 800, 1100, 'wedding-invitation-ivory'),
        badge: 'EDITOR PICK',
      },
      {
        id: 'ivory-s2',
        title: 'Programme Booklet',
        detail: 'Cream cardstock, gold foil monogram, silk tassel',
        kind: 'programs',
        image: u('ivory-s2', 800, 1100, 'wedding-programme'),
      },
      {
        id: 'ivory-s3',
        title: 'Place Cards',
        detail: 'Hand-calligraphed names, gold-leaf edge, dried jasmine sprig',
        kind: 'menus',
        image: u('ivory-s3', 800, 1100, 'place-card-calligraphy'),
      },
    ],
  },

  // ───────────────────────────────────────────── SAGE × TERRACOTTA
  {
    slug: 'sage-terracotta',
    name: 'Sage & Terracotta',
    italicWord: 'Terracotta',
    tagline: 'sun-warmed, garden-spilled',
    description:
      'For couples who want their wedding to feel like a long Sunday lunch in a Tuscan villa. Sage, dusty terracotta, dried-grass beige — earthy, romantic, never trend-chasing.',
    swatches: [
      { hex: '#A4B494', label: 'Sage' },
      { hex: '#C76F4B', label: 'Terracotta' },
      { hex: '#E8C8A0', label: 'Wheat' },
      { hex: '#6E8466', label: 'Olive' },
      { hex: '#5C2E1E', label: 'Burnt Earth' },
    ],
    primary: '#6E8466',
    accent: '#C76F4B',
    badge: { label: 'NEW', tone: 'pink' },
    comingUp: {
      label: 'a real wedding in this palette',
      body: 'Mira & Aarav, Grapevine, March 2027. Set a reminder →',
    },
    weddings: [
      {
        id: 'mira-aarav',
        couple: 'Mira & Aarav',
        city: 'Grapevine, TX',
        date: 'March 2027',
        venue: 'Hidden Pines Hill Country',
        guests: 140,
        events: ['ceremony', 'reception'],
        hook: 'an olive-grove ceremony in the hill country',
        image: u('sage-w1', 900, 1100, 'wedding-olive-sage'),
        badge: 'NEW',
        aspect: 'tall',
      },
      {
        id: 'anjali-sameer',
        couple: 'Anjali & Sameer',
        city: 'Fort Worth, TX',
        date: 'April 2027',
        venue: 'Stonewall Estate',
        guests: 110,
        events: ['mehendi', 'ceremony'],
        hook: 'aunties said it looked like a pinterest board come to life. compliment.',
        image: u('sage-w2', 900, 700, 'wedding-ranch-terracotta'),
        aspect: 'wide',
      },
      {
        id: 'kavya-rohan',
        couple: 'Kavya & Rohan',
        city: 'Weatherford, TX',
        date: 'May 2027',
        venue: 'Veranda by the Springs',
        guests: 130,
        events: ['ceremony', 'reception'],
        hook: 'an outdoor reception that felt like a vineyard at dusk',
        image: u('sage-w3', 800, 1000, 'wedding-vineyard'),
        aspect: 'tall',
      },
      {
        id: 'simran-kabir',
        couple: 'Simran & Kabir',
        city: 'Denton, TX',
        date: 'October 2026',
        venue: "Paniolo Ranch",
        guests: 90,
        events: ['ceremony'],
        hook: 'a 90-guest pheras inside an olive grove. nobody wanted to leave.',
        image: u('sage-w4', 800, 800, 'wedding-olive-grove'),
        badge: 'TRENDING',
        aspect: 'square',
      },
    ],
    decor: [
      {
        id: 'sage-d1',
        title: 'Olive-Branch Mandap',
        materials: 'Live olive branches, terracotta urns, beeswax tapers',
        kind: 'mandaps',
        image: u('sage-d1', 800, 1100, 'olive-branch-mandap'),
        badge: 'EDITOR PICK',
        hook: 'every wedding pinterest board has this saved',
        aspect: 'tall',
      },
      {
        id: 'sage-d2',
        title: 'Tablescape',
        materials: 'Linen runner, terracotta charger, dried wheat, fig garland',
        kind: 'tablescapes',
        image: u('sage-d2', 800, 800, 'wedding-table-sage-terracotta'),
        aspect: 'square',
      },
      {
        id: 'sage-d3',
        title: 'Welcome Arch',
        materials: 'Pampas grass, eucalyptus, dried palm, jute rope',
        kind: 'florals',
        image: u('sage-d3', 800, 1000, 'wedding-pampas-arch'),
      },
      {
        id: 'sage-d4',
        title: 'Mehendi Lounge',
        materials: 'Sage cushions, bamboo low tables, hand-painted ceramic bowls',
        kind: 'lounges',
        image: u('sage-d4', 800, 1100, 'mehendi-lounge'),
        aspect: 'tall',
      },
      {
        id: 'sage-d5',
        title: 'Beeswax Lighting',
        materials: 'Hand-poured beeswax pillars, terracotta saucers, eucalyptus garland',
        kind: 'lighting',
        image: u('sage-d5', 800, 800, 'beeswax-candle-wedding'),
      },
      {
        id: 'sage-d6',
        title: 'Dried Wheat Centerpiece',
        materials: 'Bleached wheat, fig branch, terracotta jug',
        kind: 'florals',
        image: u('sage-d6', 800, 1000, 'wheat-centerpiece'),
      },
    ],
    attire: [
      {
        id: 'sage-a1',
        title: 'Bridal Lehenga',
        designer: 'Raw Mango',
        meta: 'Hand-dyed sage chanderi, terracotta thread embroidery, ivory dupatta',
        kind: 'bridal',
        image: u('sage-a1', 800, 1100, 'lehenga-sage-green'),
      },
      {
        id: 'sage-a2',
        title: 'Groom Bandhgala',
        designer: 'Antar-Agni',
        meta: 'Burnt-terracotta linen, hand-stitched buttons, sage pocket square',
        kind: 'groom',
        image: u('sage-a2', 800, 1100, 'bandhgala-terracotta'),
      },
      {
        id: 'sage-a3',
        title: 'Bridesmaid Saris',
        designer: 'Eka',
        meta: 'Soft-sage handloom cotton, contrast terracotta border',
        kind: 'bridesmaids',
        image: u('sage-a3', 800, 1100, 'sari-sage-cotton'),
      },
      {
        id: 'sage-a4',
        title: 'Hair Garland',
        designer: 'Petaluna Florals',
        meta: 'Fresh eucalyptus, dried wheat, terracotta ribbon',
        kind: 'accessories',
        image: u('sage-a4', 800, 1100, 'wedding-hair-garland'),
      },
    ],
    invites: [
      {
        id: 'sage-s1',
        title: 'Handmade Paper Suite',
        detail: 'Handmade kozo paper, sage ink, dried botanical pressed in',
        kind: 'full-suites',
        image: u('sage-s1', 800, 1100, 'invitation-handmade-paper'),
        badge: 'EDITOR PICK',
      },
      {
        id: 'sage-s2',
        title: 'Welcome Card',
        detail: 'Terracotta cardstock, olive-leaf illustration, twine-bound',
        kind: 'save-the-dates',
        image: u('sage-s2', 800, 1100, 'wedding-welcome-card'),
      },
      {
        id: 'sage-s3',
        title: 'Mehendi Menu',
        detail: 'Block-printed motif on linen-textured paper, sprig of rosemary',
        kind: 'menus',
        image: u('sage-s3', 800, 1100, 'mehendi-menu-paper'),
      },
    ],
  },

  // ───────────────────────────────────────── LAVENDER × SOFT GOLD
  {
    slug: 'lavender-soft-gold',
    name: 'Lavender & Soft Gold',
    italicWord: 'Soft Gold',
    tagline: 'soft girl shaadi energy',
    description:
      "Pale lilac, soft buttery gold, hints of lavender-blush. The palette that made every couple's mom say 'wait, this is actually beautiful.' Made for spring pheras and afternoon receptions.",
    swatches: [
      { hex: '#C9B6E4', label: 'Lavender' },
      { hex: '#F4E5B5', label: 'Soft Gold' },
      { hex: '#E5D5F0', label: 'Lilac Mist' },
      { hex: '#9B7BC4', label: 'Iris' },
      { hex: '#D4A853', label: 'Honey' },
    ],
    primary: '#9B7BC4',
    accent: '#D4A853',
    badge: { label: 'NEW', tone: 'pink' },
    comingUp: {
      label: 'a real wedding in this palette',
      body: 'Naina & Aryan, Plano, April 2027. Set a reminder →',
    },
    weddings: [
      {
        id: 'naina-aryan',
        couple: 'Naina & Aryan',
        city: 'Plano, TX',
        date: 'April 2027',
        venue: 'The Renaissance Plano Legacy West',
        guests: 200,
        events: ['mehendi', 'ceremony', 'reception'],
        hook: 'a lavender-field engagement that turned into a lilac-mandap pheras',
        image: u('lav-w1', 900, 1100, 'wedding-lavender-bride'),
        badge: 'NEW',
        aspect: 'tall',
      },
      {
        id: 'ishani-veer',
        couple: 'Ishani & Veer',
        city: 'Allen, TX',
        date: 'May 2027',
        venue: 'Watters Creek Atrium',
        guests: 160,
        events: ['sangeet', 'ceremony'],
        hook: "12-piece string section played 'tum hi ho.' first dance unspoiled.",
        image: u('lav-w2', 900, 700, 'wedding-lilac-sangeet'),
        aspect: 'wide',
      },
      {
        id: 'sara-yash-l',
        couple: 'Sara & Yash',
        city: 'Frisco, TX',
        date: 'March 2027',
        venue: 'The Star at Frisco — Omni',
        guests: 240,
        events: ['ceremony', 'reception'],
        hook: 'a lilac-and-gold reception in the omni ballroom',
        image: u('lav-w3', 800, 1000, 'wedding-lilac-reception'),
        aspect: 'tall',
      },
      {
        id: 'tia-aarav',
        couple: 'Tia & Aarav',
        city: 'Southlake, TX',
        date: 'June 2027',
        venue: "Hotel Vin's Harvest Hall",
        guests: 110,
        events: ['ceremony'],
        hook: 'an afternoon outdoor pheras in pale-purple chiffon',
        image: u('lav-w4', 800, 800, 'wedding-pale-purple'),
        aspect: 'square',
      },
    ],
    decor: [
      {
        id: 'lav-d1',
        title: 'Lilac Floral Mandap',
        materials: 'Fresh lilac, lisianthus, dusty miller, gold frame',
        kind: 'mandaps',
        image: u('lav-d1', 800, 1100, 'lilac-mandap'),
        badge: 'NEW',
        aspect: 'tall',
      },
      {
        id: 'lav-d2',
        title: 'Tablescape',
        materials: 'Lavender linen, gold rim glassware, sweet-pea posies',
        kind: 'tablescapes',
        image: u('lav-d2', 800, 800, 'wedding-table-lavender'),
        aspect: 'square',
      },
      {
        id: 'lav-d3',
        title: 'Aisle Runner',
        materials: 'Petal-strewn cream, lavender-stem markers, brass lanterns',
        kind: 'lighting',
        image: u('lav-d3', 800, 1100, 'wedding-aisle-petals'),
        aspect: 'tall',
      },
      {
        id: 'lav-d4',
        title: 'Sweet Pea Centerpiece',
        materials: 'Sweet peas, lilac sprigs, gold-rim glass',
        kind: 'florals',
        image: u('lav-d4', 800, 800, 'sweet-pea-centerpiece'),
      },
      {
        id: 'lav-d5',
        title: 'Lounge Vignette',
        materials: 'Soft-gold velvet sofas, lilac throw pillows, brass coffee tables',
        kind: 'lounges',
        image: u('lav-d5', 800, 1000, 'wedding-lounge-lavender'),
      },
      {
        id: 'lav-d6',
        title: 'Gold String Light Canopy',
        materials: 'Soft-gold string lights, chiffon drape, brass anchors',
        kind: 'lighting',
        image: u('lav-d6', 800, 1100, 'wedding-string-lights'),
        aspect: 'tall',
      },
    ],
    attire: [
      {
        id: 'lav-a1',
        title: 'Bridal Lehenga',
        designer: 'Manish Malhotra',
        meta: 'Pale-lilac georgette, hand-embroidered pearls, soft-gold dupatta',
        kind: 'bridal',
        image: u('lav-a1', 800, 1100, 'lehenga-lavender-pearl'),
        badge: 'EDITOR PICK',
      },
      {
        id: 'lav-a2',
        title: 'Groom Sherwani',
        designer: 'Kunal Rawal',
        meta: 'Soft-gold raw silk, lilac stole, mother-of-pearl buttons',
        kind: 'groom',
        image: u('lav-a2', 800, 1100, 'sherwani-soft-gold'),
      },
      {
        id: 'lav-a3',
        title: 'Reception Sari',
        designer: 'Tarun Tahiliani',
        meta: 'Lilac chiffon, gold tissue border, crystal-set blouse',
        kind: 'bridal',
        image: u('lav-a3', 800, 1100, 'sari-lilac-gold'),
      },
      {
        id: 'lav-a4',
        title: 'Bridesmaid Lehengas',
        designer: 'Anita Dongre',
        meta: 'Soft-gold tulle, lilac embroidery, ivory dupatta',
        kind: 'bridesmaids',
        image: u('lav-a4', 800, 1100, 'bridesmaid-lavender'),
      },
    ],
    invites: [
      {
        id: 'lav-s1',
        title: 'Lilac Paper Suite',
        detail: 'Lilac handmade paper, gold foil, dried-lavender stem inside',
        kind: 'full-suites',
        image: u('lav-s1', 800, 1100, 'invitation-lavender'),
        badge: 'NEW',
      },
      {
        id: 'lav-s2',
        title: 'RSVP Card',
        detail: 'Pale-purple cardstock, gold-embossed monogram, hand-tied ribbon',
        kind: 'save-the-dates',
        image: u('lav-s2', 800, 1100, 'rsvp-card-purple'),
      },
      {
        id: 'lav-s3',
        title: 'Reception Menu',
        detail: 'Vellum on lilac, gold script, pressed dried floral corner',
        kind: 'menus',
        image: u('lav-s3', 800, 1100, 'wedding-menu-lavender'),
      },
    ],
  },

  // ─────────────────────────────────────── DUSTY ROSE × DEEP TEAL
  {
    slug: 'dusty-rose-deep-teal',
    name: 'Dusty Rose & Deep Teal',
    italicWord: 'Deep Teal',
    tagline: 'old-world, candlelit, a little moody',
    description:
      'Muted rose and inky teal — the color of Rajasthani frescoes lit by candlelight. Reads vintage, never sweet. Best for evening pheras and havelis (or convincing imitations of them).',
    swatches: [
      { hex: '#C99094', label: 'Dusty Rose' },
      { hex: '#1F4D4F', label: 'Deep Teal' },
      { hex: '#7E3F45', label: 'Wine Mauve' },
      { hex: '#E5C4C0', label: 'Powder Rose' },
      { hex: '#0E2A2B', label: 'Inkwell' },
    ],
    primary: '#1F4D4F',
    accent: '#C99094',
    badge: { label: 'EDITOR PICK', tone: 'wine' },
    comingUp: {
      label: 'a real wedding in this palette',
      body: 'Kavya & Yash, Frisco, December 2026. Set a reminder →',
    },
    weddings: [
      {
        id: 'kavya-yash-t',
        couple: 'Kavya & Yash',
        city: 'Frisco, TX',
        date: 'December 2026',
        venue: 'The Renaissance Plano Legacy West',
        guests: 240,
        events: ['sangeet', 'ceremony', 'reception'],
        hook: 'she commissioned hand-painted fresco panels. they live in their dining room now.',
        image: u('teal-w1', 900, 1100, 'wedding-fresco-teal'),
        badge: 'EDITOR PICK',
        aspect: 'tall',
      },
      {
        id: 'reema-nikhil',
        couple: 'Reema & Nikhil',
        city: 'Southlake, TX',
        date: 'February 2027',
        venue: 'The Aristide Mansfield',
        guests: 180,
        events: ['ceremony', 'reception'],
        hook: '600 candles arranged like a star map. their photographer broke (in a good way).',
        image: u('teal-w2', 900, 700, 'wedding-candlelit-rose'),
        aspect: 'wide',
      },
      {
        id: 'noor-ishaan',
        couple: 'Noor & Ishaan',
        city: 'Irving, TX',
        date: 'March 2027',
        venue: 'Las Colinas Country Club',
        guests: 220,
        events: ['mehendi', 'ceremony'],
        hook: 'rajasthani jali-screen mandap that nobody could stop photographing',
        image: u('teal-w3', 800, 1000, 'wedding-jali-screen'),
        aspect: 'tall',
      },
      {
        id: 'aaria-rohan',
        couple: 'Aaria & Rohan',
        city: 'Plano, TX',
        date: 'November 2026',
        venue: 'The Westin Stonebriar',
        guests: 200,
        events: ['ceremony', 'reception'],
        hook: 'evening pheras under a candle-lit teal canopy',
        image: u('teal-w4', 800, 800, 'wedding-evening-teal'),
        aspect: 'square',
      },
    ],
    decor: [
      {
        id: 'teal-d1',
        title: 'Fresco Mandap',
        materials: 'Hand-painted teal panels, dusty-rose curtain, brass diyas',
        kind: 'mandaps',
        image: u('teal-d1', 800, 1100, 'fresco-mandap'),
        badge: 'EDITOR PICK',
        hook: 'this one went viral for a reason',
        aspect: 'tall',
      },
      {
        id: 'teal-d2',
        title: 'Candlelit Aisle',
        materials: '400 pillar candles, teal runner, dusty-rose petals',
        kind: 'lighting',
        image: u('teal-d2', 800, 800, 'wedding-candlelit-aisle'),
        aspect: 'square',
      },
      {
        id: 'teal-d3',
        title: 'Tablescape',
        materials: 'Teal velvet runner, antique-brass thalis, dried rose center',
        kind: 'tablescapes',
        image: u('teal-d3', 800, 900, 'wedding-table-teal-rose'),
      },
      {
        id: 'teal-d4',
        title: 'Reception Stage',
        materials: 'Rajasthani jali screens, dusty-rose drape, brass lantern wall',
        kind: 'mandaps',
        image: u('teal-d4', 800, 1100, 'wedding-stage-jali'),
        aspect: 'tall',
      },
      {
        id: 'teal-d5',
        title: 'Velvet Lounge',
        materials: 'Teal velvet sofas, dusty-rose throw pillows, antique-brass tables',
        kind: 'lounges',
        image: u('teal-d5', 800, 800, 'wedding-lounge-teal'),
      },
      {
        id: 'teal-d6',
        title: 'Dried Rose Centerpiece',
        materials: 'Dried garden roses, teal ceramic urn, brass votives',
        kind: 'florals',
        image: u('teal-d6', 800, 1000, 'dried-rose-centerpiece'),
      },
    ],
    attire: [
      {
        id: 'teal-a1',
        title: 'Bridal Lehenga',
        designer: 'Anita Dongre',
        meta: 'Dusty-rose velvet, gold gota, deep-teal dupatta',
        kind: 'bridal',
        image: u('teal-a1', 800, 1100, 'lehenga-dusty-rose'),
        badge: 'EDITOR PICK',
      },
      {
        id: 'teal-a2',
        title: 'Groom Sherwani',
        designer: 'Sabyasachi',
        meta: 'Deep-teal silk, antique-gold thread, rose-stone buttoning',
        kind: 'groom',
        image: u('teal-a2', 800, 1100, 'sherwani-teal'),
      },
      {
        id: 'teal-a3',
        title: 'Bridesmaid Lehengas',
        designer: 'Anita Dongre',
        meta: 'Dusty-rose chanderi, hand-block teal border',
        kind: 'bridesmaids',
        image: u('teal-a3', 800, 1100, 'bridesmaid-rose-teal'),
      },
      {
        id: 'teal-a4',
        title: 'Polki Maang Tikka & Earrings',
        designer: 'Hazoorilal Legacy',
        meta: 'Antique polki, dusty-rose enamel, pearl drops',
        kind: 'accessories',
        image: u('teal-a4', 800, 1100, 'polki-maang-tikka'),
      },
    ],
    invites: [
      {
        id: 'teal-s1',
        title: 'Miniature-Painting Suite',
        detail: 'Teal cotton paper, dusty-rose foil, miniature painting motif',
        kind: 'full-suites',
        image: u('teal-s1', 800, 1100, 'invitation-teal-rose'),
        badge: 'EDITOR PICK',
      },
      {
        id: 'teal-s2',
        title: 'Welcome Folder',
        detail: 'Block-printed teal, gold-leaf border, hand-tied silk thread',
        kind: 'save-the-dates',
        image: u('teal-s2', 800, 1100, 'wedding-welcome-folder'),
      },
      {
        id: 'teal-s3',
        title: 'Reception Menu',
        detail: 'Deep-teal cardstock, dusty-rose calligraphy, gold edge',
        kind: 'menus',
        image: u('teal-s3', 800, 1100, 'menu-card-teal'),
      },
    ],
  },

  // ─────────────────────────────────────── MIDNIGHT BLUE × COPPER
  {
    slug: 'midnight-blue-copper',
    name: 'Midnight Blue & Copper',
    italicWord: 'Copper',
    tagline: 'sangeet-but-make-it-electric',
    description:
      'Inky midnight blue with hammered copper. Reads contemporary, photographs cinematic, makes every uplight look intentional. Built for after-dark sangeets and reception finales.',
    swatches: [
      { hex: '#0C1A3A', label: 'Midnight' },
      { hex: '#B87333', label: 'Copper' },
      { hex: '#1F2D5C', label: 'Sapphire Deep' },
      { hex: '#E5A26B', label: 'Rose Copper' },
      { hex: '#0A1428', label: 'Inkwell' },
    ],
    primary: '#0C1A3A',
    accent: '#B87333',
    badge: { label: 'MOST SAVED', tone: 'gold' },
    comingUp: {
      label: 'a real wedding in this palette',
      body: 'Anika & Rohan, Frisco, January 2027. Set a reminder →',
    },
    weddings: [
      {
        id: 'anika-rohan-m',
        couple: 'Anika & Rohan',
        city: 'Frisco, TX',
        date: 'January 2027',
        venue: 'The Star at Frisco — Omni',
        guests: 350,
        events: ['sangeet', 'reception'],
        hook: '20-minute sangeet performance turned tiktok moment',
        image: u('mid-w1', 900, 1100, 'sangeet-blue-copper'),
        badge: 'MOST SAVED',
        aspect: 'tall',
      },
      {
        id: 'pooja-sid',
        couple: 'Pooja & Sid',
        city: 'Plano, TX',
        date: 'February 2027',
        venue: 'Gilley\'s Dallas',
        guests: 230,
        events: ['ceremony', 'reception'],
        hook: 'reception in a converted warehouse, copper pipe sculptures throughout',
        image: u('mid-w2', 900, 700, 'wedding-warehouse-blue'),
        aspect: 'wide',
      },
      {
        id: 'mira-zayn',
        couple: 'Mira & Zayn',
        city: 'Irving, TX',
        date: 'November 2026',
        venue: 'Four Seasons Resort Las Colinas',
        guests: 280,
        events: ['sangeet', 'reception'],
        hook: 'midnight-blue ballroom, copper draping the ceiling, a band you\'ve heard of',
        image: u('mid-w3', 800, 1000, 'sangeet-ballroom-copper'),
        aspect: 'tall',
      },
      {
        id: 'aria-vihan',
        couple: 'Aria & Vihan',
        city: 'Southlake, TX',
        date: 'March 2027',
        venue: 'Marriott Hotel & Golf Club at Champions Circle',
        guests: 200,
        events: ['mehendi', 'ceremony', 'reception'],
        hook: 'copper-and-navy mehendi that out-photographed the wedding',
        image: u('mid-w4', 800, 800, 'mehendi-copper-blue'),
        aspect: 'square',
      },
    ],
    decor: [
      {
        id: 'mid-d1',
        title: 'Copper Pipe Sculpture',
        materials: 'Welded copper geometry, hanging Edison bulbs, blue uplights',
        kind: 'lighting',
        image: u('mid-d1', 800, 1100, 'copper-sculpture-wedding'),
        badge: 'MOST SAVED',
        hook: 'we still think about this room',
        aspect: 'tall',
      },
      {
        id: 'mid-d2',
        title: 'Sangeet Dance Floor',
        materials: 'Mirrored midnight-blue floor, copper truss, smoke machine',
        kind: 'mandaps',
        image: u('mid-d2', 800, 800, 'sangeet-dance-floor'),
        aspect: 'square',
      },
      {
        id: 'mid-d3',
        title: 'Reception Tablescape',
        materials: 'Midnight-blue linen, hammered-copper chargers, blue thistle',
        kind: 'tablescapes',
        image: u('mid-d3', 800, 1000, 'wedding-table-blue-copper'),
      },
      {
        id: 'mid-d4',
        title: 'Bar Backdrop',
        materials: 'Copper-pipe shelving, midnight-blue velvet, neon scribble sign',
        kind: 'lounges',
        image: u('mid-d4', 800, 1100, 'wedding-bar-copper'),
        aspect: 'tall',
      },
      {
        id: 'mid-d5',
        title: 'Edison Canopy',
        materials: 'Copper string lights, Edison bulbs, navy chiffon drape',
        kind: 'lighting',
        image: u('mid-d5', 800, 800, 'edison-canopy-copper'),
      },
      {
        id: 'mid-d6',
        title: 'Bowed Copper Centerpiece',
        materials: 'Bent copper rod, white phalaenopsis, pillar candles',
        kind: 'florals',
        image: u('mid-d6', 800, 1000, 'copper-centerpiece-modern'),
      },
    ],
    attire: [
      {
        id: 'mid-a1',
        title: 'Bridal Lehenga',
        designer: 'Falguni Shane Peacock',
        meta: 'Midnight-blue velvet, hand-set copper crystal, copper sequin dupatta',
        kind: 'bridal',
        image: u('mid-a1', 800, 1100, 'lehenga-midnight-blue'),
        badge: 'EDITOR PICK',
      },
      {
        id: 'mid-a2',
        title: 'Groom Sherwani',
        designer: 'Kunal Rawal',
        meta: 'Copper raw silk, midnight-blue stole, contrast pagdi',
        kind: 'groom',
        image: u('mid-a2', 800, 1100, 'sherwani-copper'),
      },
      {
        id: 'mid-a3',
        title: 'Reception Gown',
        designer: 'Gaurav Gupta',
        meta: 'Midnight-blue jersey, copper sequined train, off-shoulder',
        kind: 'bridal',
        image: u('mid-a3', 800, 1100, 'reception-gown-blue-copper'),
      },
      {
        id: 'mid-a4',
        title: 'Copper Statement Earrings',
        designer: 'Outhouse Jewellery',
        meta: 'Hammered copper, midnight-blue resin, crystal drop',
        kind: 'accessories',
        image: u('mid-a4', 800, 1100, 'copper-earrings'),
      },
    ],
    invites: [
      {
        id: 'mid-s1',
        title: 'Geometric Invitation Suite',
        detail: 'Matte midnight-blue cardstock, copper foil, geometric monogram',
        kind: 'full-suites',
        image: u('mid-s1', 800, 1100, 'invitation-blue-copper'),
        badge: 'MOST SAVED',
      },
      {
        id: 'mid-s2',
        title: 'Sangeet Pass',
        detail: 'Copper-edged ticket, midnight-blue velvet pouch, holographic seal',
        kind: 'save-the-dates',
        image: u('mid-s2', 800, 1100, 'sangeet-pass'),
      },
      {
        id: 'mid-s3',
        title: 'Reception Menu',
        detail: 'Foil-stamped midnight blue, copper script, deckle edge',
        kind: 'menus',
        image: u('mid-s3', 800, 1100, 'menu-midnight-blue'),
      },
    ],
  },
];

// Server-side helper so the route can return Next's notFound() for unknown
// slugs without paying for client-bundle hydration.
export function hasPalette(slug: string): boolean {
  return PALETTES.some((p) => p.slug === slug);
}

// ── Tab + filter config ──────────────────────────────────────────────

type TabId = 'weddings' | 'decor' | 'attire' | 'invites';

const TABS: { id: TabId; label: string; scrawl: string; heading: string; italic: string }[] = [
  { id: 'weddings', label: 'Real Weddings', scrawl: 'shot in this palette', heading: 'Weddings that lived', italic: 'here' },
  { id: 'decor', label: 'Décor & Florals', scrawl: 'mandaps · tablescapes · lounges', heading: 'How it shows up', italic: 'in the room' },
  { id: 'attire', label: 'Lehengas & Attire', scrawl: 'bridal · groom · party', heading: 'What you wear', italic: 'in this color story' },
  { id: 'invites', label: 'Invitations & Stationery', scrawl: 'paper, foil, calligraphy', heading: 'On paper', italic: 'made permanent' },
];

const WEDDING_FILTERS: { key: 'all' | WeddingEvent; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'haldi', label: 'HALDI' },
  { key: 'mehendi', label: 'MEHENDI' },
  { key: 'sangeet', label: 'SANGEET' },
  { key: 'ceremony', label: 'CEREMONY' },
  { key: 'reception', label: 'RECEPTION' },
];

const DECOR_FILTERS: { key: 'all' | DecorKind; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'mandaps', label: 'MANDAPS' },
  { key: 'tablescapes', label: 'TABLESCAPES' },
  { key: 'florals', label: 'FLORALS' },
  { key: 'lighting', label: 'LIGHTING' },
  { key: 'lounges', label: 'LOUNGES' },
];

const ATTIRE_FILTERS: { key: 'all' | AttireKind; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'bridal', label: 'BRIDAL' },
  { key: 'groom', label: 'GROOM' },
  { key: 'bridesmaids', label: 'BRIDESMAIDS' },
  { key: 'accessories', label: 'ACCESSORIES' },
];

const INVITE_FILTERS: { key: 'all' | InviteKind; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'full-suites', label: 'FULL SUITES' },
  { key: 'save-the-dates', label: 'SAVE THE DATES' },
  { key: 'menus', label: 'MENUS' },
  { key: 'programs', label: 'PROGRAMS' },
];

// ── Component ────────────────────────────────────────────────────────

export default function PaletteDeepDiveView({ slug }: { slug: string }) {
  const palette = useMemo(() => PALETTES.find((p) => p.slug === slug), [slug]);

  const [tab, setTab] = useState<TabId>('weddings');
  const [filter, setFilter] = useState<string>('all');
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);

  // Inject Google Fonts (no-op if already loaded by the layout).
  useEffect(() => {
    const id = 'marigold-palette-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Caveat:wght@500;600&family=Syne:wght@500;600;700;800&family=Space+Grotesk:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  // Reset filter whenever tab changes.
  useEffect(() => setFilter('all'), [tab]);

  // Auto-dismiss toast.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // Server shell already gates unknown slugs via notFound(); guard for TS.
  if (!palette) return null;

  const counts: Record<TabId, number> = {
    weddings: palette.weddings.length,
    decor: palette.decor.length,
    attire: palette.attire.length,
    invites: palette.invites.length,
  };
  const totalFeatures = counts.weddings + counts.decor + counts.attire + counts.invites;

  const related = PALETTES.filter((p) => p.slug !== palette.slug).slice(0, 4);

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background: T.cream,
        color: T.wine,
        fontFamily: F.body,
      }}
    >
      {/* Soft palette wash behind hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0"
        style={{
          height: '720px',
          background: `radial-gradient(80% 60% at 50% 0%, ${palette.primary}26 0%, ${palette.accent}14 38%, transparent 75%)`,
        }}
      />
      {/* Gold dot grid (homepage texture) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${T.gold}26 1px, transparent 1.4px)`,
          backgroundSize: '28px 28px',
          opacity: 0.4,
        }}
      />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <header className="relative z-[1] mx-auto max-w-[1200px] px-6 pb-10 pt-14 md:px-10 md:pt-20">
        <div className="mb-6 flex items-center gap-3" style={{ fontFamily: F.syne, fontSize: 11, fontWeight: 600, letterSpacing: '0.22em' }}>
          <Link
            href="/studio"
            className="uppercase transition-colors"
            style={{ color: T.mauve, textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = T.pink)}
            onMouseLeave={(e) => (e.currentTarget.style.color = T.mauve)}
          >
            ← The Studio
          </Link>
          <span style={{ color: T.mauve, opacity: 0.4 }}>/</span>
          <Link
            href="/palettes"
            className="uppercase transition-colors"
            style={{ color: T.mauve, textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = T.pink)}
            onMouseLeave={(e) => (e.currentTarget.style.color = T.mauve)}
          >
            All Palettes
          </Link>
        </div>

        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="text-left">
            <div
              className="mb-2 inline-block"
              style={{
                fontFamily: F.script,
                color: T.pink,
                fontSize: 26,
                transform: 'rotate(-1.5deg)',
                animation: 'mg-fade-up 0.7s ease both',
              }}
            >
              fall into this color world
            </div>
            <h1
              className="mb-4"
              style={{
                fontFamily: F.display,
                fontWeight: 500,
                fontSize: 'clamp(44px, 6vw, 76px)',
                lineHeight: 1.02,
                letterSpacing: '-0.01em',
                color: T.wine,
                animation: 'mg-fade-up 0.7s ease 0.05s both',
              }}
            >
              {renderTitle(palette.name, palette.italicWord)}
            </h1>
            <p
              className="mb-7 max-w-[540px]"
              style={{
                fontSize: 16,
                lineHeight: 1.65,
                color: T.mauve,
                animation: 'mg-fade-up 0.7s ease 0.12s both',
              }}
            >
              {palette.description}
            </p>

            {/* Color swatch row with names */}
            <div className="mb-7 flex flex-wrap gap-x-5 gap-y-4" aria-label="Palette swatches">
              {palette.swatches.map((s, i) => (
                <div key={s.hex} className="flex flex-col items-center gap-2" style={{ animation: `mg-fade-up 0.6s ease ${0.18 + i * 0.04}s both` }}>
                  <span
                    className="block transition-transform hover:rotate-[-3deg] hover:-translate-y-1"
                    style={{
                      width: 56,
                      height: 56,
                      background: s.hex,
                      border: '1.5px solid rgba(75,21,40,0.12)',
                      boxShadow: `3px 3px 0 ${T.wine}14`,
                    }}
                  />
                  <span style={{ fontFamily: F.syne, fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.mauve }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Metadata strip */}
            <div className="flex items-center gap-3" style={{ fontFamily: F.syne, fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.mauve }}>
              <span style={{ color: T.gold }}>❀</span>
              <span>{totalFeatures} features</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>4 categories</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, background: palette.primary, borderRadius: '50%', boxShadow: `0 0 0 4px ${palette.primary}26` }} />
                {palette.badge.label.toLowerCase()}
              </span>
            </div>
          </div>

          {/* Hero collage — 3 polaroid-stack images */}
          <div className="relative h-[420px] md:h-[480px]" aria-hidden="true">
            <CollageCard image={palette.weddings[0]?.image} caption="palette in motion" rotation={-4} top="0" left="0" width="56%" zIndex={2} />
            <CollageCard image={palette.decor[0]?.image} rotation={3.2} top="6%" right="0" width="50%" zIndex={1} />
            <CollageCard image={palette.attire[0]?.image} caption={palette.tagline} rotation={-1.4} bottom="0" left="18%" width="52%" zIndex={3} />
          </div>
        </div>
      </header>

      {/* ── STICKY TABS + FILTER PILLS ─────────────────────────── */}
      <nav
        ref={tabsRef}
        className="sticky z-[5]"
        style={{
          top: 100,
          background: 'rgba(255, 248, 242, 0.92)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderTop: `1px solid ${T.wine}14`,
          borderBottom: `1px solid ${T.wine}14`,
          marginTop: 24,
        }}
        aria-label="Browse this palette"
      >
        <div className="mx-auto flex max-w-[1200px] items-center gap-1 overflow-x-auto px-6 py-3 md:px-10" style={{ scrollbarWidth: 'none' }}>
          {TABS.map((c) => {
            const active = tab === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setTab(c.id)}
                className="flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 transition-all"
                style={{
                  fontFamily: F.syne,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  border: `1px solid ${active ? T.wine : 'transparent'}`,
                  color: active ? T.wine : T.mauve,
                  background: active ? T.cream : 'transparent',
                  cursor: 'pointer',
                }}
                aria-pressed={active}
              >
                {c.label}
                <span style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 13, fontWeight: 500, letterSpacing: 0, color: active ? T.pink : T.gold }}>
                  ({counts[c.id]})
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter pill row (within active tab) */}
        <div className="mx-auto flex max-w-[1200px] items-center gap-2 overflow-x-auto px-6 pb-3 md:px-10" style={{ scrollbarWidth: 'none' }}>
          {currentFilters(tab).map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className="shrink-0 rounded-full px-3.5 py-1.5 transition-all"
                style={{
                  fontFamily: F.syne,
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  border: `1px solid ${active ? T.wine : T.wine + '33'}`,
                  color: active ? T.cream : T.mauve,
                  background: active ? T.wine : 'transparent',
                  cursor: 'pointer',
                }}
                aria-pressed={active}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── CONTENT GRID ─────────────────────────────────────── */}
      <section className="relative z-[1] mx-auto max-w-[1200px] px-6 pb-16 pt-14 md:px-10" key={`${tab}-${filter}`}>
        <SectionHead palette={palette} tab={tab} />

        {tab === 'weddings' && (
          <WeddingsGrid items={filterWeddings(palette.weddings, filter as 'all' | WeddingEvent)} accent={palette.primary} />
        )}
        {tab === 'decor' && (
          <MasonryGrid items={filterDecor(palette.decor, filter as 'all' | DecorKind)} accent={palette.primary} />
        )}
        {tab === 'attire' && (
          <AttireGrid items={filterAttire(palette.attire, filter as 'all' | AttireKind)} accent={palette.primary} />
        )}
        {tab === 'invites' && (
          <InvitesGrid items={filterInvites(palette.invites, filter as 'all' | InviteKind)} accent={palette.primary} />
        )}
      </section>

      {/* ── COMING UP BANNER ─────────────────────────────────── */}
      <section className="relative z-[1] mx-auto max-w-[1200px] px-6 pb-16 md:px-10">
        <div
          className="flex flex-col items-center justify-between gap-4 rounded-md px-7 py-6 text-left md:flex-row md:gap-10"
          style={{ background: T.wine, color: T.cream }}
        >
          <div className="flex items-center gap-5">
            <span
              style={{
                fontFamily: F.syne,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: T.gold,
                borderRight: `1px solid ${T.gold}55`,
                paddingRight: 18,
              }}
            >
              Coming Up
            </span>
            <span style={{ fontFamily: F.script, fontSize: 22, color: T.cream, opacity: 0.95 }}>
              {palette.comingUp.label}
            </span>
          </div>
          <div className="flex items-center gap-5">
            <p style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 19, lineHeight: 1.4, margin: 0, maxWidth: 460 }}>
              {palette.comingUp.body}
            </p>
            <button
              type="button"
              className="shrink-0 rounded-full"
              style={{
                fontFamily: F.syne,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: T.wine,
                background: T.gold,
                border: 0,
                padding: '11px 18px',
                cursor: 'pointer',
              }}
            >
              Set Reminder →
            </button>
          </div>
        </div>
      </section>

      {/* ── BOTTOM SAVE CTA ──────────────────────────────────── */}
      <section className="relative z-[1] py-16 text-center">
        <div className="mx-auto max-w-[720px] px-6">
          <span
            className="inline-block"
            style={{ fontFamily: F.script, fontSize: 22, color: T.pink, transform: 'rotate(-1deg)', marginBottom: 8 }}
          >
            love this one?
          </span>
          <h2
            className="mb-4"
            style={{
              fontFamily: F.display,
              fontWeight: 500,
              fontSize: 'clamp(32px, 4.6vw, 52px)',
              lineHeight: 1.05,
              color: T.wine,
            }}
          >
            Save{' '}
            <em style={{ fontStyle: 'italic', color: palette.primary }}>{palette.name}</em>{' '}
            to your wedding
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: T.mauve, marginBottom: 26 }}>
            We'll pin this palette to your planning circle so vendors, moodboards, and your shopping picks all start from the same color story.
          </p>
          <button
            type="button"
            disabled={saved}
            onClick={() => {
              setSaved(true);
              setToast(`${palette.name} saved to your wedding`);
            }}
            className="inline-flex items-center gap-3 transition-transform"
            style={{
              fontFamily: F.syne,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              background: saved ? T.mauve : palette.primary,
              color: T.cream,
              padding: '18px 32px',
              border: 0,
              borderRadius: 2,
              boxShadow: `4px 5px 0 ${T.wine}`,
              cursor: saved ? 'default' : 'pointer',
              opacity: saved ? 0.85 : 1,
            }}
            onMouseEnter={(e) => {
              if (!saved) {
                e.currentTarget.style.transform = 'translate(-2px, -2px)';
                e.currentTarget.style.boxShadow = `6px 7px 0 ${T.wine}`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = `4px 5px 0 ${T.wine}`;
            }}
          >
            {saved ? 'Saved to my wedding ✿' : 'Save to my wedding →'}
          </button>
          <Link
            href="/moodboards"
            className="mt-6 block"
            style={{
              fontFamily: F.script,
              fontSize: 17,
              color: T.mauve,
              textDecoration: 'underline',
              textDecorationColor: `${T.pink}66`,
              textUnderlineOffset: 4,
            }}
          >
            see moodboards in this color story →
          </Link>
        </div>
      </section>

      {/* ── RELATED PALETTES ─────────────────────────────────── */}
      <section className="relative z-[1] mx-auto max-w-[1200px] px-6 pb-24 md:px-10">
        <div className="mb-7 flex items-baseline gap-3">
          <span style={{ fontFamily: F.script, fontSize: 22, color: T.pink, transform: 'rotate(-1deg)' }}>
            you might also love
          </span>
          <h3 style={{ fontFamily: F.display, fontWeight: 500, fontSize: 28, color: T.wine, margin: 0 }}>
            other color <em style={{ fontStyle: 'italic', color: T.pink }}>worlds</em>
          </h3>
        </div>
        <div
          className="-mx-6 flex gap-5 overflow-x-auto px-6 pb-4 md:-mx-10 md:px-10"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'thin' }}
        >
          {related.map((p) => (
            <Link
              key={p.slug}
              href={`/palettes/${p.slug}`}
              className="group relative shrink-0"
              style={{ width: 280, scrollSnapAlign: 'start', textDecoration: 'none', color: 'inherit' }}
            >
              <div
                className="relative overflow-hidden"
                style={{
                  aspectRatio: '4 / 5',
                  background: `linear-gradient(135deg, ${p.swatches[0].hex} 0%, ${p.swatches[1].hex} 50%, ${p.swatches[3].hex} 100%)`,
                }}
              >
                <div
                  className="absolute inset-x-3 bottom-3 grid"
                  style={{ gridTemplateColumns: `repeat(${p.swatches.length}, 1fr)`, gap: 4 }}
                >
                  {p.swatches.map((s) => (
                    <span key={s.hex} style={{ height: 14, background: s.hex, border: '1px solid rgba(255,255,255,0.7)' }} />
                  ))}
                </div>
                <span
                  className="absolute -top-2 left-3"
                  style={{
                    fontFamily: F.syne,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    background: p.badge.tone === 'gold' ? T.gold : p.badge.tone === 'wine' ? T.wine : T.pink,
                    color: p.badge.tone === 'gold' ? T.wine : T.cream,
                    padding: '5px 9px',
                    borderRadius: 2,
                    transform: 'rotate(-3deg)',
                    boxShadow: `2px 3px 0 ${T.wine}1f`,
                  }}
                >
                  {p.badge.label}
                </span>
              </div>
              <h4 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 500, lineHeight: 1.15, margin: '14px 0 4px', color: T.wine }}>
                {p.name}
              </h4>
              <span style={{ fontFamily: F.script, fontSize: 17, color: T.pink, display: 'block' }}>
                {p.tagline}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-7 left-1/2 z-50"
          style={{
            transform: 'translateX(-50%)',
            background: T.wine,
            color: T.cream,
            fontFamily: F.syne,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            padding: '14px 22px',
            borderRadius: 2,
            boxShadow: `4px 5px 0 ${T.gold}`,
            animation: 'mg-toast-in 0.4s ease both',
          }}
        >
          ✿ {toast}
        </div>
      )}

      {/* Local keyframes */}
      <style>{`
        @keyframes mg-fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes mg-tile-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes mg-toast-in { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .mg-tile { animation: mg-tile-in 0.55s ease both; }
        .mg-no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function renderTitle(name: string, italic: string) {
  if (!name.includes(italic)) return name;
  const idx = name.indexOf(italic);
  const before = name.slice(0, idx);
  const after = name.slice(idx + italic.length);
  return (
    <>
      {before}
      <em style={{ fontStyle: 'italic', color: T.pink }}>{italic}</em>
      {after}
    </>
  );
}

function currentFilters(tab: TabId) {
  if (tab === 'weddings') return WEDDING_FILTERS;
  if (tab === 'decor') return DECOR_FILTERS;
  if (tab === 'attire') return ATTIRE_FILTERS;
  return INVITE_FILTERS;
}

function filterWeddings(items: Wedding[], key: 'all' | WeddingEvent) {
  if (key === 'all') return items;
  return items.filter((w) => w.events.includes(key));
}
function filterDecor(items: Decor[], key: 'all' | DecorKind) {
  return key === 'all' ? items : items.filter((d) => d.kind === key);
}
function filterAttire(items: Attire[], key: 'all' | AttireKind) {
  return key === 'all' ? items : items.filter((a) => a.kind === key);
}
function filterInvites(items: Invite[], key: 'all' | InviteKind) {
  return key === 'all' ? items : items.filter((i) => i.kind === key);
}

// ── Sub-components ───────────────────────────────────────────────────

function CollageCard({
  image,
  caption,
  rotation,
  top,
  left,
  right,
  bottom,
  width,
  zIndex,
}: {
  image?: string;
  caption?: string;
  rotation: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  width: string;
  zIndex: number;
}) {
  if (!image) return null;
  return (
    <div
      className="absolute overflow-hidden bg-white"
      style={{
        top, left, right, bottom, width,
        aspectRatio: '3 / 4',
        padding: '12px 12px 30px',
        boxShadow: `6px 8px 24px ${T.wine}29`,
        transform: `rotate(${rotation}deg)`,
        zIndex,
      }}
    >
      <img src={image} alt="" loading="lazy" className="block h-full w-full object-cover" />
      {caption && (
        <span
          className="absolute"
          style={{ left: 12, bottom: 6, fontFamily: F.script, fontSize: 14, color: T.wine }}
        >
          {caption}
        </span>
      )}
    </div>
  );
}

function SectionHead({ palette, tab }: { palette: Palette; tab: TabId }) {
  const meta = TABS.find((t) => t.id === tab)!;
  return (
    <div className="mb-7 flex flex-wrap items-baseline gap-3">
      <span style={{ fontFamily: F.script, fontSize: 20, color: T.pink, transform: 'rotate(-1deg)' }}>
        {meta.scrawl}
      </span>
      <h2
        style={{
          fontFamily: F.display,
          fontWeight: 500,
          fontSize: 'clamp(28px, 3.6vw, 40px)',
          lineHeight: 1.05,
          margin: 0,
          color: T.wine,
        }}
      >
        {meta.heading} <em style={{ fontStyle: 'italic', color: palette.primary }}>{meta.italic}</em>
      </h2>
    </div>
  );
}

function Badge({ label, tone = 'pink' }: { label: BadgeLabel; tone?: Tone }) {
  const bg = tone === 'gold' ? T.gold : tone === 'wine' ? T.wine : T.pink;
  const fg = tone === 'gold' ? T.wine : T.cream;
  return (
    <span
      className="absolute -top-3 left-3 z-[2]"
      style={{
        fontFamily: F.syne,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        background: bg,
        color: fg,
        padding: '5px 9px',
        borderRadius: 2,
        transform: 'rotate(-3deg)',
        boxShadow: `2px 3px 0 ${T.wine}1f`,
      }}
    >
      {label}
    </span>
  );
}

function badgeTone(label: BadgeLabel | undefined): Tone {
  if (!label) return 'pink';
  if (label === 'EDITOR PICK' || label === 'OUR NAMESAKE') return 'gold';
  if (label === 'TRENDING') return 'wine';
  return 'pink';
}

function WeddingsGrid({ items, accent }: { items: Wedding[]; accent: string }) {
  if (items.length === 0) return <EmptyState />;
  return (
    <div className="grid grid-cols-1 gap-x-7 gap-y-9 md:grid-cols-2">
      {items.map((w, i) => (
        <article
          key={w.id}
          className="mg-tile group relative overflow-hidden"
          style={{
            background: T.cream,
            border: `1px solid ${T.wine}14`,
            boxShadow: `0 6px 22px ${T.wine}10`,
            animationDelay: `${i * 60}ms`,
            transition: 'transform 0.35s ease, box-shadow 0.35s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.boxShadow = `0 14px 32px ${T.wine}29`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 6px 22px ${T.wine}10`;
          }}
        >
          <span aria-hidden="true" className="absolute inset-x-0 top-0 z-[2]" style={{ height: 4, background: accent }} />
          {w.badge && <Badge label={w.badge} tone={badgeTone(w.badge)} />}
          <div className="relative" style={{ aspectRatio: '5 / 4', overflow: 'hidden' }}>
            <img
              src={w.image}
              alt={`${w.couple}, ${w.city}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span
              className="absolute"
              style={{
                top: 14, right: 14,
                fontFamily: F.syne, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                background: T.cream, color: T.wine,
                padding: '6px 10px', borderRadius: 2,
                boxShadow: `2px 3px 0 ${T.wine}24`,
              }}
            >
              {w.guests} guests
            </span>
          </div>
          <div className="flex flex-col gap-2.5 p-6">
            <div className="flex flex-wrap gap-1.5">
              {w.events.map((e) => (
                <span
                  key={e}
                  style={{
                    fontFamily: F.syne, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: T.wine, background: `${T.gold}2e`, border: `1px solid ${T.gold}80`,
                    padding: '4px 9px', borderRadius: 999,
                  }}
                >
                  {e}
                </span>
              ))}
            </div>
            <h3 style={{ fontFamily: F.display, fontWeight: 500, fontSize: 28, lineHeight: 1.1, color: T.wine, margin: '4px 0 0' }}>
              {(() => {
                const [a, b] = w.couple.split(' & ');
                return (
                  <>
                    <span>{a}</span>{' '}
                    <em style={{ fontStyle: 'italic', color: T.pink }}>&</em>{' '}
                    <span>{b}</span>
                  </>
                );
              })()}
            </h3>
            <p
              style={{
                fontFamily: F.syne, fontSize: 10.5, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: T.mauve, margin: 0,
              }}
            >
              {w.date} · {w.venue} · {w.city}
            </p>
            <p
              style={{
                fontFamily: F.display, fontStyle: 'italic', fontSize: 17, lineHeight: 1.45,
                color: T.gold, margin: '6px 0 6px', paddingLeft: 14, position: 'relative',
              }}
            >
              <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: 2, background: T.gold, opacity: 0.55 }} />
              {w.hook}
            </p>
            <span
              className="self-start"
              style={{
                fontFamily: F.syne, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: accent, marginTop: 4, cursor: 'pointer',
              }}
            >
              Read the wedding →
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function MasonryGrid({ items, accent }: { items: Decor[]; accent: string }) {
  if (items.length === 0) return <EmptyState />;
  return (
    <div className="gap-6" style={{ columnCount: 'unset', columns: '3 280px', columnGap: 24 }}>
      {items.map((d, i) => {
        const aspect = d.aspect === 'tall' ? '3/4' : d.aspect === 'square' ? '1/1' : '4/3';
        return (
          <article
            key={d.id}
            className="mg-tile relative mb-6 inline-block w-full"
            style={{
              background: '#fff',
              padding: '12px 12px 0',
              boxShadow: `4px 6px 16px ${T.wine}1a`,
              breakInside: 'avoid',
              animationDelay: `${i * 50}ms`,
              transition: 'transform 0.35s ease, box-shadow 0.35s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) rotate(-0.4deg)';
              e.currentTarget.style.boxShadow = `8px 12px 28px ${T.wine}2e`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) rotate(0)';
              e.currentTarget.style.boxShadow = `4px 6px 16px ${T.wine}1a`;
            }}
          >
            {d.badge && <Badge label={d.badge} tone={badgeTone(d.badge)} />}
            <div className="relative overflow-hidden" style={{ aspectRatio: aspect, background: T.goldLight }}>
              <img src={d.image} alt={d.title} loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col gap-1.5 px-1 pb-5 pt-4">
              <h3 style={{ fontFamily: F.display, fontWeight: 500, fontSize: 19, lineHeight: 1.2, color: T.wine, margin: 0 }}>
                {d.title}
              </h3>
              <p style={{ fontFamily: F.body, fontSize: 12, color: T.mauve, lineHeight: 1.55, margin: 0 }}>
                {d.materials}
              </p>
              {d.hook && (
                <p
                  style={{
                    fontFamily: F.script, fontSize: 16, color: T.pink, marginTop: 4,
                    transform: 'rotate(-0.5deg)', display: 'inline-block',
                  }}
                >
                  {d.hook}
                </p>
              )}
              <span
                style={{
                  fontFamily: F.syne, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: accent, marginTop: 6, cursor: 'pointer',
                }}
              >
                See the details →
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function AttireGrid({ items, accent }: { items: Attire[]; accent: string }) {
  if (items.length === 0) return <EmptyState />;
  return (
    <div className="grid gap-7" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
      {items.map((a, i) => (
        <article
          key={a.id}
          className="mg-tile group relative overflow-hidden"
          style={{
            background: T.cream,
            border: `1px solid ${T.wine}14`,
            animationDelay: `${i * 60}ms`,
            transition: 'transform 0.35s ease, box-shadow 0.35s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.boxShadow = `0 14px 30px ${T.wine}24`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {a.badge && <Badge label={a.badge} tone={badgeTone(a.badge)} />}
          <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', background: T.goldLight }}>
            <img src={a.image} alt={a.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <span
              className="absolute"
              style={{
                top: 12, right: 12,
                fontFamily: F.syne, fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: T.wine, background: 'rgba(255,248,242,0.92)',
                padding: '5px 9px', borderRadius: 999,
              }}
            >
              {a.kind}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 p-5">
            <h3 style={{ fontFamily: F.display, fontWeight: 500, fontSize: 21, lineHeight: 1.18, color: T.wine, margin: 0 }}>
              {a.title}
            </h3>
            <p style={{ fontFamily: F.body, fontSize: 11.5, color: T.mauve, lineHeight: 1.5, margin: 0 }}>
              {a.meta}
            </p>
            <span style={{ fontFamily: F.syne, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: T.gold, marginTop: 4 }}>
              {a.designer}
            </span>
            {a.hook && (
              <p style={{ fontFamily: F.script, fontSize: 15, color: T.pink, margin: '6px 0 0' }}>
                {a.hook}
              </p>
            )}
            <span
              style={{
                fontFamily: F.syne, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: accent, marginTop: 8, cursor: 'pointer',
              }}
            >
              Shop this look →
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function InvitesGrid({ items, accent }: { items: Invite[]; accent: string }) {
  if (items.length === 0) return <EmptyState />;
  return (
    <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {items.map((s, i) => (
        <article
          key={s.id}
          className="mg-tile relative cursor-pointer"
          style={{
            background: T.cream,
            border: `1px solid ${T.wine}1a`,
            padding: 28,
            animationDelay: `${i * 70}ms`,
            transition: 'transform 0.35s ease, box-shadow 0.35s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px)';
            e.currentTarget.style.boxShadow = `0 14px 30px ${T.wine}26`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {s.badge && <Badge label={s.badge} tone={badgeTone(s.badge)} />}
          <div
            className="relative overflow-hidden"
            style={{
              aspectRatio: '4/5',
              background: '#fff',
              marginBottom: 16,
              border: `1px solid ${T.wine}14`,
            }}
          >
            <img src={s.image} alt={s.title} loading="lazy" className="h-full w-full object-cover" />
          </div>
          <h3 style={{ fontFamily: F.display, fontWeight: 500, fontSize: 22, lineHeight: 1.15, color: T.wine, margin: '0 0 6px' }}>
            {s.title}
          </h3>
          <p style={{ fontFamily: F.body, fontSize: 12, color: T.mauve, lineHeight: 1.55, margin: 0 }}>
            {s.detail}
          </p>
          <span
            style={{
              fontFamily: F.syne, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: accent, marginTop: 10, display: 'inline-block', cursor: 'pointer',
            }}
          >
            See the suite →
          </span>
        </article>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-md py-14 text-center"
      style={{
        background: '#fff',
        border: `1px dashed ${T.wine}33`,
        fontFamily: F.display,
        fontStyle: 'italic',
        fontSize: 18,
        color: T.mauve,
      }}
    >
      nothing in this filter yet — try <em style={{ color: T.pink }}>ALL</em>
    </div>
  );
}

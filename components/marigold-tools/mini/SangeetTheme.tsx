'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MiniToolShell } from './MiniToolShell';
import primitives from './MiniToolPrimitives.module.css';
import styles from './SangeetTheme.module.css';

type Phase = 'quiz' | 'result';

type ThemeKey =
  | 'bollywood-retro'
  | 'desi-disco'
  | 'royal-rajasthan'
  | 'tropical-mehfil'
  | 'masquerade'
  | 'old-hollywood'
  | 'mehndi-mela'
  | 'club-night';

const QUESTIONS: {
  id: string;
  prompt: string;
  options: { label: string; weights: Partial<Record<ThemeKey, number>> }[];
}[] = [
  {
    id: 'mood',
    prompt: 'Pick a vibe',
    options: [
      { label: 'Maximalist & glittery', weights: { 'bollywood-retro': 3, 'desi-disco': 2, 'royal-rajasthan': 2 } },
      { label: 'Romantic & dreamy', weights: { 'old-hollywood': 3, masquerade: 2, 'tropical-mehfil': 1 } },
      { label: 'Fun & high-energy', weights: { 'desi-disco': 3, 'club-night': 3, 'bollywood-retro': 1 } },
      { label: 'Heritage & rooted', weights: { 'royal-rajasthan': 3, 'mehndi-mela': 3 } },
      { label: 'Unexpected & cool', weights: { masquerade: 3, 'club-night': 2, 'old-hollywood': 1 } },
    ],
  },
  {
    id: 'music',
    prompt: 'Music direction',
    options: [
      { label: '70s/80s Bollywood — RD Burman, Disco Dancer', weights: { 'bollywood-retro': 4, 'desi-disco': 2 } },
      { label: 'Punjabi & bhangra-heavy', weights: { 'desi-disco': 3, 'mehndi-mela': 2, 'club-night': 2 } },
      { label: 'Modern Bollywood + remixes', weights: { 'club-night': 3, 'desi-disco': 2 } },
      { label: 'Folk + classical fusion', weights: { 'royal-rajasthan': 3, 'mehndi-mela': 3 } },
      { label: 'Jazz, lounge, Frank Sinatra', weights: { 'old-hollywood': 4, masquerade: 2 } },
      { label: 'Tropical house, beachy', weights: { 'tropical-mehfil': 4 } },
    ],
  },
  {
    id: 'palette',
    prompt: 'Color palette',
    options: [
      { label: 'Hot pink, gold, magenta', weights: { 'bollywood-retro': 3, 'desi-disco': 2 } },
      { label: 'Neon + black + holographic', weights: { 'desi-disco': 3, 'club-night': 3 } },
      { label: 'Burgundy, mustard, deep teal', weights: { 'royal-rajasthan': 3, masquerade: 1 } },
      { label: 'Coral, palm, sand', weights: { 'tropical-mehfil': 4 } },
      { label: 'Black, gold, ivory', weights: { 'old-hollywood': 3, masquerade: 3 } },
      { label: 'Saffron, marigold, pomegranate', weights: { 'mehndi-mela': 3, 'royal-rajasthan': 2 } },
    ],
  },
  {
    id: 'guest',
    prompt: 'What do you want guests to do?',
    options: [
      { label: 'Performance routines + family dances', weights: { 'bollywood-retro': 3, 'mehndi-mela': 2 } },
      { label: 'Dance floor open all night', weights: { 'desi-disco': 3, 'club-night': 4 } },
      { label: 'Sit, eat, listen to live music', weights: { 'royal-rajasthan': 3, 'old-hollywood': 2 } },
      { label: 'Mix, mingle, and surprise', weights: { masquerade: 4, 'tropical-mehfil': 1 } },
      { label: 'Hands-on — mehndi, dhol, food stations', weights: { 'mehndi-mela': 4 } },
    ],
  },
];

const THEMES: Record<
  ThemeKey,
  {
    name: string;
    eyebrow: string;
    overview: string;
    decor: string[];
    music: string[];
    dressCode: string;
    foodNotes: string;
  }
> = {
  'bollywood-retro': {
    name: 'Bollywood Retro Night',
    eyebrow: 'rd burman, sequins, color',
    overview:
      'Disco Deewane meets Sholay. Reds, hot pinks, gold sequins — and a stage built for the family choreographies you spent eight weeks rehearsing.',
    decor: [
      'Vintage Bollywood movie posters as printed backdrops',
      'Red, hot pink, and gold mirror balls + sequin curtains',
      'A stage lit like a 1970s film set with side curtains',
      'Tea-stained dupattas hung from the ceiling like ribbons',
    ],
    music: [
      '70s/80s Bollywood — RD Burman, Asha Bhosle, Mohammed Rafi',
      'Disco Dancer, Om Shanti Om, Sholay covers',
      'Live dhol entry for the bridal party',
    ],
    dressCode: 'Retro Bollywood — bell-bottoms, big hair, saris with silver, velvet jackets',
    foodNotes: 'Chaat stations and old-school Bombay street food. Paan bar at the end of the night.',
  },
  'desi-disco': {
    name: 'Desi Disco',
    eyebrow: 'neon, bhangra, glitter',
    overview:
      'A maximalist club takeover. Bhangra mashups, neon, and the kind of energy that wraps at 2 AM with the dhol still going.',
    decor: [
      'Neon signs in Hindi script ("Pyaar," "Dhamaka," your hashtag)',
      'Holographic table runners and metallic balloon clouds',
      'A laser & disco-ball ceiling installation',
      'LED-floor dance area or animated projection mapping',
    ],
    music: [
      'Punjabi-bhangra heavy — Diljit, AP Dhillon, Karan Aujla',
      'Bollywood club remixes — Abhi Toh Party, Cheez Badi',
      'A live dhol player layered over the DJ for entries',
    ],
    dressCode: 'Glitz & glam — sequins, metallics, neon accents encouraged',
    foodNotes: 'Late-night kathi roll cart + chai chuski stand. Welcome shots of pink lassi.',
  },
  'royal-rajasthan': {
    name: 'Royal Rajasthan',
    eyebrow: 'havelis, mirror work, mehfil',
    overview:
      "A jewel-toned mehfil set inside an imagined haveli courtyard. Mirror work, low seating, classical performances, and a slower pace that feels expensive.",
    decor: [
      'Low jhula swings, bolsters, and floor cushions in velvet',
      'Mirror-work backdrops + jharokha-style window cutouts',
      'Diyas and brass lanterns instead of fairy lights',
      'Marigold and mogra strings strung overhead like a canopy',
    ],
    music: [
      'Live ghazal singer or qawwali ensemble for an opening set',
      'Folk Rajasthani performers (Manganiyars or Kalbelia dancers)',
      'Classical fusion — sitar + tabla + violin',
    ],
    dressCode: 'Bandhani, gota patti, royal jewel tones. Turbans for groomsmen.',
    foodNotes: 'Thali-style plated dinner with dal baati churma and ghevar for dessert.',
  },
  'tropical-mehfil': {
    name: 'Tropical Mehfil',
    eyebrow: 'palm, coral, beach-coded',
    overview:
      'Goa-meets-Coachella. Ideal for destination weddings or warm-weather venues — palm fronds, breezy fabrics, and tropical house mashed with Bollywood.',
    decor: [
      'Hanging palm leaves and pampas grass installations',
      'Coral, blush, and sand-colored linens',
      'Coconut tealights and bamboo pendant lights',
      'A bar styled like a tiki shack with a desi twist',
    ],
    music: [
      'Tropical house remixes of Bollywood',
      'Ritviz, Nucleya, and Indian electronic crossovers',
      'Acoustic Hindi covers for sunset cocktail hour',
    ],
    dressCode: 'Beach formal — flowy, floral, pastel. Linen kurtas for the boys.',
    foodNotes: 'Coconut-water welcome drinks, seafood and Goan curries, kulfi popsicles for dessert.',
  },
  masquerade: {
    name: 'Bollywood Masquerade',
    eyebrow: 'masks, drama, mystery',
    overview:
      'Eyes Wide Shut by way of Devdas. Black-tie with a desi twist — every guest gets a mask at the door, and the music walks the line between mehfil and modern.',
    decor: [
      'Black, deep burgundy, and gold; candlelight only',
      'Feathered & jeweled masks at every place setting',
      'A grand staircase or curtained entrance for reveals',
      'Mirrored centerpieces and tall taper candelabras',
    ],
    music: [
      'Live string quartet covering Bollywood ballads',
      'Slow Bollywood + jazz mashups for the first half',
      'DJ set ramps from sultry to club after midnight',
    ],
    dressCode: 'Black tie — deep colors, masks required at entry',
    foodNotes: 'Cocktail-style — passed canapés (chaat couture), no full sit-down. Champagne tower.',
  },
  'old-hollywood': {
    name: 'Vintage Hollywood',
    eyebrow: 'jazz, satin, sinatra',
    overview:
      "An old-school glamour evening. Black, gold, and ivory; martinis and live jazz; and a slow build into a Bollywood dance set after midnight.",
    decor: [
      'Black, ivory, and gold palette throughout',
      'Crystal candelabras and tall taper candles',
      'Vintage typewriter-style menu cards and a "Casablanca"-style lounge',
      'A red carpet entry with a step-and-repeat for guest portraits',
    ],
    music: [
      'Live jazz/swing band — Sinatra, Etta James, Ella Fitzgerald',
      'Acoustic Bollywood-jazz covers (think "Tum Hi Ho" but jazzy)',
      'DJ takes over after dinner for the dance shift',
    ],
    dressCode: 'Black-tie glam. Saris in satin or velvet, men in tuxes or bandhgalas.',
    foodNotes: 'Cocktail-forward bar, plated dinner, mini desi desserts at midnight.',
  },
  'mehndi-mela': {
    name: 'Mehndi Mela',
    eyebrow: 'marigold, dhol, mela energy',
    overview:
      'A daytime carnival that doubles as the sangeet warmup — or a sangeet that channels mela energy. Mehndi stations, dhol players, food carts, and color, color, color.',
    decor: [
      'Marigold rope curtains and floral arches',
      'Brightly-painted carts: chai, paani puri, kulfi, paan',
      'Mehndi station with multiple artists',
      'Floor seating with bright Rajasthani cushions',
    ],
    music: [
      'Live dholis circulating throughout the event',
      'Punjabi folk + bhangra DJ set',
      'A "ladies sangeet" segment with traditional songs',
    ],
    dressCode: 'Bright florals, gota work, mirror-work. Yellow/orange/pink encouraged.',
    foodNotes: 'Live food stalls — chaat, dosa, paani puri, gol gappa, jalebi station.',
  },
  'club-night': {
    name: 'Sangeet Club Takeover',
    eyebrow: 'dj, lasers, vibes',
    overview:
      'You took over a club. Or made your venue feel like one. Lasers, fog, and a DJ who knows when to drop "Kala Chashma." This is for couples who want one thing: a dance floor that never empties.',
    decor: [
      'Black, neon, and chrome — minimal florals',
      'Laser lighting + LED kinetic ceiling',
      'Smoke machine + CO2 cannons for big drops',
      'VIP-style banquette seating around the dance floor',
    ],
    music: [
      'Top-tier desi DJ headlining the night',
      'Bhangra-house & Bollywood club bangers all night',
      'Live percussionist (dhol or tabla) layered over the DJ',
    ],
    dressCode: 'Sleek and modern — fitted Indo-western, sequins, fur, latex if you dare',
    foodNotes: 'Late-night menu — sliders, mini biryanis, pani puri shots, dessert dabba.',
  },
};

function topTheme(scores: Record<ThemeKey, number>): ThemeKey {
  let best: ThemeKey = 'bollywood-retro';
  let bestScore = -1;
  for (const k of Object.keys(scores) as ThemeKey[]) {
    if (scores[k] > bestScore) {
      best = k;
      bestScore = scores[k];
    }
  }
  return best;
}

export function SangeetTheme() {
  const [phase, setPhase] = useState<Phase>('quiz');
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<ThemeKey, number>>({
    'bollywood-retro': 0,
    'desi-disco': 0,
    'royal-rajasthan': 0,
    'tropical-mehfil': 0,
    masquerade: 0,
    'old-hollywood': 0,
    'mehndi-mela': 0,
    'club-night': 0,
  });

  const total = QUESTIONS.length;
  const current = QUESTIONS[step];

  function answer(weights: Partial<Record<ThemeKey, number>>) {
    const next = { ...scores };
    for (const k of Object.keys(weights) as ThemeKey[]) {
      next[k] = (next[k] ?? 0) + (weights[k] ?? 0);
    }
    setScores(next);
    if (step + 1 < total) setStep(step + 1);
    else setPhase('result');
  }

  function reset() {
    setScores({
      'bollywood-retro': 0,
      'desi-disco': 0,
      'royal-rajasthan': 0,
      'tropical-mehfil': 0,
      masquerade: 0,
      'old-hollywood': 0,
      'mehndi-mela': 0,
      'club-night': 0,
    });
    setStep(0);
    setPhase('quiz');
  }

  const winner = phase === 'result' ? topTheme(scores) : null;
  const theme = winner ? THEMES[winner] : null;

  return (
    <MiniToolShell
      name="Sangeet Theme Generator"
      tagline="Bollywood night or something unexpected?"
      estimatedTime="1 min"
    >
      <AnimatePresence mode="wait">
        {phase === 'quiz' && current && (
          <motion.div
            key={`q-${step}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.28 }}
            className={styles.quizCard}
          >
            <div className={styles.progress}>
              <span className={styles.progressLabel}>
                Question {step + 1} of {total}
              </span>
              <div className={styles.progressBar}>
                <motion.div
                  className={styles.progressFill}
                  initial={false}
                  animate={{ width: `${((step + 1) / total) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            <h2 className={styles.prompt}>{current.prompt}</h2>

            <div className={styles.options}>
              {current.options.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  className={styles.option}
                  onClick={() => answer(opt.weights)}
                >
                  <span className={styles.optionDot} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'result' && theme && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42 }}
            className={primitives.resultCard}
          >
            <span className={primitives.resultEyebrow}>{theme.eyebrow}</span>
            <p className={styles.themeName}>{theme.name}</p>
            <p className={primitives.resultBody}>{theme.overview}</p>

            <div className={styles.section}>
              <span className={primitives.resultEyebrow}>decor direction</span>
              <ul className={styles.list}>
                {theme.decor.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>

            <div className={styles.section}>
              <span className={primitives.resultEyebrow}>music direction</span>
              <ul className={styles.list}>
                {theme.music.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>

            <div className={styles.section}>
              <span className={primitives.resultEyebrow}>dress code</span>
              <p className={styles.bodyLine}>{theme.dressCode}</p>
            </div>

            <div className={styles.section}>
              <span className={primitives.resultEyebrow}>food note</span>
              <p className={styles.bodyLine}>{theme.foodNotes}</p>
            </div>

            <button
              type="button"
              className={styles.resetBtn}
              onClick={reset}
              style={{ marginTop: 24 }}
            >
              ↻ retake the quiz
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </MiniToolShell>
  );
}

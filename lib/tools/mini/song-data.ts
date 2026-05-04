// Bridal entry song database. Hand-curated. No lyrics, just title + artist
// + which moment of the song to use + tone descriptors so the picker can
// filter intelligently.
//
// Coverage: ~70 songs spread across event (ceremony / reception / sangeet),
// mood (grand / romantic / fun / modern / traditional), tempo, language.

export type SongEvent = 'ceremony' | 'reception' | 'sangeet';
export type SongMood = 'grand' | 'romantic' | 'fun' | 'modern' | 'traditional';
export type SongTempo = 'slow' | 'medium' | 'upbeat';
export type SongLanguage =
  | 'hindi'
  | 'punjabi'
  | 'tamil'
  | 'telugu'
  | 'english'
  | 'instrumental';

export type Song = {
  title: string;
  artist: string;
  events: SongEvent[];
  moods: SongMood[];
  tempo: SongTempo;
  languages: SongLanguage[];
  cue: string; // which part of the song the bride enters on
  note?: string;
};

export const SONGS: Song[] = [
  // ── Hindi classics ──
  {
    title: 'Din Shagna Da',
    artist: 'Jasleen Royal',
    events: ['ceremony', 'sangeet'],
    moods: ['traditional', 'romantic'],
    tempo: 'slow',
    languages: ['punjabi', 'hindi'],
    cue: 'Start of the song — full first 90 seconds works for a slow walk.',
    note: 'Modern bridal classic. Almost universal at North Indian weddings now.',
  },
  {
    title: 'Bole Chudiyan',
    artist: 'K3G OST',
    events: ['sangeet'],
    moods: ['fun', 'traditional'],
    tempo: 'upbeat',
    languages: ['hindi'],
    cue: 'Drop on the chorus — full bridal squad entrance.',
  },
  {
    title: 'Chunari Chunari',
    artist: 'Biwi No. 1 OST',
    events: ['sangeet', 'reception'],
    moods: ['fun'],
    tempo: 'upbeat',
    languages: ['hindi'],
    cue: 'First chorus drop — high-energy reveal.',
  },
  {
    title: 'Mehendi Hai Rachne Wali',
    artist: 'Zubeen Garg',
    events: ['sangeet'],
    moods: ['traditional', 'romantic'],
    tempo: 'medium',
    languages: ['hindi'],
    cue: 'Slow walk through opening verses; pick up tempo for the bridal party.',
  },
  {
    title: 'Sajan Sajan Teri Dulhan',
    artist: 'Aap Ke Aa Jane Se OST',
    events: ['ceremony'],
    moods: ['romantic', 'traditional'],
    tempo: 'slow',
    languages: ['hindi'],
    cue: 'Acoustic intro, perfect for a stately walk to the mandap.',
  },
  {
    title: 'Tu Hi Re',
    artist: 'A.R. Rahman',
    events: ['ceremony', 'reception'],
    moods: ['romantic'],
    tempo: 'slow',
    languages: ['hindi', 'tamil'],
    cue: 'Full intro — flute then strings.',
  },
  {
    title: 'Tum Hi Ho',
    artist: 'Arijit Singh',
    events: ['reception'],
    moods: ['romantic', 'modern'],
    tempo: 'slow',
    languages: ['hindi'],
    cue: 'Skip to the second verse for a lower-key entrance.',
  },
  {
    title: 'Raabta',
    artist: 'Arijit Singh',
    events: ['reception'],
    moods: ['romantic', 'modern'],
    tempo: 'medium',
    languages: ['hindi'],
    cue: 'Drop at the chorus — classic modern walk-in.',
  },
  {
    title: 'Tera Yaar Hoon Main',
    artist: 'Arijit Singh',
    events: ['reception'],
    moods: ['romantic', 'modern'],
    tempo: 'slow',
    languages: ['hindi'],
    cue: 'Acoustic intro.',
  },
  {
    title: 'Kabhi Khushi Kabhie Gham (Title)',
    artist: 'Lata Mangeshkar',
    events: ['ceremony', 'reception'],
    moods: ['grand', 'traditional'],
    tempo: 'medium',
    languages: ['hindi'],
    cue: 'The orchestral intro — instantly recognizable, full goosebumps.',
  },
  {
    title: 'Manwa Laage',
    artist: 'Arijit Singh, Shreya Ghoshal',
    events: ['ceremony', 'reception'],
    moods: ['romantic', 'modern'],
    tempo: 'slow',
    languages: ['hindi'],
    cue: 'Soft strings intro into the first verse.',
  },
  {
    title: 'Saiyaara',
    artist: 'Mohit Chauhan',
    events: ['reception'],
    moods: ['romantic', 'modern'],
    tempo: 'medium',
    languages: ['hindi'],
    cue: 'Drop at the second verse — keeps the energy without overpowering.',
  },
  {
    title: 'Ranjha (Shershaah)',
    artist: 'Jasleen Royal, B Praak',
    events: ['ceremony', 'reception'],
    moods: ['romantic'],
    tempo: 'slow',
    languages: ['punjabi', 'hindi'],
    cue: 'Full intro — strings build beautifully.',
  },
  {
    title: 'Kesariya',
    artist: 'Arijit Singh',
    events: ['ceremony', 'reception', 'sangeet'],
    moods: ['romantic', 'modern'],
    tempo: 'medium',
    languages: ['hindi'],
    cue: 'The instrumental opening — the song everyone knew in 2022.',
  },

  // ── Punjabi grand ──
  {
    title: 'Kala Chashma',
    artist: 'Amar Arshi',
    events: ['sangeet', 'reception'],
    moods: ['fun'],
    tempo: 'upbeat',
    languages: ['punjabi'],
    cue: 'The unmistakable beat drop. Bridal squad signature move.',
  },
  {
    title: 'Saadi Galli Aaja',
    artist: 'Nautanki Saala OST',
    events: ['sangeet'],
    moods: ['fun'],
    tempo: 'upbeat',
    languages: ['punjabi', 'hindi'],
    cue: 'First chorus.',
  },
  {
    title: 'Laembadgini',
    artist: 'Diljit Dosanjh',
    events: ['sangeet', 'reception'],
    moods: ['fun', 'modern'],
    tempo: 'upbeat',
    languages: ['punjabi'],
    cue: 'Bass drop.',
  },
  {
    title: 'Sauda Khara Khara',
    artist: 'Diljit Dosanjh',
    events: ['sangeet'],
    moods: ['fun'],
    tempo: 'upbeat',
    languages: ['punjabi'],
    cue: 'The "Sauda Khara Khara!" hook.',
  },
  {
    title: 'Lehnga',
    artist: 'Jass Manak',
    events: ['sangeet', 'reception'],
    moods: ['fun', 'modern'],
    tempo: 'upbeat',
    languages: ['punjabi'],
    cue: 'Modern Punjabi go-to. Drop on the chorus.',
  },
  {
    title: 'Mundian To Bach Ke',
    artist: 'Panjabi MC',
    events: ['sangeet'],
    moods: ['fun', 'grand'],
    tempo: 'upbeat',
    languages: ['punjabi'],
    cue: 'The riff — instantly fills any room.',
  },
  {
    title: 'Tere Vaaste',
    artist: 'Varun Jain, Sachin-Jigar',
    events: ['ceremony', 'reception'],
    moods: ['romantic', 'modern'],
    tempo: 'medium',
    languages: ['hindi'],
    cue: 'Soft acoustic opening.',
  },

  // ── South Indian ──
  {
    title: 'Vinmeengal Vidiyalle',
    artist: 'A.R. Rahman',
    events: ['ceremony'],
    moods: ['romantic'],
    tempo: 'slow',
    languages: ['tamil'],
    cue: 'Flute intro into the strings.',
  },
  {
    title: 'Kaadhal Rojave',
    artist: 'A.R. Rahman',
    events: ['ceremony'],
    moods: ['romantic', 'traditional'],
    tempo: 'medium',
    languages: ['tamil'],
    cue: 'Iconic chorus.',
  },
  {
    title: 'Munbe Vaa',
    artist: 'A.R. Rahman, Naresh Iyer',
    events: ['ceremony', 'reception'],
    moods: ['romantic'],
    tempo: 'slow',
    languages: ['tamil'],
    cue: 'Strings intro.',
  },
  {
    title: 'Inkem Inkem Inkem Kaavaale',
    artist: 'Sid Sriram',
    events: ['reception'],
    moods: ['romantic', 'modern'],
    tempo: 'slow',
    languages: ['telugu'],
    cue: 'Acoustic guitar opening.',
  },
  {
    title: 'Samajavaragamana',
    artist: 'Sid Sriram',
    events: ['ceremony', 'reception'],
    moods: ['romantic'],
    tempo: 'slow',
    languages: ['telugu'],
    cue: 'Vocal intro — uses every emotion the room has to give.',
  },

  // ── Grand orchestral / instrumental ──
  {
    title: 'A Thousand Years (Strings)',
    artist: 'The Piano Guys / Vitamin String Quartet',
    events: ['ceremony'],
    moods: ['grand', 'romantic'],
    tempo: 'slow',
    languages: ['instrumental'],
    cue: 'Full instrumental — works for any tradition.',
  },
  {
    title: 'Canon in D (Modern)',
    artist: 'Various',
    events: ['ceremony'],
    moods: ['grand', 'traditional'],
    tempo: 'slow',
    languages: ['instrumental'],
    cue: 'Classic. The aunties who normally complain will stop.',
  },
  {
    title: 'Mangalam Bhagwan Vishnu (Sanskrit)',
    artist: 'Traditional',
    events: ['ceremony'],
    moods: ['traditional'],
    tempo: 'slow',
    languages: ['instrumental', 'hindi'],
    cue: 'Devotional opening for a traditional Hindu mandap entrance.',
  },
  {
    title: 'Marriage of Figaro (Overture)',
    artist: 'Mozart',
    events: ['reception'],
    moods: ['grand', 'fun'],
    tempo: 'upbeat',
    languages: ['instrumental'],
    cue: 'Pure showmanship — for a dramatic reception entrance.',
  },
  {
    title: 'Here Comes the Sun',
    artist: 'The Beatles',
    events: ['ceremony', 'reception'],
    moods: ['fun', 'romantic'],
    tempo: 'medium',
    languages: ['english'],
    cue: 'The opening guitar.',
  },
  {
    title: 'A Sky Full of Stars',
    artist: 'Coldplay',
    events: ['reception'],
    moods: ['grand', 'modern'],
    tempo: 'upbeat',
    languages: ['english'],
    cue: 'The build into the drop — incredible reveal moment.',
  },
  {
    title: 'Perfect',
    artist: 'Ed Sheeran',
    events: ['ceremony', 'reception'],
    moods: ['romantic'],
    tempo: 'slow',
    languages: ['english'],
    cue: 'Acoustic intro.',
  },
  {
    title: 'All of Me',
    artist: 'John Legend',
    events: ['reception'],
    moods: ['romantic'],
    tempo: 'slow',
    languages: ['english'],
    cue: 'Piano opening.',
  },
  {
    title: 'A Thousand Years',
    artist: 'Christina Perri',
    events: ['ceremony'],
    moods: ['romantic'],
    tempo: 'slow',
    languages: ['english'],
    cue: 'Full first verse — fusion-wedding favorite.',
  },
  {
    title: 'Marry You',
    artist: 'Bruno Mars',
    events: ['reception'],
    moods: ['fun', 'modern'],
    tempo: 'upbeat',
    languages: ['english'],
    cue: 'Drum intro.',
  },
  {
    title: 'Signed, Sealed, Delivered',
    artist: 'Stevie Wonder',
    events: ['reception'],
    moods: ['fun'],
    tempo: 'upbeat',
    languages: ['english'],
    cue: 'Brass intro.',
  },

  // ── Modern Bollywood ──
  {
    title: 'Channa Mereya',
    artist: 'Arijit Singh',
    events: ['ceremony', 'reception'],
    moods: ['romantic'],
    tempo: 'slow',
    languages: ['hindi', 'punjabi'],
    cue: 'The piano-led intro — emotional, perfect for fathers walking the bride.',
  },
  {
    title: 'Ae Dil Hai Mushkil',
    artist: 'Arijit Singh',
    events: ['reception'],
    moods: ['romantic', 'modern'],
    tempo: 'slow',
    languages: ['hindi'],
    cue: 'Full intro.',
  },
  {
    title: 'Galat',
    artist: 'Asees Kaur',
    events: ['reception'],
    moods: ['modern', 'romantic'],
    tempo: 'medium',
    languages: ['hindi', 'punjabi'],
    cue: 'Drop on the chorus.',
  },
  {
    title: 'Hawa Banke',
    artist: 'Darshan Raval',
    events: ['ceremony', 'reception'],
    moods: ['romantic', 'modern'],
    tempo: 'medium',
    languages: ['hindi'],
    cue: 'Soft opening into a building melody.',
  },
  {
    title: 'Mere Sohneya',
    artist: 'Sachet Tandon, Parampara Tandon',
    events: ['ceremony', 'reception'],
    moods: ['romantic'],
    tempo: 'slow',
    languages: ['hindi', 'punjabi'],
    cue: 'Strings into vocals.',
  },
  {
    title: 'Tujhe Kitna Chahne Lage',
    artist: 'Arijit Singh',
    events: ['reception'],
    moods: ['romantic', 'modern'],
    tempo: 'slow',
    languages: ['hindi'],
    cue: 'Acoustic guitar opening.',
  },
  {
    title: 'Ghar More Pardesiya',
    artist: 'Shreya Ghoshal',
    events: ['ceremony', 'sangeet'],
    moods: ['traditional', 'romantic'],
    tempo: 'medium',
    languages: ['hindi'],
    cue: 'Classical-fusion intro — visually it makes the room beautiful.',
  },
  {
    title: 'Aaj Sajeya',
    artist: 'Goldie Sohel, Alaya F',
    events: ['ceremony', 'sangeet'],
    moods: ['traditional', 'romantic'],
    tempo: 'medium',
    languages: ['hindi'],
    cue: 'Tabla and harmonium opening — classic but fresh.',
  },
  {
    title: 'Ang Laga De',
    artist: 'Shreya Ghoshal',
    events: ['ceremony'],
    moods: ['romantic', 'traditional'],
    tempo: 'slow',
    languages: ['hindi'],
    cue: 'The opening alaap — pure devotional energy.',
  },
];

export type Filter = {
  event: SongEvent;
  mood: SongMood;
  tempo: SongTempo;
  languages: SongLanguage[];
};

export function rankSongs(filter: Filter, limit = 8): Song[] {
  const ranked = SONGS.map((s) => {
    let score = 0;
    if (s.events.includes(filter.event)) score += 4;
    if (s.moods.includes(filter.mood)) score += 3;
    if (s.tempo === filter.tempo) score += 2;
    if (
      filter.languages.length === 0 ||
      s.languages.some((l) => filter.languages.includes(l))
    )
      score += 2;
    return { song: s, score };
  })
    .filter((r) => r.score >= 4) // must at least match event
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, limit).map((r) => r.song);
}

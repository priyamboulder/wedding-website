// ── Tradition → Rituals & Samagri knowledge base ─────────────────────────
// The couple picks a tradition on the Vision & Ceremony Brief tab; this
// library converts that choice into a first-draft set of rituals (ordered,
// with meanings) and a first-draft samagri list (grouped by category and
// linked back to the ritual they serve). The couple can then Include / Skip
// / Discuss each ritual, and the samagri list recomputes behind the scenes.
//
// Most entries here cover the largest traditions in depth. Regional
// sub-traditions that aren't hand-curated fall back to a reasonable Hindu
// base (Vedic + regional notes in the meanings). This is deliberate — a
// wrong-but-directionally-right starting point beats a blank canvas.

import type {
  CeremonyRitual,
  CeremonyTradition,
  SamagriCategory,
  SamagriItem,
  SamagriResponsibility,
  SamagriSource,
} from "@/types/pandit";

// Light ritual template — we expand to full CeremonyRitual at generation time.
interface RitualTemplate {
  id: string;
  name_sanskrit: string;
  name_english: string;
  short_description: string;
  meaning: string;
  default_duration_min: number;
  default_inclusion?: "yes" | "no" | "discuss";
  traditional_participants: string;
  what_happens?: string;
  music_note?: string;
  photography_note?: string;
  guest_instruction?: string;
}

interface SamagriTemplate {
  id: string;
  name_local: string;
  name_english: string;
  category: SamagriCategory;
  used_for_ritual_id?: string;
  used_for_label?: string;
  quantity: string;
  source: SamagriSource;
  responsibility: SamagriResponsibility;
  added_by_pandit?: boolean;
  notes?: string;
}

const now = () => new Date().toISOString();

const rid = (suffix: string, tradition: CeremonyTradition) =>
  `rit-${tradition}-${suffix}`;

const sid = (suffix: string, tradition: CeremonyTradition) =>
  `sam-${tradition}-${suffix}`;

// ── Shared ritual fragments used by many Hindu sub-traditions ────────────

const R_GANESH: RitualTemplate = {
  id: "ganesh",
  name_sanskrit: "गणेश पूजा",
  name_english: "Ganesh Puja",
  short_description:
    "Invocation of Lord Ganesh to remove obstacles at the ceremony start.",
  meaning:
    "Hindu ceremonies open by honoring Ganesh — the remover of obstacles. The couple and pandit offer prayers so the rest of the ceremony unfolds without interruption. Acknowledging that no union begins alone.",
  default_duration_min: 5,
  default_inclusion: "yes",
  traditional_participants: "Couple + pandit",
  what_happens:
    "Couple sits at the mandap. Pandit leads a short invocation to Ganesh. Couple offers flowers and rice to a small Ganesh murti.",
  music_note: "Silence or soft instrumental. No recorded music.",
  photography_note: "Wide opening shot — establishes the ceremony begin.",
  guest_instruction: "Seated. Silent attention.",
};

const R_BARAAT: RitualTemplate = {
  id: "baraat",
  name_sanskrit: "बरात और मिलनी",
  name_english: "Baraat & Milni",
  short_description:
    "Groom's procession arrives; families greet with garlands.",
  meaning:
    "The baraat is the groom's joyous arrival — historically on horseback, today often with a band and dancing. Milni is the formal greeting between families, garlanding male elders on both sides to symbolize the merging of two lineages.",
  default_duration_min: 20,
  default_inclusion: "yes",
  traditional_participants: "Groom, groom's family, bride's family",
  what_happens:
    "Groom arrives dancing to dhol. At the venue entrance, elders from both families exchange garlands in pairs. Bride's family offers tilak and sweets.",
  music_note: "Live dhol or recorded baraat music. Cut to silence as milni begins.",
  photography_note: "High-energy. Groom's face, the dancing, each milni pair.",
  guest_instruction: "Mingle, dance with the baraat.",
};

const R_JAIMALA: RitualTemplate = {
  id: "jaimala",
  name_sanskrit: "जयमाला / वरमाला",
  name_english: "Jai Mala / Varmala",
  short_description: "Exchange of flower garlands — a mutual act of acceptance.",
  meaning:
    "The couple sees each other as bride and groom for the first time and exchanges garlands. This is the moment of mutual choice — each welcoming the other into their life.",
  default_duration_min: 5,
  default_inclusion: "yes",
  traditional_participants: "Couple, bride's brothers/cousins",
  what_happens:
    "Bride and groom stand facing each other on either side of an antarpat. The curtain drops. They exchange garlands — three times each, traditionally.",
  music_note: "Soft instrumental during; build during the garland exchange.",
  photography_note: "Both profiles. The laugh as they garland each other.",
  guest_instruction: "Stand. Cheer and throw petals on exchange.",
};

const R_KANYADAAN: RitualTemplate = {
  id: "kanyadaan",
  name_sanskrit: "कन्यादान",
  name_english: "Kanyadaan",
  short_description:
    "The bride's parents entrust her to the groom — often the most emotional moment.",
  meaning:
    "Kanyadaan literally means 'giving away of the daughter.' The bride's parents place her hand in the groom's, pour sacred water, and formally entrust her care. This ritual carries complicated feelings for many modern couples — some reframe it as a blessing rather than a handover.",
  default_duration_min: 10,
  default_inclusion: "discuss",
  traditional_participants: "Bride's parents, bride, groom",
  what_happens:
    "Bride's parents sit with the couple at the mandap. Sacred water is poured over the joined hands of bride and groom. Mantras are recited affirming the union.",
  music_note: "Silence. Let the family speak.",
  photography_note: "Layered hands. Parents' faces.",
  guest_instruction: "Seated. Silent. A family moment.",
};

const R_HAVAN: RitualTemplate = {
  id: "havan",
  name_sanskrit: "विवाह हवन",
  name_english: "Vivah Havan",
  short_description: "The sacred fire is kindled — Agni witnesses the marriage.",
  meaning:
    "In Hindu tradition, Agni (fire) is the eternal witness to the marriage. Everything said and done at the havan is considered sacred because fire has seen it.",
  default_duration_min: 15,
  default_inclusion: "yes",
  traditional_participants: "Couple, pandit",
  what_happens:
    "Pandit kindles the sacred fire. Couple offers ghee and samagri into the fire while mantras are chanted.",
  music_note: "No recorded music. Mantras only.",
  photography_note: "Fire and the couple's faces lit by it.",
  guest_instruction: "Seated. Do not approach the fire.",
};

const R_PHERAS: RitualTemplate = {
  id: "pheras",
  name_sanskrit: "मंगल फेरे",
  name_english: "Mangal Pheras",
  short_description: "Seven circles around the sacred fire — seven vows.",
  meaning:
    "The couple walks around the sacred fire seven times, each circle representing a vow: nourishment, strength, prosperity, wisdom, progeny, health, and lifelong friendship.",
  default_duration_min: 15,
  default_inclusion: "yes",
  traditional_participants: "Couple, bride's brother (for offerings)",
  what_happens:
    "Couple's clothes are tied together (gath bandhan). They walk slowly around the fire, pausing after each circuit as the pandit recites the vow.",
  music_note: "No recorded music. Mantras only.",
  photography_note: "Each of the seven circles. Faces mid-vow.",
  guest_instruction: "Stand as they begin.",
};

const R_SAPTAPADI: RitualTemplate = {
  id: "saptapadi",
  name_sanskrit: "सप्तपदी",
  name_english: "Saptapadi",
  short_description: "Seven steps together — seven promises.",
  meaning:
    "The couple takes seven literal steps together, each step being a specific promise: to share responsibilities, be each other's strength, pursue dharma together, raise a family, grow old together, and remain friends forever.",
  default_duration_min: 10,
  default_inclusion: "yes",
  traditional_participants: "Couple, pandit",
  what_happens:
    "Couple takes seven deliberate steps together while the pandit recites each promise. Often where couples are invited to say their own vows in English.",
  music_note: "Silence during steps. Soft instrumental can follow.",
  photography_note: "Feet. Faces. Pandit in frame.",
  guest_instruction: "Seated or standing. Silent witness.",
};

const R_SINDOOR: RitualTemplate = {
  id: "sindoor",
  name_sanskrit: "सिंदूर दान",
  name_english: "Sindoor",
  short_description:
    "Groom applies sindoor to the bride's hairline — marking her as married.",
  meaning:
    "Sindoor (red vermillion powder) is applied by the groom to the parting of the bride's hair. In Hindu tradition this visibly marks a woman as married.",
  default_duration_min: 3,
  default_inclusion: "yes",
  traditional_participants: "Couple",
  what_happens:
    "Groom applies sindoor along the bride's hairline. Her head is typically veiled during or immediately after.",
  music_note: "Soft build from instrumental.",
  photography_note: "Close-up. Sindoor, hairline, bride's face.",
  guest_instruction: "Seated. A small cheer is appropriate after.",
};

const R_MANGALSUTRA: RitualTemplate = {
  id: "mangalsutra",
  name_sanskrit: "मंगलसूत्र",
  name_english: "Mangalsutra",
  short_description:
    "Sacred necklace tied by the groom — the bond of marriage.",
  meaning:
    "The mangalsutra is a gold and black-bead necklace tied by the groom around the bride's neck. 'Mangal' means auspicious, 'sutra' means thread.",
  default_duration_min: 3,
  default_inclusion: "yes",
  traditional_participants: "Couple",
  what_happens:
    "Groom takes the mangalsutra and ties it around the bride's neck. In some traditions, three knots are tied.",
  music_note: "Soft instrumental.",
  photography_note: "Front-facing so mangalsutra is visible.",
  guest_instruction: "Seated. Cheer welcome after.",
};

const R_AASHIRVAD: RitualTemplate = {
  id: "aashirvad",
  name_sanskrit: "आशीर्वाद",
  name_english: "Aashirvad",
  short_description: "Blessings from elders — the couple receives grace.",
  meaning:
    "After the rites are complete, the couple receives blessings from elders. Parents and grandparents place rice, flowers, or grain on the couple's heads while reciting blessings.",
  default_duration_min: 10,
  default_inclusion: "yes",
  traditional_participants: "All parents and grandparents, followed by other elders",
  what_happens:
    "Couple touches the feet of each elder. Elder places rice/flowers on their heads, murmurs a blessing.",
  music_note: "Soft instrumental.",
  photography_note: "Each elder individually. The couple touching feet.",
  guest_instruction: "Seated.",
};

const R_VIDAAI: RitualTemplate = {
  id: "vidaai",
  name_sanskrit: "विदाई",
  name_english: "Vidaai",
  short_description:
    "The bride's farewell from her family — the most emotional moment.",
  meaning:
    "Vidaai is the bride's departure from her parents' home. Traditionally she throws rice backward over her shoulder — symbolically repaying her parents for everything they've given her.",
  default_duration_min: 10,
  default_inclusion: "yes",
  traditional_participants: "Bride, bride's family, groom",
  what_happens:
    "Bride embraces each family member. She throws three handfuls of rice backward over her shoulder, walks out with the groom.",
  music_note: "A dedicated vidaai song — often 'Babul'. Live singer welcome.",
  photography_note: "The tears. The rice. The car door closing.",
  guest_instruction: "Stand. You may cry. You may wave.",
};

// Standard Vedic script shared by several sub-traditions.
const VEDIC_BASE: RitualTemplate[] = [
  R_GANESH,
  R_BARAAT,
  R_JAIMALA,
  R_KANYADAAN,
  R_HAVAN,
  R_PHERAS,
  R_SAPTAPADI,
  R_SINDOOR,
  R_MANGALSUTRA,
  R_AASHIRVAD,
  R_VIDAAI,
];

// ── Tradition-specific ritual libraries ──────────────────────────────────

const RITUAL_LIBRARY: Partial<Record<CeremonyTradition, RitualTemplate[]>> = {
  vedic: VEDIC_BASE,
  north_indian: VEDIC_BASE,

  arya_samaj: [
    R_GANESH,
    R_HAVAN,
    {
      id: "brahmacharya",
      name_sanskrit: "ब्रह्मचर्य व्रत",
      name_english: "Brahmacharya Vrat",
      short_description:
        "Vow of purity and learning — a reformed Arya Samaj opening rite.",
      meaning:
        "Arya Samaj ceremonies open with a vow to lead a life of truth and discipline. Unlike Vedic ceremonies there is no idol worship — the fire alone is the witness.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, pandit",
    },
    {
      id: "pratigya",
      name_sanskrit: "प्रतिज्ञा",
      name_english: "Pratigya (Mutual Vows)",
      short_description: "Couple exchanges vows in spoken Sanskrit + language.",
      meaning:
        "Arya Samaj emphasizes mutual vows spoken by both partners — a marked departure from ceremonies where only the priest speaks.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple",
    },
    R_JAIMALA,
    R_PHERAS,
    R_SAPTAPADI,
    R_AASHIRVAD,
    R_VIDAAI,
  ],

  tamil_brahmin: [
    {
      id: "ganapathi",
      name_sanskrit: "கணபதி பூஜை",
      name_english: "Ganapathi Pooja",
      short_description: "Tamil invocation of Ganesh — opens every ceremony.",
      meaning: "Same spirit as Ganesh Puja elsewhere, led in Tamil tradition.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple + pandit",
    },
    {
      id: "nandi",
      name_sanskrit: "நாந்தீ ஶ்ராத்தம்",
      name_english: "Nandi Shraddha",
      short_description:
        "Ancestral blessings — invoking forefathers before the wedding.",
      meaning:
        "Before the wedding rites, both families perform Nandi Shraddha to seek blessings from departed ancestors.",
      default_duration_min: 15,
      default_inclusion: "yes",
      traditional_participants: "Both families, pandit",
    },
    {
      id: "kashi_yatra",
      name_sanskrit: "காசீ யாத்ரை",
      name_english: "Kashi Yatra",
      short_description:
        "Groom's playful 'pilgrimage' — the bride's father calls him back.",
      meaning:
        "The groom pretends to renounce worldly life and leave for Kashi; the bride's father intercepts with the offer of his daughter's hand. A theatrical, beloved Tamil Brahmin moment.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Groom, bride's father",
      music_note: "Nadaswaram band.",
    },
    {
      id: "maalai_maatral",
      name_sanskrit: "மாலை மாற்றல்",
      name_english: "Maalai Maatral",
      short_description:
        "Garland exchange — lifted by uncles and brothers on both sides.",
      meaning:
        "The Tamil equivalent of jaimala, but charged with comedic energy: uncles on both sides lift the bride and groom to make the exchange harder.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, uncles/brothers on both sides",
    },
    {
      id: "oonjal",
      name_sanskrit: "ஊஞ்சல்",
      name_english: "Oonjal (Swing Ceremony)",
      short_description:
        "Couple is seated on a swing; elders sing to ward off evil.",
      meaning:
        "Couple is seated on a swing (oonjal) decorated with flowers. Elders circle them with songs and offerings of colored rice to invoke protection.",
      default_duration_min: 15,
      default_inclusion: "yes",
      traditional_participants: "Couple, elder women",
      music_note: "Traditional oonjal pattu (songs).",
    },
    {
      id: "kanyadaanam",
      name_sanskrit: "கன்யாதானம்",
      name_english: "Kanyadaanam",
      short_description: "Bride's parents formally offer her hand to the groom.",
      meaning:
        "Tamil Brahmin version of Kanyadaan — bride sits on her father's lap during the ritual.",
      default_duration_min: 10,
      default_inclusion: "discuss",
      traditional_participants: "Bride, bride's parents, groom",
    },
    {
      id: "mangalya_dharanam",
      name_sanskrit: "மாங்கல்ய தாரணம்",
      name_english: "Mangalya Dharanam (Thali)",
      short_description:
        "Groom ties the sacred thali around the bride's neck — THE central moment.",
      meaning:
        "In South Indian traditions the thali-tying is the ONE ritual that makes the marriage. The groom ties three knots while the nadaswaram peaks.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple",
      music_note: "Nadaswaram reaches a climax at the moment of tying.",
    },
    R_SAPTAPADI,
    {
      id: "pradhana_homam",
      name_sanskrit: "பிரதான ஹோமம்",
      name_english: "Pradhana Homam",
      short_description: "Main fire ceremony — witness to the union.",
      meaning:
        "The main fire ritual — rice and ghee offerings into the homam while the bride's brother guides her in the traditional sequence.",
      default_duration_min: 15,
      default_inclusion: "yes",
      traditional_participants: "Couple, bride's brother",
    },
    {
      id: "nalangu",
      name_sanskrit: "நலங்கு",
      name_english: "Nalangu",
      short_description:
        "Playful games between bride and groom — cracking coconuts, rolling balls.",
      meaning:
        "Post-ceremony games that ease the couple into friendship — cracking coconuts, rolling balls back and forth. The wedding's most fun moment.",
      default_duration_min: 20,
      default_inclusion: "yes",
      traditional_participants: "Couple, extended families",
    },
    R_AASHIRVAD,
  ],

  telugu: [
    {
      id: "snathakam",
      name_sanskrit: "స్నాతకం",
      name_english: "Snathakam",
      short_description: "Groom's pre-wedding ritual bath and dedication.",
      meaning:
        "The groom ceremonially prepares by tying a silver string around his waist, declaring he is ready for marriage.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Groom, groom's family",
    },
    {
      id: "kashi_yatra_te",
      name_sanskrit: "కాశీ యాత్ర",
      name_english: "Kashi Yatra",
      short_description:
        "Groom mock-departs for Kashi; bride's father calls him back.",
      meaning:
        "Groom carries an umbrella and a walking stick, pretends to leave for renunciation. Bride's father persuades him with his daughter's hand.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Groom, bride's father",
    },
    {
      id: "madhuparkam",
      name_sanskrit: "మధుపర్కం",
      name_english: "Madhuparkam",
      short_description:
        "Couple wears simple white-and-cream attire, receives honey.",
      meaning:
        "Bride and groom change into simple madhuparkam attire and are welcomed with a sweetened honey drink.",
      default_duration_min: 8,
      default_inclusion: "yes",
      traditional_participants: "Couple, bride's parents",
    },
    {
      id: "jeelakarra_bellam",
      name_sanskrit: "జీలకర్ర బెల్లం",
      name_english: "Jeelakarra Bellam",
      short_description:
        "Couple places cumin + jaggery paste on each other's heads.",
      meaning:
        "A quintessentially Telugu moment — couple places a mixture of cumin seeds and jaggery on each other's heads, symbolizing an inseparable bond even in hardship.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple",
      music_note: "Nadaswaram + melam.",
    },
    R_MANGALSUTRA,
    {
      id: "talambralu",
      name_sanskrit: "తలంబ్రాలు",
      name_english: "Talambralu",
      short_description:
        "Couple showers rice mixed with turmeric and saffron on each other.",
      meaning:
        "The loudest, most joyful moment — couple pours handfuls of yellow rice on each other while the crowd cheers.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple",
      photography_note: "High-energy. Continuous frames through the shower.",
    },
    R_SAPTAPADI,
    R_AASHIRVAD,
  ],

  malayali: [
    {
      id: "ganapati_homam",
      name_sanskrit: "ഗണപതി ഹോമം",
      name_english: "Ganapati Homam",
      short_description:
        "Kerala-style invocation of Ganesh at a small homam.",
      meaning:
        "Kerala Hindu ceremonies begin at the temple or venue with a Ganapati homam — a small fire ritual to invoke obstacle-removal.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, pandit",
    },
    {
      id: "muhurtham_m",
      name_sanskrit: "മുഹൂർത്തം",
      name_english: "Muhurtham",
      short_description:
        "The auspicious moment — tied to exact time by astrologer.",
      meaning:
        "Kerala weddings are sharply timed to the auspicious muhurtham calculated by the family astrologer. Everything else is sequenced around it.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple, elders",
    },
    {
      id: "pudavakoda",
      name_sanskrit: "പുടവകൊട",
      name_english: "Pudavakoda",
      short_description:
        "Groom presents the bride with a silk sari (pudava).",
      meaning:
        "The groom gifts a new silk pudava (sari) to the bride, formally welcoming her into his family.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple, groom's mother",
    },
    {
      id: "thali_m",
      name_sanskrit: "താലിക്കെട്ട്",
      name_english: "Thalikettu",
      short_description:
        "Thali-tying — the central Kerala Hindu moment.",
      meaning:
        "Groom ties the thali (sacred thread with a small gold pendant) around the bride's neck to the sound of the nadaswaram peaking.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple",
    },
    R_SAPTAPADI,
    R_AASHIRVAD,
  ],

  gujarati: [
    {
      id: "ganesh_g",
      name_sanskrit: "ગણેશ સ્થાપના",
      name_english: "Ganesh Sthapana",
      short_description:
        "Installation of Ganesh — opening rite of Gujarati weddings.",
      meaning:
        "Before the ceremony begins, Ganesh is formally installed and worshipped at the mandap. The Gujarati wedding begins only after this.",
      default_duration_min: 8,
      default_inclusion: "yes",
      traditional_participants: "Couple, pandit, elders",
    },
    {
      id: "mandap_muhurat",
      name_sanskrit: "મંડપ મુહૂર્ત",
      name_english: "Mandap Muhurat",
      short_description:
        "Consecration of the mandap — the four pillars represent four parents.",
      meaning:
        "The mandap's four pillars represent the four parents of the couple. Each is touched and blessed before the ceremony begins.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Both sets of parents",
    },
    R_BARAAT,
    {
      id: "ponkhanu",
      name_sanskrit: "પોંખણું",
      name_english: "Ponkhanu",
      short_description:
        "Bride's mother playfully tries to 'catch' the groom's nose.",
      meaning:
        "The bride's mother welcomes the groom with aarti and — traditionally — playfully reaches to pinch his nose as a sign of humility. A beloved Gujarati moment.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Groom, bride's mother",
    },
    {
      id: "jaimala_g",
      name_sanskrit: "જયમાળા",
      name_english: "Jaimala",
      short_description: "Garland exchange.",
      meaning: R_JAIMALA.meaning,
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: R_JAIMALA.traditional_participants,
    },
    R_KANYADAAN,
    {
      id: "hastamilap",
      name_sanskrit: "હસ્તમિલાપ",
      name_english: "Hastamilap",
      short_description:
        "Joining of hands — the bride's and groom's hands are tied together.",
      meaning:
        "The pandit ties a white cloth around the joined hands of the couple. This is the Gujarati equivalent of the 'knot' being tied — from here they are one.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple, pandit, parents",
    },
    R_PHERAS,
    R_SAPTAPADI,
    R_SINDOOR,
    R_MANGALSUTRA,
    R_AASHIRVAD,
    R_VIDAAI,
  ],

  surti_gujarati: [
    // Surti Gujarati shares most of the Gujarati sequence with minor name
    // variations — we reuse the Gujarati library and add a Surti-specific
    // "Sari pehrani" moment.
    {
      id: "ganesh_sg",
      name_sanskrit: "ગણેશ સ્થાપના",
      name_english: "Ganesh Sthapana",
      short_description: "Installation of Ganesh.",
      meaning: "Standard Gujarati Ganesh installation.",
      default_duration_min: 8,
      default_inclusion: "yes",
      traditional_participants: "Couple, pandit, elders",
    },
    R_BARAAT,
    {
      id: "sari_pehrani",
      name_sanskrit: "સાડી પહેરાણી",
      name_english: "Sari Pehrani",
      short_description:
        "Groom's family gifts the bride a sari for the ceremony.",
      meaning:
        "Distinct Surti tradition — the groom's family formally gifts and drapes the wedding sari during the ceremony.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Groom's family, bride",
    },
    R_JAIMALA,
    R_KANYADAAN,
    {
      id: "hastamilap_sg",
      name_sanskrit: "હસ્તમિલાપ",
      name_english: "Hastamilap",
      short_description: "Joining of hands.",
      meaning: "Couple's hands are tied together by the pandit.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple, pandit",
    },
    R_PHERAS,
    R_SAPTAPADI,
    R_SINDOOR,
    R_MANGALSUTRA,
    R_AASHIRVAD,
    R_VIDAAI,
  ],

  marathi: [
    {
      id: "ganesh_m",
      name_sanskrit: "गणेश पूजा",
      name_english: "Ganesh Puja",
      short_description: "Ganesh invocation with Marathi rites.",
      meaning: R_GANESH.meaning,
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple + pandit",
    },
    {
      id: "antarpat",
      name_sanskrit: "अंतरपाट",
      name_english: "Antarpat",
      short_description:
        "Silk cloth held between couple while Mangalashtaka verses are chanted.",
      meaning:
        "The Marathi equivalent of the veil — a silk curtain is held between bride and groom while sacred verses (Mangalashtaka) are sung. The curtain drops on the final verse.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, priests, chorus",
      music_note: "Mangalashtaka verses sung by priests.",
    },
    R_JAIMALA,
    {
      id: "kanyadaan_m",
      name_sanskrit: "कन्यादान",
      name_english: "Kanyadaan",
      short_description: "Bride's parents entrust her — Marathi rites.",
      meaning: R_KANYADAAN.meaning,
      default_duration_min: 10,
      default_inclusion: "discuss",
      traditional_participants: R_KANYADAAN.traditional_participants,
    },
    {
      id: "lajahom",
      name_sanskrit: "लाजाहोम",
      name_english: "Lajahom",
      short_description:
        "Bride's brother offers puffed rice into the fire on her behalf.",
      meaning:
        "The bride's brother pours puffed rice into her cupped hands; she offers it into the sacred fire on behalf of her marital home.",
      default_duration_min: 8,
      default_inclusion: "yes",
      traditional_participants: "Couple, bride's brother",
    },
    R_SAPTAPADI,
    R_MANGALSUTRA,
    R_AASHIRVAD,
    R_VIDAAI,
  ],

  bengali: [
    {
      id: "bor_boron",
      name_sanskrit: "বর বরণ",
      name_english: "Bor Boron",
      short_description: "Welcome of the groom with aarti and sweets.",
      meaning:
        "The bride's mother welcomes the groom with an aarti tray, rice, and sweets as he arrives at the mandap.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Groom, bride's mother",
    },
    {
      id: "subho_drishti",
      name_sanskrit: "শুভ দৃষ্টি",
      name_english: "Shubho Drishti",
      short_description:
        "The first auspicious look — bride is carried in on a pidi.",
      meaning:
        "Bride is carried in on a wooden stool (pidi) by her brothers, covered by betel leaves. When the leaves drop, the couple sees each other — the 'auspicious glance.'",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, bride's brothers",
      photography_note: "The uncovering. The first glance.",
    },
    {
      id: "mala_badal",
      name_sanskrit: "মালা বদল",
      name_english: "Mala Badal",
      short_description: "Garland exchange — Bengali version of jaimala.",
      meaning:
        "Couple exchanges garlands three times while raised on the shoulders of their cousins.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple, cousins",
    },
    {
      id: "sampradan",
      name_sanskrit: "সম্প্রদান",
      name_english: "Sampradan (Kanyadaan)",
      short_description: "Bride is entrusted to the groom by her parents.",
      meaning:
        "The Bengali equivalent of kanyadaan — the bride's father places her hand in the groom's while mantras are recited.",
      default_duration_min: 8,
      default_inclusion: "discuss",
      traditional_participants: R_KANYADAAN.traditional_participants,
    },
    {
      id: "yagna_b",
      name_sanskrit: "যজ্ঞ",
      name_english: "Yagna",
      short_description: "Fire ritual — Bengali style.",
      meaning: R_HAVAN.meaning,
      default_duration_min: 15,
      default_inclusion: "yes",
      traditional_participants: R_HAVAN.traditional_participants,
    },
    {
      id: "saat_pak",
      name_sanskrit: "সাত পাক",
      name_english: "Saat Paak",
      short_description: "Seven circles around the fire — Bengali variant.",
      meaning:
        "Bengali version of pheras — seven circles with the groom leading and the bride following.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, pandit",
    },
    {
      id: "sindoor_daan",
      name_sanskrit: "সিঁদুর দান",
      name_english: "Sindoor Daan",
      short_description:
        "Groom applies sindoor while the bride is veiled with a new sari.",
      meaning:
        "Groom applies sindoor to the bride's hairline. A new red sari (the gayebhar) is then draped over her head.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple",
    },
    R_AASHIRVAD,
    R_VIDAAI,
  ],

  punjabi_hindu: [
    R_GANESH,
    R_BARAAT,
    {
      id: "agwani",
      name_sanskrit: "ਆਗਵਾਨੀ",
      name_english: "Agwani & Milni",
      short_description:
        "Punjabi-style welcome and elder-exchange of garlands.",
      meaning:
        "Bride's side welcomes the groom's baraat. Elders from both sides pair off for the milni, exchanging garlands and tokens of shagun.",
      default_duration_min: 20,
      default_inclusion: "yes",
      traditional_participants: "Both families, elders",
    },
    R_JAIMALA,
    R_KANYADAAN,
    {
      id: "laavan",
      name_sanskrit: "ਲਾਵਾਂ / ਫੇਰੇ",
      name_english: "Pheras / Laavan",
      short_description: "Seven circles around the fire.",
      meaning:
        "Punjabi Hindu ceremonies follow the four or seven pheras around the fire, led by the bride's brother.",
      default_duration_min: 15,
      default_inclusion: "yes",
      traditional_participants: "Couple, bride's brother",
    },
    R_SAPTAPADI,
    R_SINDOOR,
    R_MANGALSUTRA,
    {
      id: "chooda",
      name_sanskrit: "ਚੂੜਾ",
      name_english: "Chooda & Kalire",
      short_description:
        "Red-and-ivory bangles + dangling kalire from maternal uncle.",
      meaning:
        "Bride's maternal uncle (mamaji) presents the chooda (red and ivory bangles) and kalire (ornamental danglers). Unmarried girls stand around her to have the kalire dropped on them — 'whoever it falls on marries next.'",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Bride, maternal uncle, unmarried cousins",
    },
    R_AASHIRVAD,
    R_VIDAAI,
  ],

  rajasthani: VEDIC_BASE,
  marwari: [
    R_GANESH,
    {
      id: "janev",
      name_sanskrit: "जनेऊ",
      name_english: "Janev (Sacred Thread)",
      short_description: "Groom is invested with the sacred thread.",
      meaning:
        "Marwari grooms are invested with the sacred thread (janev) as a prerequisite for the wedding.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Groom, pandit",
    },
    R_BARAAT,
    R_JAIMALA,
    R_KANYADAAN,
    {
      id: "paanigrahan",
      name_sanskrit: "पाणिग्रहण",
      name_english: "Paanigrahan",
      short_description:
        "Groom formally accepts the bride's hand.",
      meaning:
        "The pandit places the bride's hand in the groom's and recites verses sealing the partnership.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple, pandit",
    },
    R_HAVAN,
    R_PHERAS,
    R_SAPTAPADI,
    R_SINDOOR,
    R_MANGALSUTRA,
    {
      id: "anjhala_bharai",
      name_sanskrit: "अंजला भराई",
      name_english: "Anjhala Bharai",
      short_description:
        "Bride is formally welcomed into her new family.",
      meaning:
        "Groom's mother fills the bride's lap with fruit, sweets, and gold — a welcome into her new household.",
      default_duration_min: 8,
      default_inclusion: "yes",
      traditional_participants: "Groom's mother, bride",
    },
    R_AASHIRVAD,
    R_VIDAAI,
  ],

  sindhi: [
    R_GANESH,
    {
      id: "berana",
      name_sanskrit: "بيراڻا",
      name_english: "Berana Satsang",
      short_description:
        "Devotional singing at the bride's home before the wedding.",
      meaning:
        "Sindhis begin wedding celebrations with a devotional satsang — hymns to Jhulelal and other patron saints.",
      default_duration_min: 15,
      default_inclusion: "yes",
      traditional_participants: "Both families",
    },
    R_BARAAT,
    R_JAIMALA,
    {
      id: "palla",
      name_sanskrit: "پلؐو",
      name_english: "Palla",
      short_description:
        "Groom's scarf is tied to the bride's — they become one.",
      meaning:
        "The groom's scarf (palla) is tied to the bride's dupatta — a Sindhi-specific knot-tying moment.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple, elders",
    },
    R_PHERAS,
    R_SAPTAPADI,
    R_SINDOOR,
    R_AASHIRVAD,
    R_VIDAAI,
  ],

  kashmiri_pandit: [
    {
      id: "ganesh_kp",
      name_sanskrit: "गणेश पूजा",
      name_english: "Ganesh Puja",
      short_description: "Ganesh invocation in the Kashmiri Pandit style.",
      meaning: R_GANESH.meaning,
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple + pandit",
    },
    {
      id: "devgon",
      name_sanskrit: "देवगोन",
      name_english: "Devgon",
      short_description:
        "Thread ceremony for the couple — unique to KP tradition.",
      meaning:
        "Both bride and groom undergo a Devgon (thread investiture) as a purification step before the wedding itself.",
      default_duration_min: 15,
      default_inclusion: "yes",
      traditional_participants: "Couple, pandit",
    },
    {
      id: "lagan",
      name_sanskrit: "लगन",
      name_english: "Lagan",
      short_description: "Auspicious-moment fire ritual.",
      meaning:
        "KP weddings center on the Lagan — the fire ritual timed to the auspicious muhurat by the family jyotishi.",
      default_duration_min: 20,
      default_inclusion: "yes",
      traditional_participants: "Couple, pandit, families",
    },
    R_KANYADAAN,
    {
      id: "saat_phere_kp",
      name_sanskrit: "सप्तपदी",
      name_english: "Saat Phere / Saptapadi",
      short_description: "Seven circuits around the fire.",
      meaning: R_PHERAS.meaning,
      default_duration_min: 15,
      default_inclusion: "yes",
      traditional_participants: "Couple, pandit",
    },
    {
      id: "posh_puza",
      name_sanskrit: "पोष पूज़ा",
      name_english: "Posh Puza",
      short_description:
        "Flower-blessing — couple is showered with fresh flowers.",
      meaning:
        "A distinct KP moment — family elders shower the couple with fresh flowers while a priest chants.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, elders",
    },
    R_AASHIRVAD,
    R_VIDAAI,
  ],

  bihari_maithili: VEDIC_BASE,
  odia: VEDIC_BASE,
  assamese: [
    R_GANESH,
    {
      id: "juron_diya",
      name_sanskrit: "জুৰোণ দিয়া",
      name_english: "Juron Diya",
      short_description:
        "Groom's family presents the bride with her wedding attire.",
      meaning:
        "Groom's mother formally presents the bride with her wedding sari, jewelry, and sindoor. A defining Assamese moment.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Groom's family, bride",
    },
    R_JAIMALA,
    R_KANYADAAN,
    R_PHERAS,
    R_SAPTAPADI,
    R_SINDOOR,
    R_AASHIRVAD,
    R_VIDAAI,
  ],
  konkani_goan_hindu: VEDIC_BASE,
  kannada: [
    R_GANESH,
    {
      id: "dhare_herdu",
      name_sanskrit: "ಧಾರೆ ಎರೆಯುವುದು",
      name_english: "Dhare Herdu",
      short_description:
        "Bride's parents pour sacred water over the joined hands.",
      meaning:
        "The Kannada equivalent of kanyadaan — water is poured over the couple's joined hands while mantras seal the marriage.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Bride's parents, couple",
    },
    R_MANGALSUTRA,
    R_SAPTAPADI,
    {
      id: "okuli",
      name_sanskrit: "ಓಕುಳಿ",
      name_english: "Okuli",
      short_description:
        "Playful post-ceremony game — couple throws colored water.",
      meaning:
        "Kannada couples play 'okuli' — throwing turmeric water at each other — as a lighthearted start to married life.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple",
    },
    R_AASHIRVAD,
  ],

  sikh_anand_karaj: [
    {
      id: "ardaas",
      name_sanskrit: "ਅਰਦਾਸ",
      name_english: "Ardaas",
      short_description: "Opening prayer by the granthi.",
      meaning:
        "The Anand Karaj opens with an Ardaas (communal prayer) before Guru Granth Sahib Ji. All guests stand during this.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Granthi, all guests",
    },
    {
      id: "palla_rasam",
      name_sanskrit: "ਪੱਲੇ ਦੀ ਰਸਮ",
      name_english: "Palla Rasam",
      short_description:
        "Bride's father ties one end of a cloth to groom and the other to bride.",
      meaning:
        "Bride's father places one end of a long cloth (palla) in the groom's hand and the other in the bride's — symbolizing that she is now his responsibility.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Bride's father, couple",
    },
    {
      id: "laavan_sikh",
      name_sanskrit: "ਲਾਵਾਂ",
      name_english: "Laavan (Four Rounds)",
      short_description:
        "Four circumambulations of Guru Granth Sahib Ji — each tied to a verse from the Laavan Shabad.",
      meaning:
        "The couple walks clockwise around Guru Granth Sahib Ji four times. A different Laavan verse is read before each circuit, each describing a stage of the spiritual journey of marriage.",
      default_duration_min: 20,
      default_inclusion: "yes",
      traditional_participants: "Couple, granthi, ragi jatha",
      music_note: "Ragi jatha (raag singers) sing each Laavan verse.",
    },
    {
      id: "anand_sahib",
      name_sanskrit: "ਅਨੰਦ ਸਾਹਿਬ",
      name_english: "Anand Sahib",
      short_description:
        "Recitation of the Anand Sahib closing prayer.",
      meaning:
        "Six stanzas of the Anand Sahib are sung, followed by another Ardaas to close the ceremony.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Granthi, sangat",
    },
    {
      id: "hukamnama",
      name_sanskrit: "ਹੁਕਮਨਾਮਾ",
      name_english: "Hukamnama",
      short_description:
        "A random verse is read from Guru Granth Sahib Ji — guidance for the couple.",
      meaning:
        "A verse is opened at random from Guru Granth Sahib Ji and read aloud as divine guidance for the newlyweds.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Granthi, couple",
    },
    {
      id: "karah_prasad",
      name_sanskrit: "ਕੜਾਹ ਪ੍ਰਸ਼ਾਦ",
      name_english: "Karah Prasad",
      short_description: "Sacred sweet offering served to all attendees.",
      meaning:
        "The blessed karah prasad is distributed to all present — a shared, sweet end to the ceremony.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Sangat, sevadars",
    },
  ],

  jain: [
    {
      id: "navkar_mantra",
      name_sanskrit: "णमोकार मंत्र",
      name_english: "Navkar Mantra",
      short_description: "Opening recitation of the Navkar — Jain universal prayer.",
      meaning:
        "Every Jain ceremony opens with the Navkar Mantra — a salutation to the enlightened, liberated, and monastic beings.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Everyone present",
    },
    {
      id: "vagdan",
      name_sanskrit: "वाग्दान",
      name_english: "Vagdan",
      short_description: "Formal engagement — exchange of tika and coconut.",
      meaning:
        "Families exchange tika, sweets, and a coconut to seal the formal engagement before the wedding proper.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Both families",
    },
    {
      id: "granthi_bandhan_j",
      name_sanskrit: "ग्रंथी बंधन",
      name_english: "Granthi Bandhan",
      short_description: "Tying of the couple's garments.",
      meaning:
        "A Jain-specific knot is tied between the couple's attire before the pheras begin.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple, pandit",
    },
    R_PHERAS,
    R_SAPTAPADI,
    {
      id: "ashirwad_j",
      name_sanskrit: "आशीर्वाद",
      name_english: "Aashirvad & Pravachan",
      short_description:
        "Elder blessings and a Jain sermon for the couple.",
      meaning:
        "The sadhu/sadhvi gives a pravachan (short sermon) on dharma in married life, followed by blessings from elders.",
      default_duration_min: 15,
      default_inclusion: "yes",
      traditional_participants: "Sadhu/sadhvi, elders",
    },
    R_VIDAAI,
  ],

  buddhist: [
    {
      id: "refuge",
      name_sanskrit: "त्रिशरण",
      name_english: "Taking Refuge",
      short_description: "Couple recites refuge in Buddha, Dharma, Sangha.",
      meaning:
        "Couple formally takes refuge in the Three Jewels before a monk — setting the ceremony within the Buddhist framework.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple, monk",
    },
    {
      id: "precepts",
      name_sanskrit: "पंचशील",
      name_english: "Five Precepts",
      short_description: "Couple affirms the Five Precepts.",
      meaning:
        "The couple affirms the Five Precepts — non-harm, non-stealing, right speech, right conduct, and clarity of mind.",
      default_duration_min: 8,
      default_inclusion: "yes",
      traditional_participants: "Couple, monk",
    },
    {
      id: "sigalovada",
      name_sanskrit: "सिगालोवाद",
      name_english: "Sigalovada Sutta Reading",
      short_description:
        "Reading of the Buddha's teaching on married life.",
      meaning:
        "The Sigalovada Sutta describes mutual duties between husband and wife — a foundational text for Buddhist married life.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Monk, couple",
    },
    {
      id: "water_pouring",
      name_sanskrit: "पानी चढ़ाना",
      name_english: "Water-Pouring Blessing",
      short_description:
        "Monk pours water over the couple's hands into a bowl.",
      meaning:
        "A blessing where merit is symbolically transferred to the couple through pouring water.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple, monk",
    },
    {
      id: "ring_exchange_b",
      name_sanskrit: "",
      name_english: "Ring Exchange",
      short_description:
        "Contemporary ring exchange between the couple.",
      meaning:
        "Modern Buddhist weddings include a ring exchange — symbol of mutual commitment in everyday terms.",
      default_duration_min: 3,
      default_inclusion: "yes",
      traditional_participants: "Couple",
    },
    {
      id: "sangha_blessing",
      name_sanskrit: "संघ आशीर्वाद",
      name_english: "Sangha Blessing",
      short_description: "Community affirms the marriage.",
      meaning:
        "The gathered sangha offers blessings; monks chant protective verses (Paritta).",
      default_duration_min: 8,
      default_inclusion: "yes",
      traditional_participants: "Sangha, monks",
    },
  ],

  muslim_nikah: [
    {
      id: "nikah_istikbal",
      name_sanskrit: "استقبال",
      name_english: "Istikbal (Welcome)",
      short_description:
        "Groom's party is welcomed at the venue.",
      meaning:
        "The groom's arrival and formal welcome by the bride's family — the gentle opening of the nikah day.",
      default_duration_min: 15,
      default_inclusion: "yes",
      traditional_participants: "Both families",
    },
    {
      id: "ijab_qubul",
      name_sanskrit: "إيجاب و قبول",
      name_english: "Ijab-e-Qubul",
      short_description:
        "Bride's and groom's consent is asked three times, answered 'qubul hai.'",
      meaning:
        "Core of the nikah — the maulvi asks both bride and groom three times if they consent to the marriage. Each responds 'qubul hai' (I accept).",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, maulvi, witnesses",
    },
    {
      id: "mehr",
      name_sanskrit: "مهر",
      name_english: "Mehr",
      short_description:
        "Mandatory gift from groom to bride, formally entered in the nikahnama.",
      meaning:
        "The mehr is the gift (often cash, property, or jewelry) the groom pledges to the bride. Its value is negotiated and recorded in the nikahnama.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple, maulvi, witnesses",
    },
    {
      id: "nikahnama",
      name_sanskrit: "نكاح نامه",
      name_english: "Nikahnama Signing",
      short_description: "Marriage contract is signed by bride, groom, witnesses.",
      meaning:
        "The nikahnama is the marriage contract. Bride, groom, two witnesses from each side, and the maulvi sign.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, 4 witnesses, maulvi",
    },
    {
      id: "khutbah",
      name_sanskrit: "خطبة النکاح",
      name_english: "Khutbah-e-Nikah",
      short_description: "Sermon by the maulvi blessing the marriage.",
      meaning:
        "The maulvi delivers a short sermon drawn from the Quran and hadith about the rights and duties of marriage.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Maulvi, all present",
    },
    {
      id: "dua",
      name_sanskrit: "دعاء",
      name_english: "Dua",
      short_description: "Collective prayer for the couple's wellbeing.",
      meaning:
        "A dua is offered — asking Allah's blessing on the marriage, prosperity, and righteous offspring.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Maulvi, all present",
    },
    {
      id: "rukhsati",
      name_sanskrit: "رخصتی",
      name_english: "Rukhsati",
      short_description: "Bride's farewell from her family.",
      meaning:
        "The Muslim equivalent of vidaai — bride departs with her husband and his family. Emotional for both sides.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Bride, both families",
    },
  ],

  muslim_nikah_walima: [
    // Nikah + post-wedding walima banquet in sequence
    {
      id: "nikah_istikbal2",
      name_sanskrit: "استقبال",
      name_english: "Istikbal",
      short_description: "Groom's party is welcomed.",
      meaning: "Welcome of the groom's party at the venue.",
      default_duration_min: 15,
      default_inclusion: "yes",
      traditional_participants: "Both families",
    },
    {
      id: "ijab_qubul2",
      name_sanskrit: "إيجاب و قبول",
      name_english: "Ijab-e-Qubul",
      short_description: "Consent exchange.",
      meaning:
        "Consent exchange, maulvi asks three times, both answer qubul hai.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, maulvi, witnesses",
    },
    {
      id: "mehr2",
      name_sanskrit: "مهر",
      name_english: "Mehr",
      short_description: "Mehr is fixed and recorded.",
      meaning: "Mehr negotiated and recorded in the nikahnama.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple, maulvi",
    },
    {
      id: "nikahnama2",
      name_sanskrit: "نكاح نامه",
      name_english: "Nikahnama Signing",
      short_description: "Marriage contract signed.",
      meaning: "Marriage contract signed by bride, groom, witnesses, maulvi.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, 4 witnesses, maulvi",
    },
    {
      id: "khutbah2",
      name_sanskrit: "خطبة النکاح",
      name_english: "Khutbah",
      short_description: "Sermon.",
      meaning: "Maulvi's sermon on marriage duties.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Maulvi, all present",
    },
    {
      id: "dua2",
      name_sanskrit: "دعاء",
      name_english: "Dua",
      short_description: "Collective prayer.",
      meaning: "Dua for the couple.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Maulvi, all present",
    },
    {
      id: "rukhsati2",
      name_sanskrit: "رخصتی",
      name_english: "Rukhsati",
      short_description: "Bride's farewell.",
      meaning: "Bride's farewell from her family.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Bride, families",
    },
    {
      id: "walima",
      name_sanskrit: "وليمه",
      name_english: "Walima Banquet",
      short_description:
        "Public celebratory banquet hosted by groom's family.",
      meaning:
        "The walima is hosted by the groom's family to publicly celebrate and announce the marriage. It's a sunnah and the day-after highlight.",
      default_duration_min: 120,
      default_inclusion: "yes",
      traditional_participants: "Groom's family, all guests",
    },
  ],

  ismaili: [
    {
      id: "khutba_ismaili",
      name_sanskrit: "خطبة",
      name_english: "Khutba",
      short_description:
        "Opening sermon by the Ismaili officiant.",
      meaning:
        "Ismaili weddings open with a khutba led by the appointed community officiant.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Officiant, couple, families",
    },
    {
      id: "ashaad",
      name_sanskrit: "اشهاد",
      name_english: "Ashaad (Testimony)",
      short_description: "Couple testifies consent in front of witnesses.",
      meaning:
        "Couple affirms their consent before community witnesses — the central moment.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, witnesses",
    },
    {
      id: "mehr_i",
      name_sanskrit: "مهر",
      name_english: "Mehr Declaration",
      short_description: "Mehr is announced and recorded.",
      meaning: "Mehr is declared as part of the Ismaili nikah process.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple, officiant",
    },
    {
      id: "dua_i",
      name_sanskrit: "دعاء",
      name_english: "Dua",
      short_description: "Blessing prayer.",
      meaning: "Dua for the couple and community.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Officiant, all",
    },
  ],

  parsi_zoroastrian: [
    {
      id: "achumichu",
      name_sanskrit: "અચુમિચુ",
      name_english: "Achumichu",
      short_description:
        "Welcome ritual with egg, coconut, rice, and water.",
      meaning:
        "The bride's mother performs achumichu — circling symbolic items around the groom to ward off the evil eye.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Bride's mother, groom",
    },
    {
      id: "ara_antar",
      name_sanskrit: "આર અંતર",
      name_english: "Ara Antar",
      short_description:
        "Bride and groom seated facing each other with a curtain between.",
      meaning:
        "Couple sits facing each other with a curtain between. Priests circle them with a string seven times while prayers are recited. When the curtain drops they see each other and throw rice.",
      default_duration_min: 15,
      default_inclusion: "yes",
      traditional_participants: "Couple, priests",
    },
    {
      id: "ashirvad_parsi",
      name_sanskrit: "આશીર્વાદ",
      name_english: "Ashirvad (Blessings)",
      short_description:
        "Priest recites blessings in Avesta.",
      meaning:
        "Priest recites Avestan blessings from the Ashirvad prayer — the Zoroastrian marriage vow.",
      default_duration_min: 15,
      default_inclusion: "yes",
      traditional_participants: "Priests, couple",
    },
    {
      id: "chero_bandhvanu",
      name_sanskrit: "ચેરો બાંધવાનું",
      name_english: "Chero Bandhvanu",
      short_description:
        "Priest ties the couple's hands with sacred string.",
      meaning:
        "The priest ties the couple's hands with a sacred string seven times — a Parsi-specific knot.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple, priest",
    },
  ],

  christian_catholic_indian: [
    {
      id: "processional",
      name_sanskrit: "",
      name_english: "Processional",
      short_description: "Entry of the bridal party to the altar.",
      meaning:
        "Bridal party processes in order: bridesmaids, maid of honor, flower girls, bride with her father.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Bridal party",
      music_note: "Processional hymn or instrumental.",
    },
    {
      id: "entrance_rite",
      name_sanskrit: "",
      name_english: "Entrance Rite",
      short_description:
        "Priest welcomes the assembly and opens the Mass.",
      meaning:
        "Priest greets the gathered community and opens with the Sign of the Cross, prayer, and the Gloria.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Priest, all",
    },
    {
      id: "liturgy_word",
      name_sanskrit: "",
      name_english: "Liturgy of the Word",
      short_description:
        "Readings from Scripture — Old Testament, Psalm, New Testament, Gospel.",
      meaning:
        "Readings chosen by the couple, often from Corinthians 13 or the Song of Songs, followed by the Gospel reading and homily.",
      default_duration_min: 20,
      default_inclusion: "yes",
      traditional_participants: "Readers, priest, all",
    },
    {
      id: "rite_of_marriage",
      name_sanskrit: "",
      name_english: "Rite of Marriage",
      short_description:
        "Vow exchange, ring exchange, and declaration of marriage.",
      meaning:
        "The core — couple exchanges vows, rings are blessed and exchanged, priest declares them husband and wife.",
      default_duration_min: 15,
      default_inclusion: "yes",
      traditional_participants: "Couple, priest",
    },
    {
      id: "thali_christian",
      name_sanskrit: "",
      name_english: "Thali / Minnu Tying",
      short_description:
        "Groom ties a cross-marked thali around the bride's neck.",
      meaning:
        "A South Indian Christian adaptation — groom ties a thali bearing a small cross around the bride's neck.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple",
    },
    {
      id: "liturgy_eucharist",
      name_sanskrit: "",
      name_english: "Liturgy of the Eucharist",
      short_description:
        "Celebration of the Mass — Eucharistic prayer, communion.",
      meaning:
        "The Mass continues with the Eucharistic prayer, consecration, and communion — only Catholics typically receive.",
      default_duration_min: 30,
      default_inclusion: "yes",
      traditional_participants: "Priest, Catholic attendees",
    },
    {
      id: "final_blessing",
      name_sanskrit: "",
      name_english: "Final Blessing & Recessional",
      short_description: "Blessing and exit of the newlyweds.",
      meaning:
        "Priest's final blessing, recessional music, couple exits as husband and wife.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Priest, couple",
    },
  ],

  christian_protestant_indian: [
    {
      id: "call_to_worship",
      name_sanskrit: "",
      name_english: "Call to Worship",
      short_description: "Pastor's opening prayer and welcome.",
      meaning:
        "Pastor opens with a prayer and welcome, setting the tone for the service.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Pastor, all",
    },
    {
      id: "hymn",
      name_sanskrit: "",
      name_english: "Opening Hymn",
      short_description: "Congregational hymn.",
      meaning:
        "All sing an opening hymn chosen by the couple (often 'Amazing Grace', 'How Great Thou Art').",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "All",
    },
    {
      id: "scripture_prot",
      name_sanskrit: "",
      name_english: "Scripture Readings",
      short_description: "Old and New Testament readings.",
      meaning:
        "Readings from Scripture — often Corinthians 13 and Ephesians 5.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Readers, all",
    },
    {
      id: "sermon_prot",
      name_sanskrit: "",
      name_english: "Sermon",
      short_description: "Pastor's sermon on marriage.",
      meaning:
        "A short homily on the meaning of marriage from a Christian perspective.",
      default_duration_min: 15,
      default_inclusion: "yes",
      traditional_participants: "Pastor, all",
    },
    {
      id: "vows_prot",
      name_sanskrit: "",
      name_english: "Exchange of Vows",
      short_description: "Couple exchanges vows.",
      meaning:
        "Couple exchanges vows (traditional or personal), followed by ring exchange.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, pastor",
    },
    {
      id: "pronouncement",
      name_sanskrit: "",
      name_english: "Pronouncement",
      short_description:
        "Pastor pronounces them married.",
      meaning:
        "Pastor declares them husband and wife. Often a kiss follows.",
      default_duration_min: 2,
      default_inclusion: "yes",
      traditional_participants: "Couple, pastor",
    },
    {
      id: "benediction",
      name_sanskrit: "",
      name_english: "Benediction & Recessional",
      short_description: "Closing blessing and exit.",
      meaning:
        "Pastor offers a benediction; couple recesses as husband and wife.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Pastor, couple",
    },
  ],

  christian_syro_malabar: [
    {
      id: "pre_marriage_blessing",
      name_sanskrit: "",
      name_english: "Pre-Marriage Blessing",
      short_description: "Priest blesses the couple and rings.",
      meaning:
        "Before the full Mass, the priest blesses the couple and the wedding symbols — rings and thali.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple, priest",
    },
    {
      id: "qurbana",
      name_sanskrit: "ഖുർബാന",
      name_english: "Holy Qurbana (Mass)",
      short_description:
        "Syro-Malabar Mass — bilingual (Malayalam / Syriac).",
      meaning:
        "The Syro-Malabar Qurbana is sung in Malayalam and Syriac. The marriage rite is embedded in the Qurbana.",
      default_duration_min: 45,
      default_inclusion: "yes",
      traditional_participants: "Priest, choir, all",
    },
    {
      id: "minnu_kettu",
      name_sanskrit: "മിന്നുകെട്ട്",
      name_english: "Minnu Kettu",
      short_description:
        "Groom ties the minnu (cross-bearing chain) around bride's neck.",
      meaning:
        "Minnu Kettu is the defining Syro-Malabar Kerala Christian moment — a gold chain with a small cross is tied by the groom.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple, priest",
    },
    {
      id: "manthrakodi",
      name_sanskrit: "മന്ത്രകോടി",
      name_english: "Manthrakodi",
      short_description:
        "Groom places a blessed sari on the bride.",
      meaning:
        "Groom places a blessed sari (manthrakodi) over the bride's head — a Kerala-Christian moment analogous to gifting attire.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple",
    },
    {
      id: "vows_sm",
      name_sanskrit: "",
      name_english: "Vow Exchange",
      short_description: "Couple exchanges vows and rings.",
      meaning: "Vows and rings within the Qurbana framework.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, priest",
    },
    {
      id: "final_blessing_sm",
      name_sanskrit: "",
      name_english: "Final Blessing",
      short_description: "Priest blesses the couple.",
      meaning: "Final blessing and recessional.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple, priest",
    },
  ],

  interfaith_hindu_christian: [
    R_GANESH,
    {
      id: "processional_ic",
      name_sanskrit: "",
      name_english: "Christian Processional",
      short_description: "Bridal party processes to the altar.",
      meaning:
        "The Christian half opens with a formal processional — bridesmaids, maid of honor, bride with her father.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Bridal party",
    },
    {
      id: "readings_ic",
      name_sanskrit: "",
      name_english: "Scripture Readings",
      short_description:
        "Scripture readings chosen by the couple.",
      meaning:
        "Readings — typically Corinthians 13 — mark the Christian portion of an interfaith ceremony.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Readers, pastor",
    },
    {
      id: "vows_ic",
      name_sanskrit: "",
      name_english: "Christian Vows & Ring Exchange",
      short_description: "Couple exchanges Christian vows and rings.",
      meaning:
        "Couple exchanges traditional or personal Christian vows, followed by ring exchange.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, pastor",
    },
    R_JAIMALA,
    R_PHERAS,
    R_SAPTAPADI,
    R_SINDOOR,
    R_MANGALSUTRA,
    {
      id: "joint_blessing_ic",
      name_sanskrit: "",
      name_english: "Joint Blessing",
      short_description:
        "Pastor and pandit bless the couple together.",
      meaning:
        "Pastor and pandit each offer a short blessing, symbolizing the union of two faith traditions in one family.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Pandit, pastor, couple",
    },
    R_AASHIRVAD,
    {
      id: "recessional",
      name_sanskrit: "",
      name_english: "Recessional",
      short_description: "Couple exits as husband and wife.",
      meaning: "Both-tradition recessional — couple exits the ceremony.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple",
    },
  ],

  interfaith_hindu_muslim: [
    R_GANESH,
    R_JAIMALA,
    {
      id: "ijab_qubul_ihm",
      name_sanskrit: "إيجاب و قبول",
      name_english: "Ijab-e-Qubul",
      short_description: "Nikah consent exchange.",
      meaning:
        "The Muslim half: maulvi asks consent three times, each partner responds qubul hai.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, maulvi, witnesses",
    },
    {
      id: "nikahnama_ihm",
      name_sanskrit: "نكاح نامه",
      name_english: "Nikahnama Signing",
      short_description: "Signing of the marriage contract.",
      meaning:
        "Nikahnama signed by bride, groom, witnesses, maulvi.",
      default_duration_min: 8,
      default_inclusion: "yes",
      traditional_participants: "Couple, 4 witnesses, maulvi",
    },
    R_PHERAS,
    R_SAPTAPADI,
    R_SINDOOR,
    R_AASHIRVAD,
    {
      id: "dua_ihm",
      name_sanskrit: "دعاء",
      name_english: "Dua",
      short_description: "Muslim prayer of blessing.",
      meaning: "Maulvi offers a dua for the couple's prosperity.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Maulvi",
    },
  ],

  interfaith_hindu_jewish: [
    R_GANESH,
    {
      id: "chuppah",
      name_sanskrit: "חוּפָּה",
      name_english: "Chuppah & Processional",
      short_description: "Couple stands under the Jewish wedding canopy.",
      meaning:
        "Couple enters under the chuppah — a canopy symbolizing the home they'll build together.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, parents, rabbi",
    },
    {
      id: "seven_blessings",
      name_sanskrit: "שבע ברכות",
      name_english: "Sheva Brachot",
      short_description: "Recitation of the Seven Blessings.",
      meaning:
        "Seven blessings recited over the couple — often by different family members or friends.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, rabbi, honored readers",
    },
    {
      id: "ketubah",
      name_sanskrit: "כתובה",
      name_english: "Ketubah Signing",
      short_description: "Jewish marriage contract signed and read.",
      meaning:
        "Ketubah is signed by witnesses, then read aloud during the ceremony.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, witnesses, rabbi",
    },
    {
      id: "glass_breaking",
      name_sanskrit: "שבירת הכוס",
      name_english: "Breaking of the Glass",
      short_description:
        "Groom breaks a glass, all shout 'Mazel Tov!'",
      meaning:
        "Groom steps on and breaks a glass — a reminder of fragility and the destruction of the Temple, but also the celebratory moment.",
      default_duration_min: 2,
      default_inclusion: "yes",
      traditional_participants: "Groom, all guests",
    },
    R_JAIMALA,
    R_PHERAS,
    R_SAPTAPADI,
    R_AASHIRVAD,
  ],

  interfaith_hindu_sikh: [
    R_GANESH,
    R_BARAAT,
    R_JAIMALA,
    {
      id: "laavan_interfaith",
      name_sanskrit: "ਲਾਵਾਂ",
      name_english: "Laavan",
      short_description:
        "Four circuits around Guru Granth Sahib Ji.",
      meaning:
        "The Sikh half — four circuits around Guru Granth Sahib Ji, each tied to a Laavan verse.",
      default_duration_min: 20,
      default_inclusion: "yes",
      traditional_participants: "Couple, granthi",
    },
    R_PHERAS,
    R_SAPTAPADI,
    R_AASHIRVAD,
  ],

  interfaith_sikh_christian: [
    {
      id: "ardaas_sc",
      name_sanskrit: "ਅਰਦਾਸ",
      name_english: "Ardaas",
      short_description: "Sikh opening prayer.",
      meaning:
        "Ardaas opens the Sikh portion of the ceremony.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Granthi, all",
    },
    {
      id: "laavan_sc",
      name_sanskrit: "ਲਾਵਾਂ",
      name_english: "Laavan",
      short_description: "Four circuits around Guru Granth Sahib Ji.",
      meaning: "Four Laavan circuits with verses.",
      default_duration_min: 20,
      default_inclusion: "yes",
      traditional_participants: "Couple, granthi",
    },
    {
      id: "readings_sc",
      name_sanskrit: "",
      name_english: "Christian Scripture Readings",
      short_description: "Selected Scripture passages.",
      meaning: "Christian half — Scripture readings chosen by the couple.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Readers, pastor",
    },
    {
      id: "vows_sc",
      name_sanskrit: "",
      name_english: "Christian Vows & Rings",
      short_description: "Couple exchanges Christian vows and rings.",
      meaning: "Vow and ring exchange in the Christian tradition.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, pastor",
    },
    {
      id: "joint_blessing_sc",
      name_sanskrit: "",
      name_english: "Joint Blessing",
      short_description: "Granthi and pastor bless together.",
      meaning:
        "Granthi and pastor each offer a short blessing over the couple.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Granthi, pastor",
    },
  ],

  interfaith_sikh_muslim: [
    {
      id: "ardaas_sm",
      name_sanskrit: "ਅਰਦਾਸ",
      name_english: "Ardaas",
      short_description: "Sikh opening prayer.",
      meaning:
        "Ardaas opens the Sikh portion. Note: Anand Karaj and Nikah are not typically combined — consult both officiants carefully.",
      default_duration_min: 5,
      default_inclusion: "discuss",
      traditional_participants: "Granthi, all",
    },
    {
      id: "nikah_sm",
      name_sanskrit: "نكاح",
      name_english: "Nikah (Civil)",
      short_description: "Civil nikah ceremony.",
      meaning:
        "A civil nikah with ijab-e-qubul and signing — Anand Karaj is traditionally NOT combined; a joint blessing ceremony is often used instead.",
      default_duration_min: 20,
      default_inclusion: "discuss",
      traditional_participants: "Couple, maulvi, witnesses",
    },
    {
      id: "joint_blessing_smm",
      name_sanskrit: "",
      name_english: "Joint Blessing",
      short_description: "Granthi and maulvi each offer blessings.",
      meaning:
        "In place of two full religious ceremonies, many couples opt for a joint blessing from both officiants.",
      default_duration_min: 15,
      default_inclusion: "yes",
      traditional_participants: "Granthi, maulvi",
    },
  ],

  interfaith_custom: [
    {
      id: "opening_reading",
      name_sanskrit: "",
      name_english: "Opening Reading",
      short_description: "A chosen text that opens the ceremony.",
      meaning:
        "For a custom interfaith ceremony, start with a reading that speaks to both of your traditions.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Officiant, couple",
    },
    R_JAIMALA,
    {
      id: "vows_custom",
      name_sanskrit: "",
      name_english: "Personal Vows",
      short_description: "Couple exchanges vows they've written.",
      meaning:
        "Without a single tradition to anchor the vows, custom interfaith ceremonies often center personal vow-writing.",
      default_duration_min: 15,
      default_inclusion: "yes",
      traditional_participants: "Couple",
    },
    {
      id: "ring_custom",
      name_sanskrit: "",
      name_english: "Ring / Mangalsutra Exchange",
      short_description: "Exchange of rings or a mangalsutra.",
      meaning:
        "Couple exchanges rings, a mangalsutra, or both — choose what belongs in your ceremony.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple",
    },
    {
      id: "blessings_custom",
      name_sanskrit: "",
      name_english: "Elder Blessings",
      short_description:
        "Elders from both families offer blessings.",
      meaning:
        "Without a prescribed order, elder blessings are the most universal closing element.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Elders from both families",
    },
  ],

  spiritual_nonreligious: [
    {
      id: "welcome_sp",
      name_sanskrit: "",
      name_english: "Welcome",
      short_description: "Officiant welcomes guests.",
      meaning:
        "Officiant welcomes guests and speaks briefly about the couple.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Officiant, all",
    },
    {
      id: "reading_sp",
      name_sanskrit: "",
      name_english: "Reading",
      short_description: "A meaningful poem or prose reading.",
      meaning:
        "Reading chosen by the couple — Rumi, Mary Oliver, a favorite passage.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Reader",
    },
    {
      id: "vows_sp",
      name_sanskrit: "",
      name_english: "Personal Vows",
      short_description: "Couple speaks their vows.",
      meaning:
        "Personal vow exchange — the centerpiece of a non-religious ceremony.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple",
    },
    {
      id: "ring_sp",
      name_sanskrit: "",
      name_english: "Ring Exchange",
      short_description: "Couple exchanges rings.",
      meaning: "Ring exchange with a brief officiant note about commitment.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple",
    },
    {
      id: "pronouncement_sp",
      name_sanskrit: "",
      name_english: "Pronouncement",
      short_description: "Officiant pronounces the couple married.",
      meaning: "Officiant declares them married; guests cheer.",
      default_duration_min: 2,
      default_inclusion: "yes",
      traditional_participants: "Officiant, couple",
    },
  ],

  cultural_only: [
    {
      id: "cultural_opening",
      name_sanskrit: "",
      name_english: "Cultural Opening",
      short_description:
        "Non-religious welcome with cultural flourishes — music, dress, language.",
      meaning:
        "For a cultural-only ceremony, draw on your heritage for the look and feel without the formal religious framework.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple, officiant",
    },
    R_JAIMALA,
    {
      id: "cultural_vows",
      name_sanskrit: "",
      name_english: "Personal Vows",
      short_description: "Couple exchanges personal vows.",
      meaning: "Personal vows, optionally in a heritage language.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple",
    },
    {
      id: "cultural_rings",
      name_sanskrit: "",
      name_english: "Ring / Mangalsutra Exchange",
      short_description: "Exchange of wedding symbols.",
      meaning:
        "Choose the wedding symbol that matters to your family — rings, mangalsutra, bangles.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Couple",
    },
    R_AASHIRVAD,
  ],
};

// ── Samagri library — a few key traditions get dedicated lists ───────────
// Most Hindu traditions share the Vedic samagri baseline; we override where
// regional items materially differ.

const SAMAGRI_LIBRARY: Partial<Record<CeremonyTradition, SamagriTemplate[]>> = {
  vedic: [
    {
      id: "havan_kund",
      name_local: "हवन कुंड",
      name_english: "Havan kund (fire vessel)",
      category: "general_setup",
      used_for_ritual_id: "havan",
      quantity: "1 large copper vessel",
      source: "pandit_provides",
      responsibility: "pandit",
      added_by_pandit: true,
      notes: "Confirm dimensions and fire-safe mat placement with venue.",
    },
    {
      id: "ghee",
      name_local: "घी",
      name_english: "Ghee (clarified butter)",
      category: "general_setup",
      used_for_ritual_id: "havan",
      quantity: "500 g",
      source: "indian_grocery",
      responsibility: "brides_family",
    },
    {
      id: "camphor",
      name_local: "कपूर",
      name_english: "Camphor",
      category: "general_setup",
      used_for_ritual_id: "havan",
      quantity: "1 box",
      source: "indian_grocery",
      responsibility: "brides_family",
    },
    {
      id: "incense",
      name_local: "अगरबत्ती",
      name_english: "Incense sticks",
      category: "general_setup",
      quantity: "2 packs",
      source: "indian_grocery",
      responsibility: "brides_family",
    },
    {
      id: "lighter",
      name_local: "माचिस / लाइटर",
      name_english: "Matchbox / lighter",
      category: "general_setup",
      quantity: "2",
      source: "other",
      responsibility: "planner",
      notes: "Backup lighter essential.",
    },
    {
      id: "jaimala",
      name_local: "जयमाला",
      name_english: "Jaimala garlands",
      category: "floral",
      used_for_ritual_id: "jaimala",
      quantity: "2 large garlands",
      source: "other",
      responsibility: "planner",
      notes: "Rose + marigold, substantial size.",
    },
    {
      id: "petals",
      name_local: "फूल पंखुड़ियाँ",
      name_english: "Flower petals",
      category: "floral",
      used_for_ritual_id: "jaimala",
      quantity: "2 kg loose petals",
      source: "other",
      responsibility: "planner",
      notes: "Rose + marigold blend. Basket stations near aisle.",
    },
    {
      id: "mango_leaves",
      name_local: "आम के पत्ते",
      name_english: "Mango leaves",
      category: "floral",
      quantity: "1 small bundle",
      source: "indian_grocery",
      responsibility: "brides_family",
      notes: "For kalash decoration.",
    },
    {
      id: "rice",
      name_local: "अक्षत (चावल)",
      name_english: "Rice — akshata (uncooked)",
      category: "food_grain",
      used_for_ritual_id: "aashirvad",
      quantity: "500 g",
      source: "indian_grocery",
      responsibility: "brides_family",
      notes: "Mixed with a pinch of turmeric for color.",
    },
    {
      id: "haldi",
      name_local: "हल्दी",
      name_english: "Turmeric — haldi",
      category: "food_grain",
      quantity: "100 g powder + 2 roots",
      source: "indian_grocery",
      responsibility: "brides_family",
    },
    {
      id: "kumkum",
      name_local: "कुमकुम",
      name_english: "Kumkum",
      category: "food_grain",
      quantity: "2 small containers",
      source: "indian_grocery",
      responsibility: "brides_family",
    },
    {
      id: "coconut",
      name_local: "नारियल",
      name_english: "Coconut (whole, with husk)",
      category: "food_grain",
      quantity: "3",
      source: "indian_grocery",
      responsibility: "brides_family",
    },
    {
      id: "supari",
      name_local: "सुपारी",
      name_english: "Supari (betel nut)",
      category: "food_grain",
      quantity: "100 g",
      source: "indian_grocery",
      responsibility: "brides_family",
    },
    {
      id: "paan",
      name_local: "पान के पत्ते",
      name_english: "Paan leaves",
      category: "food_grain",
      quantity: "12 fresh leaves",
      source: "indian_grocery",
      responsibility: "brides_family",
      notes: "Keep wrapped in damp paper — they wilt quickly.",
    },
    {
      id: "mandap_cloth",
      name_local: "लाल चुनरी",
      name_english: "Red/maroon cloth for mandap seat",
      category: "fabric",
      quantity: "2 meters",
      source: "other",
      responsibility: "planner",
    },
    {
      id: "antarpat",
      name_local: "अंतरपट",
      name_english: "Antarpat (cloth curtain for Jaimala)",
      category: "fabric",
      used_for_ritual_id: "jaimala",
      quantity: "6 x 6 ft embroidered cloth",
      source: "other",
      responsibility: "planner",
    },
    {
      id: "moli",
      name_local: "मौली / कलावा",
      name_english: "Sacred thread — moli",
      category: "fabric",
      quantity: "1 spool",
      source: "indian_grocery",
      responsibility: "brides_family",
    },
    {
      id: "kalash",
      name_local: "कलश",
      name_english: "Kalash (brass water vessel)",
      category: "metal_vessels",
      quantity: "1",
      source: "indian_grocery",
      responsibility: "brides_family",
      notes: "Decorated with mango leaves + coconut on top.",
    },
    {
      id: "sindoor_container",
      name_local: "सिंदूर दानी",
      name_english: "Sindoor container + sindoor",
      category: "metal_vessels",
      used_for_ritual_id: "sindoor",
      quantity: "1 container + 50 g sindoor",
      source: "indian_grocery",
      responsibility: "brides_family",
    },
    {
      id: "mangalsutra",
      name_local: "मंगलसूत्र",
      name_english: "Mangalsutra",
      category: "personal_items",
      used_for_ritual_id: "mangalsutra",
      quantity: "1",
      source: "other",
      responsibility: "grooms_family",
      notes:
        "Cross-ref Jewelry workspace. Ensure accessible — NOT packed away in luggage.",
    },
    {
      id: "rings",
      name_local: "अंगूठियां",
      name_english: "Wedding rings",
      category: "personal_items",
      quantity: "2",
      source: "other",
      responsibility: "grooms_family",
    },
  ],
  // For other traditions, the Vedic baseline is a good starting point and
  // the couple can prune what doesn't apply. We add tradition-specific items
  // for the big regional traditions.
  tamil_brahmin: [
    {
      id: "thali",
      name_local: "தாலி",
      name_english: "Thali (sacred gold pendant)",
      category: "personal_items",
      used_for_ritual_id: "mangalya_dharanam",
      quantity: "1",
      source: "other",
      responsibility: "grooms_family",
      notes: "The single most important item of the Tamil ceremony.",
    },
    {
      id: "manjal_kayiru",
      name_local: "மஞ்சள் கயிறு",
      name_english: "Turmeric thread (for thali)",
      category: "fabric",
      used_for_ritual_id: "mangalya_dharanam",
      quantity: "1",
      source: "indian_grocery",
      responsibility: "grooms_family",
    },
    {
      id: "kanyadaanam_coconut",
      name_local: "தேங்காய்",
      name_english: "Coconuts (for kanyadaanam)",
      category: "food_grain",
      used_for_ritual_id: "kanyadaanam",
      quantity: "5",
      source: "indian_grocery",
      responsibility: "brides_family",
    },
    {
      id: "oonjal",
      name_local: "ஊஞ்சல்",
      name_english: "Oonjal (swing)",
      category: "general_setup",
      used_for_ritual_id: "oonjal",
      quantity: "1 decorated swing",
      source: "other",
      responsibility: "planner",
      notes: "Decorate with flowers; must support couple's weight.",
    },
    {
      id: "nalangu_items",
      name_local: "நலங்கு பொருட்கள்",
      name_english: "Nalangu items (coconuts, tender fruits, bangles)",
      category: "other",
      used_for_ritual_id: "nalangu",
      quantity: "coconut pair + fruit + bangles",
      source: "indian_grocery",
      responsibility: "brides_family",
    },
  ],
  gujarati: [
    {
      id: "ponkhanu_items",
      name_local: "પોંખણું સમાન",
      name_english: "Ponkhanu items (mortar, rolling pin, grain)",
      category: "other",
      used_for_ritual_id: "ponkhanu",
      quantity: "mortar + rolling pin + grain pot",
      source: "indian_grocery",
      responsibility: "brides_family",
    },
    {
      id: "hastamilap_cloth",
      name_local: "હસ્તમિલાપ કપડું",
      name_english: "Hastamilap cloth",
      category: "fabric",
      used_for_ritual_id: "hastamilap",
      quantity: "1 white cloth, 2 meters",
      source: "other",
      responsibility: "planner",
    },
    {
      id: "mandap_kalash",
      name_local: "મંડપ કળશ",
      name_english: "Mandap kalash",
      category: "metal_vessels",
      quantity: "4",
      source: "indian_grocery",
      responsibility: "brides_family",
      notes: "Four kalashes, one per pillar of the mandap.",
    },
  ],
  sikh_anand_karaj: [
    {
      id: "guru_granth_sahib",
      name_local: "ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ",
      name_english: "Guru Granth Sahib Ji",
      category: "general_setup",
      quantity: "1",
      source: "temple",
      responsibility: "other",
      notes:
        "Saroop + palki. Coordinate with the granthi / gurdwara for transport and setup.",
    },
    {
      id: "rumalla",
      name_local: "ਰੁਮੱਲਾ",
      name_english: "Rumalla (silk coverings)",
      category: "fabric",
      quantity: "Set of 4",
      source: "temple",
      responsibility: "other",
    },
    {
      id: "karah_prasad_ingredients",
      name_local: "ਕੜਾਹ ਪ੍ਰਸ਼ਾਦ",
      name_english: "Karah Prasad ingredients (atta, ghee, sugar)",
      category: "food_grain",
      used_for_ritual_id: "karah_prasad",
      quantity: "2 kg each",
      source: "indian_grocery",
      responsibility: "brides_family",
    },
    {
      id: "palki_flowers",
      name_local: "ਪਾਲਕੀ ਫੁੱਲ",
      name_english: "Palki flowers",
      category: "floral",
      quantity: "Garlands for the palki",
      source: "other",
      responsibility: "planner",
    },
    {
      id: "kirpan",
      name_local: "ਕਿਰਪਾਨ",
      name_english: "Groom's kirpan",
      category: "personal_items",
      quantity: "1",
      source: "other",
      responsibility: "grooms_family",
    },
  ],
  muslim_nikah: [
    {
      id: "nikahnama_printed",
      name_local: "نكاح نامه",
      name_english: "Printed nikahnama (marriage contract)",
      category: "other",
      used_for_ritual_id: "nikahnama",
      quantity: "1",
      source: "other",
      responsibility: "other",
      notes: "Typically provided by the maulvi.",
    },
    {
      id: "ittar",
      name_local: "عطر",
      name_english: "Ittar (traditional perfume)",
      category: "personal_items",
      quantity: "2 small bottles",
      source: "other",
      responsibility: "grooms_family",
    },
    {
      id: "dates_m",
      name_local: "کھجور",
      name_english: "Dates (for distribution)",
      category: "food_grain",
      quantity: "1 kg premium dates",
      source: "other",
      responsibility: "brides_family",
    },
    {
      id: "rose_petals_m",
      name_local: "گلاب پتیاں",
      name_english: "Rose petals (for rukhsati)",
      category: "floral",
      used_for_ritual_id: "rukhsati",
      quantity: "2 kg",
      source: "other",
      responsibility: "planner",
    },
  ],
  parsi_zoroastrian: [
    {
      id: "sedreh",
      name_local: "સેદરેહ",
      name_english: "Sedreh (sacred undershirt)",
      category: "fabric",
      quantity: "1 per partner",
      source: "other",
      responsibility: "other",
    },
    {
      id: "kusti",
      name_local: "કુસ્તી",
      name_english: "Kusti (sacred cord)",
      category: "fabric",
      quantity: "1 per partner",
      source: "other",
      responsibility: "other",
    },
    {
      id: "parsi_tray",
      name_local: "સેસ",
      name_english: "Ses (silver tray with ceremonial items)",
      category: "metal_vessels",
      quantity: "1",
      source: "other",
      responsibility: "brides_family",
      notes:
        "Contains coconut, rice, dates, rose water, kumkum — configured by family elder.",
    },
  ],
  christian_catholic_indian: [
    {
      id: "unity_candle",
      name_local: "",
      name_english: "Unity candle",
      category: "general_setup",
      used_for_ritual_id: "rite_of_marriage",
      quantity: "1 unity + 2 family candles",
      source: "other",
      responsibility: "planner",
    },
    {
      id: "lectionary",
      name_local: "",
      name_english: "Lectionary readings printed",
      category: "other",
      used_for_ritual_id: "liturgy_word",
      quantity: "1 set for each reader",
      source: "other",
      responsibility: "planner",
    },
    {
      id: "rings_catholic",
      name_local: "",
      name_english: "Wedding rings + pillow",
      category: "personal_items",
      used_for_ritual_id: "rite_of_marriage",
      quantity: "2 rings + 1 pillow",
      source: "other",
      responsibility: "grooms_family",
    },
    {
      id: "hosts_wine",
      name_local: "",
      name_english: "Hosts + wine for Eucharist",
      category: "food_grain",
      used_for_ritual_id: "liturgy_eucharist",
      quantity: "Per priest's request",
      source: "other",
      responsibility: "other",
      added_by_pandit: true,
    },
  ],
  interfaith_hindu_christian: [
    // Merge of Vedic essentials + Christian ceremony items
    {
      id: "unity_candle_ic",
      name_local: "",
      name_english: "Unity candle",
      category: "general_setup",
      quantity: "1 unity + 2 family candles",
      source: "other",
      responsibility: "planner",
    },
    {
      id: "rings_ic",
      name_local: "",
      name_english: "Wedding rings",
      category: "personal_items",
      used_for_ritual_id: "vows_ic",
      quantity: "2",
      source: "other",
      responsibility: "grooms_family",
    },
    {
      id: "jaimala_ic",
      name_local: "जयमाला",
      name_english: "Jaimala garlands",
      category: "floral",
      used_for_ritual_id: "jaimala",
      quantity: "2 large garlands",
      source: "other",
      responsibility: "planner",
    },
    {
      id: "mangalsutra_ic",
      name_local: "मंगलसूत्र",
      name_english: "Mangalsutra",
      category: "personal_items",
      used_for_ritual_id: "mangalsutra",
      quantity: "1",
      source: "other",
      responsibility: "grooms_family",
    },
    {
      id: "sindoor_ic",
      name_local: "सिंदूर",
      name_english: "Sindoor + container",
      category: "metal_vessels",
      used_for_ritual_id: "sindoor",
      quantity: "1 set",
      source: "indian_grocery",
      responsibility: "brides_family",
    },
    {
      id: "havan_kit_ic",
      name_local: "हवन सामग्री",
      name_english: "Havan kit (ghee, samagri, kund)",
      category: "general_setup",
      quantity: "Full kit",
      source: "pandit_provides",
      responsibility: "pandit",
      added_by_pandit: true,
    },
  ],
};

// Fallback library — returns Vedic ritual set for any Hindu tradition not
// explicitly handled, and a minimal generic set otherwise.
function getFallbackRituals(tradition: CeremonyTradition): RitualTemplate[] {
  // Hindu regional variants fall back to Vedic if not explicitly handled.
  const hinduVariants: CeremonyTradition[] = [
    "north_indian",
    "rajasthani",
    "bihari_maithili",
    "odia",
    "konkani_goan_hindu",
  ];
  if (hinduVariants.includes(tradition)) return VEDIC_BASE;
  // All others — minimal universal set.
  return [
    {
      id: "opening",
      name_sanskrit: "",
      name_english: "Opening",
      short_description: "Officiant welcomes all.",
      meaning:
        "A minimal opening. Edit this to reflect your specific tradition.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Officiant, all",
    },
    {
      id: "vows",
      name_sanskrit: "",
      name_english: "Vows",
      short_description: "Exchange of vows.",
      meaning: "Core of any wedding — the vows.",
      default_duration_min: 10,
      default_inclusion: "yes",
      traditional_participants: "Couple",
    },
    {
      id: "blessing",
      name_sanskrit: "",
      name_english: "Blessing",
      short_description: "Closing blessing.",
      meaning: "Officiant and/or elders offer a blessing.",
      default_duration_min: 5,
      default_inclusion: "yes",
      traditional_participants: "Officiant, elders",
    },
  ];
}

function getFallbackSamagri(): SamagriTemplate[] {
  return [
    {
      id: "rings",
      name_local: "",
      name_english: "Wedding rings",
      category: "personal_items",
      quantity: "2",
      source: "other",
      responsibility: "grooms_family",
    },
  ];
}

// ── Public API ───────────────────────────────────────────────────────────

export function generateRitualsForTradition(
  tradition: CeremonyTradition,
): CeremonyRitual[] {
  const templates = RITUAL_LIBRARY[tradition] ?? getFallbackRituals(tradition);
  const ts = now();
  return templates.map((t, idx) => ({
    id: rid(t.id, tradition),
    name_sanskrit: t.name_sanskrit,
    name_english: t.name_english,
    short_description: t.short_description,
    meaning: t.meaning,
    default_duration_min: t.default_duration_min,
    default_inclusion: t.default_inclusion ?? "yes",
    traditional_participants: t.traditional_participants,
    inclusion: t.default_inclusion ?? "yes",
    included_duration_min: t.default_duration_min,
    abbreviated: false,
    couple_notes: "",
    sort_order: idx + 1,
    what_happens: t.what_happens ?? "",
    music_note: t.music_note ?? "",
    photography_note: t.photography_note ?? "",
    guest_instruction: t.guest_instruction ?? "",
    created_at: ts,
    updated_at: ts,
  }));
}

export function generateSamagriForTradition(
  tradition: CeremonyTradition,
): SamagriItem[] {
  // Start from whichever library is most specific. Hindu regional fallbacks
  // inherit the Vedic baseline; other traditions use their dedicated list
  // plus a final minimal fallback.
  let templates = SAMAGRI_LIBRARY[tradition];
  if (!templates) {
    // Fallback: Hindu variants get Vedic baseline; everything else gets its
    // minimal generic set.
    const hinduFallbackTraditions: CeremonyTradition[] = [
      "arya_samaj",
      "north_indian",
      "telugu",
      "kannada",
      "malayali",
      "surti_gujarati",
      "marathi",
      "bengali",
      "punjabi_hindu",
      "rajasthani",
      "marwari",
      "sindhi",
      "kashmiri_pandit",
      "bihari_maithili",
      "odia",
      "assamese",
      "konkani_goan_hindu",
    ];
    if (hinduFallbackTraditions.includes(tradition)) {
      templates = SAMAGRI_LIBRARY.vedic ?? [];
    } else {
      templates = getFallbackSamagri();
    }
  }
  const ts = now();
  return templates.map((t) => ({
    id: sid(t.id, tradition),
    name_local: t.name_local,
    name_english: t.name_english,
    category: t.category,
    used_for_ritual_id: t.used_for_ritual_id
      ? rid(t.used_for_ritual_id, tradition)
      : undefined,
    used_for_label: t.used_for_label,
    quantity: t.quantity,
    source: t.source,
    responsibility: t.responsibility,
    status: "needed",
    added_by_pandit: t.added_by_pandit ?? false,
    notes: t.notes ?? "",
    created_at: ts,
    updated_at: ts,
  }));
}

// Returns the number of curated ritual templates a tradition has, or null
// when it falls back. Used by the UI to surface "hand-curated vs. Vedic
// fallback" transparency.
export function traditionRitualCount(
  tradition: CeremonyTradition,
): { count: number; curated: boolean } {
  const lib = RITUAL_LIBRARY[tradition];
  if (lib) return { count: lib.length, curated: true };
  return { count: getFallbackRituals(tradition).length, curated: false };
}

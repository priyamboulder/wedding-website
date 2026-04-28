"use client";

// ── MagazineFlipbook ────────────────────────────────────────────────────────
// Editorial flipbook with mixed content types: feature spreads (4 layouts),
// vendor spotlights, editor's note, couple Q&A, mood boards, listicles,
// letters, section dividers. Each page supports content-aware Instagram
// export (Story 9:16, Post 4:5, Square 1:1) rendered to canvas — no heavy
// libs, no image assets, gradients parsed from the existing Tailwind data.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ChevronDown,
  Sparkles,
  Heart,
  MapPin,
  Users,
  Calendar,
  Flower2,
  Share2,
  Download,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Design tokens ──────────────────────────────────────────────────────────
// Pure-white editorial palette. Photography + typography carry the page;
// background stays out of the way. Terracotta is reserved for the brand
// accent — used sparingly (kickers, rules, wordmark) against black ink.

const TERRACOTTA = "#B84A2E";
const TERRACOTTA_DEEP = "#8F3720";
const PAPER = "#FFFFFF";
const PAPER_SHADE = "#F5F3F0";
const INK = "#0A0A0A";
const INK_SOFT = "#1F1F1F";
const INK_MUTED = "#5C5C5C";
const INK_FAINT = "#9A9A9A";
const RULE = "#0A0A0A";
const GOLD = "#8F6B2E";
const FLIP_MS = 720;

// ── Public types ───────────────────────────────────────────────────────────

export type FlipbookWedding = {
  slug: string;
  coupleNames: string;
  brideFirst: string;
  fromCity: string;
  toCity: string;
  date: string;
  year: number;
  season: "winter" | "spring" | "summer" | "fall";
  venueType: string;
  tradition: string;
  guestCount: string;
  quote: string;
  gradient: string;
  categories: string[];
  loves: number;
};

// ── Internal content types ─────────────────────────────────────────────────

type FeatureLayout = "portrait" | "grid" | "essay" | "triptych";

type Vendor = {
  id: string;
  category: string;
  name: string;
  location: string;
  tagline: string;
  blurb: string;
  featuredIn: number;
  gradient: string;
};

type Moodboard = {
  id: string;
  label: string;
  theme: string;
  palette: string[];
  items: { gradient: string; caption: string }[];
};

type CoupleQa = {
  id: string;
  couple: string;
  location: string;
  gradient: string;
  items: { q: string; a: string }[];
};

type EditList = {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  items: { label: string; meta: string; gradient: string }[];
};

type Letter = {
  id: string;
  from: string;
  location: string;
  date: string;
  body: string[];
  gradient: string;
};

type EditorsNote = {
  kicker: string;
  title: string;
  pullQuote: string;
  body: string[];
  author: string;
  role: string;
  company: string;
  gradient: string;
};

type TocEntry = {
  label: string;
  sub: string;
  section: string;
  page: number;
  gradient?: string;
};

type MagazinePage =
  | {
      kind: "cover";
      issueTitle: string;
      issueSub: string;
      issueNumber: string;
      weddings: FlipbookWedding[];
    }
  | { kind: "toc"; entries: TocEntry[] }
  | { kind: "editors-note"; note: EditorsNote }
  | {
      kind: "feature";
      layout: FeatureLayout;
      side: "left" | "right";
      wedding: FlipbookWedding;
      pageNumber: number;
    }
  | { kind: "vendor"; vendor: Vendor }
  | { kind: "qa"; qa: CoupleQa }
  | { kind: "moodboard"; board: Moodboard }
  | { kind: "edit"; edit: EditList }
  | { kind: "letter"; letter: Letter }
  | { kind: "divider"; section: string; subtitle?: string }
  | {
      kind: "back-cover";
      nextIssue: { title: string; teaser: string; weddings: FlipbookWedding[] };
    };

// ── Sample editorial content ───────────────────────────────────────────────
// Generated from the wedding dataset so the magazine feels populated even
// without image assets. All derivative — no external fetches.

function buildVendors(weddings: FlipbookWedding[]): Vendor[] {
  const pool = [
    { category: "Florals", name: "Petal & Provenance", tagline: "Field-to-aisle florals, rooted in season" },
    { category: "Photography", name: "Stories by Joseph Radhik", tagline: "Documentary weddings, heirloom prints" },
    { category: "Catering", name: "Kitchen House Collective", tagline: "Regional menus, reworked for ceremony" },
    { category: "Mehendi", name: "Henna by Aanya", tagline: "Fine-line henna, contemporary motifs" },
    { category: "Planning", name: "The Soirée Co.", tagline: "Logistics disguised as love letters" },
    { category: "Venues", name: "The Palace Pavilion", tagline: "Heritage estates, quietly reimagined" },
  ];
  return pool.slice(0, 4).map((p, i) => ({
    id: `v${i}`,
    category: p.category,
    name: p.name,
    location: weddings[i % weddings.length].toCity,
    tagline: p.tagline,
    blurb:
      "Featured across this issue for a body of work that feels considered, quiet, and unmistakably theirs. The kind of collaborator brides keep on speed dial — and so do their mothers.",
    featuredIn: 2 + (i % 3),
    gradient: weddings[i % weddings.length].gradient,
  }));
}

function buildMoodboards(weddings: FlipbookWedding[]): Moodboard[] {
  return [
    {
      id: "mb1",
      label: "Monsoon Golds",
      theme: "Fall 2025 · Palette Study",
      palette: ["#C48A6A", "#D6B77A", "#9C7A3E", "#EED3C0", "#7A4E3F"],
      items: [
        { gradient: weddings[0]?.gradient ?? "from-[#EED3C0] via-[#C99680] to-[#7A4E3F]", caption: "Gilded thread" },
        { gradient: weddings[3]?.gradient ?? "from-[#EEDCB0] via-[#D6B77A] to-[#9C7A3E]", caption: "Marigold, dried" },
        { gradient: weddings[5]?.gradient ?? "from-[#F1D2C0] via-[#D99E7E] to-[#A65F47]", caption: "Handwoven border" },
        { gradient: weddings[6]?.gradient ?? "from-[#EACBA3] via-[#C99A68] to-[#7E5A34]", caption: "Brass vessel" },
        { gradient: weddings[7]?.gradient ?? "from-[#E9D5B8] via-[#C7A478] to-[#8B6A40]", caption: "Saffron silk" },
      ],
    },
    {
      id: "mb2",
      label: "Coastal Whites",
      theme: "Fall 2025 · Palette Study",
      palette: ["#F3EEE4", "#E4DCC8", "#C7BFA7", "#8AA38C", "#3D312A"],
      items: [
        { gradient: weddings[2]?.gradient ?? "from-[#E4DCC8] via-[#C7BFA7] to-[#8AA38C]", caption: "Linen, salt-worn" },
        { gradient: weddings[4]?.gradient ?? "from-[#E2E8D4] via-[#B9C7A0] to-[#7B976A]", caption: "Palm, folded" },
        { gradient: "from-[#F3EEE4] via-[#E4DCC8] to-[#C7BFA7]", caption: "Coral, bleached" },
        { gradient: weddings[10]?.gradient ?? "from-[#D9E3D0] via-[#A2B58A] to-[#5E7F5A]", caption: "Tuberose, stem" },
        { gradient: "from-[#EAE4D5] via-[#CFC3A8] to-[#8A7D5C]", caption: "Shell, ivory" },
      ],
    },
  ];
}

function buildQa(weddings: FlipbookWedding[]): CoupleQa[] {
  return weddings.slice(0, 2).map((w, i) => ({
    id: `qa${i}`,
    couple: w.coupleNames,
    location: w.toCity,
    gradient: w.gradient,
    items: [
      {
        q: "How did you meet?",
        a: "Through a cousin's housewarming, three years before either of us was ready to admit it. The proposal happened in the same living room — different furniture, same people.",
      },
      {
        q: "What almost went wrong?",
        a: "The florals arrived an hour late. The planner offered tea and a contingency playlist. By the time the flowers came, no one had noticed they were missing.",
      },
      {
        q: "The moment you'll never forget?",
        a: `"${w.quote}" — honestly, that. The one we didn't plan and can't recreate.`,
      },
      {
        q: "The song you danced to first?",
        a: "A Bollywood ballad neither of our parents recognised, and then a Malayalam lullaby everyone did.",
      },
      {
        q: "Advice for future couples?",
        a: "Over-invite the aunties. Under-budget the centrepieces. Write the vows yourselves — even if you cry halfway through. Especially then.",
      },
    ],
  }));
}

function buildEditLists(weddings: FlipbookWedding[]): EditList[] {
  const venuePicks = [
    "Umaid Bhawan, Jodhpur",
    "Taj Falaknuma, Hyderabad",
    "Alila Fort Bishangarh, Rajasthan",
    "Soneva Fushi, Maldives",
    "The Leela Palace, Udaipur",
    "Aman-i-Khás, Ranthambhore",
  ];
  return [
    {
      id: "edit1",
      kicker: "The Edit",
      title: "six venues we can't stop thinking about.",
      subtitle:
        "Palaces, forts and quiet estates that keep earning repeat features. A shortlist, gently opinionated.",
      items: venuePicks.map((label, i) => ({
        label,
        meta: `No. 0${i + 1}`,
        gradient: weddings[i % weddings.length].gradient,
      })),
    },
    {
      id: "edit2",
      kicker: "The Edit",
      title: "five mehendi artists redefining the craft.",
      subtitle:
        "Fine-line, figurative, deliberately uneven — the hands rewriting what a bridal palm looks like.",
      items: [
        "Aanya Henna Atelier, Mumbai",
        "Veera & Co., Bengaluru",
        "The Mehendi Room, Delhi",
        "Studio Saanjh, Ahmedabad",
        "Jaya Henna, London",
      ].map((label, i) => ({
        label,
        meta: `No. 0${i + 1}`,
        gradient: weddings[(i + 2) % weddings.length].gradient,
      })),
    },
  ];
}

function buildLetters(weddings: FlipbookWedding[]): Letter[] {
  const w = weddings[0];
  const w2 = weddings[1];
  return [
    {
      id: "l1",
      from: w.coupleNames,
      location: `${w.fromCity} → ${w.toCity}`,
      date: w.date,
      gradient: w.gradient,
      body: [
        `A week after the last guest flew home, we sat on the floor of the palace room and tried to remember what we had worried about. We couldn't.`,
        `Planning felt like a full-time job for eight months. The wedding itself felt like a long, warm afternoon. Our advice — to anyone still in the middle of it — is that the thing you are protecting is not the schedule. It is the room. Keep the room warm. The rest follows.`,
        `With love,\n${w.brideFirst} & ${w.coupleNames.split(" & ")[1]}`,
      ],
    },
    {
      id: "l2",
      from: w2.coupleNames,
      location: `${w2.fromCity} → ${w2.toCity}`,
      date: w2.date,
      gradient: w2.gradient,
      body: [
        `Before the pheras, we stood in the green room and counted the people who weren't there — the ones we'd lost, the ones who couldn't travel, the ones we'd hoped would come. And then we walked out and let the rest happen.`,
        `Everyone says the day goes fast. It doesn't, actually. It goes slowly and all at once. Make space for both.`,
        `— ${w2.coupleNames.split(" & ").join(" & ")}`,
      ],
    },
  ];
}

function buildEditorsNote(weddings: FlipbookWedding[]): EditorsNote {
  return {
    kicker: "Editor's Letter",
    title: "on the weddings we chose, and the ones we left out.",
    pullQuote:
      "Every issue, we pick eight stories out of the hundred we read. Not the biggest weddings — the ones that made us look twice.",
    body: [
      "We spent the better part of this season rereading submissions at kitchen tables — Bengaluru, Brooklyn, a studio above a bakery in south Delhi. The eight weddings in this issue share almost nothing: a palace and a backwater houseboat, a 1,200-person baraat and a 32-person elopement, couples who married in a language their grandparents invented and couples who wrote their own.",
      "What they share is a kind of quiet authorship. The bride who rewrote the invitation six times so her grandmother's name would fit. The couple who sent their playlist to the catering team so the kitchen could time a dish to a song. These are not details you hire out. They are the wedding.",
      "If you submitted and we didn't run you this season, we read you. Twice, usually. We hope you'll send us your story again. And if you're still planning — thank you, for letting us sit with yours before anyone else gets to.",
    ],
    author: "Arohi Menon",
    role: "Editor-in-Chief",
    company: "Ananya Studio",
    gradient: weddings[0].gradient,
  };
}

// ── Page builder — the canonical issue structure ──────────────────────────

function buildPages(
  weddings: FlipbookWedding[],
  issueTitle: string,
  issueSub: string,
  issueNumber: string,
): MagazinePage[] {
  const features = weddings.slice(0, 4);
  const vendors = buildVendors(weddings);
  const moodboards = buildMoodboards(weddings);
  const qas = buildQa(weddings);
  const edits = buildEditLists(weddings);
  const letters = buildLetters(weddings);
  const editorsNote = buildEditorsNote(weddings);
  const layouts: FeatureLayout[] = ["triptych", "portrait", "grid", "essay"];

  const pages: MagazinePage[] = [];

  pages.push({
    kind: "cover",
    issueTitle,
    issueSub,
    issueNumber,
    weddings,
  });

  const tocEntries: TocEntry[] = [];
  pages.push({ kind: "toc", entries: tocEntries }); // placeholder — populate after build

  pages.push({ kind: "editors-note", note: editorsNote });
  pages.push({ kind: "moodboard", board: moodboards[0] });

  features.forEach((w, i) => {
    const layout = layouts[i % layouts.length];
    const leftPageNumber = pages.length + 1;
    pages.push({
      kind: "feature",
      layout,
      side: "left",
      wedding: w,
      pageNumber: leftPageNumber,
    });
    pages.push({
      kind: "feature",
      layout,
      side: "right",
      wedding: w,
      pageNumber: leftPageNumber + 1,
    });

    // Interstitial between features — vary by index.
    if (i === 0) {
      pages.push({ kind: "vendor", vendor: vendors[0] });
      pages.push({ kind: "qa", qa: qas[0] });
    } else if (i === 1) {
      pages.push({ kind: "edit", edit: edits[0] });
      pages.push({ kind: "vendor", vendor: vendors[1] });
    } else if (i === 2) {
      pages.push({ kind: "letter", letter: letters[0] });
      pages.push({ kind: "moodboard", board: moodboards[1] });
    }
  });

  pages.push({ kind: "qa", qa: qas[1] });
  pages.push({ kind: "letter", letter: letters[1] });

  pages.push({
    kind: "back-cover",
    nextIssue: {
      title: "Winter 2026",
      teaser: "Palace weddings, coastal elopements, and the first-ever Destinations Guide. In your reader Jan 15.",
      weddings: weddings.slice(0, 3),
    },
  });

  // Pad to even so every spread has a left+right.
  if (pages.length % 2 !== 0)
    pages.push({ kind: "divider", section: "Fin" });

  // Populate TOC now that we know page numbers.
  for (let i = 0; i < pages.length; i += 1) {
    const p = pages[i];
    if (p.kind === "feature" && p.side === "left") {
      tocEntries.push({
        label: p.wedding.coupleNames,
        sub: `${p.wedding.fromCity} → ${p.wedding.toCity} · ${p.wedding.tradition}`,
        section: "Features",
        page: i + 1,
        gradient: p.wedding.gradient,
      });
    } else if (p.kind === "vendor") {
      tocEntries.push({
        label: p.vendor.name,
        sub: `${p.vendor.category} · ${p.vendor.location}`,
        section: "Spotlight",
        page: i + 1,
        gradient: p.vendor.gradient,
      });
    } else if (p.kind === "qa") {
      tocEntries.push({
        label: `Q&A · ${p.qa.couple}`,
        sub: p.qa.location,
        section: "Voices",
        page: i + 1,
        gradient: p.qa.gradient,
      });
    } else if (p.kind === "moodboard") {
      tocEntries.push({
        label: p.board.label,
        sub: p.board.theme,
        section: "Palette",
        page: i + 1,
      });
    } else if (p.kind === "edit") {
      tocEntries.push({
        label: p.edit.title.replace(".", ""),
        sub: p.edit.kicker,
        section: "The Edit",
        page: i + 1,
      });
    } else if (p.kind === "letter") {
      tocEntries.push({
        label: `Letter from ${p.letter.from}`,
        sub: p.letter.location,
        section: "Letters",
        page: i + 1,
        gradient: p.letter.gradient,
      });
    } else if (p.kind === "editors-note") {
      tocEntries.push({
        label: "Editor's Letter",
        sub: p.note.author,
        section: "Opener",
        page: i + 1,
      });
    }
  }

  return pages;
}

// ── Main component ─────────────────────────────────────────────────────────

export function MagazineFlipbook({
  weddings,
  issueTitle = "Ananya Magazine",
  issueSub = "Fall 2025 · Love Stories, In Print",
  issueNumber = "No. 07",
  initialSlug,
  onClose,
}: {
  weddings: FlipbookWedding[];
  issueTitle?: string;
  issueSub?: string;
  issueNumber?: string;
  initialSlug?: string;
  onClose: () => void;
}) {
  const pages = useMemo(
    () => buildPages(weddings, issueTitle, issueSub, issueNumber),
    [weddings, issueTitle, issueSub, issueNumber],
  );
  const spreadCount = Math.ceil(pages.length / 2);

  const initialSpread = useMemo(() => {
    if (!initialSlug) return 0;
    const idx = pages.findIndex(
      (p) => p.kind === "feature" && p.wedding.slug === initialSlug && p.side === "left",
    );
    return idx < 0 ? 0 : Math.floor(idx / 2);
  }, [pages, initialSlug]);

  const [spread, setSpread] = useState(initialSpread);
  const [flip, setFlip] = useState<null | "next" | "prev">(null);
  const [mobile, setMobile] = useState(false);
  const [mobilePage, setMobilePage] = useState(initialSpread * 2);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);
  const [exportedToast, setExportedToast] = useState<string | null>(null);
  const [showShareTip, setShowShareTip] = useState(false);
  const flipLock = useRef(false);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (window.localStorage.getItem(SHARE_TIP_KEY)) return;
      const t = window.setTimeout(() => setShowShareTip(true), 900);
      return () => window.clearTimeout(t);
    } catch {
      return;
    }
  }, []);

  const dismissShareTip = useCallback(() => {
    setShowShareTip(false);
    try {
      window.localStorage.setItem(SHARE_TIP_KEY, "1");
    } catch {
      // ignored
    }
  }, []);

  const handleExported = useCallback((msg: string) => {
    setExportedToast(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setExportedToast(null), 2800);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    },
    [],
  );

  const openPageShare = useCallback(
    (pageIndex: number, format?: ExportFormat) => {
      dismissShareTip();
      setShareTarget({ kind: "page", pageIndex, initialFormat: format });
    },
    [dismissShareTip],
  );

  const openSpreadShare = useCallback(
    (leftIndex: number, rightIndex: number) => {
      dismissShareTip();
      setShareTarget({ kind: "spread", leftIndex, rightIndex });
    },
    [dismissShareTip],
  );

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const leftIdx = spread * 2;
  const rightIdx = spread * 2 + 1;
  const leftPage = pages[leftIdx];
  const rightPage = pages[rightIdx];
  const nextLeftPage = pages[(spread + 1) * 2];
  const nextRightPage = pages[(spread + 1) * 2 + 1];
  const prevLeftPage = pages[(spread - 1) * 2];
  const prevRightPage = pages[(spread - 1) * 2 + 1];

  const canNext = mobile
    ? mobilePage < pages.length - 1
    : spread < spreadCount - 1;
  const canPrev = mobile ? mobilePage > 0 : spread > 0;

  const goNext = useCallback(() => {
    if (flipLock.current) return;
    if (mobile) {
      if (mobilePage >= pages.length - 1) return;
      flipLock.current = true;
      setFlip("next");
      window.setTimeout(() => {
        setMobilePage((p) => p + 1);
        setFlip(null);
        flipLock.current = false;
      }, FLIP_MS);
    } else {
      if (spread >= spreadCount - 1) return;
      flipLock.current = true;
      setFlip("next");
      window.setTimeout(() => {
        setSpread((s) => s + 1);
        setFlip(null);
        flipLock.current = false;
      }, FLIP_MS);
    }
  }, [mobile, mobilePage, pages.length, spread, spreadCount]);

  const goPrev = useCallback(() => {
    if (flipLock.current) return;
    if (mobile) {
      if (mobilePage <= 0) return;
      flipLock.current = true;
      setFlip("prev");
      window.setTimeout(() => {
        setMobilePage((p) => p - 1);
        setFlip(null);
        flipLock.current = false;
      }, FLIP_MS);
    } else {
      if (spread <= 0) return;
      flipLock.current = true;
      setFlip("prev");
      window.setTimeout(() => {
        setSpread((s) => s - 1);
        setFlip(null);
        flipLock.current = false;
      }, FLIP_MS);
    }
  }, [mobile, mobilePage, spread]);

  const jumpToPage = useCallback(
    (pageIndex: number) => {
      if (flipLock.current) return;
      if (mobile) setMobilePage(pageIndex);
      else setSpread(Math.floor(pageIndex / 2));
    },
    [mobile],
  );

  const jumpToWedding = useCallback(
    (slug: string) => {
      const idx = pages.findIndex(
        (p) => p.kind === "feature" && p.wedding.slug === slug && p.side === "left",
      );
      if (idx < 0) return;
      jumpToPage(idx);
      setJumpOpen(false);
    },
    [pages, jumpToPage],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (shareTarget) {
        if (e.key === "Escape") setShareTarget(null);
        return;
      }
      if (e.key === "Escape") {
        if (jumpOpen) setJumpOpen(false);
        else onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, onClose, jumpOpen, shareTarget]);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  let displayLeft: MagazinePage | undefined = leftPage;
  let displayRight: MagazinePage | undefined = rightPage;
  let flipFront: MagazinePage | undefined;
  let flipBack: MagazinePage | undefined;
  if (flip === "next") {
    displayRight = nextRightPage ?? rightPage;
    flipFront = rightPage;
    flipBack = nextLeftPage;
  } else if (flip === "prev") {
    displayLeft = prevLeftPage ?? leftPage;
    flipFront = leftPage;
    flipBack = prevRightPage;
  }

  const featureSlugs = useMemo(() => {
    const seen = new Set<string>();
    const out: { slug: string; label: string; gradient: string; date: string; toCity: string }[] = [];
    for (const p of pages) {
      if (p.kind === "feature" && p.side === "left" && !seen.has(p.wedding.slug)) {
        seen.add(p.wedding.slug);
        out.push({
          slug: p.wedding.slug,
          label: p.wedding.coupleNames,
          gradient: p.wedding.gradient,
          date: p.wedding.date,
          toCity: p.wedding.toCity,
        });
      }
    }
    return out;
  }, [pages]);

  return (
    <div
      className="fixed inset-0 z-[100] flex select-none flex-col"
      style={{
        background:
          "radial-gradient(ellipse at center, #2a1f17 0%, #15100b 70%, #080604 100%)",
        fontFamily: "var(--font-sans, ui-sans-serif, system-ui)",
      }}
      aria-modal
      role="dialog"
    >
      <FlipbookStyles />

      <TopBar
        pageLabel={
          mobile
            ? `Page ${mobilePage + 1} of ${pages.length}`
            : `Spread ${spread + 1} of ${spreadCount}`
        }
        issueNumber={issueNumber}
        features={featureSlugs}
        jumpOpen={jumpOpen}
        setJumpOpen={setJumpOpen}
        onJumpWedding={jumpToWedding}
        onClose={onClose}
      />

      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-2 py-4 md:px-16 md:py-6"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(196,93,62,0.10) 0%, transparent 55%)",
          }}
        />

        {mobile ? (
          <MobileStage
            page={pages[mobilePage]}
            underlying={
              flip === "next"
                ? pages[mobilePage + 1]
                : flip === "prev"
                  ? pages[mobilePage - 1]
                  : undefined
            }
            flip={flip}
            flipFront={flip ? pages[mobilePage] : undefined}
            flipBack={
              flip === "next"
                ? pages[mobilePage + 1]
                : flip === "prev"
                  ? pages[mobilePage - 1]
                  : undefined
            }
            pageNumber={mobilePage + 1}
            allPages={pages}
            onShareFormat={(format) => openPageShare(mobilePage, format)}
          />
        ) : (
          <DesktopBook
            leftPage={displayLeft}
            rightPage={displayRight}
            leftPageNumber={leftIdx + 1}
            rightPageNumber={rightIdx + 1}
            flip={flip}
            flipFront={flipFront}
            flipFrontPageNumber={
              flip === "next" ? rightIdx + 1 : flip === "prev" ? leftIdx + 1 : 1
            }
            flipBack={flipBack}
            flipBackPageNumber={
              flip === "next"
                ? (spread + 1) * 2 + 1
                : flip === "prev"
                  ? (spread - 1) * 2 + 2
                  : 1
            }
            allPages={pages}
            onShareLeftFormat={(format) => openPageShare(leftIdx, format)}
            onShareRightFormat={(format) => openPageShare(rightIdx, format)}
            onShareSpread={
              leftPage && rightPage
                ? () => openSpreadShare(leftIdx, rightIdx)
                : undefined
            }
          />
        )}

        <NavArrow direction="prev" disabled={!canPrev || !!flip} onClick={goPrev} />
        <NavArrow direction="next" disabled={!canNext || !!flip} onClick={goNext} />
      </div>

      <BottomBar
        pages={pages}
        activeIndex={mobile ? mobilePage : spread * 2}
        activeEndIndex={mobile ? mobilePage : spread * 2 + 1}
        onJump={jumpToPage}
      />

      {shareTarget && (
        <SharePanel
          target={shareTarget}
          pages={pages}
          issueTitle={issueTitle}
          issueSub={issueSub}
          issueNumber={issueNumber}
          onClose={() => setShareTarget(null)}
          onExported={handleExported}
        />
      )}

      {exportedToast && <SavedToast message={exportedToast} />}

      {showShareTip && !shareTarget && (
        <FirstTimeShareTip onDismiss={dismissShareTip} />
      )}
    </div>
  );
}

// ── Top bar ───────────────────────────────────────────────────────────────

function TopBar({
  pageLabel,
  issueNumber,
  features,
  jumpOpen,
  setJumpOpen,
  onJumpWedding,
  onClose,
}: {
  pageLabel: string;
  issueNumber: string;
  features: { slug: string; label: string; gradient: string; date: string; toCity: string }[];
  jumpOpen: boolean;
  setJumpOpen: (v: boolean) => void;
  onJumpWedding: (slug: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="relative z-10 flex items-center gap-3 border-b border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-2 text-white/90">
        <BookOpen size={16} strokeWidth={1.8} />
        <span
          className="text-[11px] font-medium uppercase tracking-[0.24em]"
          style={{ color: TERRACOTTA }}
        >
          The Magazine
        </span>
        <span className="hidden text-[10.5px] uppercase tracking-[0.2em] text-white/45 md:inline">
          · {issueNumber}
        </span>
      </div>

      <div className="hidden h-4 w-px bg-white/15 md:block" />
      <span className="hidden text-[11.5px] tracking-[0.08em] text-white/60 md:inline">
        {pageLabel}
      </span>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setJumpOpen(!jumpOpen)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] text-white/90 transition-colors hover:bg-white/10"
          >
            Jump to wedding
            <ChevronDown size={12} strokeWidth={1.8} />
          </button>
          {jumpOpen && (
            <div
              className="absolute right-0 top-full z-20 mt-2 max-h-[320px] w-[260px] overflow-auto rounded-lg border border-white/10 bg-[#1a1310] py-1 shadow-2xl"
              onMouseLeave={() => setJumpOpen(false)}
            >
              {features.map((f) => (
                <button
                  key={f.slug}
                  type="button"
                  onClick={() => onJumpWedding(f.slug)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-[12.5px] text-white/85 transition-colors hover:bg-white/5"
                >
                  <span className={cn("h-7 w-7 shrink-0 rounded-sm bg-gradient-to-br", f.gradient)} />
                  <span className="flex-1 truncate">
                    <span className="block font-medium lowercase">{f.label}</span>
                    <span className="block text-[10.5px] text-white/50">
                      {f.toCity} · {f.date}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="inline text-[11.5px] tracking-[0.08em] text-white/60 md:hidden">
          {pageLabel}
        </span>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close magazine"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 transition-colors hover:bg-white/10"
        >
          <X size={15} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

// ── Nav arrow ─────────────────────────────────────────────────────────────

function NavArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "next" | "prev";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "next" ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "next" ? "Next page" : "Previous page"}
      className={cn(
        "absolute top-1/2 z-20 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/90 backdrop-blur-sm transition-all hover:bg-black/60 md:h-12 md:w-12",
        direction === "next" ? "right-2 md:right-6" : "left-2 md:left-6",
        disabled && "cursor-not-allowed opacity-25",
      )}
    >
      <Icon size={20} strokeWidth={1.8} />
    </button>
  );
}

// ── Desktop book ──────────────────────────────────────────────────────────

function DesktopBook({
  leftPage,
  rightPage,
  leftPageNumber,
  rightPageNumber,
  flip,
  flipFront,
  flipFrontPageNumber,
  flipBack,
  flipBackPageNumber,
  allPages,
  onShareLeftFormat,
  onShareRightFormat,
  onShareSpread,
}: {
  leftPage?: MagazinePage;
  rightPage?: MagazinePage;
  leftPageNumber: number;
  rightPageNumber: number;
  flip: null | "next" | "prev";
  flipFront?: MagazinePage;
  flipFrontPageNumber: number;
  flipBack?: MagazinePage;
  flipBackPageNumber: number;
  allPages: MagazinePage[];
  onShareLeftFormat: (format?: ExportFormat) => void;
  onShareRightFormat: (format?: ExportFormat) => void;
  onShareSpread?: () => void;
}) {
  return (
    <div className="book-stage">
      <div className="book-shadow" />
      <div className="book">
        <PageShell
          side="left"
          pageNumber={leftPageNumber}
          page={leftPage}
          allPages={allPages}
          onShareFormat={onShareLeftFormat}
        />
        <div className="book-spine" aria-hidden />
        <PageShell
          side="right"
          pageNumber={rightPageNumber}
          page={rightPage}
          allPages={allPages}
          onShareFormat={onShareRightFormat}
          onShareSpread={onShareSpread}
        />

        {flip === "next" && (
          <div className="flip-page flip-next" style={{ animationDuration: `${FLIP_MS}ms` }}>
            <div className="flip-face flip-front">
              <PageShell side="right" pageNumber={flipFrontPageNumber} page={flipFront} allPages={allPages} bare />
            </div>
            <div className="flip-face flip-back">
              <PageShell side="left" pageNumber={flipBackPageNumber} page={flipBack} allPages={allPages} bare />
            </div>
          </div>
        )}
        {flip === "prev" && (
          <div className="flip-page flip-prev" style={{ animationDuration: `${FLIP_MS}ms` }}>
            <div className="flip-face flip-front">
              <PageShell side="left" pageNumber={flipFrontPageNumber} page={flipFront} allPages={allPages} bare />
            </div>
            <div className="flip-face flip-back">
              <PageShell side="right" pageNumber={flipBackPageNumber} page={flipBack} allPages={allPages} bare />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MobileStage({
  page,
  underlying,
  flip,
  flipFront,
  flipBack,
  pageNumber,
  allPages,
  onShareFormat,
}: {
  page?: MagazinePage;
  underlying?: MagazinePage;
  flip: null | "next" | "prev";
  flipFront?: MagazinePage;
  flipBack?: MagazinePage;
  pageNumber: number;
  allPages: MagazinePage[];
  onShareFormat: (format?: ExportFormat) => void;
}) {
  return (
    <div className="book-stage mobile">
      <div className="book-shadow mobile" />
      <div className="book mobile">
        <PageShell
          side="single"
          pageNumber={flip ? (flip === "next" ? pageNumber + 1 : pageNumber - 1) : pageNumber}
          page={flip ? underlying : page}
          allPages={allPages}
          onShareFormat={onShareFormat}
        />
        {flip === "next" && (
          <div className="flip-page flip-next mobile" style={{ animationDuration: `${FLIP_MS}ms` }}>
            <div className="flip-face flip-front">
              <PageShell side="single" pageNumber={pageNumber} page={flipFront} allPages={allPages} bare />
            </div>
            <div className="flip-face flip-back">
              <PageShell side="single" pageNumber={pageNumber + 1} page={flipBack} allPages={allPages} bare />
            </div>
          </div>
        )}
        {flip === "prev" && (
          <div className="flip-page flip-prev mobile" style={{ animationDuration: `${FLIP_MS}ms` }}>
            <div className="flip-face flip-front">
              <PageShell side="single" pageNumber={pageNumber} page={flipFront} allPages={allPages} bare />
            </div>
            <div className="flip-face flip-back">
              <PageShell side="single" pageNumber={pageNumber - 1} page={flipBack} allPages={allPages} bare />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page shell ────────────────────────────────────────────────────────────

function PageShell({
  side,
  pageNumber,
  page,
  allPages,
  bare,
  onShareFormat,
  onShareSpread,
}: {
  side: "left" | "right" | "single";
  pageNumber: number;
  page?: MagazinePage;
  allPages: MagazinePage[];
  bare?: boolean;
  onShareFormat?: (format?: ExportFormat) => void;
  onShareSpread?: () => void;
}) {
  const shellClass = cn(
    "page-shell group",
    side === "left" && "page-left",
    side === "right" && "page-right",
    side === "single" && "page-single",
    bare && "page-bare",
  );

  const hidesChrome =
    page?.kind === "cover" ||
    page?.kind === "back-cover" ||
    page?.kind === "divider" ||
    (page?.kind === "feature" && (page.layout === "grid" || page.layout === "triptych"));

  const showShareBar = !bare && !hidesChrome && page && onShareFormat;
  const sectionLabel = page ? sectionLabelFor(page) : "";

  return (
    <div className={shellClass} style={{ backgroundColor: PAPER, color: INK }}>
      <div className="page-grain" aria-hidden />
      <div className="page-fade" aria-hidden data-side={side} />

      {page && !hidesChrome && (
        <>
          <span
            className={cn(
              "running-header",
              side === "right" ? "running-header-right" : "running-header-left",
            )}
          >
            {sectionLabel}
          </span>
        </>
      )}

      <div
        className={cn("page-inner", showShareBar && "page-inner-with-bar")}
      >
        {page ? (
          <PageContent page={page} allPages={allPages} side={side} />
        ) : null}
      </div>

      {page && !hidesChrome && !showShareBar && (
        <>
          <span
            className={cn(
              "running-footer",
              side === "right" ? "running-footer-issue-right" : "running-footer-issue",
            )}
          >
            Ananya · No. 07
          </span>
          <div
            className={cn(
              "page-number",
              side === "left" ? "page-number-left" : "page-number-right",
            )}
            style={side === "left" ? { left: "auto", right: 22 } : { right: "auto", left: 22 }}
          >
            {String(pageNumber).padStart(3, "0")}
          </div>
        </>
      )}

      {showShareBar && onShareFormat && (
        <ShareBar
          side={side}
          pageNumber={pageNumber}
          onShareFormat={onShareFormat}
          onShareSpread={onShareSpread}
        />
      )}
    </div>
  );
}

function sectionLabelFor(page: MagazinePage): string {
  switch (page.kind) {
    case "toc":
      return "Contents";
    case "editors-note":
      return "Editor's Letter";
    case "feature":
      return `Feature · ${page.wedding.tradition}`;
    case "vendor":
      return `Spotlight · ${page.vendor.category}`;
    case "qa":
      return "Voices · Couple Q&A";
    case "moodboard":
      return "Palette Study";
    case "edit":
      return "The Edit";
    case "letter":
      return "Letters";
    default:
      return "Ananya Magazine";
  }
}

// ── Share bar (persistent, per-page) ──────────────────────────────────────

function ShareBar({
  side,
  pageNumber,
  onShareFormat,
  onShareSpread,
}: {
  side: "left" | "right" | "single";
  pageNumber: number;
  onShareFormat: (format?: ExportFormat) => void;
  onShareSpread?: () => void;
}) {
  const trigger = (format: ExportFormat) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onShareFormat(format);
  };
  const openGeneric = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShareFormat();
  };
  return (
    <div
      className={cn(
        "share-bar",
        side === "left" && "share-bar-left",
        side === "right" && "share-bar-right",
        side === "single" && "share-bar-single",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={openGeneric}
        className="share-bar-label"
        aria-label="Share this page for Instagram"
      >
        <Share2 size={10} strokeWidth={2} />
        <span>Share this page</span>
      </button>

      <div className="share-bar-shapes" role="group" aria-label="Instagram formats">
        <button
          type="button"
          onClick={trigger("story")}
          className="share-shape-btn"
          aria-label="Instagram Story, 9 by 16"
        >
          <span className="share-shape shape-story" aria-hidden />
          <span className="share-shape-text">Story 9:16</span>
        </button>
        <button
          type="button"
          onClick={trigger("post")}
          className="share-shape-btn"
          aria-label="Instagram Post, 4 by 5"
        >
          <span className="share-shape shape-post" aria-hidden />
          <span className="share-shape-text">Post 4:5</span>
        </button>
        <button
          type="button"
          onClick={trigger("square")}
          className="share-shape-btn"
          aria-label="Square, 1 by 1"
        >
          <span className="share-shape shape-square" aria-hidden />
          <span className="share-shape-text">Square 1:1</span>
        </button>

        {onShareSpread && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShareSpread();
            }}
            className="share-spread-btn"
            aria-label="Export full spread as Instagram carousel"
          >
            <span className="share-spread-icon" aria-hidden>
              <span className="share-spread-card" />
              <span className="share-spread-card" />
              <span className="share-spread-card" />
            </span>
            <span className="share-spread-text">Full spread</span>
          </button>
        )}
      </div>

      <div className="share-bar-page-number">{String(pageNumber).padStart(2, "0")}</div>
    </div>
  );
}

function PageContent({
  page,
  allPages,
  side,
}: {
  page: MagazinePage;
  allPages: MagazinePage[];
  side: "left" | "right" | "single";
}) {
  switch (page.kind) {
    case "cover":
      return <CoverPage {...page} />;
    case "toc":
      return <TocPage entries={page.entries} />;
    case "editors-note":
      return <EditorsNotePage note={page.note} />;
    case "feature":
      return <FeaturePage {...page} side={side === "single" ? "right" : side} />;
    case "vendor":
      return <VendorSpotlightPage vendor={page.vendor} />;
    case "qa":
      return <QaPage qa={page.qa} />;
    case "moodboard":
      return <MoodboardPage board={page.board} />;
    case "edit":
      return <EditListPage edit={page.edit} />;
    case "letter":
      return <LetterPage letter={page.letter} />;
    case "divider":
      return <DividerPage section={page.section} subtitle={page.subtitle} />;
    case "back-cover":
      return <BackCoverPage nextIssue={page.nextIssue} />;
  }
}

// ── Cover page ────────────────────────────────────────────────────────────

function CoverPage({
  issueTitle,
  issueSub,
  issueNumber,
  weddings,
}: {
  issueTitle: string;
  issueSub: string;
  issueNumber: string;
  weddings: FlipbookWedding[];
}) {
  const mosaic = weddings.slice(0, 6);
  const headline = weddings[0];
  return (
    <div className="relative flex h-full flex-col px-10 py-10">
      {/* Top masthead bar */}
      <div
        className="flex items-baseline justify-between border-b pb-3"
        style={{ borderColor: RULE }}
      >
        <p
          className="text-[9.5px] font-semibold uppercase tracking-[0.34em]"
          style={{ color: INK }}
        >
          {issueNumber} · {issueSub.split(" · ")[0]}
        </p>
        <p
          className="text-[9.5px] font-semibold uppercase tracking-[0.34em]"
          style={{ color: TERRACOTTA }}
        >
          The Real Weddings Issue
        </p>
      </div>

      {/* Wordmark — oversized didone, all-caps, dropped to the page like a nameplate */}
      <h1
        className="mt-5 tracking-[-0.015em]"
        style={{
          fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
          fontSize: "clamp(78px, 11vw, 148px)",
          fontWeight: 500,
          lineHeight: 0.82,
          color: INK,
          textTransform: "uppercase",
        }}
      >
        Ananya
      </h1>
      <p
        className="mt-2 text-[10px] font-medium uppercase"
        style={{ color: INK_MUTED, letterSpacing: "0.54em" }}
      >
        M · A · G · A · Z · I · N · E
      </p>

      {/* Cover story tease */}
      <div className="mt-6 grid grid-cols-[1.1fr_auto] items-end gap-6">
        <div>
          <p
            className="text-[9px] font-semibold uppercase"
            style={{ color: TERRACOTTA, letterSpacing: "0.3em" }}
          >
            Cover Story · {headline.tradition}
          </p>
          <p
            className="mt-2 italic leading-[1.05]"
            style={{
              fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
              fontSize: "clamp(22px, 2.6vw, 32px)",
              fontWeight: 400,
              color: INK,
            }}
          >
            &ldquo;{headline.quote}&rdquo;
          </p>
          <p
            className="mt-3 text-[10.5px] font-medium uppercase"
            style={{ color: INK, letterSpacing: "0.22em" }}
          >
            {headline.coupleNames} · {headline.toCity} · {headline.date}
          </p>
        </div>
      </div>

      {/* Photo mosaic — tighter, square grid, captioned */}
      <div className="mt-5 grid flex-1 grid-cols-3 gap-[3px] overflow-hidden">
        {mosaic.map((w, i) => (
          <figure key={w.slug} className="relative overflow-hidden">
            <div className={cn("absolute inset-0 bg-gradient-to-br", w.gradient)} />
            <PhotoGrain />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 55%)",
              }}
            />
            <figcaption
              className="absolute inset-x-0 bottom-0 flex items-end justify-between px-2 pb-1.5 text-white/95"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
            >
              <span className="text-[8.5px] font-semibold uppercase tracking-[0.2em]">
                {w.brideFirst}
              </span>
              <span className="text-[8px] uppercase tracking-[0.18em] text-white/75">
                p.{String((i + 1) * 6).padStart(2, "0")}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Cover credits strip — hairline, tight, multi-column list */}
      <div
        className="mt-5 grid grid-cols-3 gap-6 border-t pt-3 text-[9px] uppercase"
        style={{ color: INK, letterSpacing: "0.2em", borderColor: RULE }}
      >
        <div>
          <p className="font-semibold" style={{ color: TERRACOTTA }}>
            Features
          </p>
          <p className="mt-1 leading-[1.5]" style={{ color: INK_SOFT }}>
            {weddings.slice(0, 3).map((w) => w.brideFirst).join(" · ")}
          </p>
        </div>
        <div>
          <p className="font-semibold" style={{ color: TERRACOTTA }}>
            Inside
          </p>
          <p className="mt-1 leading-[1.5]" style={{ color: INK_SOFT }}>
            Vendors · Q&amp;A · The Edit · Letters
          </p>
        </div>
        <div>
          <p className="font-semibold" style={{ color: TERRACOTTA }}>
            Masthead
          </p>
          <p className="mt-1 leading-[1.5]" style={{ color: INK_SOFT }}>
            Arohi Menon, Editor · Ananya Studio
          </p>
        </div>
      </div>
    </div>
  );
}

// ── TOC ───────────────────────────────────────────────────────────────────

function TocPage({ entries }: { entries: TocEntry[] }) {
  const bySection = useMemo(() => {
    const order = ["Opener", "Features", "Palette", "Spotlight", "Voices", "The Edit", "Letters"];
    const groups = new Map<string, TocEntry[]>();
    for (const e of entries) {
      if (!groups.has(e.section)) groups.set(e.section, []);
      groups.get(e.section)!.push(e);
    }
    return order
      .map((s) => ({ section: s, items: groups.get(s) ?? [] }))
      .filter((g) => g.items.length > 0);
  }, [entries]);

  return (
    <div className="flex h-full flex-col px-10 pb-10 pt-14">
      <div
        className="flex items-baseline justify-between border-b pb-2"
        style={{ borderColor: RULE }}
      >
        <p
          className="text-[9px] font-semibold uppercase"
          style={{ color: INK, letterSpacing: "0.32em" }}
        >
          Contents
        </p>
        <p
          className="text-[9px] font-semibold uppercase"
          style={{ color: TERRACOTTA, letterSpacing: "0.3em" }}
        >
          Fall 2025 · No. 07
        </p>
      </div>

      <h2
        className="mt-4 tracking-[-0.02em]"
        style={{
          fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
          fontSize: "clamp(44px, 5.6vw, 68px)",
          fontWeight: 500,
          lineHeight: 0.9,
          color: INK,
        }}
      >
        Inside<br />
        <span style={{ fontStyle: "italic", color: INK_MUTED }}>this issue.</span>
      </h2>

      <div className="mt-6 grid flex-1 grid-cols-2 gap-x-6 gap-y-5 overflow-hidden">
        {bySection.map((g) => (
          <section key={g.section} className="break-inside-avoid">
            <div
              className="flex items-center justify-between border-b pb-1"
              style={{ borderColor: INK }}
            >
              <p
                className="text-[8.5px] font-semibold uppercase"
                style={{ color: TERRACOTTA, letterSpacing: "0.28em" }}
              >
                {g.section}
              </p>
              <p
                className="text-[8px] uppercase"
                style={{ color: INK_FAINT, letterSpacing: "0.22em" }}
              >
                {String(g.items.length).padStart(2, "0")} entries
              </p>
            </div>
            <ul className="mt-1">
              {g.items.map((e) => (
                <li
                  key={`${e.section}-${e.page}`}
                  className="flex items-baseline gap-2 border-b py-1.5"
                  style={{ borderColor: "rgba(0,0,0,0.08)" }}
                >
                  <p
                    className="min-w-0 flex-1 truncate leading-[1.2]"
                    style={{
                      fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
                      fontSize: "13.5px",
                      fontWeight: 500,
                      color: INK,
                    }}
                  >
                    {e.label}
                  </p>
                  <span
                    className="shrink-0 text-[9px] font-semibold tabular-nums"
                    style={{ color: TERRACOTTA, letterSpacing: "0.15em" }}
                  >
                    {String(e.page).padStart(3, "0")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

// ── Editor's Note ─────────────────────────────────────────────────────────

function EditorsNotePage({ note }: { note: EditorsNote }) {
  return (
    <div className="flex h-full flex-col px-10 pb-10 pt-14">
      <p
        className="text-[9px] font-semibold uppercase"
        style={{ color: TERRACOTTA, letterSpacing: "0.32em" }}
      >
        {note.kicker}
      </p>

      {/* Oversized pull quote — the hook */}
      <blockquote
        className="mt-3 tracking-[-0.015em]"
        style={{
          fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
          fontSize: "clamp(28px, 3.4vw, 40px)",
          fontStyle: "italic",
          fontWeight: 400,
          lineHeight: 1.05,
          color: INK,
        }}
      >
        &ldquo;{note.pullQuote}&rdquo;
      </blockquote>
      <div
        className="mt-4 h-px w-12"
        style={{ background: INK }}
        aria-hidden
      />

      {/* Two-column dense body */}
      <div
        className="mt-5 flex-1 overflow-hidden columns-2 gap-6 text-[11.5px]"
        style={{
          fontFamily: "'Cormorant Garamond', 'Source Serif 4', Georgia, serif",
          color: INK,
          lineHeight: 1.45,
          textAlign: "justify",
          hyphens: "auto",
          columnRule: `1px solid rgba(0,0,0,0.12)`,
        }}
      >
        {note.body.map((p, i) => (
          <p key={i} className="mb-3 break-inside-avoid">
            {i === 0 ? (
              <>
                <span
                  className="float-left mr-[6px] mt-[2px]"
                  style={{
                    fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
                    fontSize: "56px",
                    lineHeight: 0.82,
                    fontWeight: 500,
                    color: INK,
                    padding: "2px 0 0 0",
                  }}
                >
                  {p.charAt(0).toUpperCase()}
                </span>
                {p.slice(1)}
              </>
            ) : (
              p
            )}
          </p>
        ))}
      </div>

      {/* Signature block — hairline above, tight layout */}
      <div
        className="mt-4 flex items-center gap-3 border-t pt-4"
        style={{ borderColor: RULE }}
      >
        <div
          className={cn(
            "h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gradient-to-br",
            note.gradient,
          )}
        >
          <PhotoGrain />
        </div>
        <div className="flex-1">
          <p
            className="tracking-[-0.01em]"
            style={{
              fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
              fontSize: "18px",
              fontStyle: "italic",
              fontWeight: 500,
              color: INK,
              lineHeight: 1,
            }}
          >
            {note.author}
          </p>
          <p
            className="mt-1 text-[9px] font-semibold uppercase"
            style={{ color: INK_MUTED, letterSpacing: "0.22em" }}
          >
            {note.role} · {note.company}
          </p>
        </div>
        <p
          className="text-right text-[8.5px] uppercase"
          style={{ color: INK_FAINT, letterSpacing: "0.2em" }}
        >
          Letter from
          <br />
          the Editor
        </p>
      </div>
    </div>
  );
}

// ── Feature pages (4 layouts) ─────────────────────────────────────────────

function FeaturePage({
  layout,
  side,
  wedding,
}: {
  layout: FeatureLayout;
  side: "left" | "right";
  wedding: FlipbookWedding;
}) {
  if (layout === "portrait") return <FeaturePortrait side={side} wedding={wedding} />;
  if (layout === "grid") return <FeatureGrid side={side} wedding={wedding} />;
  if (layout === "essay") return <FeatureEssay side={side} wedding={wedding} />;
  return <FeatureTriptych side={side} wedding={wedding} />;
}

function FeaturePortrait({
  side,
  wedding,
}: {
  side: "left" | "right";
  wedding: FlipbookWedding;
}) {
  if (side === "left") {
    return (
      <div className={cn("relative h-full w-full overflow-hidden bg-gradient-to-br", wedding.gradient)}>
        <PhotoGrain />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.2) 48%, rgba(0,0,0,0) 72%)",
          }}
        />

        {/* Vertical photographer credit — classic editorial move */}
        <p
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[8.5px] font-semibold uppercase text-white/75"
          style={{
            writingMode: "vertical-rl",
            letterSpacing: "0.32em",
          }}
        >
          Photographed by Joseph Radhik · {wedding.toCity}
        </p>

        <div className="absolute left-8 top-8 flex items-center gap-2">
          <span
            className="h-[1px] w-6 bg-white/90"
            aria-hidden
          />
          <span
            className="text-[9px] font-semibold uppercase text-white/95"
            style={{ letterSpacing: "0.32em" }}
          >
            The Feature
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-8 pb-10">
          <p
            className="text-[9.5px] font-semibold uppercase text-white/85"
            style={{ letterSpacing: "0.3em" }}
          >
            {wedding.tradition} · {wedding.venueType}
          </p>
          <h2
            className="mt-3 tracking-[-0.02em] text-white"
            style={{
              fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
              fontSize: "clamp(46px, 6.2vw, 80px)",
              fontWeight: 500,
              lineHeight: 0.92,
              textTransform: "uppercase",
            }}
          >
            {wedding.coupleNames.split(" & ").join(" & ")}
          </h2>
          <p
            className="mt-3 max-w-[440px] italic text-white/95"
            style={{
              fontFamily: "var(--font-serif, Georgia, serif)",
              fontSize: "clamp(14px, 1.5vw, 17px)",
              lineHeight: 1.35,
            }}
          >
            &ldquo;{wedding.quote}&rdquo;
          </p>
          <div
            className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-white/40 pt-3 text-[9.5px] font-semibold uppercase text-white/80"
            style={{ letterSpacing: "0.24em" }}
          >
            <span className="inline-flex items-center gap-1.5"><MapPin size={10} />{wedding.toCity}</span>
            <span className="inline-flex items-center gap-1.5"><Calendar size={10} />{wedding.date}</span>
            <span className="inline-flex items-center gap-1.5"><Users size={10} />{wedding.guestCount}</span>
          </div>
        </div>
      </div>
    );
  }

  const paragraphs = buildNarrative(wedding);
  return (
    <div className="grid h-full grid-cols-[1fr_auto] gap-6 px-9 pb-10 pt-14">
      <div className="flex min-w-0 flex-col">
        <p
          className="text-[9px] font-semibold uppercase"
          style={{ color: TERRACOTTA, letterSpacing: "0.32em" }}
        >
          Real Wedding · No. {wedding.slug.charCodeAt(0) % 10}
        </p>
        <h3
          className="mt-2 tracking-[-0.02em]"
          style={{
            fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(28px, 3vw, 38px)",
            fontWeight: 500,
            lineHeight: 0.95,
            color: INK,
          }}
        >
          A {wedding.season} of {wedding.brideFirst}&rsquo;s
          <span style={{ fontStyle: "italic" }}> own making.</span>
        </h3>
        <p
          className="mt-2 text-[9.5px] font-semibold uppercase"
          style={{ color: INK_MUTED, letterSpacing: "0.22em" }}
        >
          Words · Arohi Menon · Photography · Joseph Radhik
        </p>

        <AsymmetricPhotos gradient={wedding.gradient} />

        <div
          className="mt-4 flex-1 space-y-2.5 text-[11px]"
          style={{
            fontFamily: "'Cormorant Garamond', 'Source Serif 4', Georgia, serif",
            color: INK,
            lineHeight: 1.42,
            textAlign: "justify",
            hyphens: "auto",
          }}
        >
          {paragraphs.map((para, i) => (
            <p key={i}>
              {i === 0 ? (
                <>
                  <span
                    className="float-left mr-[6px]"
                    style={{
                      fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
                      fontSize: "52px",
                      lineHeight: 0.82,
                      fontWeight: 500,
                      color: INK,
                      paddingTop: 2,
                    }}
                  >
                    {para.charAt(0).toUpperCase()}
                  </span>
                  {para.slice(1)}
                </>
              ) : (
                para
              )}
            </p>
          ))}
        </div>
      </div>
      <QuickStatsSidebar wedding={wedding} />
    </div>
  );
}

function FeatureGrid({
  side,
  wedding,
}: {
  side: "left" | "right";
  wedding: FlipbookWedding;
}) {
  if (side === "left") {
    return (
      <div className="relative h-full w-full bg-white p-1.5">
        <div className="grid h-full grid-cols-3 grid-rows-5 gap-[3px]">
          <div className={cn("relative col-span-3 row-span-2 overflow-hidden bg-gradient-to-br", wedding.gradient)}>
            <PhotoGrain />
          </div>
          <div className={cn("relative col-span-1 row-span-2 overflow-hidden bg-gradient-to-tr", wedding.gradient)}>
            <PhotoGrain />
          </div>
          <div className={cn("relative col-span-2 row-span-3 overflow-hidden bg-gradient-to-bl", wedding.gradient)}>
            <PhotoGrain />
          </div>
          <div className={cn("relative col-span-1 row-span-1 overflow-hidden bg-gradient-to-br", wedding.gradient)}>
            <PhotoGrain />
          </div>
          <div className={cn("relative col-span-1 row-span-2 overflow-hidden bg-gradient-to-tl", wedding.gradient)}>
            <PhotoGrain />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative h-full w-full bg-white p-1.5">
      <div className="grid h-full grid-cols-3 grid-rows-5 gap-[3px]">
        <div className={cn("relative col-span-2 row-span-3 overflow-hidden bg-gradient-to-bl", wedding.gradient)}>
          <PhotoGrain />
        </div>
        <div className={cn("relative col-span-1 row-span-2 overflow-hidden bg-gradient-to-br", wedding.gradient)}>
          <PhotoGrain />
        </div>
        <div className={cn("relative col-span-1 row-span-1 overflow-hidden bg-gradient-to-tr", wedding.gradient)}>
          <PhotoGrain />
        </div>
        <div className={cn("relative col-span-3 row-span-2 overflow-hidden bg-gradient-to-br", wedding.gradient)}>
          <PhotoGrain />
        </div>
      </div>

      {/* Floating white caption card — like a press photo caption */}
      <div
        className="absolute bottom-5 left-5 right-5 md:left-auto md:right-5 md:max-w-[320px]"
        style={{
          background: "#FFFFFF",
          padding: "18px 20px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          borderTop: `2px solid ${TERRACOTTA}`,
        }}
      >
        <p
          className="text-[8.5px] font-semibold uppercase"
          style={{ color: TERRACOTTA, letterSpacing: "0.32em" }}
        >
          Portfolio · {wedding.tradition}
        </p>
        <h2
          className="mt-2 tracking-[-0.015em]"
          style={{
            fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(22px, 2.6vw, 30px)",
            fontWeight: 500,
            lineHeight: 0.95,
            color: INK,
            textTransform: "uppercase",
          }}
        >
          {wedding.coupleNames}
        </h2>
        <p
          className="mt-2 italic text-[12px]"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: INK,
            lineHeight: 1.35,
          }}
        >
          &ldquo;{wedding.quote}&rdquo;
        </p>
        <p
          className="mt-3 border-t pt-2 text-[8.5px] font-semibold uppercase"
          style={{ color: INK_MUTED, letterSpacing: "0.26em", borderColor: "rgba(0,0,0,0.15)" }}
        >
          {wedding.toCity} · {wedding.date}
        </p>
      </div>
    </div>
  );
}

function FeatureEssay({
  side,
  wedding,
}: {
  side: "left" | "right";
  wedding: FlipbookWedding;
}) {
  const paragraphs = buildLongNarrative(wedding);
  const [left, right] = splitAtMidpoint(paragraphs);

  if (side === "left") {
    return (
      <div className="flex h-full flex-col px-10 pb-10 pt-14">
        <p
          className="text-[9px] font-semibold uppercase"
          style={{ color: TERRACOTTA, letterSpacing: "0.32em" }}
        >
          The Essay · {wedding.tradition}
        </p>
        <h2
          className="mt-3 tracking-[-0.02em]"
          style={{
            fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(36px, 4.4vw, 54px)",
            fontWeight: 500,
            lineHeight: 0.92,
            color: INK,
          }}
        >
          The quiet<br />
          <span style={{ fontStyle: "italic" }}>architecture</span> of
          <br />
          {wedding.brideFirst}&rsquo;s wedding.
        </h2>
        <p
          className="mt-3 max-w-[360px] text-[10.5px] font-semibold uppercase"
          style={{ color: INK_MUTED, letterSpacing: "0.22em" }}
        >
          {wedding.coupleNames} · {wedding.fromCity} → {wedding.toCity}
          <br />
          <span style={{ color: INK_FAINT }}>Words by Arohi Menon</span>
        </p>

        <div
          className="mt-5 h-px"
          style={{ background: INK }}
          aria-hidden
        />

        <div
          className="mt-4 flex-1 overflow-hidden columns-2 gap-6 text-[10.5px]"
          style={{
            fontFamily: "'Cormorant Garamond', 'Source Serif 4', Georgia, serif",
            color: INK,
            lineHeight: 1.4,
            textAlign: "justify",
            hyphens: "auto",
            columnRule: `1px solid rgba(0,0,0,0.12)`,
          }}
        >
          {left.map((p, i) => (
            <p key={i} className="mb-2.5 break-inside-avoid">
              {i === 0 ? (
                <>
                  <span
                    className="float-left mr-[6px]"
                    style={{
                      fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
                      fontSize: "62px",
                      lineHeight: 0.8,
                      fontWeight: 500,
                      color: INK,
                      paddingTop: 2,
                    }}
                  >
                    {p.charAt(0).toUpperCase()}
                  </span>
                  {p.slice(1)}
                </>
              ) : (
                p
              )}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col px-10 pb-10 pt-14">
      {/* Pull quote — massive, italic, interrupting the column flow */}
      <figure>
        <blockquote
          className="tracking-[-0.01em]"
          style={{
            fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(26px, 3.2vw, 36px)",
            fontStyle: "italic",
            fontWeight: 400,
            lineHeight: 1.05,
            color: INK,
          }}
        >
          &ldquo;{wedding.quote}&rdquo;
        </blockquote>
        <figcaption
          className="mt-3 flex items-center gap-2 text-[9px] font-semibold uppercase"
          style={{ color: INK_MUTED, letterSpacing: "0.22em" }}
        >
          <span className="h-[1px] w-6" style={{ background: INK }} aria-hidden />
          {wedding.coupleNames}, in conversation
        </figcaption>
      </figure>

      <div
        className="mt-4 h-px"
        style={{ background: INK }}
        aria-hidden
      />

      <div className="mt-4 grid grid-cols-[auto_1fr] gap-5">
        <figure className="w-[128px]">
          <div
            className={cn(
              "relative aspect-[3/4] overflow-hidden bg-gradient-to-br",
              wedding.gradient,
            )}
          >
            <PhotoGrain />
          </div>
          <figcaption
            className="mt-2 text-[9px] italic"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: INK_MUTED,
              lineHeight: 1.35,
            }}
          >
            The mandap, built in silence before the family arrived. {wedding.venueType}, {wedding.toCity}.
          </figcaption>
          <p
            className="mt-1 text-[7.5px] font-semibold uppercase"
            style={{ color: INK_FAINT, letterSpacing: "0.22em" }}
          >
            Fig. 01
          </p>
        </figure>

        <div
          className="text-[10.5px]"
          style={{
            fontFamily: "'Cormorant Garamond', 'Source Serif 4', Georgia, serif",
            color: INK,
            lineHeight: 1.4,
            textAlign: "justify",
            hyphens: "auto",
          }}
        >
          {right.map((p, i) => (
            <p key={i} className="mb-2.5">{p}</p>
          ))}
        </div>
      </div>

      <p
        className="mt-auto border-t pt-3 text-[9px] font-semibold uppercase"
        style={{ color: INK_MUTED, letterSpacing: "0.24em", borderColor: RULE }}
      >
        {wedding.date} · {wedding.toCity} · {wedding.guestCount} · End of Feature
      </p>
    </div>
  );
}

function FeatureTriptych({
  side,
  wedding,
}: {
  side: "left" | "right";
  wedding: FlipbookWedding;
}) {
  if (side === "left") {
    return (
      <div className="relative h-full w-full bg-white p-1.5">
        <div className="grid h-full grid-cols-2 grid-rows-[1fr_auto] gap-[3px]">
          <div
            className={cn(
              "relative row-span-1 overflow-hidden bg-gradient-to-br",
              wedding.gradient,
            )}
          >
            <PhotoGrain />
          </div>
          <div
            className={cn(
              "relative row-span-1 overflow-hidden bg-gradient-to-tr",
              wedding.gradient,
            )}
          >
            <PhotoGrain />
          </div>
          <div
            className="col-span-2 flex items-end justify-between px-1 pb-1 pt-2"
            style={{ color: INK }}
          >
            <p
              className="text-[8.5px] font-semibold uppercase"
              style={{ letterSpacing: "0.32em" }}
            >
              I. The Morning
            </p>
            <p
              className="text-[8.5px] font-semibold uppercase"
              style={{ color: INK_MUTED, letterSpacing: "0.28em" }}
            >
              II. The Mandap
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative h-full w-full bg-white p-1.5">
      <div className="grid h-full grid-cols-1 grid-rows-[1fr_auto] gap-[3px]">
        <div
          className={cn(
            "relative overflow-hidden bg-gradient-to-br",
            wedding.gradient,
          )}
        >
          <PhotoGrain />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.0) 40%)",
            }}
          />
          <p
            className="absolute left-3 top-3 text-[8.5px] font-semibold uppercase text-white/95"
            style={{ letterSpacing: "0.32em" }}
          >
            III. The Departure
          </p>
        </div>

        <div
          className="mt-1 flex flex-wrap items-end justify-between gap-3 px-1 pb-1 pt-2"
          style={{ color: INK }}
        >
          <div className="min-w-0 flex-1">
            <p
              className="text-[8.5px] font-semibold uppercase"
              style={{ color: TERRACOTTA, letterSpacing: "0.32em" }}
            >
              {wedding.season} · {wedding.year}
            </p>
            <p
              className="mt-1 tracking-[-0.015em]"
              style={{
                fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
                fontSize: "clamp(22px, 2.6vw, 32px)",
                fontWeight: 500,
                textTransform: "uppercase",
                lineHeight: 0.95,
              }}
            >
              {wedding.coupleNames}
            </p>
          </div>
          <p
            className="max-w-[280px] text-right text-[11px] italic"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: INK,
              lineHeight: 1.35,
            }}
          >
            &ldquo;{wedding.quote}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Vendor spotlight ──────────────────────────────────────────────────────

function VendorSpotlightPage({ vendor }: { vendor: Vendor }) {
  return (
    <div className="flex h-full flex-col px-10 pb-10 pt-14">
      {/* Top meta strip — no icons, just typography */}
      <div
        className="flex items-center justify-between border-y py-1.5"
        style={{ borderColor: RULE }}
      >
        <p
          className="text-[9px] font-semibold uppercase"
          style={{ color: INK, letterSpacing: "0.34em" }}
        >
          Spotlight No. {(vendor.id.charCodeAt(1) || 0) + 1}
        </p>
        <p
          className="text-[9px] font-semibold uppercase"
          style={{ color: TERRACOTTA, letterSpacing: "0.3em" }}
        >
          {vendor.category}
        </p>
      </div>

      {/* Hero image — full bleed, single image, generous framing */}
      <div
        className={cn(
          "relative mt-4 aspect-[16/11] w-full overflow-hidden bg-gradient-to-br",
          vendor.gradient,
        )}
      >
        <PhotoGrain />
      </div>
      <p
        className="mt-1.5 text-[8.5px] uppercase"
        style={{ color: INK_FAINT, letterSpacing: "0.22em" }}
      >
        Fig. 01 · From the house's spring archive, {vendor.location}.
      </p>

      {/* Name — oversized, all-caps, architectural */}
      <h2
        className="mt-5 tracking-[-0.015em]"
        style={{
          fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
          fontSize: "clamp(34px, 4.2vw, 54px)",
          fontWeight: 500,
          lineHeight: 0.92,
          color: INK,
          textTransform: "uppercase",
        }}
      >
        {vendor.name}
      </h2>
      <p
        className="mt-1.5 italic"
        style={{
          fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
          fontSize: "15px",
          fontWeight: 400,
          color: INK_MUTED,
          lineHeight: 1.3,
        }}
      >
        {vendor.tagline}
      </p>

      <p
        className="mt-3 max-w-[520px] text-[11px]"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          color: INK,
          lineHeight: 1.45,
          textAlign: "justify",
          hyphens: "auto",
        }}
      >
        {vendor.blurb}
      </p>

      <div
        className="mt-auto grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-t pt-3 text-[8.5px] font-semibold uppercase"
        style={{ color: INK, letterSpacing: "0.26em", borderColor: RULE }}
      >
        <span>{vendor.location}</span>
        <span
          className="text-center"
          style={{ color: TERRACOTTA, letterSpacing: "0.32em" }}
        >
          Featured in {vendor.featuredIn} weddings
        </span>
        <span className="text-right" style={{ color: INK_MUTED }}>
          Ananya.Studio/Vendors
        </span>
      </div>
    </div>
  );
}

// ── Couple Q&A ───────────────────────────────────────────────────────────

function QaPage({ qa }: { qa: CoupleQa }) {
  return (
    <div className="relative flex h-full flex-col px-10 pb-10 pt-14">
      <figure className="pointer-events-none absolute right-8 top-12 w-[112px]">
        <div
          className={cn(
            "relative aspect-[3/4] overflow-hidden bg-gradient-to-br",
            qa.gradient,
          )}
        >
          <PhotoGrain />
        </div>
      </figure>

      <p
        className="text-[9px] font-semibold uppercase"
        style={{ color: TERRACOTTA, letterSpacing: "0.32em" }}
      >
        Voices · In Conversation
      </p>

      <h2
        className="mt-3 max-w-[60%] tracking-[-0.02em]"
        style={{
          fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
          fontSize: "clamp(32px, 4vw, 48px)",
          fontWeight: 500,
          lineHeight: 0.94,
          color: INK,
          textTransform: "uppercase",
        }}
      >
        {qa.couple}
      </h2>

      <p
        className="mt-1.5 text-[10px] font-semibold uppercase"
        style={{ color: INK_MUTED, letterSpacing: "0.24em" }}
      >
        {qa.location} · Interview by Arohi Menon
      </p>

      <div
        className="mt-3 h-px"
        style={{ background: "rgba(10,10,10,0.22)" }}
        aria-hidden
      />

      <div className="mt-5 flex-1 overflow-hidden">
        <div className="max-w-[78%] space-y-[22px]">
          {qa.items.map((it, i) => (
            <div key={i} className="break-inside-avoid">
              <p
                className="text-[10px]"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: "italic",
                  color: "#888",
                  lineHeight: 1.35,
                }}
              >
                {it.q}
              </p>
              <p
                className="mt-1.5 text-[11.5px]"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  color: "#1A1A1A",
                  lineHeight: 1.45,
                  textAlign: "justify",
                  hyphens: "auto",
                }}
              >
                {it.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Moodboard ────────────────────────────────────────────────────────────

function MoodboardPage({ board }: { board: Moodboard }) {
  return (
    <div className="flex h-full flex-col px-10 pb-10 pt-14">
      <div
        className="flex items-baseline justify-between border-b pb-1.5"
        style={{ borderColor: RULE }}
      >
        <p
          className="text-[9px] font-semibold uppercase"
          style={{ color: TERRACOTTA, letterSpacing: "0.32em" }}
        >
          Palette Study
        </p>
        <p
          className="text-[8.5px] uppercase"
          style={{ color: INK_MUTED, letterSpacing: "0.24em" }}
        >
          {board.theme}
        </p>
      </div>

      <h2
        className="mt-3 tracking-[-0.02em]"
        style={{
          fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
          fontSize: "clamp(44px, 5.6vw, 68px)",
          fontWeight: 500,
          lineHeight: 0.9,
          color: INK,
          textTransform: "uppercase",
        }}
      >
        {board.label}
      </h2>

      {/* Palette strip — labelled hexes, thin, architectural */}
      <div className="mt-4">
        <div
          className="grid gap-[2px]"
          style={{ gridTemplateColumns: `repeat(${board.palette.length}, 1fr)` }}
        >
          {board.palette.map((hex) => (
            <div
              key={hex}
              className="h-10"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
        <div
          className="mt-1 grid gap-[2px]"
          style={{ gridTemplateColumns: `repeat(${board.palette.length}, 1fr)` }}
        >
          {board.palette.map((hex) => (
            <p
              key={hex}
              className="text-[7.5px] font-semibold uppercase"
              style={{ color: INK, letterSpacing: "0.18em" }}
            >
              {hex.replace("#", "")}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-4 grid flex-1 grid-cols-3 grid-rows-3 gap-[3px] overflow-hidden">
        <figure
          className={cn(
            "relative col-span-2 row-span-2 overflow-hidden bg-gradient-to-br",
            board.items[0]?.gradient ?? "from-[#C48A6A] to-[#9C7A3E]",
          )}
        >
          <PhotoGrain />
          <figcaption
            className="absolute inset-x-0 bottom-0 px-2 pb-1.5 text-[8.5px] font-semibold uppercase text-white/95"
            style={{
              letterSpacing: "0.24em",
              background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
            }}
          >
            {board.items[0]?.caption}
          </figcaption>
        </figure>
        {board.items.slice(1, 5).map((it, i) => (
          <figure
            key={i}
            className={cn("relative overflow-hidden bg-gradient-to-br", it.gradient)}
          >
            <PhotoGrain />
            {it.caption && (
              <figcaption
                className="absolute inset-x-0 bottom-0 px-1.5 pb-1 text-[7.5px] font-semibold uppercase text-white/95"
                style={{
                  letterSpacing: "0.22em",
                  background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                }}
              >
                {it.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      <p
        className="mt-3 max-w-[520px] text-[10.5px] italic"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          color: INK_MUTED,
          lineHeight: 1.4,
        }}
      >
        A palette study — colours, textures, and details that kept appearing in the submissions we couldn&rsquo;t stop re-reading.
      </p>
    </div>
  );
}

// ── The Edit ─────────────────────────────────────────────────────────────

function EditListPage({ edit }: { edit: EditList }) {
  return (
    <div className="flex h-full flex-col px-10 pb-10 pt-14">
      <p
        className="text-[9px] font-semibold uppercase"
        style={{ color: TERRACOTTA, letterSpacing: "0.32em" }}
      >
        {edit.kicker} · Issue 07
      </p>
      <h2
        className="mt-2 tracking-[-0.02em]"
        style={{
          fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
          fontSize: "clamp(30px, 3.8vw, 46px)",
          fontWeight: 500,
          lineHeight: 0.92,
          color: INK,
        }}
      >
        {edit.title.replace(/\.$/, "")}
        <span style={{ color: TERRACOTTA }}>.</span>
      </h2>
      <p
        className="mt-2 max-w-[440px] text-[11px] italic"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          color: INK_MUTED,
          lineHeight: 1.4,
        }}
      >
        {edit.subtitle}
      </p>

      <div className="mt-4 h-px" style={{ background: INK }} aria-hidden />

      <ul className="mt-3 flex-1 overflow-hidden">
        {edit.items.map((it, i) => (
          <li
            key={i}
            className="flex items-center gap-3 border-b py-2"
            style={{ borderColor: "rgba(0,0,0,0.1)" }}
          >
            <span
              className="w-8 shrink-0 text-[22px] font-semibold tabular-nums"
              style={{
                fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
                color: TERRACOTTA,
                lineHeight: 1,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div
              className={cn(
                "relative h-12 w-14 shrink-0 overflow-hidden bg-gradient-to-br",
                it.gradient,
              )}
            >
              <PhotoGrain />
            </div>
            <p
              className="flex-1 tracking-[-0.01em]"
              style={{
                fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
                fontSize: "16px",
                fontWeight: 500,
                color: INK,
                lineHeight: 1.15,
              }}
            >
              {it.label}
            </p>
            <span
              className="shrink-0 text-[8.5px] font-semibold uppercase"
              style={{ color: INK_FAINT, letterSpacing: "0.24em" }}
            >
              See p.{String((i + 1) * 4).padStart(3, "0")}
            </span>
          </li>
        ))}
      </ul>

      <p
        className="mt-auto border-t pt-3 text-[8.5px] font-semibold uppercase"
        style={{ color: INK_MUTED, letterSpacing: "0.26em", borderColor: RULE }}
      >
        Curated by the editors · {edit.items.length} picks · Tear-out page
      </p>
    </div>
  );
}

// ── Letter ───────────────────────────────────────────────────────────────

function LetterPage({ letter }: { letter: Letter }) {
  return (
    <div className="flex h-full flex-col px-10 pb-10 pt-14">
      <div
        className="flex items-center justify-between border-b pb-1.5"
        style={{ borderColor: RULE }}
      >
        <p
          className="text-[9px] font-semibold uppercase"
          style={{ color: TERRACOTTA, letterSpacing: "0.32em" }}
        >
          Letters · Reader Submissions
        </p>
        <p
          className="text-[8.5px] uppercase"
          style={{ color: INK_MUTED, letterSpacing: "0.24em" }}
        >
          Unedited · Pp. Select
        </p>
      </div>

      <div className="mt-4 grid grid-cols-[auto_1fr] items-end gap-4">
        <div
          className={cn(
            "relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gradient-to-br",
            letter.gradient,
          )}
        >
          <PhotoGrain />
        </div>
        <div>
          <h2
            className="tracking-[-0.01em]"
            style={{
              fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
              fontSize: "clamp(26px, 3.2vw, 38px)",
              fontWeight: 500,
              fontStyle: "italic",
              lineHeight: 0.95,
              color: INK,
            }}
          >
            A note from<br />
            {letter.from}.
          </h2>
          <p
            className="mt-1 text-[9px] font-semibold uppercase"
            style={{ color: INK_MUTED, letterSpacing: "0.24em" }}
          >
            {letter.location} · {letter.date}
          </p>
        </div>
      </div>

      <div className="mt-4 h-px" style={{ background: INK }} aria-hidden />

      <div
        className="mt-3 flex-1 overflow-hidden text-[11.5px] italic"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          color: INK,
          lineHeight: 1.45,
        }}
      >
        {letter.body.map((p, i) => (
          <p
            key={i}
            className="mb-2.5 whitespace-pre-line"
          >
            {i === 0 ? (
              <>
                <span
                  className="float-left mr-[6px] not-italic"
                  style={{
                    fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
                    fontSize: "54px",
                    lineHeight: 0.82,
                    fontWeight: 500,
                    color: INK,
                    paddingTop: 2,
                  }}
                >
                  {p.charAt(0).toUpperCase()}
                </span>
                {p.slice(1)}
              </>
            ) : (
              p
            )}
          </p>
        ))}
      </div>

      <p
        className="mt-auto border-t pt-3 text-[8.5px] font-semibold uppercase"
        style={{ color: INK_FAINT, letterSpacing: "0.26em", borderColor: RULE }}
      >
        Send your letter · Ananya.Studio/Letters
      </p>
    </div>
  );
}

// ── Divider ──────────────────────────────────────────────────────────────

function DividerPage({ section, subtitle }: { section: string; subtitle?: string }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-white"
      style={{ color: INK }}
    >
      <PhotoGrain />
      <div className="text-center">
        <p
          className="text-[9px] font-semibold uppercase"
          style={{ color: TERRACOTTA, letterSpacing: "0.38em" }}
        >
          Part · {section.slice(0, 1).toUpperCase()}
        </p>
        <h2
          className="mt-4 tracking-[-0.02em]"
          style={{
            fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
            fontSize: "clamp(54px, 7vw, 92px)",
            fontWeight: 500,
            fontStyle: "italic",
            lineHeight: 0.9,
            color: INK,
          }}
        >
          {section}
        </h2>
        <div
          className="mx-auto mt-4 h-px w-16"
          style={{ background: INK }}
          aria-hidden
        />
        {subtitle && (
          <p
            className="mt-3 italic text-[13px]"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: INK_MUTED,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Back cover ───────────────────────────────────────────────────────────

function BackCoverPage({
  nextIssue,
}: {
  nextIssue: { title: string; teaser: string; weddings: FlipbookWedding[] };
}) {
  return (
    <div className="flex h-full flex-col bg-white px-10 pb-10 pt-10">
      <div
        className="flex items-baseline justify-between border-b pb-2"
        style={{ borderColor: RULE }}
      >
        <p
          className="text-[9px] font-semibold uppercase"
          style={{ color: INK, letterSpacing: "0.34em" }}
        >
          Ananya Magazine
        </p>
        <p
          className="text-[9px] font-semibold uppercase"
          style={{ color: TERRACOTTA, letterSpacing: "0.32em" }}
        >
          Next · Winter 2026
        </p>
      </div>

      <h2
        className="mt-5 tracking-[-0.02em]"
        style={{
          fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
          fontSize: "clamp(56px, 7.4vw, 98px)",
          fontWeight: 500,
          lineHeight: 0.86,
          color: INK,
          textTransform: "uppercase",
        }}
      >
        {nextIssue.title}
      </h2>
      <p
        className="mt-4 max-w-[420px] italic"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "16px",
          color: INK,
          lineHeight: 1.35,
        }}
      >
        {nextIssue.teaser}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-[3px]">
        {nextIssue.weddings.map((w, i) => (
          <figure key={w.slug} className="relative aspect-[3/4] overflow-hidden">
            <div className={cn("absolute inset-0 bg-gradient-to-br", w.gradient)} />
            <PhotoGrain />
            <figcaption
              className="absolute inset-x-0 bottom-0 px-2 pb-1.5 text-[8.5px] font-semibold uppercase text-white/95"
              style={{
                letterSpacing: "0.26em",
                background: "linear-gradient(to top, rgba(0,0,0,0.45), transparent)",
              }}
            >
              Ch. {String(i + 1).padStart(2, "0")}
            </figcaption>
          </figure>
        ))}
      </div>

      <div
        className="mt-auto flex items-end justify-between border-t pt-4"
        style={{ borderColor: RULE }}
      >
        <div>
          <p
            className="tracking-[-0.015em]"
            style={{
              fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
              fontSize: "22px",
              fontWeight: 500,
              color: INK,
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            Ananya Studio
          </p>
          <p
            className="mt-1 text-[9px] font-semibold uppercase"
            style={{ color: INK_MUTED, letterSpacing: "0.28em" }}
          >
            Submit your wedding · ananya.studio/submit
          </p>
        </div>
        <p
          className="text-[9px] font-semibold uppercase"
          style={{ color: INK_FAINT, letterSpacing: "0.28em" }}
        >
          © 2026
        </p>
      </div>
    </div>
  );
}

// ── Shared visual helpers ────────────────────────────────────────────────

function AsymmetricPhotos({ gradient }: { gradient: string }) {
  return (
    <div className="mt-5 grid h-[170px] grid-cols-5 grid-rows-2 gap-1.5">
      <div className={cn("relative col-span-3 row-span-2 overflow-hidden rounded-sm bg-gradient-to-br", gradient)}>
        <PhotoGrain />
      </div>
      <div className={cn("relative col-span-2 overflow-hidden rounded-sm bg-gradient-to-tr", gradient)}>
        <PhotoGrain />
      </div>
      <div className={cn("relative col-span-2 overflow-hidden rounded-sm bg-gradient-to-bl", gradient)}>
        <PhotoGrain />
      </div>
    </div>
  );
}

function QuickStatsSidebar({ wedding }: { wedding: FlipbookWedding }) {
  return (
    <aside
      className="flex w-[172px] shrink-0 flex-col gap-3 border-l pl-4"
      style={{ borderColor: RULE }}
    >
      <p
        className="text-[8.5px] font-semibold uppercase"
        style={{ color: TERRACOTTA, letterSpacing: "0.3em" }}
      >
        The Details
      </p>
      <StatRow icon={<Users size={10} />} label="Guests" value={wedding.guestCount} />
      <StatRow icon={<Flower2 size={10} />} label="Tradition" value={wedding.tradition} />
      <StatRow icon={<MapPin size={10} />} label="Venue" value={`${wedding.toCity} · ${wedding.venueType}`} />
      <StatRow icon={<Calendar size={10} />} label="Dates" value={wedding.date} />
      <StatRow icon={<Heart size={10} />} label="Loves" value={wedding.loves.toLocaleString()} />

      <div className="mt-1 border-t pt-3" style={{ borderColor: RULE }}>
        <p
          className="text-[8.5px] font-semibold uppercase"
          style={{ color: TERRACOTTA, letterSpacing: "0.3em" }}
        >
          Credits
        </p>
        <ul className="mt-2 space-y-2">
          {[
            { role: "Planning", name: "The Soirée Co." },
            { role: "Photography", name: "Joseph Radhik" },
            { role: "Florals", name: "Petal & Provenance" },
            { role: "Catering", name: "Kitchen House" },
            { role: "Mehendi", name: "Aanya Henna Atelier" },
          ].map((v) => (
            <li key={v.role} className="leading-[1.25]">
              <span
                className="block text-[7.5px] font-semibold uppercase"
                style={{ color: INK_FAINT, letterSpacing: "0.22em" }}
              >
                {v.role}
              </span>
              <span
                className="text-[10.5px]"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  color: INK,
                }}
              >
                {v.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function StatRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="border-b pb-1.5" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
      <div
        className="flex items-center gap-1 text-[7.5px] font-semibold uppercase"
        style={{ color: INK_FAINT, letterSpacing: "0.22em" }}
      >
        {icon}
        {label}
      </div>
      <p
        className="mt-0.5 tracking-[-0.005em]"
        style={{
          fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
          fontSize: "13px",
          fontWeight: 500,
          lineHeight: 1.15,
          color: INK,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function PhotoGrain() {
  return (
    <span
      aria-hidden
      className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.5) 1px, transparent 1px)",
        backgroundSize: "3px 3px, 5px 5px",
        backgroundPosition: "0 0, 1px 1px",
      }}
    />
  );
}

// ── Narrative generators ─────────────────────────────────────────────────

function buildNarrative(w: FlipbookWedding): string[] {
  const first = w.coupleNames.split(" & ")[0];
  return [
    `when ${w.coupleNames} set their date for ${w.date}, they weren't chasing a trend — they were chasing a feeling. ${w.fromCity} had raised them; ${w.toCity} was where they wanted to start something new. over several days, they wove a ${w.tradition.toLowerCase()} celebration that felt less like a production and more like a love letter, read aloud, to everyone who shaped them.`,
    `the ${w.venueType.toLowerCase()} became a stage for the small rituals: ${first}'s grandmother's gold, tied into the mehndi; the welcome envelopes hand-stitched by cousins flown in a week early; a first-dance playlist debated over six months of voice notes. the details weren't for the photos. they were for the people in them.`,
    `"${w.quote}" — ${first} told us, a week after the last guest had flown home. the photographs, still being colour-graded, will live in the issue. but the story, as always, is theirs.`,
  ];
}

function buildLongNarrative(w: FlipbookWedding): string[] {
  const first = w.coupleNames.split(" & ")[0];
  const second = w.coupleNames.split(" & ")[1] ?? "partner";
  return [
    `there is a version of this wedding that lives only in the group chat. it is 847 messages long, and it contains two seating-chart revisions, a three-day argument about whether the chaat counter should open before or after the ceremony, and a photograph of ${first}'s grandmother holding a shoe — which, if you ask her, is the best photo of the week.`,
    `the official story starts on a different day. ${w.date}, ${w.toCity}. a ${w.venueType.toLowerCase()} rented for a weekend, a ${w.tradition.toLowerCase()} ceremony rehearsed in two languages, and a guest list of ${w.guestCount.toLowerCase()} that had been cut, re-cut, and quietly expanded three times.`,
    `"${w.quote}" ${first} said later, standing in the kitchen at four in the morning, eating leftover biryani out of a catering tray with ${second}. the planner had gone home. the florist had gone home. everyone had gone home.`,
    `what remains, in the end, is the kind of wedding that doesn't belong to the industry. it belongs to the two of them — and to the small, specific number of people who showed up with the right kind of stories.`,
    `you could call it restrained, but that would miss the point. it was not restrained. it was precisely as loud as it needed to be. the difference, ${first} pointed out, is that they had chosen the volume themselves.`,
    `we talked for two hours in a hotel lobby four months later. ${second} ordered a filter coffee and forgot to drink it. ${first} wore their mother's dupatta, pinned as a scarf, because the air-conditioning was set to funeral. they are, if you are curious, very much still in love.`,
  ];
}

function splitAtMidpoint<T>(arr: T[]): [T[], T[]] {
  const mid = Math.ceil(arr.length / 2);
  return [arr.slice(0, mid), arr.slice(mid)];
}

// ── Bottom bar ──────────────────────────────────────────────────────────

function BottomBar({
  pages,
  activeIndex,
  activeEndIndex,
  onJump,
}: {
  pages: MagazinePage[];
  activeIndex: number;
  activeEndIndex: number;
  onJump: (pageIndex: number) => void;
}) {
  const progress = ((activeEndIndex + 1) / pages.length) * 100;
  return (
    <div className="relative z-10 border-t border-white/10 bg-black/40 px-3 pb-3 pt-2.5 backdrop-blur-md md:px-8">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3">
        <div className="flex-1 overflow-x-auto">
          <div className="flex items-end gap-1.5">
            {pages.map((p, i) => {
              const active = i >= activeIndex && i <= activeEndIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onJump(i)}
                  aria-label={`Jump to page ${i + 1}`}
                  className={cn(
                    "group relative h-10 w-7 shrink-0 overflow-hidden rounded-[2px] border transition-all md:h-12 md:w-9",
                    active
                      ? "border-[color:var(--tc,#C45D3E)] ring-1 ring-[color:var(--tc,#C45D3E)]"
                      : "border-white/15 opacity-60 hover:opacity-100",
                  )}
                  style={{ ["--tc" as unknown as string]: TERRACOTTA } as CSSProperties}
                >
                  <ThumbnailContent page={p} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: TERRACOTTA }}
            />
          </div>
          <span className="text-[11px] tabular-nums text-white/60">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}

function ThumbnailContent({ page }: { page: MagazinePage }) {
  if (page.kind === "feature") {
    return <div className={cn("absolute inset-0 bg-gradient-to-br", page.wedding.gradient)} />;
  }
  if (page.kind === "vendor") {
    return <div className={cn("absolute inset-0 bg-gradient-to-br", page.vendor.gradient)} />;
  }
  if (page.kind === "qa") {
    return <div className={cn("absolute inset-0 bg-gradient-to-br", page.qa.gradient)} />;
  }
  if (page.kind === "letter") {
    return <div className={cn("absolute inset-0 bg-gradient-to-br", page.letter.gradient)} />;
  }
  if (page.kind === "moodboard") {
    const p = page.board.palette;
    return (
      <div className="absolute inset-0 flex">
        {p.slice(0, 4).map((c, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: c }} />
        ))}
      </div>
    );
  }
  if (page.kind === "cover" || page.kind === "back-cover") {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: "#FFFFFF" }}
      >
        <span
          className="text-[7px] font-semibold uppercase"
          style={{ color: INK, letterSpacing: "0.22em" }}
        >
          Ananya
        </span>
      </div>
    );
  }
  return (
    <div
      className="absolute inset-0"
      style={{ background: "#FFFFFF", borderLeft: `2px solid ${TERRACOTTA}55` }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Share / Instagram export
// ═══════════════════════════════════════════════════════════════════════════

type ExportFormat = "story" | "post" | "square";

const FORMAT_DIM: Record<ExportFormat, { w: number; h: number; aspect: string; label: string }> = {
  story: { w: 1080, h: 1920, aspect: "9:16", label: "Instagram Story" },
  post: { w: 1080, h: 1350, aspect: "4:5", label: "Instagram Post" },
  square: { w: 1080, h: 1080, aspect: "1:1", label: "Square" },
};

type ShareTarget =
  | { kind: "page"; pageIndex: number; initialFormat?: ExportFormat }
  | {
      kind: "spread";
      leftIndex: number;
      rightIndex: number;
      initialFormat?: ExportFormat;
    };

const SHARE_TIP_KEY = "ananya_mag_share_tip_seen";

function SharePanel({
  target,
  pages,
  issueTitle,
  issueSub,
  issueNumber,
  onClose,
  onExported,
}: {
  target: ShareTarget;
  pages: MagazinePage[];
  issueTitle: string;
  issueSub: string;
  issueNumber: string;
  onClose: () => void;
  onExported: (message: string) => void;
}) {
  const isSpread = target.kind === "spread";
  const primaryPage = isSpread ? pages[target.leftIndex] : pages[target.pageIndex];
  const companionPage = isSpread ? pages[target.rightIndex] : undefined;

  const [format, setFormat] = useState<ExportFormat>(
    target.initialFormat ?? (isSpread ? "post" : "story"),
  );
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLCanvasElement | null>(null);

  const featureWedding = useMemo<FlipbookWedding | null>(() => {
    if (isSpread) {
      for (const p of [primaryPage, companionPage]) {
        if (p && p.kind === "feature") return p.wedding;
      }
    }
    return null;
  }, [isSpread, primaryPage, companionPage]);

  const primaryContent = useMemo(
    () =>
      primaryPage
        ? pageToExportContent(primaryPage, issueTitle, issueSub, issueNumber)
        : null,
    [primaryPage, issueTitle, issueSub, issueNumber],
  );

  const coverContent = useMemo<SpreadCoverContent | null>(
    () =>
      isSpread
        ? buildSpreadCoverContent({
            wedding: featureWedding,
            leftPage: primaryPage,
            rightPage: companionPage,
            issueTitle,
            issueSub,
            issueNumber,
          })
        : null,
    [isSpread, featureWedding, primaryPage, companionPage, issueTitle, issueSub, issueNumber],
  );

  // Render preview canvas at reduced scale.
  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const { w, h } = FORMAT_DIM[format];
    const scale = 0.32;
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);
    if (isSpread && coverContent) {
      renderSpreadCoverCanvas(ctx, format, coverContent);
    } else if (primaryContent) {
      renderExportCanvas(ctx, format, primaryContent);
    }
  }, [format, primaryContent, coverContent, isSpread]);

  const handleDownload = useCallback(async () => {
    if (!primaryPage) return;
    setExporting(true);
    try {
      if (isSpread && companionPage && coverContent && primaryContent) {
        await downloadSpreadCarousel({
          format,
          issueTitle,
          issueSub,
          issueNumber,
          leftPage: primaryPage,
          rightPage: companionPage,
          coverContent,
          leftIndex: target.leftIndex,
        });
        onExported("Saved! Ready to post \u2728");
        return;
      }
      if (!primaryContent) return;
      const blob = await renderExportBlob(format, primaryContent);
      if (!blob) return;
      const filename = exportFilename(primaryPage, format, issueNumber);

      const nav = typeof navigator !== "undefined" ? navigator : undefined;
      const canShareFn = nav && typeof nav.share === "function"
        ? (nav as Navigator & { canShare?: (d: ShareData) => boolean }).canShare
        : undefined;
      if (nav && canShareFn) {
        const file = new File([blob], filename, { type: "image/png" });
        const shareData = { files: [file], title: primaryContent.title } as ShareData;
        if (canShareFn(shareData)) {
          try {
            await nav.share(shareData);
            onExported("Shared! Ready to post \u2728");
            return;
          } catch {
            // Fall through to download.
          }
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onExported("Saved! Ready to post \u2728");
    } finally {
      setExporting(false);
    }
  }, [
    format,
    primaryContent,
    coverContent,
    primaryPage,
    companionPage,
    issueNumber,
    issueTitle,
    issueSub,
    isSpread,
    target,
    onExported,
  ]);

  const linkIndex = isSpread ? target.leftIndex : target.pageIndex;
  const handleCopyLink = useCallback(async () => {
    const base = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "";
    const url = `${base}?tab=editorial&sub=magazine&fbpage=${linkIndex}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignored
    }
  }, [linkIndex]);

  if (!primaryPage || (isSpread && (!companionPage || !coverContent))) return null;

  const headingLabel = isSpread ? "Share full spread" : "Share this page";
  const headingTitle = isSpread
    ? featureWedding?.coupleNames ?? "ananya spread"
    : primaryContent?.title ?? "";
  const footerHint = isSpread
    ? "Three slides: a branded cover card, then each page. Post to Instagram as a carousel."
    : `Exports include a wordmark, issue identifier, and a scan code back to the full page. Page ${
        target.kind === "page" ? target.pageIndex + 1 : 1
      } of ${pages.length}.`;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-[min(92vw,720px)] overflow-hidden rounded-2xl border border-white/10 bg-[#1a1310] text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p
              className="text-[10.5px] font-medium uppercase tracking-[0.24em]"
              style={{ color: TERRACOTTA }}
            >
              {headingLabel}
            </p>
            <h3
              className="mt-1 lowercase"
              style={{
                fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
                fontSize: "22px",
                fontWeight: 500,
              }}
            >
              {headingTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share panel"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 transition-colors hover:bg-white/10"
          >
            <X size={14} strokeWidth={1.8} />
          </button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr]">
          <div className="flex items-center justify-center">
            <div className="relative rounded-md bg-[#0c0806] p-2 shadow-xl">
              <canvas
                ref={previewRef}
                className="block max-h-[340px]"
                style={{ imageRendering: "auto" }}
              />
              {isSpread && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-[#1a1310] px-3 py-1 text-[9.5px] font-medium uppercase tracking-[0.22em] text-white/70">
                  Slide 1 of 3 · Cover card
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2">
              {(["story", "post", "square"] as ExportFormat[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors",
                    format === f
                      ? "border-[color:var(--tc,#C45D3E)] bg-white/5"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/5",
                  )}
                  style={{ ["--tc" as unknown as string]: TERRACOTTA } as CSSProperties}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/90">
                    <span
                      className={cn(
                        "inline-block border border-white/70",
                        f === "story" && "h-[14px] w-[8px]",
                        f === "post" && "h-[14px] w-[11px]",
                        f === "square" && "h-[12px] w-[12px]",
                      )}
                      aria-hidden
                    />
                    <span>{FORMAT_DIM[f].label}</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/50">
                    {FORMAT_DIM[f].aspect} · {FORMAT_DIM[f].w}×{FORMAT_DIM[f].h}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={exporting}
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: TERRACOTTA }}
              >
                {exporting ? (
                  isSpread ? "Rendering carousel..." : "Rendering..."
                ) : (
                  <>
                    <Download size={14} strokeWidth={1.8} />
                    {isSpread ? "Download carousel (3 slides)" : "Download PNG"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-[13px] font-medium text-white/90 transition-colors hover:bg-white/10"
              >
                {copied ? (
                  <>
                    <Check size={14} strokeWidth={1.8} />
                    Link copied
                  </>
                ) : (
                  <>
                    <LinkIcon size={14} strokeWidth={1.8} />
                    Copy link to this {isSpread ? "spread" : "page"}
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] leading-[1.55] text-white/55">{footerHint}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── First-time tooltip + saved toast ───────────────────────────────────────

function FirstTimeShareTip({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, 6500);
    return () => window.clearTimeout(t);
  }, [onDismiss]);
  return (
    <button
      type="button"
      onClick={onDismiss}
      className="share-tip"
      aria-label="Dismiss tip"
    >
      <Sparkles size={12} strokeWidth={2} />
      <span>Tear out any page for Instagram</span>
    </button>
  );
}

function SavedToast({ message }: { message: string }) {
  return (
    <div className="saved-toast" role="status" aria-live="polite">
      <span className="saved-toast-mark" aria-hidden>
        <Check size={12} strokeWidth={2.4} />
      </span>
      <span className="saved-toast-text">{message}</span>
    </div>
  );
}

// ── Export content model + renderers ────────────────────────────────────

type HeroSpec =
  | { type: "gradient"; gradient: string }
  | { type: "mosaic"; items: { gradient: string; label?: string }[] }
  | { type: "palette"; palette: string[] };

type ExportContent = {
  kicker: string;
  title: string;
  subtitle?: string;
  body: string;
  attribution?: string;
  meta: string;
  hero: HeroSpec;
  issueTitle: string;
  issueSub: string;
  issueNumber: string;
  deepLinkLabel: string;
};

function pageToExportContent(
  page: MagazinePage,
  issueTitle: string,
  issueSub: string,
  issueNumber: string,
): ExportContent {
  const base = { issueTitle, issueSub, issueNumber, deepLinkLabel: "read at ananya/magazine" };
  switch (page.kind) {
    case "cover":
      return {
        ...base,
        kicker: "The Real Weddings Issue",
        title: "ananya magazine.",
        subtitle: issueSub,
        body: `Featuring ${page.weddings.slice(0, 3).map((w) => w.coupleNames).join(" · ")}.`,
        meta: `${issueNumber} · ${issueTitle}`,
        hero: {
          type: "mosaic",
          items: page.weddings.slice(0, 6).map((w) => ({ gradient: w.gradient, label: w.brideFirst })),
        },
      };
    case "toc":
      return {
        ...base,
        kicker: "Contents",
        title: "inside this issue.",
        body: page.entries.slice(0, 6).map((e) => `${String(e.page).padStart(2, "0")} · ${e.label}`).join("\n"),
        meta: `${issueNumber} · ${issueTitle}`,
        hero: { type: "palette", palette: ["#E9D5B8", "#C48A6A", "#9C7A3E", "#7E5A34", "#3D312A"] },
      };
    case "editors-note":
      return {
        ...base,
        kicker: page.note.kicker,
        title: `"${page.note.pullQuote}"`,
        body: page.note.body[0],
        attribution: `${page.note.author} · ${page.note.role}`,
        meta: `${issueNumber} · ${issueTitle}`,
        hero: { type: "gradient", gradient: page.note.gradient },
      };
    case "feature":
      return {
        ...base,
        kicker: `${page.wedding.tradition} · ${page.wedding.venueType}`,
        title: page.wedding.coupleNames + ".",
        body: `"${page.wedding.quote}"`,
        meta: `${page.wedding.fromCity} → ${page.wedding.toCity} · ${page.wedding.date} · ${page.wedding.guestCount}`,
        hero: { type: "gradient", gradient: page.wedding.gradient },
      };
    case "vendor":
      return {
        ...base,
        kicker: `${page.vendor.category} · ${page.vendor.location}`,
        title: page.vendor.name + ".",
        subtitle: page.vendor.tagline,
        body: page.vendor.blurb,
        meta: `Featured in ${page.vendor.featuredIn} weddings · ${issueTitle}`,
        hero: { type: "gradient", gradient: page.vendor.gradient },
      };
    case "qa": {
      const pick = page.qa.items[2] ?? page.qa.items[0];
      return {
        ...base,
        kicker: "Couple Q&A",
        title: page.qa.couple + ".",
        body: `${pick.q}\n\n${pick.a}`,
        meta: `${page.qa.location} · ${issueTitle}`,
        hero: { type: "gradient", gradient: page.qa.gradient },
      };
    }
    case "moodboard":
      return {
        ...base,
        kicker: page.board.theme,
        title: page.board.label + ".",
        body: "A palette study from the Fall 2025 issue — colours, textures, and details worth lingering over.",
        meta: `${issueNumber} · ${issueTitle}`,
        hero: { type: "palette", palette: page.board.palette },
      };
    case "edit":
      return {
        ...base,
        kicker: page.edit.kicker,
        title: page.edit.title,
        subtitle: page.edit.subtitle,
        body: page.edit.items.slice(0, 5).map((it, i) => `${it.meta}  ${it.label}`).join("\n"),
        meta: `${issueNumber} · ${issueTitle}`,
        hero: { type: "gradient", gradient: page.edit.items[0]?.gradient ?? "from-[#C48A6A] to-[#9C7A3E]" },
      };
    case "letter":
      return {
        ...base,
        kicker: "A Letter In",
        title: `a note from ${page.letter.from}.`,
        body: page.letter.body[0],
        attribution: `${page.letter.location} · ${page.letter.date}`,
        meta: `${issueNumber} · ${issueTitle}`,
        hero: { type: "gradient", gradient: page.letter.gradient },
      };
    case "divider":
      return {
        ...base,
        kicker: "Section",
        title: page.section.toLowerCase() + ".",
        body: page.subtitle ?? "",
        meta: `${issueNumber} · ${issueTitle}`,
        hero: { type: "palette", palette: ["#F8F2E8", "#ECE2D0"] },
      };
    case "back-cover":
      return {
        ...base,
        kicker: "Next Issue",
        title: page.nextIssue.title.toLowerCase() + ".",
        body: page.nextIssue.teaser,
        meta: `${issueNumber} · ${issueTitle}`,
        hero: {
          type: "mosaic",
          items: page.nextIssue.weddings.map((w) => ({ gradient: w.gradient })),
        },
      };
  }
}

// ── Spread carousel export ───────────────────────────────────────────────

type SpreadCoverContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  issueMeta: string;
  gradient: string;
  issueTitle: string;
  issueNumber: string;
};

function buildSpreadCoverContent({
  wedding,
  leftPage,
  rightPage,
  issueTitle,
  issueSub,
  issueNumber,
}: {
  wedding: FlipbookWedding | null;
  leftPage?: MagazinePage;
  rightPage?: MagazinePage;
  issueTitle: string;
  issueSub: string;
  issueNumber: string;
}): SpreadCoverContent | null {
  if (!leftPage || !rightPage) return null;
  const fallbackGradient =
    (leftPage.kind === "vendor" && leftPage.vendor.gradient) ||
    (rightPage.kind === "vendor" && rightPage.vendor.gradient) ||
    (leftPage.kind === "qa" && leftPage.qa.gradient) ||
    (rightPage.kind === "qa" && rightPage.qa.gradient) ||
    (leftPage.kind === "letter" && leftPage.letter.gradient) ||
    (rightPage.kind === "letter" && rightPage.letter.gradient) ||
    "from-[#E9C8B5] via-[#D8A080] to-[#B56A4A]";

  const title = wedding?.coupleNames ?? issueTitle;
  const subtitle = wedding
    ? `featured in ${issueTitle.toLowerCase()}`
    : issueSub.toLowerCase();
  return {
    eyebrow: "Featured in",
    title,
    subtitle,
    issueMeta: `${issueNumber} · ${issueTitle}`,
    gradient: wedding?.gradient ?? fallbackGradient,
    issueTitle,
    issueNumber,
  };
}

function renderSpreadCoverCanvas(
  ctx: CanvasRenderingContext2D,
  format: ExportFormat,
  content: SpreadCoverContent,
) {
  const { w, h } = FORMAT_DIM[format];

  // Full-bleed gradient hero.
  drawTailwindGradient(ctx, content.gradient, 0, 0, w, h);
  drawGrain(ctx, w, h, 0.14);

  // Dark vignette bottom for legibility.
  const fade = ctx.createLinearGradient(0, 0, 0, h);
  fade.addColorStop(0, "rgba(0,0,0,0.15)");
  fade.addColorStop(0.45, "rgba(0,0,0,0)");
  fade.addColorStop(1, "rgba(0,0,0,0.5)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, w, h);

  const padX = format === "story" ? 80 : 72;
  const topY = format === "story" ? 140 : 110;

  // Eyebrow.
  drawSmallCaps(
    ctx,
    content.eyebrow,
    padX,
    topY,
    "rgba(255,255,255,0.85)",
    format === "story" ? 26 : 22,
    format === "story" ? 5 : 4,
  );

  // Wordmark in the middle.
  const midY = Math.round(h * 0.44);
  ctx.fillStyle = "rgba(255,255,255,0.97)";
  ctx.font = `500 ${format === "story" ? 130 : 108}px "Playfair Display", Georgia, serif`;
  ctx.textBaseline = "top";
  ctx.fillText("ananya", padX, midY);
  ctx.fillText("magazine.", padX, midY + (format === "story" ? 128 : 108));

  // Couple / title.
  const titleY = midY + (format === "story" ? 300 : 260);
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = `italic 400 ${format === "story" ? 44 : 34}px "Playfair Display", Georgia, serif`;
  ctx.textBaseline = "top";
  const titleLines = wrapText(ctx, content.title.toLowerCase(), w - padX * 2);
  const titleLineH = format === "story" ? 52 : 42;
  titleLines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, padX, titleY + i * titleLineH);
  });

  // Subtitle.
  drawSmallCaps(
    ctx,
    content.subtitle,
    padX,
    titleY + Math.min(titleLines.length, 2) * titleLineH + 18,
    "rgba(255,255,255,0.75)",
    format === "story" ? 20 : 16,
    format === "story" ? 3.5 : 3,
  );

  // Footer strip.
  const footerH = format === "story" ? 120 : 96;
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.fillRect(0, h - footerH, w, footerH);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(padX, h - footerH + footerH / 2 - 0.5, w - padX * 2, 1);

  drawSmallCaps(
    ctx,
    "Swipe for the full spread",
    padX,
    h - footerH + 28,
    "rgba(255,255,255,0.95)",
    format === "story" ? 22 : 18,
    format === "story" ? 4 : 3.2,
  );

  drawSmallCaps(
    ctx,
    content.issueMeta,
    padX,
    h - 40,
    "rgba(255,255,255,0.7)",
    format === "story" ? 16 : 13,
    format === "story" ? 3 : 2.4,
  );

  // Slide marker (top right).
  const markerW = format === "story" ? 96 : 78;
  const markerH = format === "story" ? 36 : 30;
  const markerX = w - padX - markerW;
  const markerY = topY - 6;
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(markerX, markerY, markerW, markerH);
  drawSmallCaps(
    ctx,
    "1 of 3",
    markerX + 14,
    markerY + (markerH - (format === "story" ? 18 : 15)) / 2,
    "rgba(255,255,255,0.95)",
    format === "story" ? 18 : 15,
    format === "story" ? 3 : 2.4,
  );
}

async function renderBlob(
  format: ExportFormat,
  draw: (ctx: CanvasRenderingContext2D) => void,
): Promise<Blob | null> {
  const { w, h } = FORMAT_DIM[format];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  draw(ctx);
  return await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/png", 1.0);
  });
}

async function downloadSpreadCarousel({
  format,
  issueTitle,
  issueSub,
  issueNumber,
  leftPage,
  rightPage,
  coverContent,
  leftIndex,
}: {
  format: ExportFormat;
  issueTitle: string;
  issueSub: string;
  issueNumber: string;
  leftPage: MagazinePage;
  rightPage: MagazinePage;
  coverContent: SpreadCoverContent;
  leftIndex: number;
}) {
  const leftContent = pageToExportContent(leftPage, issueTitle, issueSub, issueNumber);
  const rightContent = pageToExportContent(rightPage, issueTitle, issueSub, issueNumber);

  const [coverBlob, leftBlob, rightBlob] = await Promise.all([
    renderBlob(format, (ctx) => renderSpreadCoverCanvas(ctx, format, coverContent)),
    renderBlob(format, (ctx) => renderExportCanvas(ctx, format, leftContent)),
    renderBlob(format, (ctx) => renderExportCanvas(ctx, format, rightContent)),
  ]);
  if (!coverBlob || !leftBlob || !rightBlob) return;

  const safeIssue = issueNumber.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const safeLeft = String(leftIndex + 1).padStart(2, "0");
  const safeRight = String(leftIndex + 2).padStart(2, "0");
  const baseName = `ananya-${safeIssue}-spread-${safeLeft}-${safeRight}`;
  const files = [
    { name: `${baseName}-01-cover-${format}.png`, blob: coverBlob },
    { name: `${baseName}-02-left-${format}.png`, blob: leftBlob },
    { name: `${baseName}-03-right-${format}.png`, blob: rightBlob },
  ];

  // Prefer native share with multiple files on supporting devices.
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  const canShareFn = nav && typeof nav.share === "function"
    ? (nav as Navigator & { canShare?: (d: ShareData) => boolean }).canShare
    : undefined;
  if (nav && canShareFn) {
    const shareFiles = files.map((f) => new File([f.blob], f.name, { type: "image/png" }));
    const shareData = {
      files: shareFiles,
      title: `${coverContent.title} · spread carousel`,
    } as ShareData;
    if (canShareFn(shareData)) {
      try {
        await nav.share(shareData);
        return;
      } catch {
        // Fall through to zip.
      }
    }
  }

  // Fallback: zip + download.
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const f of files) zip.file(f.name, f.blob);
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${baseName}-${format}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportFilename(page: MagazinePage, format: ExportFormat, issueNumber: string): string {
  const safe = issueNumber.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const tag = (() => {
    switch (page.kind) {
      case "feature":
        return `feature-${page.wedding.slug}`;
      case "vendor":
        return `vendor-${page.vendor.id}`;
      case "qa":
        return `qa-${page.qa.id}`;
      case "moodboard":
        return `mood-${page.board.id}`;
      case "edit":
        return `edit-${page.edit.id}`;
      case "letter":
        return `letter-${page.letter.id}`;
      default:
        return page.kind;
    }
  })();
  return `ananya-${safe}-${tag}-${format}.png`;
}

async function renderExportBlob(
  format: ExportFormat,
  content: ExportContent,
): Promise<Blob | null> {
  const { w, h } = FORMAT_DIM[format];
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  renderExportCanvas(ctx, format, content);
  return await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/png", 1.0);
  });
}

function renderExportCanvas(
  ctx: CanvasRenderingContext2D,
  format: ExportFormat,
  content: ExportContent,
) {
  const { w, h } = FORMAT_DIM[format];

  // Paper background.
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, PAPER);
  bg.addColorStop(1, PAPER_SHADE);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Sprinkle grain.
  drawGrain(ctx, w, h, 0.05);

  if (format === "story") renderStoryLayout(ctx, content, w, h);
  else if (format === "post") renderPostLayout(ctx, content, w, h);
  else renderSquareLayout(ctx, content, w, h);

  drawBrandFooter(ctx, w, h, content, format);
}

function renderStoryLayout(
  ctx: CanvasRenderingContext2D,
  content: ExportContent,
  w: number,
  h: number,
) {
  const heroH = Math.round(h * 0.58);
  drawHero(ctx, content.hero, 0, 0, w, heroH);

  // Paper band shadow under hero.
  const sh = ctx.createLinearGradient(0, heroH - 40, 0, heroH);
  sh.addColorStop(0, "rgba(0,0,0,0)");
  sh.addColorStop(1, "rgba(0,0,0,0.25)");
  ctx.fillStyle = sh;
  ctx.fillRect(0, heroH - 40, w, 40);

  // Content block.
  const padX = 80;
  let y = heroH + 80;
  drawSmallCaps(ctx, content.kicker, padX, y, TERRACOTTA, 26, 4);
  y += 70;
  y += drawSerifHeadline(ctx, content.title, padX, y, w - padX * 2, INK, 76, 82);
  y += 20;
  if (content.subtitle) {
    y += drawSerifItalic(ctx, content.subtitle, padX, y, w - padX * 2, INK_MUTED, 28, 38);
    y += 10;
  }
  y += drawSerifBody(ctx, content.body, padX, y, w - padX * 2, INK_SOFT, 30, 44, 6);
  if (content.attribution) {
    y += 20;
    drawSmallCaps(ctx, content.attribution, padX, y, INK_MUTED, 22, 3.5);
  }
}

function renderPostLayout(
  ctx: CanvasRenderingContext2D,
  content: ExportContent,
  w: number,
  h: number,
) {
  const heroH = Math.round(h * 0.66);
  drawHero(ctx, content.hero, 0, 0, w, heroH);

  const padX = 72;
  let y = heroH + 56;
  drawSmallCaps(ctx, content.kicker, padX, y, TERRACOTTA, 22, 3.5);
  y += 52;
  y += drawSerifHeadline(ctx, content.title, padX, y, w - padX * 2, INK, 62, 68);
  y += 14;
  if (content.subtitle) {
    y += drawSerifItalic(ctx, content.subtitle, padX, y, w - padX * 2, INK_MUTED, 22, 32);
    y += 6;
  }
  y += drawSerifBody(ctx, content.body, padX, y, w - padX * 2, INK_SOFT, 24, 36, 4);
}

function renderSquareLayout(
  ctx: CanvasRenderingContext2D,
  content: ExportContent,
  w: number,
  h: number,
) {
  const heroH = Math.round(h * 0.6);
  drawHero(ctx, content.hero, 0, 0, w, heroH);

  const padX = 72;
  let y = heroH + 48;
  drawSmallCaps(ctx, content.kicker, padX, y, TERRACOTTA, 20, 3);
  y += 46;
  y += drawSerifHeadline(ctx, content.title, padX, y, w - padX * 2, INK, 56, 62);
  y += 12;
  y += drawSerifBody(ctx, content.body, padX, y, w - padX * 2, INK_SOFT, 22, 34, 3);
}

// ── Canvas primitives ───────────────────────────────────────────────────

function drawHero(ctx: CanvasRenderingContext2D, hero: HeroSpec, x: number, y: number, w: number, h: number) {
  if (hero.type === "gradient") {
    drawTailwindGradient(ctx, hero.gradient, x, y, w, h);
    drawGrain(ctx, w, h, 0.12, x, y);
    // dark bottom fade for legibility
    const fade = ctx.createLinearGradient(0, y + h * 0.55, 0, y + h);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = fade;
    ctx.fillRect(x, y + h * 0.55, w, h * 0.45);
  } else if (hero.type === "mosaic") {
    const cols = 3;
    const rows = Math.max(1, Math.ceil(hero.items.length / cols));
    const gap = 10;
    const cellW = (w - gap * (cols + 1)) / cols;
    const cellH = (h - gap * (rows + 1)) / rows;
    hero.items.forEach((it, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const cx = x + gap + c * (cellW + gap);
      const cy = y + gap + r * (cellH + gap);
      drawTailwindGradient(ctx, it.gradient, cx, cy, cellW, cellH);
      drawGrain(ctx, cellW, cellH, 0.12, cx, cy);
      if (it.label) {
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.fillRect(cx, cy + cellH - 56, cellW, 56);
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.font = `500 20px "Inter", system-ui, sans-serif`;
        ctx.textBaseline = "middle";
        ctx.fillText(it.label.toUpperCase(), cx + 14, cy + cellH - 28);
      }
    });
    // Subtle paper border around mosaic area.
    ctx.fillStyle = PAPER;
    ctx.fillRect(x, y, w, gap);
    ctx.fillRect(x, y + h - gap, w, gap);
    ctx.fillRect(x, y, gap, h);
    ctx.fillRect(x + w - gap, y, gap, h);
  } else {
    // palette
    const swW = w / hero.palette.length;
    hero.palette.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(x + i * swW, y, swW + 1, h);
    });
    drawGrain(ctx, w, h, 0.1, x, y);
  }
}

function drawTailwindGradient(ctx: CanvasRenderingContext2D, cls: string, x: number, y: number, w: number, h: number) {
  const hexes = cls.match(/#[0-9a-fA-F]{6}/g) ?? ["#E9C8B5", "#D8A080", "#B56A4A"];
  // Direction parsing: default top-left → bottom-right.
  const dirMatch = cls.match(/bg-gradient-to-(br|bl|tr|tl|b|t|l|r)/);
  const dir = dirMatch?.[1] ?? "br";
  let x0 = x,
    y0 = y,
    x1 = x + w,
    y1 = y + h;
  if (dir === "b") { x1 = x; y1 = y + h; }
  else if (dir === "t") { x1 = x; y0 = y + h; y1 = y; }
  else if (dir === "r") { y1 = y; }
  else if (dir === "l") { x0 = x + w; x1 = x; y1 = y; }
  else if (dir === "bl") { x0 = x + w; x1 = x; }
  else if (dir === "tr") { y0 = y + h; y1 = y; }
  else if (dir === "tl") { x0 = x + w; y0 = y + h; x1 = x; y1 = y; }

  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  if (hexes.length === 2) {
    grad.addColorStop(0, hexes[0]);
    grad.addColorStop(1, hexes[1]);
  } else {
    grad.addColorStop(0, hexes[0]);
    grad.addColorStop(0.5, hexes[1]);
    grad.addColorStop(1, hexes[2]);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
}

function drawGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opacity = 0.08,
  offsetX = 0,
  offsetY = 0,
) {
  const count = Math.round((w * h) / 1400);
  ctx.save();
  ctx.globalAlpha = opacity;
  for (let i = 0; i < count; i += 1) {
    const px = offsetX + Math.random() * w;
    const py = offsetY + Math.random() * h;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)";
    ctx.fillRect(px, py, 1.2, 1.2);
  }
  ctx.restore();
}

function drawSmallCaps(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  size: number,
  tracking: number,
) {
  ctx.fillStyle = color;
  ctx.font = `500 ${size}px "Inter", system-ui, sans-serif`;
  ctx.textBaseline = "top";
  const upper = text.toUpperCase();
  let cursor = x;
  for (const ch of upper) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + tracking;
  }
}

function drawSerifHeadline(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  color: string,
  size: number,
  lineH: number,
): number {
  ctx.fillStyle = color;
  ctx.font = `500 ${size}px "Playfair Display", Georgia, serif`;
  ctx.textBaseline = "top";
  const lines = wrapText(ctx, text.toLowerCase(), maxW);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
  return lines.length * lineH;
}

function drawSerifItalic(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  color: string,
  size: number,
  lineH: number,
): number {
  ctx.fillStyle = color;
  ctx.font = `italic 400 ${size}px "Playfair Display", Georgia, serif`;
  ctx.textBaseline = "top";
  const lines = wrapText(ctx, text, maxW);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
  return lines.length * lineH;
}

function drawSerifBody(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  color: string,
  size: number,
  lineH: number,
  maxLines: number,
): number {
  ctx.fillStyle = color;
  ctx.font = `400 ${size}px Georgia, "Times New Roman", serif`;
  ctx.textBaseline = "top";
  const paragraphs = text.split("\n");
  const lines: string[] = [];
  for (const p of paragraphs) {
    if (!p) {
      lines.push("");
      continue;
    }
    const wrapped = wrapText(ctx, p, maxW);
    for (const l of wrapped) lines.push(l);
    lines.push("");
  }
  const clipped = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    // Ellipsise last.
    let last = clipped[clipped.length - 1];
    while (ctx.measureText(last + "…").width > maxW && last.length > 0) {
      last = last.slice(0, -1);
    }
    clipped[clipped.length - 1] = last + "…";
  }
  clipped.forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
  return clipped.length * lineH;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawBrandFooter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  content: ExportContent,
  format: ExportFormat,
) {
  const padX = format === "story" ? 80 : 72;
  const footerY = h - (format === "story" ? 140 : 110);

  // Divider line.
  ctx.fillStyle = `${TERRACOTTA}44`;
  ctx.fillRect(padX, footerY, w - padX * 2, 1);

  // Wordmark left.
  ctx.fillStyle = TERRACOTTA;
  ctx.font = `500 ${format === "story" ? 28 : 22}px "Playfair Display", Georgia, serif`;
  ctx.textBaseline = "top";
  ctx.fillText("ananya magazine", padX, footerY + 18);

  // Issue identifier.
  ctx.fillStyle = INK_MUTED;
  ctx.font = `500 ${format === "story" ? 18 : 14}px "Inter", system-ui, sans-serif`;
  ctx.fillText(content.meta.toUpperCase(), padX, footerY + (format === "story" ? 54 : 44));

  // Scan code placeholder (a QR-like visual).
  const qrSize = format === "story" ? 88 : 64;
  const qrX = w - padX - qrSize;
  const qrY = footerY + 18;
  drawQrPlaceholder(ctx, qrX, qrY, qrSize, content.deepLinkLabel);
}

function drawQrPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  label: string,
) {
  // Frame.
  ctx.fillStyle = "rgba(0,0,0,0.04)";
  ctx.fillRect(x, y, size, size);

  // Pseudo-random block pattern (deterministic by label hash).
  const grid = 9;
  const cell = size / grid;
  let h = 0;
  for (let i = 0; i < label.length; i += 1) h = (h * 31 + label.charCodeAt(i)) >>> 0;
  ctx.fillStyle = INK;
  for (let r = 0; r < grid; r += 1) {
    for (let c = 0; c < grid; c += 1) {
      const bit = (h >>> ((r * grid + c) % 30)) & 1;
      if (bit) ctx.fillRect(x + c * cell + 1, y + r * cell + 1, cell - 2, cell - 2);
    }
  }
  // Corner anchors.
  const anchor = (ax: number, ay: number) => {
    ctx.fillStyle = INK;
    ctx.fillRect(ax, ay, cell * 3, cell * 3);
    ctx.fillStyle = PAPER;
    ctx.fillRect(ax + cell * 0.5, ay + cell * 0.5, cell * 2, cell * 2);
    ctx.fillStyle = INK;
    ctx.fillRect(ax + cell, ay + cell, cell, cell);
  };
  anchor(x, y);
  anchor(x + size - cell * 3, y);
  anchor(x, y + size - cell * 3);

  // Label.
  ctx.fillStyle = INK_FAINT;
  ctx.font = `500 12px "Inter", system-ui, sans-serif`;
  ctx.textBaseline = "top";
  ctx.fillText(label.toUpperCase(), x - 2, y + size + 6);
}

// ── Flipbook styles ─────────────────────────────────────────────────────

function FlipbookStyles() {
  return (
    <style>{`
      .book-stage {
        position: relative;
        width: min(1180px, 100%);
        aspect-ratio: 16 / 10;
        max-height: 100%;
        perspective: 2400px;
      }
      .book-stage.mobile {
        width: min(480px, 100%);
        aspect-ratio: 3 / 4;
      }
      .book {
        position: absolute;
        inset: 0;
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        transform-style: preserve-3d;
        filter: drop-shadow(0 30px 60px rgba(0,0,0,0.55));
      }
      .book.mobile {
        grid-template-columns: 1fr;
      }
      .book-shadow {
        position: absolute;
        inset: 6% -2% -2% -2%;
        background: radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, transparent 65%);
        filter: blur(18px);
        pointer-events: none;
      }
      .book-spine {
        position: relative;
        width: 2px;
        background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.35), rgba(0,0,0,0));
      }
      .book-spine::before,
      .book-spine::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        width: 32px;
        pointer-events: none;
      }
      .book-spine::before {
        right: 100%;
        background: linear-gradient(to left, rgba(0,0,0,0.28), transparent);
      }
      .book-spine::after {
        left: 100%;
        background: linear-gradient(to right, rgba(0,0,0,0.28), transparent);
      }
      .page-shell {
        position: relative;
        height: 100%;
        overflow: hidden;
        background: ${PAPER};
        color: ${INK};
      }
      .page-left { border-radius: 2px 0 0 2px; box-shadow: inset -6px 0 12px -10px rgba(0,0,0,0.10); }
      .page-right { border-radius: 0 2px 2px 0; box-shadow: inset 6px 0 12px -10px rgba(0,0,0,0.10); }
      .page-single { border-radius: 2px; box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
      .page-bare { border-radius: 0; box-shadow: none; }
      /* Very subtle paper grain — only present to keep pure white from feeling screen-ish. */
      .page-grain {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.05;
        mix-blend-mode: multiply;
        background-image:
          radial-gradient(rgba(0,0,0,0.22) 1px, transparent 1.4px),
          radial-gradient(rgba(0,0,0,0.12) 1px, transparent 1.6px);
        background-size: 4px 4px, 7px 7px;
        background-position: 0 0, 2px 3px;
      }
      .page-fade { position: absolute; inset: 0; pointer-events: none; }
      .page-fade[data-side="left"] { background: linear-gradient(to right, rgba(0,0,0,0) 84%, rgba(0,0,0,0.06)); }
      .page-fade[data-side="right"] { background: linear-gradient(to left, rgba(0,0,0,0) 84%, rgba(0,0,0,0.06)); }
      .page-inner { position: absolute; inset: 0; }
      .page-inner-with-bar { inset: 0 0 34px 0; }
      @media (max-width: 900px) {
        .page-inner-with-bar { inset: 0 0 38px 0; }
      }

      /* ── Running chrome: folios + running headers ────────── */
      .running-header {
        position: absolute;
        top: 18px;
        font-size: 8.5px;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        font-weight: 500;
        color: ${INK};
        font-family: var(--font-sans, "Inter", system-ui, sans-serif);
        z-index: 5;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .running-header-left { left: 22px; }
      .running-header-right { right: 22px; flex-direction: row-reverse; }
      .running-header::before {
        content: "";
        display: inline-block;
        width: 18px;
        height: 1px;
        background: ${INK};
      }
      .running-header-right::before { content: none; }
      .running-header-right::after {
        content: "";
        display: inline-block;
        width: 18px;
        height: 1px;
        background: ${INK};
      }
      .running-footer {
        position: absolute;
        bottom: 14px;
        font-size: 8.5px;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: ${INK_MUTED};
        font-family: var(--font-sans, "Inter", system-ui, sans-serif);
        z-index: 5;
      }
      .running-footer-issue { left: 22px; }
      .running-footer-issue-right { right: 22px; left: auto; }

      .page-number {
        position: absolute;
        bottom: 14px;
        font-size: 9px;
        font-weight: 500;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: ${INK};
        font-family: var(--font-sans, "Inter", system-ui, sans-serif);
        z-index: 5;
      }
      .page-number-left { left: 22px; }
      .page-number-right { right: 22px; }

      /* ── Persistent share bar (editorial strip) ──────────── */
      .share-bar {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 6;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 6px 20px;
        min-height: 32px;
        background: ${PAPER};
        border-top: 1px solid ${INK};
        color: ${INK};
        font-family: var(--font-sans, "Inter", system-ui, sans-serif);
      }
      .share-bar-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 8.5px;
        font-weight: 600;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: ${INK};
        padding: 3px 4px;
        border: 0;
        background: transparent;
        cursor: pointer;
      }
      .share-bar-label:hover { color: ${TERRACOTTA}; }
      .share-bar-shapes {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-left: auto;
      }
      .share-shape-btn,
      .share-spread-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 7px;
        border: 1px solid transparent;
        background: transparent;
        color: ${INK};
        cursor: pointer;
        transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
      }
      .share-shape-btn:hover,
      .share-shape-btn:focus-visible,
      .share-spread-btn:hover,
      .share-spread-btn:focus-visible {
        background: ${INK};
        color: ${PAPER};
        border-color: ${INK};
        outline: none;
      }
      .share-shape {
        display: inline-block;
        border: 1.5px solid currentColor;
        box-sizing: border-box;
        flex-shrink: 0;
      }
      .shape-story { width: 9px; height: 16px; }
      .shape-post { width: 13px; height: 16px; }
      .shape-square { width: 14px; height: 14px; }
      .share-shape-text,
      .share-spread-text {
        font-size: 8.5px;
        font-weight: 600;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        white-space: nowrap;
        transition: opacity 200ms ease, max-width 240ms ease;
      }
      .share-bar:hover .share-shape-text,
      .share-bar:hover .share-spread-text,
      .share-shape-btn:focus-visible .share-shape-text,
      .share-spread-btn:focus-visible .share-spread-text {
        opacity: 1;
        max-width: 96px;
      }
      .share-spread-btn {
        margin-left: 6px;
        padding-left: 10px;
        border-left: 1px solid ${INK};
      }
      .share-spread-icon {
        display: inline-flex;
        align-items: center;
        gap: 1.5px;
      }
      .share-spread-card {
        display: inline-block;
        width: 5px;
        height: 14px;
        border: 1.2px solid currentColor;
      }
      .share-bar-page-number {
        font-size: 8.5px;
        font-weight: 600;
        letter-spacing: 0.26em;
        text-transform: uppercase;
        color: ${INK};
        font-family: var(--font-sans, "Inter", system-ui, sans-serif);
        padding-left: 10px;
        border-left: 1px solid ${INK};
      }
      @media (max-width: 900px) {
        .share-bar { gap: 8px; padding: 5px 14px; min-height: 36px; }
        .share-bar-label span { display: none; }
        .share-shape-text,
        .share-spread-text { opacity: 1; max-width: 80px; }
        .share-shape-btn,
        .share-spread-btn { padding: 5px 8px; }
      }

      /* ── First-time tooltip (editorial strip, no pill) ───── */
      .share-tip {
        position: absolute;
        left: 50%;
        bottom: 92px;
        transform: translateX(-50%);
        z-index: 40;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 18px;
        background: ${PAPER};
        color: ${INK};
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.26em;
        text-transform: uppercase;
        border: 1px solid ${INK};
        box-shadow: 0 18px 48px rgba(0,0,0,0.55);
        cursor: pointer;
        font-family: var(--font-sans, "Inter", system-ui, sans-serif);
        animation:
          shareTipIn 420ms cubic-bezier(0.4, 0, 0.2, 1),
          shareTipPulse 2600ms ease-in-out 900ms infinite;
      }
      .share-tip::after {
        content: "";
        position: absolute;
        bottom: -7px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        width: 10px;
        height: 10px;
        background: ${PAPER};
        border-right: 1px solid ${INK};
        border-bottom: 1px solid ${INK};
      }
      @keyframes shareTipIn {
        from { opacity: 0; transform: translate(-50%, 12px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
      @keyframes shareTipPulse {
        0%, 100% { box-shadow: 0 18px 48px rgba(0,0,0,0.55), 0 0 0 0 rgba(184,74,46,0); }
        50% { box-shadow: 0 18px 48px rgba(0,0,0,0.55), 0 0 0 6px rgba(184,74,46,0.18); }
      }

      /* ── Saved toast (black bar, editorial) ──────────────── */
      .saved-toast {
        position: absolute;
        left: 50%;
        bottom: 96px;
        transform: translateX(-50%);
        z-index: 140;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 20px 10px 14px;
        background: ${INK};
        color: ${PAPER};
        font-size: 10.5px;
        font-weight: 600;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        box-shadow: 0 18px 52px rgba(0,0,0,0.6);
        animation: savedToastIn 280ms cubic-bezier(0.4, 0, 0.2, 1);
        border-left: 3px solid ${TERRACOTTA};
      }
      .saved-toast-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 20px;
        width: 20px;
        background: ${TERRACOTTA};
        color: ${PAPER};
      }
      .saved-toast-text {
        font-family: var(--font-sans, "Inter", system-ui, sans-serif);
      }
      @keyframes savedToastIn {
        from { opacity: 0; transform: translate(-50%, 14px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }

      .flip-page {
        position: absolute;
        top: 0;
        width: 50%;
        height: 100%;
        transform-style: preserve-3d;
        will-change: transform;
        z-index: 10;
      }
      .flip-page.mobile { width: 100%; }
      .flip-next { right: 0; transform-origin: left center; animation: flipNext cubic-bezier(0.55, 0, 0.35, 1) forwards; }
      .flip-prev { left: 0; transform-origin: right center; animation: flipPrev cubic-bezier(0.55, 0, 0.35, 1) forwards; }
      .flip-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; overflow: hidden; }
      .flip-face.flip-front { transform: rotateY(0deg); }
      .flip-face.flip-back { transform: rotateY(180deg); }
      @keyframes flipNext {
        0% { transform: rotateY(0deg); box-shadow: 0 0 0 rgba(0,0,0,0); }
        40% { box-shadow: -20px 10px 30px rgba(0,0,0,0.28); }
        100% { transform: rotateY(-180deg); box-shadow: 0 0 0 rgba(0,0,0,0); }
      }
      @keyframes flipPrev {
        0% { transform: rotateY(0deg); box-shadow: 0 0 0 rgba(0,0,0,0); }
        40% { box-shadow: 20px 10px 30px rgba(0,0,0,0.28); }
        100% { transform: rotateY(180deg); box-shadow: 0 0 0 rgba(0,0,0,0); }
      }
    `}</style>
  );
}

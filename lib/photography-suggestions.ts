// ── Shot-list AI suggestions ──────────────────────────────────────────────
// Curated per-event suggestions that power the "✨ Suggest shots for …" row
// at the bottom of each event's shot list. In production these would flow
// from the actual AI service drawing on:
//   - event type + couple's tradition profile (Foundation & Vision)
//   - VIPs already added
//   - time of day
//   - shots already on the list (to avoid re-suggesting)
// Here we ship a deterministic, hand-written catalogue that feels authored
// rather than generic.

import type { PhotoEventId, ShotPriority } from "@/types/photography";

export interface ShotSuggestion {
  key: string;
  title: string;
  moment: string;
  priority: ShotPriority;
  rationale: string;
}

export const SHOT_SUGGESTIONS: Record<PhotoEventId, ShotSuggestion[]> = {
  haldi: [
    {
      key: "hal-paste-grind",
      title: "Paste being ground by aunts before ceremony",
      moment: "Pre-ceremony setup",
      priority: "preferred",
      rationale: "Traditional — the grinding is often where the real laughter happens.",
    },
    {
      key: "hal-feet-touch",
      title: "Bride touching elders' feet before the first application",
      moment: "Pre-ceremony setup",
      priority: "preferred",
      rationale: "Respect ritual that reads instantly in a photo.",
    },
    {
      key: "hal-yellow-linen",
      title: "Yellow linen table with haldi bowls — editorial still-life",
      moment: "Pre-ceremony setup",
      priority: "preferred",
      rationale: "Gives the gallery a palette-setting detail shot.",
    },
    {
      key: "hal-father-daughter",
      title: "Father applying haldi to daughter's forehead",
      moment: "Paste application",
      priority: "must",
      rationale: "Unposed emotional peak — plan a 35mm prime for this.",
    },
    {
      key: "hal-siblings-mess",
      title: "Siblings mid-mess — haldi fight candid",
      moment: "Candids",
      priority: "preferred",
      rationale: "Reliable energy shot once the formal applications finish.",
    },
    {
      key: "hal-cleanup",
      title: "Post-ceremony — bride being cleaned up with rose water",
      moment: "Candids",
      priority: "preferred",
      rationale: "Softer coda shot that bridges into getting-ready.",
    },
  ],
  mehendi: [
    {
      key: "meh-cone-overhead",
      title: "Overhead flatlay of henna cones + pattern book",
      moment: "Artists arriving",
      priority: "preferred",
      rationale: "Sets the scene for the section and is easy to shoot in downtime.",
    },
    {
      key: "meh-grooms-name",
      title: "Finding the groom's name hidden in the design",
      moment: "Details & reveal",
      priority: "must",
      rationale: "Tradition — guests expect this image in the album.",
    },
    {
      key: "meh-moms-hands",
      title: "Mother's hand next to bride's hand — generational detail",
      moment: "Guest applications",
      priority: "preferred",
      rationale: "VIP already on list — worth framing their hand alongside.",
    },
    {
      key: "meh-color-reveal",
      title: "Color reveal next morning — bride holding her hands to the light",
      moment: "Details & reveal",
      priority: "preferred",
      rationale: "Traditional — the darker the color, the more the mother-in-law loves her.",
    },
    {
      key: "meh-snack-break",
      title: "Bride being hand-fed during the application",
      moment: "Bridal mehendi",
      priority: "preferred",
      rationale: "Only moment she can't use her hands — always a tender frame.",
    },
  ],
  sangeet: [
    {
      key: "san-rehearsal",
      title: "Dress rehearsal backstage — performers warming up",
      moment: "Arrivals & decor",
      priority: "preferred",
      rationale: "Captures the nerves before the stage lights.",
    },
    {
      key: "san-parents-react",
      title: "Parents' faces during children's performance",
      moment: "Performances",
      priority: "must",
      rationale: "Reaction shots are what couples screenshot in 10 years.",
    },
    {
      key: "san-mash-up",
      title: "Group choreo finale — wide from balcony",
      moment: "Performances",
      priority: "preferred",
      rationale: "Needs planning — scout the balcony angle at arrival.",
    },
    {
      key: "san-grandparents-dance",
      title: "Grandparents brought to the dance floor",
      moment: "Dance floor",
      priority: "preferred",
      rationale: "Happens once per night — assign second shooter to watch.",
    },
    {
      key: "san-toast-hug",
      title: "First hug after the emotional toast",
      moment: "Speeches",
      priority: "preferred",
      rationale: "The reaction matters more than the speaker.",
    },
    {
      key: "san-confetti",
      title: "Confetti drop at finale — silhouette of the couple",
      moment: "Performances",
      priority: "preferred",
      rationale: "Only works if confetti is on the production run-sheet.",
    },
  ],
  baraat: [
    {
      key: "bar-horse-prep",
      title: "Horse being dressed — close-up of reins + flowers",
      moment: "Groom prep",
      priority: "preferred",
      rationale: "Detail shot that grounds the wider procession images.",
    },
    {
      key: "bar-groom-brothers",
      title: "Groom with his brothers before mounting",
      moment: "Groom prep",
      priority: "preferred",
      rationale: "Only moment to get them grouped before the chaos.",
    },
    {
      key: "bar-drone-pullback",
      title: "Drone pull-back from dhol to the full procession",
      moment: "Procession",
      priority: "preferred",
      rationale: "Cinematic opener for the baraat reel.",
    },
    {
      key: "bar-milni-hug",
      title: "Milni — bride's father greeting groom's father",
      moment: "Welcome at venue",
      priority: "must",
      rationale: "Tradition — the hug is the image.",
    },
    {
      key: "bar-garland-arc",
      title: "Garland arc — petals landing on the groom",
      moment: "Welcome at venue",
      priority: "preferred",
      rationale: "Brief — position in advance on the venue side.",
    },
  ],
  wedding: [
    {
      key: "wed-mandap-empty",
      title: "Empty mandap before guests arrive — editorial detail",
      moment: "First look",
      priority: "preferred",
      rationale: "Shoot in the setup window — won't happen again.",
    },
    {
      key: "wed-priests-hands",
      title: "Priest's hands preparing the agni",
      moment: "Kanyadaan & pheras",
      priority: "preferred",
      rationale: "Quiet ritual image that reads timeless.",
    },
    {
      key: "wed-father-tears",
      title: "Father's hand release — close-up after kanyadaan",
      moment: "Kanyadaan & pheras",
      priority: "must",
      rationale: "Emotional peak — watch the father, not the couple.",
    },
    {
      key: "wed-phera-silhouette",
      title: "Seventh phera silhouette against agni smoke",
      moment: "Kanyadaan & pheras",
      priority: "preferred",
      rationale: "Use a side profile at f/2.8 if smoke cooperates.",
    },
    {
      key: "wed-grandmother-blessing",
      title: "Grandmother blessing couple after ceremony",
      moment: "Family portraits",
      priority: "must",
      rationale: "VIP already flagged — plan for wheelchair access if needed.",
    },
    {
      key: "wed-couple-mandap-after",
      title: "Couple alone at mandap right after pheras",
      moment: "Family portraits",
      priority: "preferred",
      rationale: "Two-minute window before guests rush the stage.",
    },
    {
      key: "wed-mother-vidaai",
      title: "Mother holding daughter during vidaai — final embrace",
      moment: "Vidaai",
      priority: "must",
      rationale: "Emotionally the heaviest frame of the day.",
    },
  ],
  reception: [
    {
      key: "rec-portrait-entry",
      title: "Portrait moment before the couple's entrance",
      moment: "Entrance",
      priority: "preferred",
      rationale: "Steal five minutes before the DJ calls them up.",
    },
    {
      key: "rec-cake-detail",
      title: "Cake detail still-life before cutting",
      moment: "Toasts & cake",
      priority: "preferred",
      rationale: "The cake will be destroyed — shoot it whole first.",
    },
    {
      key: "rec-first-dance-wide",
      title: "First dance — wide with guests watching",
      moment: "First dance",
      priority: "preferred",
      rationale: "Balances the tight close-up already on the list.",
    },
    {
      key: "rec-late-night-candids",
      title: "Late-night candids — blurred motion, dance floor",
      moment: "Party",
      priority: "preferred",
      rationale: "Slow shutter on the 35mm after midnight.",
    },
    {
      key: "rec-bouquet-toss",
      title: "Bouquet toss — girl who catches it",
      moment: "Party",
      priority: "preferred",
      rationale: "Pre-position on the receiving side, not the thrower.",
    },
  ],
  general: [
    {
      key: "gen-invite-flatlay",
      title: "Invitation suite flatlay with heirlooms",
      moment: "Detail still-lifes",
      priority: "must",
      rationale: "The cover image for the full gallery.",
    },
    {
      key: "gen-jewelry-close",
      title: "Bridal jewelry — close-up on the necklace in morning light",
      moment: "Detail still-lifes",
      priority: "preferred",
      rationale: "Best shot before the bride wears it — during getting-ready.",
    },
    {
      key: "gen-mehendi-reveal",
      title: "Bride showing mehendi hands — editorial detail",
      moment: "Detail still-lifes",
      priority: "preferred",
      rationale: "Works as a transition frame between events.",
    },
    {
      key: "gen-parents-pair",
      title: "Both sets of parents together — formal portrait",
      moment: "Family combinations",
      priority: "must",
      rationale: "Only happens at one event — pick the window in advance.",
    },
    {
      key: "gen-siblings-both",
      title: "Bride's siblings + groom's siblings — combined portrait",
      moment: "Family combinations",
      priority: "preferred",
      rationale: "Often forgotten — shoot between wedding and reception.",
    },
    {
      key: "gen-venue-broll",
      title: "Venue B-roll — empty rooms, signage, architectural details",
      moment: "B-roll & transitions",
      priority: "preferred",
      rationale: "Fills the film's connective tissue — shoot on arrival day.",
    },
    {
      key: "gen-couple-golden",
      title: "Golden hour portrait set of couple, editorial",
      moment: "Golden hour portraits",
      priority: "must",
      rationale: "Cornerstone of the album — block 20 min on the schedule.",
    },
    {
      key: "gen-getting-ready",
      title: "Bride's dress hanging with jewelry + shoes",
      moment: "Getting ready",
      priority: "preferred",
      rationale: "Classic getting-ready flatlay — shoot before makeup arrives.",
    },
  ],
};

import type {
  VendorWorkspace,
  VendorWorkspaceActivity,
  VendorWorkspaceContent,
  VendorWorkspacePermissions,
  WorkspaceDiscipline,
} from "@/types/vendor-workspace";
import { DEFAULT_PERMISSIONS } from "@/types/vendor-workspace";

// A single wedding for the demo — in Supabase, this matches the couple's
// active wedding row. The sample workspaces below are all scoped to it.
const WEDDING_ID = "wed-priya-arjun";
const NOW = new Date();

function isoDaysAgo(days: number, hour = 10, minute = 0): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function activity(
  workspaceId: string,
  entries: Array<Omit<VendorWorkspaceActivity, "id" | "workspace_id">>,
): VendorWorkspaceActivity[] {
  return entries.map((e, i) => ({
    ...e,
    id: `${workspaceId}-act-${i + 1}`,
    workspace_id: workspaceId,
  }));
}

// ── Catering — Anjali's Kitchen (ven-cat-01) ──────────────────────────────

const CATERING_CONTENT: VendorWorkspaceContent = {
  kind: "catering",
  courses: [
    {
      id: "course-1",
      name: "Welcome chaat station",
      dishes: ["Dahi puri", "Papdi chaat", "Corn chaat (Jain)", "Bhel puri"],
      dietary_tags: ["veg", "jain-option"],
      notes: "Live station. Jain preparations plated separately with labels.",
    },
    {
      id: "course-2",
      name: "Main course — North Indian",
      dishes: [
        "Dal makhani",
        "Paneer lababdar",
        "Murgh makhani (non-veg line)",
        "Laal maas (non-veg line)",
        "Tandoori roti",
        "Missi roti",
        "Jeera rice",
      ],
      dietary_tags: ["veg", "non-veg"],
    },
    {
      id: "course-3",
      name: "Coastal South",
      dishes: [
        "Kerala fish curry (non-veg)",
        "Appam",
        "Avial",
        "Coconut rice",
        "Rasam",
      ],
      dietary_tags: ["veg", "non-veg"],
    },
    {
      id: "course-4",
      name: "Dessert",
      dishes: ["Shahi tukda", "Gulab jamun", "Paan kulfi", "Seasonal fruit"],
      dietary_tags: ["veg"],
      notes: "Gluten-free fruit plate available on request.",
    },
  ],
  guest_counts: {
    total: 420,
    veg: 255,
    non_veg: 145,
    jain: 18,
    vegan: 12,
    kids: 24,
  },
  service_timing: [
    { event: "Sangeet dinner", start: "20:30", end: "23:30" },
    { event: "Wedding lunch", start: "13:00", end: "16:30" },
    { event: "Reception dinner", start: "20:00", end: "00:00" },
  ],
  staffing: [
    { role: "Lead chef", count: 1 },
    { role: "Sous chefs", count: 4 },
    { role: "Line cooks", count: 12 },
    { role: "Servers", count: 28, notes: "In Sabyasachi-coordinated kurtas" },
    { role: "Bartenders", count: 6 },
  ],
  kitchen_logistics: [
    "Prep kitchen staged at Taj Falaknuma — 3 trucks, arrival H-4",
    "Separate veg/non-veg lines maintained across all events",
    "Jain prep isolated in dedicated tent adjacent to main kitchen",
    "Ice-cream freezers + water stations at 6 points for reception",
  ],
  tastings: [
    { date: isoDaysAgo(32), status: "completed" },
    { date: isoDaysAgo(14), status: "completed" },
    { date: isoDaysAgo(-9), status: "scheduled" },
  ],
  deliverables: [
    "Finalized menu with pricing — due H-30",
    "Updated guest count + dietary split — due H-14",
    "Service staff list with names/IDs — due H-7",
    "Health certificates + kitchen inspection — due H-3",
  ],
};

// ── HMUA — Namrata Soni (ven-mua-01) ──────────────────────────────────────

const HMUA_CONTENT: VendorWorkspaceContent = {
  kind: "hmua",
  timeline: [
    { person: "Bride (Priya)", event: "Haldi", call_time: "06:30", duration_mins: 45 },
    { person: "Bride (Priya)", event: "Mehndi", call_time: "15:00", duration_mins: 60 },
    { person: "Bride (Priya)", event: "Sangeet", call_time: "17:30", duration_mins: 120 },
    { person: "Bride (Priya)", event: "Wedding ceremony", call_time: "04:30", duration_mins: 180 },
    { person: "Bride (Priya)", event: "Reception", call_time: "17:00", duration_mins: 150 },
    { person: "Mother of Bride", event: "Sangeet", call_time: "18:00", duration_mins: 75 },
    { person: "Mother of Bride", event: "Wedding ceremony", call_time: "05:30", duration_mins: 90 },
    { person: "Sister (Meher)", event: "Sangeet", call_time: "17:00", duration_mins: 60 },
    { person: "Sister (Meher)", event: "Wedding ceremony", call_time: "06:00", duration_mins: 60 },
    { person: "Bridesmaids (×4)", event: "Wedding ceremony", call_time: "06:30", duration_mins: 180 },
  ],
  looks: [
    {
      person: "Bride (Priya)",
      event: "Haldi",
      style: "Dewy skin, no-makeup makeup, loose waves with marigolds",
      references: ["moodboard/haldi-minimal-1.jpg", "moodboard/haldi-minimal-2.jpg"],
    },
    {
      person: "Bride (Priya)",
      event: "Sangeet",
      style: "Smokey bronze eye, glossy nude-mauve lip, sleek side part",
      references: ["moodboard/sangeet-bronze.jpg"],
      notes: "Lehenga is emerald Sabyasachi — avoid green eyeshadow tones.",
    },
    {
      person: "Bride (Priya)",
      event: "Wedding ceremony",
      style: "Classic kohl eye, deep red lip, low bun with jasmine + kaleera",
      references: [
        "moodboard/wedding-classic-1.jpg",
        "moodboard/wedding-classic-2.jpg",
      ],
      notes: "HD airbrush base. Must survive 4 hrs under mandap + outdoor humidity.",
    },
    {
      person: "Bride (Priya)",
      event: "Reception",
      style: "Glass skin, berry lip, Hollywood waves",
      references: ["moodboard/reception-glass-skin.jpg"],
    },
    {
      person: "Mother of Bride",
      event: "Wedding ceremony",
      style: "Warm bronze, muted rose lip, elegant chignon",
      references: [],
    },
  ],
  product_preferences: [
    "Charlotte Tilbury base — Magic Cream + Airbrush Flawless",
    "MAC ruby woo or Charlotte Pillow Talk Intense for red lip",
    "Laura Mercier translucent powder for setting",
    "Urban Decay All Nighter setting spray",
    "Hypoallergenic only for Mother of Bride (sensitive skin)",
  ],
  trials: [
    { person: "Bride — wedding look", date: isoDaysAgo(21), status: "completed" },
    { person: "Bride — reception look", date: isoDaysAgo(7), status: "completed" },
    { person: "Mother of Bride", date: isoDaysAgo(-4), status: "scheduled" },
  ],
};

// ── Mehndi — Veena Nagda (ven-mua-03 repurposed as mehndi specialist) ────
// Note: in the seed directory this vendor sits under the "hmua" category,
// but her specialty is bridal mehndi. The workspace discipline is explicit
// and overrides the directory category for content type.

const MEHNDI_CONTENT: VendorWorkspaceContent = {
  kind: "mehndi",
  design_references: [
    "moodboard/mehndi-rajasthani-jaal.jpg",
    "moodboard/mehndi-portrait-motif.jpg",
    "moodboard/mehndi-fingertip-minimal.jpg",
  ],
  bridal: {
    intricacy: "regal",
    application_hours: 6,
    motifs: [
      "Rajasthani jaal",
      "Portrait of groom (left palm center)",
      "Peacock pair on forearms",
      "Mandala motif on feet",
    ],
    coverage: "Hands + forearms to elbow, feet to mid-calf (front + back)",
  },
  guest_session: {
    guest_count: 80,
    duration_hours: 4,
    location: "Mehndi lawn — Taj Falaknuma",
    event: "Mehndi",
  },
  timeline: [
    {
      person_or_group: "Bride (Priya)",
      event: "Day before wedding",
      start_time: "10:00",
      duration: "6 hours",
    },
    {
      person_or_group: "Bride's mother + sisters (×3)",
      event: "Mehndi",
      start_time: "14:00",
      duration: "1 hour each",
    },
    {
      person_or_group: "Guest session (open)",
      event: "Mehndi",
      start_time: "15:00",
      duration: "4 hours, 80 guests, 6 artists",
    },
  ],
};

// ── Photography — Stories by Joseph Radhik (ven-ph-01) ────────────────────

const PHOTOGRAPHY_CONTENT: VendorWorkspaceContent = {
  kind: "photography",
  shot_list: [
    { id: "s1", description: "Bride getting ready — candid with mother", event: "Wedding ceremony", priority: "must" },
    { id: "s2", description: "Groom's baraat arrival — wide + tight", event: "Wedding ceremony", priority: "must" },
    { id: "s3", description: "Varmala — sequence", event: "Wedding ceremony", priority: "must" },
    { id: "s4", description: "Phere around the fire — overhead angle", event: "Wedding ceremony", priority: "must" },
    { id: "s5", description: "Vidaai — bride with family", event: "Wedding ceremony", priority: "must" },
    { id: "s6", description: "First dance — reception", event: "Reception", priority: "must" },
    { id: "s7", description: "Grandmother blessing bride", event: "Haldi", priority: "preferred" },
    { id: "s8", description: "Detail shots — kaleera, mehndi, jewelry", event: "Wedding ceremony", priority: "preferred" },
    { id: "s9", description: "Sangeet performances — stage + reactions", event: "Sangeet", priority: "preferred" },
    { id: "s10", description: "Drone wide of mandap at sunset", event: "Wedding ceremony", priority: "bonus" },
  ],
  must_capture: [
    "Grandmother (Dadi) — she is 91 and has traveled from London",
    "Priya's college friends group portrait",
    "Arjun with his two brothers — rare they're all together",
    "Horse for baraat (groom's family tradition)",
  ],
  family_portraits: [
    { grouping: "Bride's immediate family", members: "Parents + bride + sister" },
    { grouping: "Groom's immediate family", members: "Parents + groom + 2 brothers" },
    { grouping: "Both families combined", members: "Bride + groom + all parents + siblings" },
    { grouping: "Extended maternal (bride)", members: "Bride + mother's siblings + spouses + cousins" },
    { grouping: "Extended paternal (groom)", members: "Groom + father's siblings + spouses + cousins" },
    { grouping: "Wedding party", members: "Bride + groom + bridesmaids + groomsmen" },
  ],
  coverage_hours: [
    { event: "Mehndi", hours: 4 },
    { event: "Haldi", hours: 3 },
    { event: "Sangeet", hours: 6 },
    { event: "Wedding ceremony", hours: 10 },
    { event: "Reception", hours: 6 },
  ],
  deliverable_timeline: [
    { item: "Sneak peek — 20 images", due_date: "H+3 days" },
    { item: "Highlight reel (2 min)", due_date: "H+14 days" },
    { item: "Full gallery (curated, 800–1200 images)", due_date: "H+45 days" },
    { item: "Feature film (8–10 min)", due_date: "H+60 days" },
    { item: "Printed fine-art album (100 spreads)", due_date: "H+120 days" },
  ],
};

// ── Florals — Vivaah Designs (ven-dec-02) ─────────────────────────────────

const FLORALS_CONTENT: VendorWorkspaceContent = {
  kind: "florals",
  design_direction:
    "Editorial maximalism with restrained palette — saffron + marigold + deep burgundy, punctuated by ivory jasmine and bronzed eucalyptus. No pastels. Texture over color count.",
  mood_board: [
    "moodboard/florals-mandap-saffron.jpg",
    "moodboard/florals-ceiling-installation.jpg",
    "moodboard/florals-table-low.jpg",
  ],
  coverage: [
    {
      area: "Mandap",
      event: "Wedding ceremony",
      arrangement: "Four pillar arch, dense marigold + jasmine cascade, saffron silk drape",
    },
    {
      area: "Aisle",
      event: "Wedding ceremony",
      arrangement: "Lined petals — marigold + rose, every 6 ft brass diya",
    },
    {
      area: "Reception stage",
      event: "Reception",
      arrangement: "Full ceiling installation — suspended inverted florals, 40 ft span",
    },
    {
      area: "Sangeet stage",
      event: "Sangeet",
      arrangement: "Backdrop of fresh greens + white orchids, asymmetric",
    },
    {
      area: "Dining tables (40)",
      event: "Reception",
      arrangement: "Low centerpieces — brass urli + floating marigold heads + floating candles",
    },
  ],
  color_palette: ["#D4A24C", "#8B2615", "#F5E6C8", "#5A7842", "#FAF7F0"],
  arrangements: [
    { type: "Bridal bouquet", count: 1, notes: "Ivory roses + jasmine, tied with saffron silk" },
    { type: "Bridesmaid bouquets", count: 4 },
    { type: "Corsages (mothers, aunts)", count: 8 },
    { type: "Boutonnieres (groom + party)", count: 6 },
    { type: "Mandap pillars", count: 4 },
    { type: "Ceiling installations", count: 2 },
    { type: "Reception centerpieces", count: 40 },
    { type: "Aisle petal load", count: 1, notes: "30 kg total, loose-scattered" },
  ],
  delivery_setup: [
    { event: "Sangeet", setup_time: "H-6 hrs", teardown: "H+2 hrs (next morning)" },
    { event: "Wedding ceremony", setup_time: "H-10 hrs (overnight crew)", teardown: "H+4 hrs" },
    { event: "Reception", setup_time: "H-6 hrs", teardown: "H+3 hrs" },
  ],
};

// ── Permissions variants ──────────────────────────────────────────────────

const CATERING_PERMISSIONS: VendorWorkspacePermissions = {
  guests: "names_and_dietary",
  other_vendors: "schedule_only",
  budget: "their_line_item",
  run_of_show: "full_schedule",
  communications: "couple_and_planner",
};

const HMUA_PERMISSIONS: VendorWorkspacePermissions = {
  guests: "none",
  other_vendors: "none",
  budget: "their_line_item",
  run_of_show: "their_plus_adjacent",
  communications: "direct_with_couple",
};

const PHOTOGRAPHY_PERMISSIONS: VendorWorkspacePermissions = {
  guests: "names_and_dietary",
  other_vendors: "all_vendors",
  budget: "none",
  run_of_show: "full_schedule",
  communications: "couple_and_planner",
};

const MEHNDI_PERMISSIONS = { ...DEFAULT_PERMISSIONS };
const FLORALS_PERMISSIONS: VendorWorkspacePermissions = {
  ...DEFAULT_PERMISSIONS,
  other_vendors: "all_vendors",
};

// ── Workspaces ────────────────────────────────────────────────────────────

function mkWorkspace(
  id: string,
  vendorId: string,
  discipline: WorkspaceDiscipline,
  content: VendorWorkspaceContent,
  permissions: VendorWorkspacePermissions,
  invite: Pick<
    VendorWorkspace,
    "invite_status" | "last_vendor_activity_at" | "invitation" | "activity"
  >,
): VendorWorkspace {
  return {
    id,
    vendor_id: vendorId,
    wedding_id: WEDDING_ID,
    discipline,
    created_at: isoDaysAgo(60),
    updated_at: isoDaysAgo(2),
    last_vendor_activity_at: invite.last_vendor_activity_at,
    invite_status: invite.invite_status,
    content,
    permissions,
    invitation: invite.invitation,
    activity: invite.activity,
  };
}

const CATERING_WS_ID = "ws-cat-01";
const HMUA_WS_ID = "ws-mua-01";
const MEHNDI_WS_ID = "ws-mua-03";
const PHOTO_WS_ID = "ws-ph-01";
const FLORALS_WS_ID = "ws-dec-02";

export const SEED_VENDOR_WORKSPACES: VendorWorkspace[] = [
  // Catering — active, fully engaged vendor
  mkWorkspace(
    CATERING_WS_ID,
    "ven-cat-01",
    "catering",
    CATERING_CONTENT,
    CATERING_PERMISSIONS,
    {
      invite_status: "active",
      last_vendor_activity_at: isoDaysAgo(0, 9, 24),
      invitation: {
        id: "inv-cat-01",
        workspace_id: CATERING_WS_ID,
        invited_email: "anjali@anjaliskitchen.co.in",
        personal_note:
          "Anjali, we loved the Jaipur dinner last spring. Excited to have you at Falaknuma for our week.",
        sent_at: isoDaysAgo(45),
        claimed_at: isoDaysAgo(44),
        revoked_at: null,
        status: "active",
      },
      activity: activity(CATERING_WS_ID, [
        {
          at: isoDaysAgo(0, 9, 24),
          actor: "vendor",
          kind: "updated",
          summary: "Updated staffing — added 2 bartenders for reception",
        },
        {
          at: isoDaysAgo(1, 16, 12),
          actor: "vendor",
          kind: "confirmed_item",
          summary: "Confirmed final menu (4 courses)",
        },
        {
          at: isoDaysAgo(1, 10, 3),
          actor: "vendor",
          kind: "viewed",
          summary: "Viewed run of show",
        },
        {
          at: isoDaysAgo(3, 18, 40),
          actor: "vendor",
          kind: "message_sent",
          summary: "Question about Jain prep isolation tent placement",
        },
        {
          at: isoDaysAgo(14, 11, 0),
          actor: "vendor",
          kind: "updated",
          summary: "Logged tasting 2 outcomes — approved murgh makhani, laal maas",
        },
        {
          at: isoDaysAgo(44, 10, 0),
          actor: "vendor",
          kind: "logged_in",
          summary: "Claimed workspace invitation",
        },
      ]),
    },
  ),

  // HMUA — invited, claimed, mid-engagement
  mkWorkspace(
    HMUA_WS_ID,
    "ven-mua-01",
    "hmua",
    HMUA_CONTENT,
    HMUA_PERMISSIONS,
    {
      invite_status: "active",
      last_vendor_activity_at: isoDaysAgo(4, 11, 18),
      invitation: {
        id: "inv-mua-01",
        workspace_id: HMUA_WS_ID,
        invited_email: "studio@namratasoni.com",
        personal_note:
          "Namrata — thrilled you're doing my wedding look. I've put together my references and daily timing here.",
        sent_at: isoDaysAgo(38),
        claimed_at: isoDaysAgo(37),
        revoked_at: null,
        status: "active",
      },
      activity: activity(HMUA_WS_ID, [
        {
          at: isoDaysAgo(4, 11, 18),
          actor: "vendor",
          kind: "updated",
          summary: "Uploaded trial 2 photos",
        },
        {
          at: isoDaysAgo(7, 9, 0),
          actor: "vendor",
          kind: "confirmed_item",
          summary: "Confirmed wedding-morning call time (04:30)",
        },
        {
          at: isoDaysAgo(21, 17, 35),
          actor: "vendor",
          kind: "message_sent",
          summary: "Notes on airbrush durability for outdoor mandap",
        },
        {
          at: isoDaysAgo(37, 8, 0),
          actor: "vendor",
          kind: "logged_in",
          summary: "Claimed workspace invitation",
        },
      ]),
    },
  ),

  // Mehndi — invited but not yet claimed
  mkWorkspace(
    MEHNDI_WS_ID,
    "ven-mua-03",
    "mehndi",
    MEHNDI_CONTENT,
    MEHNDI_PERMISSIONS,
    {
      invite_status: "invited",
      last_vendor_activity_at: null,
      invitation: {
        id: "inv-mua-03",
        workspace_id: MEHNDI_WS_ID,
        invited_email: "veena@veenanagda.com",
        personal_note:
          "Veenaji, my mother still talks about the mehndi you did for her in 1994. We'd be so honored to have you do mine.",
        sent_at: isoDaysAgo(3),
        claimed_at: null,
        revoked_at: null,
        status: "invited",
      },
      activity: activity(MEHNDI_WS_ID, [
        {
          at: isoDaysAgo(3, 15, 0),
          actor: "couple",
          kind: "updated",
          summary: "Sent workspace invitation",
        },
      ]),
    },
  ),

  // Photography — not yet invited
  mkWorkspace(
    PHOTO_WS_ID,
    "ven-ph-01",
    "photography",
    PHOTOGRAPHY_CONTENT,
    PHOTOGRAPHY_PERMISSIONS,
    {
      invite_status: "not_invited",
      last_vendor_activity_at: null,
      invitation: null,
      activity: activity(PHOTO_WS_ID, [
        {
          at: isoDaysAgo(6, 14, 22),
          actor: "couple",
          kind: "updated",
          summary: "Added 6 must-capture moments",
        },
        {
          at: isoDaysAgo(9, 10, 11),
          actor: "couple",
          kind: "updated",
          summary: "Drafted family portrait list",
        },
      ]),
    },
  ),

  // Florals — bonus sample, active
  mkWorkspace(
    FLORALS_WS_ID,
    "ven-dec-02",
    "florals",
    FLORALS_CONTENT,
    FLORALS_PERMISSIONS,
    {
      invite_status: "active",
      last_vendor_activity_at: isoDaysAgo(2, 14, 8),
      invitation: {
        id: "inv-dec-02",
        workspace_id: FLORALS_WS_ID,
        invited_email: "hello@vivaahdesigns.com",
        personal_note:
          "Loved the palette you did for my cousin's wedding. Would love to bring that editorial hand to ours.",
        sent_at: isoDaysAgo(28),
        claimed_at: isoDaysAgo(27),
        revoked_at: null,
        status: "active",
      },
      activity: activity(FLORALS_WS_ID, [
        {
          at: isoDaysAgo(2, 14, 8),
          actor: "vendor",
          kind: "file_uploaded",
          summary: "Uploaded revised ceiling installation render",
        },
        {
          at: isoDaysAgo(5, 18, 40),
          actor: "vendor",
          kind: "updated",
          summary: "Updated arrangement counts — added 8 corsages",
        },
        {
          at: isoDaysAgo(27, 9, 0),
          actor: "vendor",
          kind: "logged_in",
          summary: "Claimed workspace invitation",
        },
      ]),
    },
  ),
];

export const SEED_WEDDING_ID = WEDDING_ID;

// ── POST /api/seating/suggest ─────────────────────────────────────────
// AI-powered guest→table assignment. Takes the full guest list, table
// list, and constraint configuration; returns a JSON map of guestId →
// tableId matching the user's strategy (family_first / social_mixer /
// traditional) and their hard/soft constraints.
//
// Pattern mirrors app/api/hmua/ai/route.ts — dynamic SDK import, tool_use
// for structured output, graceful offline fallback so the UI still works
// without an API key.

import { NextRequest, NextResponse } from "next/server";
import type {
  AutoSuggestConfig,
  DiningIntelligence,
  DiningWarning,
  SuggestRequestBody,
  SuggestResponse,
  SuggestedAssignment,
  SuggestedTableZone,
} from "@/types/seating-assignments";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";

// ── SDK ambient typing ─────────────────────────────────────────────────
type MessageContentBlock =
  | { type: "tool_use"; name: string; input: unknown }
  | { type: "text"; text: string }
  | { type: string; [key: string]: unknown };

interface MessagesCreateResponse {
  content: MessageContentBlock[];
}

interface AnthropicClient {
  messages: {
    create: (args: unknown) => Promise<MessagesCreateResponse>;
  };
}

// ── Prompt authoring ───────────────────────────────────────────────────

const STRATEGY_BRIEFS = {
  family_first: `**Family First.** Keep families and households together. Group bride-side families near each other and groom-side families near each other, but don't force a hard separation. Elders go near the stage. Cousins and closer-in-age family members can share tables.`,
  social_mixer: `**Social Mixer.** Deliberately mix bride and groom sides so guests make new connections. Group by age and shared category tags (College Friends, Work Colleagues, etc.) more than by family branch. Still keep households together.`,
  traditional: `**Traditional.** Strict bride side / groom side separation — bride-side guests sit on the bride side of the room (lower-numbered tables), groom-side on the other. Elders near the stage. Immediate family at the head/front-most tables. Mutual friends fill out the back.`,
} as const;

function formatConstraints(cfg: AutoSuggestConfig): string {
  const hard: string[] = [];
  const soft: string[] = [];
  if (cfg.keepHouseholdsTogether) hard.push("Keep every household together at a single table.");
  if (cfg.vipNearStage) hard.push("Seat VIPs, immediate family, and elders at tables nearest the stage (lowest table numbers).");
  if (cfg.kidsNearParents) hard.push("Children must share a table with at least one of their parents (same household).");
  if (cfg.accessibilityNearExits) hard.push("Guests with needsAssistance=true must be at tables with clear aisle access (prefer edge tables).");
  if (cfg.groupByCategory) soft.push("Where possible, group guests with shared category tags at the same table.");
  if (cfg.balanceDietary) soft.push("Try to cluster dietary restrictions by table (e.g., Jain guests together) so servers can deliver efficiently.");
  if (cfg.groupByLanguage) soft.push("Group guests who share a preferred language so conversation flows.");
  if (cfg.balanceSides) soft.push("Balance bride and groom sides at each table (roughly 50/50).");
  if (cfg.separateSides) soft.push("Separate bride and groom sides strictly — no mixing at a table.");
  if (cfg.nriNearEnglish) soft.push("Seat NRI (out-of-town international) guests near English-speaking guests.");

  for (const pair of cfg.mustPairs) {
    if (pair.kind === "together") {
      hard.push(
        `MUST SIT TOGETHER: guests [${pair.guestIds.join(", ")}]${pair.label ? ` — ${pair.label}` : ""}. Same table.`,
      );
    } else {
      hard.push(
        `MUST NOT SIT TOGETHER: guests [${pair.guestIds.join(", ")}]${pair.label ? ` — ${pair.label}` : ""}. Different tables.`,
      );
    }
  }

  const hardBlock = hard.length ? `Hard constraints (always respect):\n${hard.map((l, i) => `${i + 1}. ${l}`).join("\n")}` : "No hard constraints beyond capacity.";
  const softBlock = soft.length ? `\n\nSoft preferences (best effort):\n${soft.map((l, i) => `${i + 1}. ${l}`).join("\n")}` : "";
  return `${hardBlock}${softBlock}`;
}

function buildPrompt(body: SuggestRequestBody): string {
  const strategy = STRATEGY_BRIEFS[body.strategy];
  const constraints = formatConstraints(body.config);
  const capacity = body.tables.reduce((s, t) => s + t.seats, 0);
  const locked = body.alreadyAssigned ?? [];
  const modeBlock =
    locked.length > 0
      ? `MODE: fill_empty. The following ${locked.length} guests are ALREADY SEATED and MUST NOT be moved or re-emitted in your response. Only assign the unassigned guests listed below.

Already seated (do not re-emit):
${locked.map((a) => `- guestId=${a.guestId} at tableId=${a.tableId}`).join("\n")}

Account for already-used seats when respecting table capacity.`
      : "MODE: replace_all. Assign every guest listed below from scratch; no prior placement is preserved.";

  return `You are the seating-assignment planner for an Indian wedding.

Event: ${body.eventLabel} (id: ${body.eventId})
Strategy: ${strategy}

${modeBlock}

Alongside assignments, classify each table into one of four social zones:
  - "vip"     → head table, immediate family, elders, bridesmaids/groomsmen
  - "family"  → extended family, aunts/uncles, cousins, parents' friends
  - "friends" → college/school/work friends, near dance floor
  - "kids"    → children's table, near food, near parents

And return a short Dining Intelligence summary: a status ("green" = no issues,
"amber" = minor, "red" = critical), a one-line summary, and 0–6 warnings for
real issues (household splits, dietary clashes like non-veg+Jain at one table,
capacity overflows, isolated guests, accessibility misplacements). Each warning
should be actionable with a one-sentence suggestion.

${constraints}

Tables (${body.tables.length} tables, ${capacity} total seats):
${body.tables
  .map(
    (t) =>
      `- ${t.id} — "${t.label}" (${t.shape}, ${t.seats} seats${t.zone ? `, ${t.zone}` : ""})`,
  )
  .join("\n")}

Guests to seat (${body.guests.length}):
${body.guests
  .map(
    (g) =>
      `- ${g.id}: ${g.name} · side=${g.side} · household=${g.householdId} · age=${g.ageCategory} · vip=${g.vipTier}${g.dietary.length ? ` · dietary=${g.dietary.join("/")}` : ""}${g.categories.length ? ` · tags=${g.categories.join("/")}` : ""}${g.preferredLanguage ? ` · lang=${g.preferredLanguage}` : ""}${g.needsAssistance ? " · needsAssistance=true" : ""}${g.relationship ? ` · ${g.relationship}` : ""}`,
  )
  .join("\n")}

Rules of thumb for an Indian wedding reception:
- Immediate family (parents, siblings, grandparents) anchor the tables closest to the stage.
- Aunts/uncles and first cousins cluster by family branch.
- College friends / work friends each get their own table if there are enough of them.
- Elderly guests (senior) want quiet — don't seat them next to the dance floor.
- Kids and plus-ones stay with their primary guest's household.
- Never exceed a table's seat count.

Call the emit_seating_plan tool with your complete assignment. Every guest that can be seated must be assigned. If you have leftover guests and no capacity, list them but do NOT assign them to overfilled tables.`;
}

// ── Tool definition ────────────────────────────────────────────────────

const TOOL = {
  name: "emit_seating_plan",
  description:
    "Return the complete seating plan: guest→table assignments, each table's social zone, and a Dining Intelligence summary with actionable warnings.",
  input_schema: {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description:
          "One short paragraph describing how you grouped guests and which constraints drove the toughest calls.",
      },
      assignments: {
        type: "array",
        items: {
          type: "object",
          properties: {
            guestId: { type: "string" },
            tableId: { type: "string" },
            reason: {
              type: "string",
              description: "Optional: why this guest is at this table.",
            },
          },
          required: ["guestId", "tableId"],
        },
      },
      table_zones: {
        type: "array",
        description:
          "Classify each table into a social zone so the canvas can paint it in the zone's color.",
        items: {
          type: "object",
          properties: {
            tableId: { type: "string" },
            zone: {
              type: "string",
              enum: ["vip", "family", "friends", "kids"],
            },
            reason: { type: "string" },
          },
          required: ["tableId", "zone"],
        },
      },
      dining_intelligence: {
        type: "object",
        description:
          "Active issue digest for the Dining Intelligence badge: status + warnings.",
        properties: {
          status: { type: "string", enum: ["green", "amber", "red"] },
          summary: { type: "string" },
          warnings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                severity: {
                  type: "string",
                  enum: ["green", "amber", "red"],
                },
                type: {
                  type: "string",
                  enum: [
                    "household_split",
                    "dietary_clash",
                    "capacity_overflow",
                    "accessibility",
                    "isolation",
                    "zone_mismatch",
                  ],
                },
                message: { type: "string" },
                affectedGuestIds: {
                  type: "array",
                  items: { type: "string" },
                },
                affectedTableIds: {
                  type: "array",
                  items: { type: "string" },
                },
                suggestion: { type: "string" },
              },
              required: ["severity", "type", "message"],
            },
          },
        },
        required: ["status", "summary"],
      },
    },
    required: ["summary", "assignments"],
  },
} as const;

// ── Offline fallback (deterministic round-robin within side buckets) ───

function offlineFallback(body: SuggestRequestBody): SuggestResponse {
  const assignments: SuggestedAssignment[] = [];
  const capacity = new Map(body.tables.map((t) => [t.id, t.seats]));
  const occupancy = new Map<string, number>(body.tables.map((t) => [t.id, 0]));
  const locked = new Set<string>();
  for (const a of body.alreadyAssigned ?? []) {
    occupancy.set(a.tableId, (occupancy.get(a.tableId) ?? 0) + 1);
    locked.add(a.guestId);
  }

  // Group guests by household so they sit together, skipping any who are
  // already seated (fill_empty mode).
  const byHousehold = new Map<string, typeof body.guests>();
  for (const g of body.guests) {
    if (locked.has(g.id)) continue;
    const list = byHousehold.get(g.householdId) ?? [];
    list.push(g);
    byHousehold.set(g.householdId, list);
  }

  // Pre-sort tables: in "traditional", split by number; otherwise sequential.
  const tables = [...body.tables];

  for (const household of byHousehold.values()) {
    const size = household.length;
    // Find a table that can fit the whole household.
    const fit = tables.find(
      (t) => (capacity.get(t.id) ?? 0) - (occupancy.get(t.id) ?? 0) >= size,
    );
    if (!fit) {
      // Split across tables
      let remaining = [...household];
      for (const t of tables) {
        const free = (capacity.get(t.id) ?? 0) - (occupancy.get(t.id) ?? 0);
        if (free <= 0 || remaining.length === 0) continue;
        const take = remaining.splice(0, free);
        for (const g of take) {
          assignments.push({
            guestId: g.id,
            tableId: t.id,
            reason: "offline fallback",
          });
          occupancy.set(t.id, (occupancy.get(t.id) ?? 0) + 1);
        }
      }
      continue;
    }
    for (const g of household) {
      assignments.push({ guestId: g.id, tableId: fit.id, reason: "offline fallback" });
      occupancy.set(fit.id, (occupancy.get(fit.id) ?? 0) + 1);
    }
  }

  return {
    ok: true,
    model: "offline-fallback",
    assignments,
    tableZones: deriveZonesHeuristically(body, assignments),
    dining: deriveDiningHeuristically(body, assignments),
    summary: `Assigned ${assignments.length} of ${body.guests.length} guests using the offline heuristic (households together, first-fit). Set ANTHROPIC_API_KEY for intelligent grouping.`,
  };
}

// Heuristic zone classifier for the offline fallback and for filling gaps
// when the model omits some tables. Rules:
//  - majority kids/child → kids
//  - majority vip tier or "Head" in label → vip
//  - contains immediate family (parents/grandparents) → vip
//  - otherwise: friends, unless mix leans adult family → family
function deriveZonesHeuristically(
  body: SuggestRequestBody,
  assignments: SuggestedAssignment[],
): SuggestedTableZone[] {
  const guestById = new Map(body.guests.map((g) => [g.id, g] as const));
  const byTable = new Map<string, typeof body.guests>();
  for (const a of assignments) {
    const g = guestById.get(a.guestId);
    if (!g) continue;
    const list = byTable.get(a.tableId) ?? [];
    list.push(g);
    byTable.set(a.tableId, list);
  }
  const out: SuggestedTableZone[] = [];
  for (const t of body.tables) {
    const guests = byTable.get(t.id) ?? [];
    const label = (t.label ?? "").toLowerCase();
    let zone: SuggestedTableZone["zone"] = "friends";
    const kidsCount = guests.filter((g) => g.ageCategory === "child").length;
    const vipCount = guests.filter(
      (g) => g.vipTier === "vip" || g.vipTier === "immediate_family",
    ).length;
    const familyRel = guests.filter((g) =>
      /mom|dad|father|mother|sister|brother|grand|uncle|aunt|cousin|nani|nana|dadi|dada/i.test(
        g.relationship ?? "",
      ),
    ).length;
    if (kidsCount >= Math.max(2, guests.length / 2)) zone = "kids";
    else if (/head|bride|groom|sweetheart/.test(label)) zone = "vip";
    else if (vipCount >= Math.max(1, guests.length / 3)) zone = "vip";
    else if (familyRel >= Math.max(1, guests.length / 3)) zone = "family";
    out.push({ tableId: t.id, zone });
  }
  return out;
}

// Lightweight dining intelligence: detects dietary clashes and capacity
// overflows post-assignment. Model-authored warnings supersede these.
function deriveDiningHeuristically(
  body: SuggestRequestBody,
  assignments: SuggestedAssignment[],
): DiningIntelligence {
  const guestById = new Map(body.guests.map((g) => [g.id, g] as const));
  const byTable = new Map<string, string[]>();
  for (const a of assignments) {
    const list = byTable.get(a.tableId) ?? [];
    list.push(a.guestId);
    byTable.set(a.tableId, list);
  }
  const warnings: DiningWarning[] = [];
  for (const t of body.tables) {
    const gids = byTable.get(t.id) ?? [];
    if (gids.length > t.seats) {
      warnings.push({
        id: `over-${t.id}`,
        severity: "red",
        type: "capacity_overflow",
        message: `${t.label}: ${gids.length} seated but capacity is ${t.seats}.`,
        affectedTableIds: [t.id],
        suggestion: `Move ${gids.length - t.seats} guest(s) to another table.`,
      });
    }
    const diets = new Set<string>();
    for (const gid of gids) {
      const g = guestById.get(gid);
      if (!g) continue;
      for (const d of g.dietary ?? []) diets.add(d);
    }
    const hasJain = diets.has("jain");
    const hasNonVeg = diets.has("non_vegetarian");
    if (hasJain && hasNonVeg) {
      warnings.push({
        id: `clash-${t.id}`,
        severity: "amber",
        type: "dietary_clash",
        message: `${t.label} mixes Jain and non-vegetarian guests.`,
        affectedTableIds: [t.id],
        suggestion: `Move Jain guests to an all-veg table to avoid cross-contamination concerns.`,
      });
    }
  }
  const status: DiningIntelligence["status"] = warnings.some(
    (w) => w.severity === "red",
  )
    ? "red"
    : warnings.some((w) => w.severity === "amber")
      ? "amber"
      : "green";
  return {
    status,
    summary:
      warnings.length === 0
        ? "No conflicts detected."
        : `${warnings.length} issue${warnings.length === 1 ? "" : "s"} detected.`,
    issuesCount: warnings.length,
    warnings,
  };
}

// ── Route handler ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(`ai:${ip}`, { windowMs: 60_000, max: 10 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }
  let body: SuggestRequestBody;
  try {
    body = (await request.json()) as SuggestRequestBody;
  } catch {
    return json<SuggestResponse>({ ok: false, error: "Invalid JSON body." }, 400);
  }

  if (!body?.guests?.length || !body?.tables?.length) {
    return json<SuggestResponse>(
      { ok: false, error: "guests and tables are required." },
      400,
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json<SuggestResponse>(offlineFallback(body));
  }

  let anthropic: AnthropicClient;
  try {
    const mod = (await import("@anthropic-ai/sdk")) as {
      default: new (opts: { apiKey: string }) => AnthropicClient;
    };
    anthropic = new mod.default({ apiKey });
  } catch {
    return json<SuggestResponse>(offlineFallback(body));
  }

  try {
    const prompt = buildPrompt(body);
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4500,
      tools: [TOOL],
      tool_choice: { type: "tool", name: TOOL.name },
      system: [
        {
          type: "text",
          text: "You are the seating-chart assistant for an Indian wedding planning app. You call the emit_seating_plan tool with a complete, valid plan that respects all hard constraints. Never exceed a table's seat capacity. Never output prose outside the tool call.",
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: prompt }],
    });

    const toolBlock = response.content.find(
      (b): b is { type: "tool_use"; name: string; input: unknown } =>
        b.type === "tool_use" && b.name === TOOL.name,
    );
    if (!toolBlock) {
      return json<SuggestResponse>({
        ok: false,
        model: MODEL,
        error: "Model did not produce a seating plan.",
      });
    }

    const input = toolBlock.input as {
      summary?: string;
      assignments?: Array<{ guestId: string; tableId: string; reason?: string }>;
      table_zones?: Array<{
        tableId: string;
        zone: "vip" | "family" | "friends" | "kids";
        reason?: string;
      }>;
      dining_intelligence?: {
        status?: "green" | "amber" | "red";
        summary?: string;
        warnings?: Array<{
          severity: "green" | "amber" | "red";
          type:
            | "household_split"
            | "dietary_clash"
            | "capacity_overflow"
            | "accessibility"
            | "isolation"
            | "zone_mismatch";
          message: string;
          affectedGuestIds?: string[];
          affectedTableIds?: string[];
          suggestion?: string;
        }>;
      };
    };
    const raw = Array.isArray(input?.assignments) ? input.assignments : [];

    // Enforce capacity on our side too — trim any overflow. Seed occupancy
    // with any guests the client said were already seated (fill_empty mode)
    // so the model can't accidentally pile on top of them.
    const capacity = new Map(body.tables.map((t) => [t.id, t.seats]));
    const occupancy = new Map<string, number>(body.tables.map((t) => [t.id, 0]));
    const validTables = new Set(body.tables.map((t) => t.id));
    const validGuests = new Set(body.guests.map((g) => g.id));
    const seen = new Set<string>();
    for (const a of body.alreadyAssigned ?? []) {
      if (!validTables.has(a.tableId)) continue;
      occupancy.set(a.tableId, (occupancy.get(a.tableId) ?? 0) + 1);
      seen.add(a.guestId);
    }
    const cleaned: SuggestedAssignment[] = [];

    for (const a of raw) {
      if (!a?.guestId || !a?.tableId) continue;
      if (seen.has(a.guestId)) continue;
      if (!validGuests.has(a.guestId)) continue;
      if (!validTables.has(a.tableId)) continue;
      const occ = occupancy.get(a.tableId) ?? 0;
      const cap = capacity.get(a.tableId) ?? 0;
      if (occ >= cap) continue;
      occupancy.set(a.tableId, occ + 1);
      seen.add(a.guestId);
      cleaned.push({
        guestId: a.guestId,
        tableId: a.tableId,
        reason: a.reason,
      });
    }

    // Validate + map zones. Keep only known tables.
    const zoneCleaned: SuggestedTableZone[] = [];
    const zoneSeen = new Set<string>();
    for (const z of input?.table_zones ?? []) {
      if (!validTables.has(z.tableId)) continue;
      if (zoneSeen.has(z.tableId)) continue;
      if (!["vip", "family", "friends", "kids"].includes(z.zone)) continue;
      zoneSeen.add(z.tableId);
      zoneCleaned.push({ tableId: z.tableId, zone: z.zone, reason: z.reason });
    }
    // Fill in any tables the model omitted using the heuristic classifier.
    const derivedZones = deriveZonesHeuristically(body, cleaned);
    for (const z of derivedZones) {
      if (!zoneSeen.has(z.tableId)) {
        zoneCleaned.push(z);
        zoneSeen.add(z.tableId);
      }
    }

    // Dining intelligence — prefer model output, fall back to heuristics.
    const modelDining = input?.dining_intelligence;
    const dining: DiningIntelligence = modelDining?.status
      ? {
          status: modelDining.status,
          summary: modelDining.summary ?? "",
          issuesCount: modelDining.warnings?.length ?? 0,
          warnings: (modelDining.warnings ?? []).map((w, i) => ({
            id: `m-${i}-${w.type}`,
            severity: w.severity,
            type: w.type,
            message: w.message,
            affectedGuestIds: w.affectedGuestIds,
            affectedTableIds: w.affectedTableIds,
            suggestion: w.suggestion,
          })),
        }
      : deriveDiningHeuristically(body, cleaned);

    return json<SuggestResponse>({
      ok: true,
      model: MODEL,
      assignments: cleaned,
      tableZones: zoneCleaned,
      dining,
      summary:
        typeof input?.summary === "string"
          ? input.summary
          : `Assigned ${cleaned.length} of ${body.guests.length} guests across ${body.tables.length} tables.`,
    });
  } catch (err) {
    return json<SuggestResponse>({
      ok: false,
      model: MODEL,
      error: err instanceof Error ? err.message : "AI request failed.",
    });
  }
}

function json<T>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}

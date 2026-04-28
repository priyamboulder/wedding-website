// ── Collaboration graph ────────────────────────────────────────────────────
// Builds an undirected weighted graph over vendors. Edge weight = number of
// shared weddings (from Vendor.weddings[].vendor_team). Used for:
//   • "Proven Teams" discovery — surfaces 2- and 3-vendor cliques.
//   • Collaboration badge on cards — "Worked with 2 vendors in your shortlist."

import type { Vendor, VendorWedding } from "@/types/vendor-unified";
import type {
  CollaborationEdge,
  ProvenTeam,
} from "@/types/vendor-discovery";

function edgeKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function buildCollaborationGraph(
  vendors: Vendor[],
): { edges: CollaborationEdge[]; adjacency: Map<string, Map<string, number>> } {
  const edgeMap = new Map<string, CollaborationEdge>();
  const adjacency = new Map<string, Map<string, number>>();

  // Collect every wedding-team observation from every vendor. Dedup the
  // weddings themselves so a wedding that two vendors both reference is only
  // counted once for the edges it implies.
  const seenWeddings = new Set<string>();

  for (const v of vendors) {
    for (const wedding of v.weddings ?? []) {
      if (seenWeddings.has(wedding.id)) continue;
      seenWeddings.add(wedding.id);

      const teamIds = [v.id, ...wedding.vendor_team.map((t) => t.vendor_id)];
      for (let i = 0; i < teamIds.length; i++) {
        for (let j = i + 1; j < teamIds.length; j++) {
          const a = teamIds[i];
          const b = teamIds[j];
          if (!a || !b || a === b) continue;
          const key = edgeKey(a, b);
          const existing = edgeMap.get(key);
          if (existing) {
            existing.wedding_count += 1;
            if (wedding.date > existing.last_worked_together) {
              existing.last_worked_together = wedding.date;
            }
          } else {
            edgeMap.set(key, {
              vendor_a_id: a < b ? a : b,
              vendor_b_id: a < b ? b : a,
              wedding_count: 1,
              last_worked_together: wedding.date,
            });
          }

          // adjacency list
          if (!adjacency.has(a)) adjacency.set(a, new Map());
          if (!adjacency.has(b)) adjacency.set(b, new Map());
          adjacency.get(a)!.set(b, (adjacency.get(a)!.get(b) ?? 0) + 1);
          adjacency.get(b)!.set(a, (adjacency.get(b)!.get(a) ?? 0) + 1);
        }
      }
    }
  }

  return { edges: Array.from(edgeMap.values()), adjacency };
}

export interface CollaborationInfo {
  // Count of vendors in the given pool this vendor has worked with.
  overlap_count: number;
  // Top-weighted collaborators.
  top: Array<{ vendor_id: string; weddings: number }>;
}

export function collaborationWithShortlist(
  vendorId: string,
  shortlistedIds: string[],
  adjacency: Map<string, Map<string, number>>,
): CollaborationInfo {
  const neighbors = adjacency.get(vendorId);
  if (!neighbors) return { overlap_count: 0, top: [] };

  const hits: Array<{ vendor_id: string; weddings: number }> = [];
  for (const id of shortlistedIds) {
    if (id === vendorId) continue;
    const w = neighbors.get(id);
    if (w && w > 0) hits.push({ vendor_id: id, weddings: w });
  }
  hits.sort((a, b) => b.weddings - a.weddings);

  return { overlap_count: hits.length, top: hits.slice(0, 3) };
}

// ── Proven Teams ──────────────────────────────────────────────────────────
// Find triangles (or pairs) of vendors who have all appeared together at
// N+ weddings. We prefer triangles that span distinct categories (so a
// photographer + decorator + planner triangle outranks three photographers).

export function findProvenTeams(
  vendors: Vendor[],
  adjacency: Map<string, Map<string, number>>,
  minWeddings: number = 2,
): ProvenTeam[] {
  const byId = new Map(vendors.map((v) => [v.id, v]));
  const teams: ProvenTeam[] = [];
  const seen = new Set<string>();

  for (const v of vendors) {
    const neighbors = adjacency.get(v.id);
    if (!neighbors) continue;

    const strongN = Array.from(neighbors.entries())
      .filter(([_, w]) => w >= minWeddings)
      .map(([id]) => id);

    // Try triangles.
    for (let i = 0; i < strongN.length; i++) {
      for (let j = i + 1; j < strongN.length; j++) {
        const a = strongN[i];
        const b = strongN[j];
        const w1 = neighbors.get(a) ?? 0;
        const w2 = neighbors.get(b) ?? 0;
        const w3 = adjacency.get(a)?.get(b) ?? 0;
        if (w3 < minWeddings) continue;
        const minW = Math.min(w1, w2, w3);
        const ids = [v.id, a, b].sort();
        const key = ids.join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        const teamVendors = ids.map((id) => byId.get(id)!).filter(Boolean);
        if (teamVendors.length !== 3) continue;
        teams.push({
          vendor_ids: ids,
          wedding_count: minW,
          categories: Array.from(new Set(teamVendors.map((x) => x.category))),
        });
      }
    }
  }

  // Sort: most weddings first; then prefer diverse categories.
  teams.sort((a, b) => {
    if (b.wedding_count !== a.wedding_count) return b.wedding_count - a.wedding_count;
    return b.categories.length - a.categories.length;
  });

  return teams.slice(0, 12);
}

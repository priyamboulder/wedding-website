// ── Seating export helpers ────────────────────────────────────────────
// Pure utility functions that transform the current seating state into
// printable/downloadable artifacts. Kept out of components so they can
// be unit-tested later.

import type {
  FixedElement,
  FloorZone,
  SeatingTable,
} from "@/types/seating";
import type { SeatAssignment } from "@/types/seating-assignments";
import type { SeatingGuest } from "@/types/seating-guest";
import { guestFullName } from "@/types/seating-guest";
import { getElementDef } from "@/lib/floor-plan-library";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

// ── CSV: guest name | table | seat | dietary | side ──────────────────
export function buildSeatingCsv(
  guests: SeatingGuest[],
  tables: SeatingTable[],
  assignments: SeatAssignment[],
): string {
  const byTable = new Map(tables.map((t) => [t.id, t]));
  const byGuest = new Map(guests.map((g) => [g.id, g]));
  const header = ["Guest Name", "Table", "Seat Position", "Dietary", "Side"];
  const rows: string[][] = [header];
  for (const a of assignments) {
    const g = byGuest.get(a.guestId);
    const t = byTable.get(a.tableId);
    if (!g || !t) continue;
    const tableLabel = t.label?.trim() || `T${t.number}`;
    rows.push([
      csvEscape(guestFullName(g)),
      csvEscape(tableLabel),
      String(a.seatIndex + 1),
      csvEscape(g.dietary.join("; ")),
      csvEscape(g.side),
    ]);
  }
  return rows.map((r) => r.join(",")).join("\n");
}

// ── Guest lookup list: alphabetical "Last, First — Table N (Name)" ──
// Use case: reception-desk sheet so greeters can look up any guest by
// surname and tell them which table they're at.
export function buildGuestLookupList(
  guests: SeatingGuest[],
  tables: SeatingTable[],
  assignments: SeatAssignment[],
): string {
  const byGuest = new Map(assignments.map((a) => [a.guestId, a]));
  const byTable = new Map(tables.map((t) => [t.id, t]));
  const sorted = [...guests].sort((a, b) => {
    const la = a.lastName.toLowerCase();
    const lb = b.lastName.toLowerCase();
    if (la !== lb) return la.localeCompare(lb);
    return a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase());
  });
  const lines: string[] = [];
  for (const g of sorted) {
    const assignment = byGuest.get(g.id);
    if (!assignment) {
      lines.push(`${g.lastName}, ${g.firstName} — (unassigned)`);
      continue;
    }
    const t = byTable.get(assignment.tableId);
    if (!t) continue;
    const tableCode = `T${t.number}`;
    const named = t.label?.trim();
    lines.push(
      `${g.lastName}, ${g.firstName} — ${tableCode}${named ? ` (${named})` : ""}`,
    );
  }
  return lines.join("\n") + "\n";
}

// ── Table cards: one per table, ready to print as escort cards ──────
export function buildTableCardsMarkdown(
  guests: SeatingGuest[],
  tables: SeatingTable[],
  assignments: SeatAssignment[],
): string {
  const byGuest = new Map(guests.map((g) => [g.id, g]));
  const sorted = [...tables].sort((a, b) => a.number - b.number);
  const lines: string[] = [];
  for (const t of sorted) {
    const label = t.label?.trim() || `Table ${t.number}`;
    const seated = assignments
      .filter((a) => a.tableId === t.id)
      .sort((x, y) => x.seatIndex - y.seatIndex)
      .map((a) => byGuest.get(a.guestId))
      .filter(Boolean) as SeatingGuest[];
    if (seated.length === 0) continue;
    lines.push(
      `## ${label}  —  ${seated.length} of ${t.seats} seats`,
      "",
      ...seated.map((g, i) => `${i + 1}. ${guestFullName(g)}${g.dietary.length ? ` — ${g.dietary.join("/")}` : ""}`),
      "",
      "",
    );
  }
  return lines.join("\n").trim() + "\n";
}

// ── Trigger download in the browser ──────────────────────────────────
export function downloadText(
  filename: string,
  contents: string,
  mime: string = "text/plain",
) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

// ── Printable HTML view ──────────────────────────────────────────────
// Returns a standalone HTML document with the floor plan and guest
// legend. The caller opens it in a new tab and invokes window.print().
export function buildPrintableHtml(input: {
  eventLabel: string;
  roomName: string;
  roomLength: number;
  roomWidth: number;
  unit: string;
  tables: SeatingTable[];
  fixedElements: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  }>;
  assignments: SeatAssignment[];
  guests: SeatingGuest[];
}): string {
  const { eventLabel, roomName, roomLength, roomWidth, unit } = input;
  const byGuest = new Map(input.guests.map((g) => [g.id, g]));

  const tableSvg = input.tables
    .map((t) => {
      const label = t.label?.trim() || `T${t.number}`;
      const isRound = t.shape === "round";
      const w = t.width;
      const h = isRound ? t.width : t.height;
      const shape = isRound
        ? `<circle cx="0" cy="0" r="${w / 2}" fill="#fff" stroke="#333" stroke-width="0.18"/>`
        : `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="0.3" fill="#fff" stroke="#333" stroke-width="0.18"/>`;
      const seated = input.assignments
        .filter((a) => a.tableId === t.id)
        .sort((a, b) => a.seatIndex - b.seatIndex);
      const seatLabels = seated
        .map((a, idx) => {
          const g = byGuest.get(a.guestId);
          if (!g) return "";
          const angle =
            (2 * Math.PI * idx) / Math.max(seated.length, t.seats) -
            Math.PI / 2;
          const r = (isRound ? w / 2 : Math.max(w, h) / 2) + 1.8;
          const lx = r * Math.cos(angle);
          const ly = r * Math.sin(angle);
          const fullName = guestFullName(g);
          const short = fullName.length > 14 ? fullName.slice(0, 13) + "…" : fullName;
          return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" font-size="0.55" fill="#333">${escapeXml(short)}</text>`;
        })
        .join("");
      return `<g transform="translate(${t.x} ${t.y}) rotate(${t.rotation})">${shape}<text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-size="1" font-family="serif" fill="#111">${escapeXml(label)}</text>${seatLabels}</g>`;
    })
    .join("");

  const fixedSvg = input.fixedElements
    .map((f) => {
      return `<g transform="translate(${f.x} ${f.y}) rotate(${f.rotation})"><rect x="${-f.width / 2}" y="${-f.height / 2}" width="${f.width}" height="${f.height}" fill="#eee" stroke="#888" stroke-width="0.12"/><text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-size="0.9" fill="#555">${escapeXml(f.label)}</text></g>`;
    })
    .join("");

  const legendSections = input.tables
    .slice()
    .sort((a, b) => a.number - b.number)
    .map((t) => {
      const label = t.label?.trim() || `T${t.number}`;
      const seated = input.assignments
        .filter((a) => a.tableId === t.id)
        .sort((a, b) => a.seatIndex - b.seatIndex)
        .map((a) => byGuest.get(a.guestId))
        .filter(Boolean) as SeatingGuest[];
      if (seated.length === 0) return "";
      const items = seated
        .map(
          (g, i) =>
            `<li>${i + 1}. ${escapeXml(guestFullName(g))}${g.dietary.length ? ` <em>(${g.dietary.join("/")})</em>` : ""}</li>`,
        )
        .join("");
      return `<section><h3>${escapeXml(label)}</h3><ol>${items}</ol></section>`;
    })
    .join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Seating Chart — ${escapeXml(eventLabel)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Georgia, serif; color: #111; margin: 0; padding: 24px; background: #faf7f1; }
  header { text-align: center; margin-bottom: 18px; }
  header h1 { margin: 0; font-size: 28px; }
  header .sub { font-family: ui-monospace, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #666; margin-top: 4px; }
  .canvas { border: 1px solid #d9cfbb; background: #fffbf2; padding: 8px; margin: 0 auto; max-width: 100%; }
  .legend { margin-top: 22px; column-count: 2; column-gap: 26px; }
  .legend section { break-inside: avoid; margin-bottom: 14px; }
  .legend h3 { margin: 0 0 4px 0; font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 2px; }
  .legend ol { margin: 0; padding-left: 20px; font-size: 11.5px; line-height: 1.45; }
  .legend em { font-style: normal; color: #5f7a4e; font-size: 10.5px; }
  @media print {
    body { padding: 0; background: #fff; }
    .canvas { border-color: #666; }
    button { display: none; }
  }
</style>
</head>
<body>
  <header>
    <h1>${escapeXml(eventLabel)} — Seating</h1>
    <div class="sub">${escapeXml(roomName)} · ${roomLength} × ${roomWidth} ${escapeXml(unit)} · ${input.tables.length} tables</div>
  </header>
  <div class="canvas">
    <svg viewBox="-2 -2 ${roomLength + 4} ${roomWidth + 4}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;">
      <rect x="0" y="0" width="${roomLength}" height="${roomWidth}" fill="#fbf8f2" stroke="#bbb" stroke-width="0.18"/>
      ${fixedSvg}
      ${tableSvg}
    </svg>
  </div>
  <div class="legend">${legendSections}</div>
  <script>window.addEventListener("load", () => setTimeout(() => window.print(), 400));</script>
</body>
</html>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Trigger printable window ────────────────────────────────────────
export function openPrintableWindow(html: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
}

// ── Grid reference for a position ────────────────────────────────────
// Converts an (x, y) in feet into a human-readable grid reference
// ("Row C, Col 4") using 10ft grid cells. Letters for rows, numbers for
// columns. This helps vendors navigate the floor plan without needing
// to read the SVG.
function gridRef(x: number, y: number): string {
  const col = Math.floor(x / 10) + 1;
  const rowIdx = Math.floor(y / 10);
  const letter = String.fromCharCode(65 + rowIdx); // A, B, C…
  return `Row ${letter}, Col ${col}`;
}

// ── Vendor Setup Sheet (plain text, grouped by vendor) ──────────────
export function buildVendorSetupSheet(input: {
  eventLabel: string;
  roomName: string;
  elements: FixedElement[];
}): string {
  const { eventLabel, roomName, elements } = input;
  const byVendor = new Map<string, FixedElement[]>();
  for (const el of elements) {
    const name = el.properties?.vendorName?.trim() || "Unassigned";
    const list = byVendor.get(name) ?? [];
    list.push(el);
    byVendor.set(name, list);
  }
  const lines: string[] = [];
  lines.push(`Vendor Setup Sheet — ${eventLabel}`);
  lines.push(`Venue: ${roomName}`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push("");
  for (const [vendor, items] of Array.from(byVendor.entries()).sort()) {
    lines.push(`════════════════════════════════════════`);
    lines.push(`VENDOR: ${vendor}`);
    lines.push(`────────────────────────────────────────`);
    lines.push(`Total elements: ${items.length}`);
    lines.push("");
    for (const el of items) {
      const def = getElementDef(el.kind);
      lines.push(`• ${el.label} (${def?.name ?? el.kind})`);
      lines.push(`  Position: ${gridRef(el.x, el.y)} — (${el.x.toFixed(1)}, ${el.y.toFixed(1)}) ft`);
      lines.push(`  Footprint: ${el.width} × ${el.height} ft${el.rotation ? ` (rotated ${el.rotation}°)` : ""}`);
      if (el.properties?.setupTime) lines.push(`  Setup: ${el.properties.setupTime}`);
      if (el.properties?.teardownTime) lines.push(`  Teardown: ${el.properties.teardownTime}`);
      if (el.properties?.staffingCount)
        lines.push(`  Staff required: ${el.properties.staffingCount}`);
      if (el.properties?.needsPower) {
        lines.push(
          `  ⚡ Power: ${el.properties.powerWatts ?? "?"} W${el.properties.needsOutlet ? ", outlet" : ""}`,
        );
      }
      const avNeeds: string[] = [];
      if (el.properties?.needsEthernet) avNeeds.push("Ethernet");
      if (el.properties?.needsHdmi) avNeeds.push("HDMI");
      if (el.properties?.needsWirelessMic) avNeeds.push("Wireless mic");
      if (el.properties?.needsSpotlight) avNeeds.push("Spotlight");
      if (avNeeds.length) lines.push(`  AV: ${avNeeds.join(", ")}`);
      if (el.properties?.cuisineType)
        lines.push(`  Cuisine: ${el.properties.cuisineType}`);
      if (el.properties?.menuItems)
        lines.push(`  Menu: ${el.properties.menuItems}`);
      if (el.properties?.vendorContact)
        lines.push(`  Contact: ${el.properties.vendorContact}`);
      if (el.properties?.cost !== undefined)
        lines.push(`  Cost: ₹${el.properties.cost}`);
      if (el.notes) lines.push(`  Notes: ${el.notes}`);
      lines.push("");
    }
  }
  return lines.join("\n");
}

// ── AV & Power Map (text summary) ───────────────────────────────────
export function buildAvPowerMap(input: {
  eventLabel: string;
  elements: FixedElement[];
}): string {
  const { eventLabel, elements } = input;
  const powered = elements.filter((e) => e.properties?.needsPower);
  const totalWatts = powered.reduce(
    (s, e) => s + (e.properties?.powerWatts ?? 0),
    0,
  );
  const circuits = Math.max(1, Math.ceil(totalWatts / 1800)); // ~1800W per 15A circuit

  const lines: string[] = [];
  lines.push(`AV & Power Map — ${eventLabel}`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push("");
  lines.push(`Summary:`);
  lines.push(`  Elements needing power: ${powered.length}`);
  lines.push(`  Estimated total load: ${totalWatts} W`);
  lines.push(`  Dedicated circuits recommended: ${circuits}`);
  lines.push("");
  lines.push(`Elements:`);
  lines.push(`────────────────────────────────────────`);
  for (const el of powered) {
    lines.push(
      `• ${el.label} — ${el.properties?.powerWatts ?? "?"}W @ ${gridRef(el.x, el.y)}`,
    );
    const avNeeds: string[] = [];
    if (el.properties?.needsOutlet) avNeeds.push("outlet");
    if (el.properties?.needsEthernet) avNeeds.push("ethernet");
    if (el.properties?.needsHdmi) avNeeds.push("HDMI");
    if (el.properties?.needsWirelessMic) avNeeds.push("wireless mic");
    if (el.properties?.needsSpotlight) avNeeds.push("spotlight");
    if (avNeeds.length) lines.push(`  Needs: ${avNeeds.join(", ")}`);
  }
  if (powered.length === 0) {
    lines.push(`  (No elements have power requirements set yet.)`);
  }
  return lines.join("\n");
}

// ── Experience Overview (shareable summary of zones) ────────────────
export function buildExperienceOverview(input: {
  eventLabel: string;
  zones: FloorZone[];
  elements: FixedElement[];
}): string {
  const { eventLabel, zones, elements } = input;
  const lines: string[] = [];
  lines.push(`Experience Overview — ${eventLabel}`);
  lines.push(`${zones.length} themed zones · ${elements.length} elements`);
  lines.push("");

  const sorted = [...zones].sort(
    (a, b) => (a.flowOrder ?? 999) - (b.flowOrder ?? 999),
  );

  if (sorted.length === 0) {
    lines.push("(No zones defined yet. Create zones on the Experience Zones tab.)");
    return lines.join("\n");
  }

  for (const zone of sorted) {
    const x1 = zone.x - zone.width / 2;
    const x2 = zone.x + zone.width / 2;
    const y1 = zone.y - zone.height / 2;
    const y2 = zone.y + zone.height / 2;
    const contained = elements.filter(
      (e) => e.x >= x1 && e.x <= x2 && e.y >= y1 && e.y <= y2,
    );
    lines.push(`════════════════════════════════════════`);
    lines.push(
      `${zone.flowOrder ? `${zone.flowOrder}. ` : ""}${zone.name.toUpperCase()}`,
    );
    if (zone.description) lines.push(zone.description);
    lines.push(`  Footprint: ${zone.width} × ${zone.height} ft`);
    if (contained.length > 0) {
      lines.push(`  Elements:`);
      for (const el of contained) {
        const vendor = el.properties?.vendorName
          ? ` · ${el.properties.vendorName}`
          : "";
        lines.push(`    · ${el.label}${vendor}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

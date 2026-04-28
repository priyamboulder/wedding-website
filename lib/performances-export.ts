// ── Performances export helpers ─────────────────────────────────────────────
// Produces Run-of-Show markdown and a flat Song List for DJ/sound teams.
// Download helpers trigger browser downloads of the generated text.

import type { Performance } from "@/types/performance";
import { performanceDurationMinutes } from "@/types/performance";

type EventLike = { id: string; label: string; date: string };
type GuestLike = { id: string; firstName: string; lastName: string };

function formatDuration(mins: number): string {
  if (mins <= 0) return "—";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function guestName(guestId: string, guests: GuestLike[]): string {
  const g = guests.find((x) => x.id === guestId);
  return g ? `${g.firstName} ${g.lastName}` : guestId;
}

function formatSongDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function runOfShowMarkdown(
  event: EventLike,
  performances: Performance[],
  guests: GuestLike[],
): string {
  const ordered = [...performances].sort((a, b) => a.order - b.order);
  const totalMins = ordered.reduce(
    (acc, p) => acc + performanceDurationMinutes(p),
    0,
  );

  const lines: string[] = [];
  lines.push(`# ${event.label} — Run of Show`);
  lines.push(`_Date: ${event.date}_`);
  lines.push("");
  lines.push(
    `**${ordered.length} performances · Total runtime: ${formatDuration(totalMins)}**`,
  );
  lines.push("");

  ordered.forEach((p, i) => {
    const idx = i + 1;
    const duration = performanceDurationMinutes(p);
    lines.push(`## ${idx}. ${p.name}`);
    lines.push(
      `- **Type:** ${p.type} · **Duration:** ${formatDuration(duration)} · **Status:** ${p.status}`,
    );

    if (p.participants.length > 0) {
      const parts = p.participants
        .map((pt) => `${guestName(pt.guestId, guests)} (${pt.role})`)
        .join(", ");
      lines.push(`- **Performers:** ${parts}`);
    }

    if (p.songs.length > 0) {
      lines.push(`- **Songs:**`);
      for (const s of p.songs) {
        lines.push(
          `  - ${s.title} — ${s.artist} (${formatSongDuration(s.durationSeconds)})`,
        );
      }
    }

    if (p.costumes) lines.push(`- **Costumes:** ${p.costumes}`);
    if (p.avRequirements.length > 0) {
      lines.push(`- **AV needs:** ${p.avRequirements.join(", ")}`);
    }
    if (p.notes) lines.push(`- **Notes:** ${p.notes}`);
    lines.push("");
  });

  return lines.join("\n");
}

export function songListMarkdown(
  performances: Performance[],
  events: EventLike[],
): string {
  const lines: string[] = [];
  lines.push("# Song List — DJ / Sound");
  lines.push("");

  const byEvent = new Map<string, Performance[]>();
  for (const p of performances) {
    const list = byEvent.get(p.eventId) ?? [];
    list.push(p);
    byEvent.set(p.eventId, list);
  }

  let grandTotal = 0;

  for (const event of events) {
    const list = byEvent.get(event.id);
    if (!list || list.length === 0) continue;
    const sorted = [...list].sort((a, b) => a.order - b.order);

    lines.push(`## ${event.label} (${event.date})`);
    lines.push("");

    for (const p of sorted) {
      if (p.songs.length === 0) continue;
      lines.push(`### ${p.name}`);
      for (const s of p.songs) {
        grandTotal += s.durationSeconds;
        lines.push(
          `- ${s.title} — ${s.artist} · ${formatSongDuration(s.durationSeconds)}`,
        );
      }
      lines.push("");
    }
  }

  lines.push("---");
  lines.push(
    `**Total music runtime: ${formatSongDuration(grandTotal)} (${Math.round(grandTotal / 60)} min)**`,
  );
  return lines.join("\n");
}

export function downloadText(filename: string, content: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

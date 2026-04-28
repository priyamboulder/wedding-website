// ── Tiny local telemetry logger ───────────────────────────────────────────
// The app has no analytics provider wired up yet. This logger keeps a
// ring buffer of events in localStorage + logs to console so product can
// inspect quiz funnels locally. Swap the `ship()` call for PostHog /
// Segment / custom API when the real pipeline lands.

const BUFFER_KEY = "ananya:telemetry-ring";
const MAX_EVENTS = 500;

export interface TelemetryEvent {
  name: string;
  at: string;
  props: Record<string, unknown>;
}

function read(): TelemetryEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BUFFER_KEY);
    return raw ? (JSON.parse(raw) as TelemetryEvent[]) : [];
  } catch {
    return [];
  }
}

function write(events: TelemetryEvent[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed =
      events.length > MAX_EVENTS ? events.slice(-MAX_EVENTS) : events;
    window.localStorage.setItem(BUFFER_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore quota errors — telemetry is fire-and-forget
  }
}

export function track(name: string, props: Record<string, unknown> = {}) {
  const event: TelemetryEvent = {
    name,
    at: new Date().toISOString(),
    props,
  };
  if (typeof window !== "undefined") {
    const buf = read();
    buf.push(event);
    write(buf);
  }
  if (typeof console !== "undefined") {
    // Namespaced so it's easy to filter in devtools.
    console.debug("[telemetry]", name, props);
  }
}

export function getRecentEvents(limit = 50): TelemetryEvent[] {
  return read().slice(-limit);
}

export function clearTelemetry() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(BUFFER_KEY);
  } catch {
    // ignore
  }
}

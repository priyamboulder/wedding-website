"use client";

// ── Travel & Accommodations Build · Session 2: Guest Travel Tracker ───────
// Walks the couple through Tab 3 (Guest Travel Hub). Each guest entry feeds
// the arrival-cluster calculator; clusters in turn feed Transportation
// Build's airport pickup roster.
//
// Storage:
//   • guest_travel_entries[] = travel-store.guests (same as Tab 3).
//   • arrival_clusters[] = computed live via buildArrivalClusters(); cached
//     for Tab 3 + Transportation Build via localStorage.
//   • booking_link_dispatch + visa letter counters = small build-only blob
//     in localStorage.

import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Plane,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import { useTravelStore } from "@/stores/travel-store";
import {
  type GuestHotelStatus,
  type GuestTravelEntry,
} from "@/types/travel";
import type { WorkspaceCategory } from "@/types/workspace";
import {
  BOOKING_STATUS_OPTIONS,
  DEFAULT_HOME_COUNTRY,
  isInternationalGuest,
  type BookingStatus,
} from "@/lib/guided-journeys/travel-accommodations-build";
import {
  buildArrivalClusters,
  clustersToAirportPickups,
  type ArrivalCluster,
} from "@/lib/calculators/arrival-clusters";
import {
  C,
  FONT_MONO,
  FONT_SANS,
  FONT_SERIF,
} from "@/components/workspace/shared/guided-journey/styles";

// ── Build-only blobs in localStorage ───────────────────────────────────────

const COUNTRIES_KEY = "ananya:travel-build:departure-countries";
const RELATIONSHIPS_KEY = "ananya:travel-build:guest-relationships";
const DISPATCH_KEY = "ananya:travel-build:dispatch-counters";
const CLUSTER_CACHE_KEY = "ananya:travel-build:arrival-clusters";

function loadMap(key: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function persistMap(key: string, value: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

interface DispatchCounters {
  sent_to_count: number;
  not_yet_sent_count: number;
  last_send_date?: string;
  template_text?: string;
}

function loadDispatch(): DispatchCounters {
  if (typeof window === "undefined") {
    return { sent_to_count: 0, not_yet_sent_count: 0 };
  }
  try {
    const raw = window.localStorage.getItem(DISPATCH_KEY);
    if (!raw) return { sent_to_count: 0, not_yet_sent_count: 0 };
    return JSON.parse(raw) as DispatchCounters;
  } catch {
    return { sent_to_count: 0, not_yet_sent_count: 0 };
  }
}

function persistDispatch(value: DispatchCounters) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DISPATCH_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function persistClusterCache(clusters: ArrivalCluster[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLUSTER_CACHE_KEY, JSON.stringify(clusters));
  } catch {
    // ignore
  }
}

// ── Build-only ↔ Tab 3 status mapping ──────────────────────────────────────
// Tab 3's enum has 3 values; Build's has 5. The mapping is documented in
// travel-accommodations-build-sync.ts; codified here.

function buildToTabStatus(s: BookingStatus): GuestHotelStatus {
  if (s === "booked") return "booked";
  if (s === "cancelled") return "elsewhere";
  return "not_booked";
}

function tabToBuildStatus(s: GuestHotelStatus): BookingStatus {
  if (s === "booked") return "booked";
  if (s === "elsewhere") return "cancelled";
  return "not_booked";
}

// ── Component ──────────────────────────────────────────────────────────────

export function GuestTravelTrackerSession({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const all = useTravelStore((s) => s.guests);
  const blocks = useTravelStore((s) => s.blocks);
  const addGuest = useTravelStore((s) => s.addGuest);
  const updateGuest = useTravelStore((s) => s.updateGuest);
  const deleteGuest = useTravelStore((s) => s.deleteGuest);

  const rows = useMemo(
    () =>
      all
        .filter((g) => g.category_id === category.id)
        .sort((a, b) => {
          if (a.arrives_date === b.arrives_date)
            return a.sort_order - b.sort_order;
          if (!a.arrives_date) return 1;
          if (!b.arrives_date) return -1;
          return a.arrives_date < b.arrives_date ? -1 : 1;
        }),
    [all, category.id],
  );

  const localBlocks = useMemo(
    () => blocks.filter((b) => b.category_id === category.id),
    [blocks, category.id],
  );

  // Build-only metadata kept per guest id in localStorage. Tab 3 doesn't
  // model these fields yet so we add them client-side without polluting the
  // shared store.
  const [countries, setCountries] = useState<Record<string, string>>({});
  const [relationships, setRelationships] = useState<Record<string, string>>(
    {},
  );
  const [dispatch, setDispatchState] = useState<DispatchCounters>({
    sent_to_count: 0,
    not_yet_sent_count: 0,
  });

  useEffect(() => {
    setCountries(loadMap(COUNTRIES_KEY));
    setRelationships(loadMap(RELATIONSHIPS_KEY));
    setDispatchState(loadDispatch());
  }, []);

  function setCountry(id: string, country: string) {
    const next = { ...countries, [id]: country };
    setCountries(next);
    persistMap(COUNTRIES_KEY, next);
  }

  function setRelationship(id: string, value: string) {
    const next = { ...relationships, [id]: value };
    setRelationships(next);
    persistMap(RELATIONSHIPS_KEY, next);
  }

  function setDispatch(patch: Partial<DispatchCounters>) {
    const next = { ...dispatch, ...patch };
    setDispatchState(next);
    persistDispatch(next);
  }

  // Compute clusters from current rows. The calculator is the source of
  // truth — Transportation Build re-derives the same way.
  const clusters = useMemo(() => {
    const computed = buildArrivalClusters(
      rows.map((r) => ({
        id: r.id,
        arrival_date: r.arrives_date,
        arrival_time: r.arrives_time,
        travel_party_size: r.party_size,
        flight_info: r.flight,
      })),
    );
    persistClusterCache(computed);
    return computed;
  }, [rows]);

  const stats = useMemo(() => {
    const totalGuests = rows.reduce((a, r) => a + (r.party_size || 1), 0);
    const booked = rows.filter((r) => r.status === "booked").length;
    const notBooked = rows.filter((r) => r.status === "not_booked").length;
    const international = rows.filter((r) =>
      isInternationalGuest(countries[r.id]),
    ).length;
    return {
      totalGuests,
      totalEntries: rows.length,
      booked,
      notBooked,
      international,
      clusterCount: clusters.length,
      visaLetters: international,
    };
  }, [rows, clusters, countries]);

  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.guest_name.toLowerCase().includes(q) ||
        r.from_city.toLowerCase().includes(q) ||
        r.hotel_name.toLowerCase().includes(q),
    );
  }, [rows, query]);

  function handleAdd() {
    addGuest({
      category_id: category.id,
      guest_name: "",
      party_size: 1,
      from_city: "",
      arrives_date: "",
      arrives_time: "",
      flight: "",
      hotel_name: "",
      status: "not_booked",
      notes: "",
    });
  }

  function handlePushClustersToTransportation() {
    const pickups = clustersToAirportPickups(clusters);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "ananya:transportation-build:airport-pickups",
        JSON.stringify(pickups),
      );
    } catch {
      // ignore
    }
    setDispatch({ last_send_date: new Date().toISOString() });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Stats strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <Stat label="Guests tracked" value={stats.totalGuests} />
        <Stat label="Entries" value={stats.totalEntries} />
        <Stat
          label="Booked"
          value={stats.booked}
          tone="ok"
          hint={
            stats.totalEntries > 0
              ? `${Math.round((stats.booked / stats.totalEntries) * 100)}%`
              : ""
          }
        />
        <Stat
          label="Not booked"
          value={stats.notBooked}
          tone={stats.notBooked > 0 ? "alert" : "neutral"}
        />
      </div>

      {/* Arrival clusters */}
      <section
        style={{
          backgroundColor: C.paper,
          border: `1px solid ${C.line}`,
          borderRadius: 6,
          padding: "14px 18px",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Plane size={14} strokeWidth={1.6} color={C.gold} />
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: C.gold,
              }}
            >
              Arrival clusters
            </span>
          </div>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10.5,
              color: C.muted,
            }}
          >
            {clusters.length} cluster{clusters.length === 1 ? "" : "s"}
          </span>
        </header>
        <p
          style={{
            fontFamily: FONT_SERIF,
            fontStyle: "italic",
            fontSize: 13,
            color: C.muted,
            margin: "0 0 10px",
          }}
        >
          Two or more guests arriving within 3 hours of each other on the
          same date form a cluster — a single van or shuttle run can pick
          them up.
        </p>
        {clusters.length === 0 ? (
          <p
            style={{
              fontFamily: FONT_SANS,
              fontSize: 12,
              color: C.faint,
              fontStyle: "italic",
              margin: 0,
            }}
          >
            Add arrival dates below and clusters will surface here.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: 6,
            }}
          >
            {clusters.map((c) => (
              <li
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "8px 12px",
                  borderRadius: 4,
                  backgroundColor: C.ivorySoft,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: FONT_SERIF,
                      fontSize: 14.5,
                      color: C.ink,
                      fontWeight: 600,
                    }}
                  >
                    {c.suggested_pickup_window}
                    {c.arrival_airport && (
                      <span
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 11,
                          color: C.muted,
                          marginLeft: 8,
                        }}
                      >
                        · {c.arrival_airport}
                      </span>
                    )}
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontFamily: FONT_SANS,
                      fontSize: 12,
                      color: C.muted,
                    }}
                  >
                    {c.guests_in_cluster.length} part
                    {c.guests_in_cluster.length === 1 ? "y" : "ies"} ·{" "}
                    {c.total_pax} pax
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 9.5,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: C.gold,
                  }}
                >
                  Cluster {c.id.slice(-4)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {clusters.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 12,
            }}
          >
            <button
              type="button"
              onClick={handlePushClustersToTransportation}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 4,
                border: "none",
                background: C.ink,
                color: C.ivory,
                fontFamily: FONT_SANS,
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              <Send size={12} strokeWidth={2} /> Send pickup roster to
              Transportation
              <ChevronRight size={12} strokeWidth={2} />
            </button>
            {dispatch.last_send_date && (
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 10.5,
                  color: C.muted,
                }}
              >
                last sent {new Date(dispatch.last_send_date).toLocaleString()}
              </span>
            )}
          </div>
        )}
      </section>

      {/* International + visa hint */}
      {stats.international > 0 && (
        <section
          style={{
            backgroundColor: C.rosePale,
            border: `1px solid ${C.roseSoft}`,
            borderRadius: 6,
            padding: "12px 16px",
          }}
        >
          <p
            style={{
              fontFamily: FONT_SERIF,
              fontSize: 14,
              color: C.ink,
              margin: 0,
            }}
          >
            <strong>
              {stats.international} international guest
              {stats.international === 1 ? "" : "s"}
            </strong>{" "}
            need invitation letters for visa applications.{" "}
            <span
              style={{
                color: C.muted,
                fontFamily: FONT_SERIF,
                fontStyle: "italic",
              }}
            >
              We&apos;ll surface a letter generator in a future update — for
              now, flag this in your documents.
            </span>
          </p>
        </section>
      )}

      {/* Guest travel table */}
      <section
        style={{
          backgroundColor: C.paper,
          border: `1px solid ${C.line}`,
          borderRadius: 6,
          padding: "14px 18px",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <Users size={14} strokeWidth={1.6} color={C.muted} />
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: C.muted,
            }}
          >
            Guest travel
          </span>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10.5,
              color: C.faint,
              marginLeft: "auto",
            }}
          >
            {stats.totalEntries} row{stats.totalEntries === 1 ? "" : "s"}
          </span>
        </header>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={12}
              strokeWidth={2}
              color={C.faint}
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, city, hotel…"
              style={{
                width: "100%",
                padding: "6px 9px 6px 26px",
                borderRadius: 4,
                border: `1px solid ${C.line}`,
                background: C.paper,
                fontFamily: FONT_SANS,
                fontSize: 12.5,
                outline: "none",
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 4,
              border: "none",
              background: C.ink,
              color: C.ivory,
              fontFamily: FONT_SANS,
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            <Plus size={12} strokeWidth={2} /> Add guest
          </button>
        </div>

        {filtered.length === 0 ? (
          <p
            style={{
              padding: "16px 12px",
              textAlign: "center",
              border: `1px dashed ${C.line}`,
              borderRadius: 4,
              fontFamily: FONT_SERIF,
              fontStyle: "italic",
              color: C.muted,
              fontSize: 13,
            }}
          >
            No guests tracked yet. Start with the elders flying in — they're
            the ones whose pickup matters most.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                  <Th>Guest</Th>
                  <Th>Relationship</Th>
                  <Th>From</Th>
                  <Th>Country</Th>
                  <Th>Arrives</Th>
                  <Th>Flight</Th>
                  <Th>Hotel</Th>
                  <Th>Status</Th>
                  <th aria-label="actions" style={{ width: 24 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <GuestRow
                    key={row.id}
                    row={row}
                    blockOptions={localBlocks.map((b) => ({
                      id: b.id,
                      label: b.name || "Unnamed block",
                    }))}
                    country={countries[row.id] ?? ""}
                    relationship={relationships[row.id] ?? ""}
                    onUpdate={(patch) => updateGuest(row.id, patch)}
                    onDelete={() => deleteGuest(row.id)}
                    onCountryChange={(c) => setCountry(row.id, c)}
                    onRelationshipChange={(r) => setRelationship(row.id, r)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p
        style={{
          fontFamily: FONT_SERIF,
          fontStyle: "italic",
          fontSize: 13,
          color: C.muted,
          margin: 0,
        }}
      >
        Country defaults to {DEFAULT_HOME_COUNTRY} (domestic). Set when guests
        are travelling internationally so visa-letter counts stay accurate.
      </p>
    </div>
  );
}

// ── Guest row ──────────────────────────────────────────────────────────────

function GuestRow({
  row,
  blockOptions,
  country,
  relationship,
  onUpdate,
  onDelete,
  onCountryChange,
  onRelationshipChange,
}: {
  row: GuestTravelEntry;
  blockOptions: Array<{ id: string; label: string }>;
  country: string;
  relationship: string;
  onUpdate: (patch: Partial<GuestTravelEntry>) => void;
  onDelete: () => void;
  onCountryChange: (c: string) => void;
  onRelationshipChange: (r: string) => void;
}) {
  const buildStatus = tabToBuildStatus(row.status);
  return (
    <tr style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
      <Td>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <input
            value={row.guest_name}
            onChange={(e) => onUpdate({ guest_name: e.target.value })}
            placeholder="Guest name"
            style={cellInputStyle()}
          />
          <input
            type="number"
            min={1}
            value={row.party_size || 1}
            onChange={(e) =>
              onUpdate({ party_size: Number(e.target.value) || 1 })
            }
            aria-label="Party size"
            style={{
              width: 38,
              ...cellInputStyle(),
              fontFamily: FONT_MONO,
              fontSize: 11,
            }}
          />
        </div>
      </Td>
      <Td>
        <input
          value={relationship}
          onChange={(e) => onRelationshipChange(e.target.value)}
          placeholder="e.g. Bride's grandparents"
          style={cellInputStyle()}
        />
      </Td>
      <Td>
        <input
          value={row.from_city}
          onChange={(e) => onUpdate({ from_city: e.target.value })}
          placeholder="City"
          style={cellInputStyle()}
        />
      </Td>
      <Td>
        <input
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          placeholder={DEFAULT_HOME_COUNTRY}
          style={cellInputStyle()}
        />
        {isInternationalGuest(country) && (
          <span
            style={{
              display: "inline-block",
              marginTop: 2,
              padding: "1px 6px",
              borderRadius: 999,
              backgroundColor: C.rosePale,
              color: C.rose,
              fontFamily: FONT_MONO,
              fontSize: 9,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Intl
          </span>
        )}
      </Td>
      <Td>
        <div style={{ display: "flex", gap: 3 }}>
          <input
            type="date"
            value={row.arrives_date}
            onChange={(e) => onUpdate({ arrives_date: e.target.value })}
            style={{ ...cellInputStyle(), fontFamily: FONT_MONO, fontSize: 11 }}
          />
          <input
            type="time"
            value={row.arrives_time}
            onChange={(e) => onUpdate({ arrives_time: e.target.value })}
            style={{
              width: 62,
              ...cellInputStyle(),
              fontFamily: FONT_MONO,
              fontSize: 11,
            }}
          />
        </div>
      </Td>
      <Td>
        <input
          value={row.flight}
          onChange={(e) => onUpdate({ flight: e.target.value })}
          placeholder="AI 101"
          style={{ ...cellInputStyle(), fontFamily: FONT_MONO, fontSize: 11 }}
        />
      </Td>
      <Td>
        {blockOptions.length > 0 ? (
          <select
            value={
              blockOptions.find((b) => b.label === row.hotel_name)?.id ?? ""
            }
            onChange={(e) => {
              const opt = blockOptions.find((b) => b.id === e.target.value);
              onUpdate({ hotel_name: opt?.label ?? "" });
            }}
            style={cellInputStyle()}
          >
            <option value="">—</option>
            {blockOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={row.hotel_name}
            onChange={(e) => onUpdate({ hotel_name: e.target.value })}
            placeholder="Hotel"
            style={cellInputStyle()}
          />
        )}
      </Td>
      <Td>
        <select
          value={buildStatus}
          onChange={(e) =>
            onUpdate({
              status: buildToTabStatus(e.target.value as BookingStatus),
            })
          }
          style={cellInputStyle()}
        >
          {BOOKING_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Td>
      <Td>
        <button
          type="button"
          aria-label="Delete"
          onClick={onDelete}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: C.faint,
            padding: 2,
          }}
        >
          <Trash2 size={11} strokeWidth={1.8} />
        </button>
      </Td>
    </tr>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "6px 8px",
        fontFamily: FONT_MONO,
        fontSize: 9.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: C.faint,
        fontWeight: 500,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td style={{ padding: "6px 8px", verticalAlign: "middle" }}>{children}</td>
  );
}

function cellInputStyle(): React.CSSProperties {
  return {
    width: "100%",
    padding: "4px 6px",
    border: "1px solid transparent",
    borderRadius: 3,
    background: "transparent",
    fontFamily: FONT_SANS,
    fontSize: 12,
    outline: "none",
  };
}

// ── Stat tile ──────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "ok" | "alert" | "neutral";
}) {
  const accent =
    tone === "alert" ? C.rose : tone === "ok" ? C.sage : C.inkSoft;
  return (
    <div
      style={{
        backgroundColor: C.paper,
        border: `1px solid ${C.line}`,
        borderRadius: 6,
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 9.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: C.faint,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 22,
          color: accent,
          fontWeight: 600,
          lineHeight: 1.1,
          marginTop: 2,
        }}
      >
        {value}
      </div>
      {hint && (
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 11,
            color: C.muted,
            marginTop: 2,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

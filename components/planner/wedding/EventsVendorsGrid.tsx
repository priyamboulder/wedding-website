import type {
  WeddingDetail,
  WeddingEvent,
} from "@/lib/planner/wedding-detail-seed";
import { PLANNER_PALETTE } from "@/components/planner/ui";

export function EventsVendorsGrid({ wedding }: { wedding: WeddingDetail }) {
  const events = wedding.events;

  return (
    <section
      className="mt-8 rounded-2xl border bg-white p-6"
      style={{
        borderColor: PLANNER_PALETTE.hairline,
        boxShadow:
          "0 1px 0 rgba(44,44,44,0.02), 0 24px 48px -36px rgba(44,44,44,0.16)",
      }}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.26em] text-[#9E8245]">
            Coverage matrix
          </p>
          <h2
            className="mt-1 text-[26px] leading-none text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            Events × Vendors
          </h2>
          <p
            className="mt-2 text-[12.5px] italic text-[#6a6a6a]"
            style={{ fontFamily: "'EB Garamond', serif" }}
          >
            Which vendors are needed for which events — spot coverage gaps at a glance.
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-[12.5px]">
          <thead>
            <tr>
              <th className="w-[32%] py-2 text-left font-normal text-[#8a8a8a]">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em]">
                  Category
                </span>
              </th>
              {events.map((e) => (
                <th
                  key={e}
                  className="px-2 py-2 text-center font-normal text-[#8a8a8a]"
                >
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.22em]">
                    {e}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {wedding.vendors.map((row, i) => {
              const zebra = i % 2 === 1 ? "bg-[#FBF4E6]/55" : "";
              return (
                <tr
                  key={row.id}
                  className={`border-t ${zebra}`}
                  style={{ borderColor: "rgba(44,44,44,0.06)" }}
                >
                  <td className="py-2.5 pr-2">
                    <span className="text-[14px] mr-1.5" aria-hidden>
                      {row.icon}
                    </span>
                    <span className="text-[12.5px] text-[#2C2C2C]">
                      {row.category}
                    </span>
                    {row.status === "open" && (
                      <span className="ml-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#C0392B]">
                        open
                      </span>
                    )}
                  </td>
                  {events.map((e) => (
                    <td key={e} className="px-2 py-2.5 text-center">
                      <Mark kind={row.events[e] ?? "none"} isOpen={row.status === "open"} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px]">
        <Legend glyph="✓" color="#1F7A3A" label="Needed — covered" />
        <Legend glyph="✓" color="#C0392B" label="Needed — open" />
        <Legend glyph="○" color="#b5a68e" label="Not needed" />
      </div>
    </section>
  );
}

function Mark({
  kind,
  isOpen,
}: {
  kind: "needed" | "optional" | "none";
  isOpen: boolean;
}) {
  if (kind === "needed") {
    return (
      <span
        aria-label="Needed"
        style={{
          color: isOpen ? "#C0392B" : "#1F7A3A",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        ✓
      </span>
    );
  }
  return (
    <span
      aria-label="Not applicable"
      style={{ color: "#c8b795", fontSize: "13px" }}
    >
      ○
    </span>
  );
}

function Legend({
  glyph,
  color,
  label,
}: {
  glyph: string;
  color: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[#5a5a5a]">
      <span style={{ color, fontWeight: 600 }} aria-hidden>
        {glyph}
      </span>
      {label}
    </span>
  );
}

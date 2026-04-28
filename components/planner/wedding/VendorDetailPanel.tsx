"use client";

import type { WeddingVendorRow } from "@/lib/planner/wedding-detail-seed";
import { StatusBadge } from "./StatusBadge";

export function VendorDetailPanel({
  row,
  onClose,
}: {
  row: WeddingVendorRow;
  onClose: () => void;
}) {
  const v = row.vendor;
  if (!v) return null;

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Close vendor detail"
        onClick={onClose}
        className="absolute inset-0 bg-black/25 transition-opacity"
      />
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col overflow-hidden border-l bg-white shadow-2xl"
        style={{ borderColor: "rgba(44,44,44,0.08)" }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-4 border-b px-6 py-5"
          style={{ borderColor: "rgba(44,44,44,0.08)" }}
        >
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-[15px] font-medium"
              style={{
                backgroundColor: "#F5E6D0",
                color: "#7a5a1a",
                boxShadow: "inset 0 0 0 1px rgba(196,162,101,0.45)",
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              {v.photoInitials}
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#9E8245]">
                {row.icon} {row.category}
              </p>
              <h2
                className="mt-1 text-[24px] leading-tight text-[#2C2C2C]"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                }}
              >
                {v.name}
              </h2>
              <p className="mt-1 text-[12px] text-[#6a6a6a]">
                <span style={{ color: "#8a5a20" }}>★ {v.rating.toFixed(1)}</span>
                {v.instagram && (
                  <>
                    <span className="mx-1.5 text-[#b5a68e]">·</span>
                    <span className="text-[#2a558c]">{v.instagram}</span>
                  </>
                )}
                <span className="mx-1.5 text-[#b5a68e]">·</span>
                {v.location}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[16px] text-[#5a5a5a] transition-colors hover:bg-[#F5E6D0]/55"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <StatusBadge status={row.status} />
            <span className="font-mono text-[16px] text-[#2C2C2C]"
              style={{ fontWeight: 500 }}
            >
              ${row.budget.toLocaleString()}
            </span>
          </div>

          {/* Contract / key dates */}
          <section className="mt-6">
            <h3 className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
              Contract & Key Dates
            </h3>
            <dl className="mt-3 space-y-2.5 text-[12.5px]">
              {v.signedOn && (
                <DetailRow label="Contract signed" value={v.signedOn} />
              )}
              {v.depositDue && (
                <DetailRow label="Deposit" value={v.depositDue} />
              )}
              {v.finalDue && (
                <DetailRow label="Final payment due" value={v.finalDue} />
              )}
              {v.workedTogether != null && (
                <DetailRow
                  label="Collaboration history"
                  value={`${v.workedTogether} weddings together`}
                />
              )}
            </dl>
          </section>

          {/* Communication */}
          {v.lastMessage && (
            <section className="mt-6">
              <h3 className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
                Latest Message
              </h3>
              <blockquote
                className="mt-3 rounded-lg border-l-2 px-3.5 py-3 text-[13px] italic text-[#4a4a4a]"
                style={{
                  backgroundColor: "#FBF4E6",
                  borderColor: "#C4A265",
                  fontFamily: "'EB Garamond', serif",
                }}
              >
                "{v.lastMessage}"
              </blockquote>
            </section>
          )}

          {/* Documents */}
          {v.documents && v.documents.length > 0 && (
            <section className="mt-6">
              <h3 className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">
                Documents
              </h3>
              <ul className="mt-3 space-y-2">
                {v.documents.map((d) => (
                  <li
                    key={d.label}
                    className="flex items-center justify-between rounded-lg border px-3.5 py-2.5"
                    style={{ borderColor: "rgba(44,44,44,0.08)" }}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className="grid h-7 w-7 place-items-center rounded-md text-[11px]"
                        style={{
                          backgroundColor: "#F5E6D0",
                          color: "#9E8245",
                        }}
                        aria-hidden
                      >
                        {d.kind === "contract" ? "📄" : d.kind === "proposal" ? "✎" : "✦"}
                      </span>
                      <span className="text-[12.5px] text-[#2C2C2C]">{d.label}</span>
                    </span>
                    <span className="text-[11px] text-[#9E8245]">Open</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Footer actions */}
        <div
          className="flex gap-2 border-t bg-[#FAF8F5] px-6 py-4"
          style={{ borderColor: "rgba(44,44,44,0.08)" }}
        >
          <button
            type="button"
            className="flex-1 rounded-full px-4 py-2.5 text-[12.5px] font-medium"
            style={{ backgroundColor: "#2C2C2C", color: "#FAF8F5" }}
          >
            Message Vendor
          </button>
          <button
            type="button"
            className="rounded-full px-4 py-2.5 text-[12.5px] font-medium text-[#2C2C2C] transition-colors hover:bg-[#F5E6D0]"
            style={{ boxShadow: "inset 0 0 0 1px rgba(44,44,44,0.12)" }}
          >
            Full Profile
          </button>
          <button
            type="button"
            className="rounded-full px-4 py-2.5 text-[12.5px] font-medium transition-colors hover:bg-[#FADBD8]/45"
            style={{
              color: "#C0392B",
              boxShadow: "inset 0 0 0 1px rgba(192,57,43,0.35)",
            }}
          >
            Replace
          </button>
        </div>
      </aside>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[#6a6a6a]">{label}</dt>
      <dd className="text-[#2C2C2C]">{value}</dd>
    </div>
  );
}

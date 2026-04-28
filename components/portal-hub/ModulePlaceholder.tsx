import Link from "next/link";
import { STATUS_COPY, getModule, getPortal } from "@/lib/portal-hub/portals";

type Props = {
  portalId: string;
  moduleSlug: string;
  /**
   * Message shown in the build-brief card. Defaults to "Ready to build".
   * Couple Portal modules where a standalone component already exists should
   * pass "Component exists — needs integration".
   */
  note?: string;
};

export default function ModulePlaceholder({
  portalId,
  moduleSlug,
  note = "Ready to build",
}: Props) {
  const portal = getPortal(portalId);
  const mod = getModule(portalId, moduleSlug);

  if (!portal || !mod) {
    return (
      <div className="px-10 py-16">
        <p className="text-sm text-stone-600">Unknown module.</p>
        <Link
          href="/portal-hub"
          className="mt-4 inline-block text-sm text-[#7a5a16] underline"
        >
          ← Back to Portal Hub
        </Link>
      </div>
    );
  }

  const status = STATUS_COPY[mod.status];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#FFFFF0",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: "#2a2a2a",
      }}
    >
      <div className="mx-auto max-w-4xl px-10 py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-stone-500">
          <Link
            href="/portal-hub"
            className="uppercase tracking-[0.2em] hover:text-[#7a5a16]"
          >
            Portal Hub
          </Link>
          <span aria-hidden>/</span>
          <span className="uppercase tracking-[0.2em] text-[#7a5a16]">
            {portal.name}
          </span>
          <span aria-hidden>/</span>
          <span className="uppercase tracking-[0.2em] text-stone-700">
            {mod.name}
          </span>
        </nav>

        {/* Title block */}
        <div className="mt-8">
          <p className="font-mono text-[11px] uppercase tracking-wider text-stone-500">
            {portal.name} · {mod.href}
          </p>
          <h1
            className="mt-3 text-5xl font-medium text-[#1a1a1a]"
            style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "-0.01em" }}
          >
            Module: {mod.name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
            {mod.description}
          </p>
          <div className="mt-5 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${status.dot}`}
              aria-hidden
            />
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${status.chip}`}
            >
              {status.label}
            </span>
          </div>
        </div>

        {/* Build brief */}
        <div className="mt-10 rounded-2xl border border-[#D4AF37]/30 bg-white p-8 shadow-[0_1px_0_rgba(212,175,55,0.08),0_20px_60px_-30px_rgba(26,26,26,0.15)]">
          <p className="text-[11px] uppercase tracking-[0.26em] text-[#7a5a16]">
            Build brief
          </p>
          <p
            className="mt-3 text-3xl font-medium text-[#1a1a1a]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {mod.name} — {note}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Swap this placeholder with the real component when the module lands.
            Update the{" "}
            <span className="font-mono text-xs">status</span> in{" "}
            <span className="font-mono text-xs">lib/portal-hub/portals.ts</span>{" "}
            to reflect build state across the hub and sidebar.
          </p>

          <dl className="mt-6 grid gap-3 text-xs text-stone-600 sm:grid-cols-2">
            <InfoRow label="Portal" value={portal.name} />
            <InfoRow label="Subdomain" value={portal.subdomain} />
            <InfoRow label="Route" value={mod.href} />
            <InfoRow label="Auth" value={portal.auth} />
          </dl>
        </div>

        {/* Back link */}
        <div className="mt-10">
          <Link
            href="/portal-hub"
            className="inline-flex items-center gap-2 rounded-lg border border-[#D4AF37]/40 bg-white px-5 py-2.5 text-sm text-[#7a5a16] transition-colors hover:bg-[#F7E7CE]/40"
          >
            <span aria-hidden>←</span>
            <span>Back to Portal Hub</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#D4AF37]/15 pb-2">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
        {label}
      </dt>
      <dd className="text-right text-stone-700">{value}</dd>
    </div>
  );
}

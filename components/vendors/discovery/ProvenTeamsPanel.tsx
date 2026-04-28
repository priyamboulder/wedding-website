"use client";

import { Link2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProvenTeam } from "@/types/vendor-discovery";
import type { Vendor } from "@/types/vendor-unified";
import { TOP_CATEGORY_ICON, TOP_CATEGORY_LABEL } from "@/lib/vendors/taxonomy";

export function ProvenTeamsPanel({
  teams,
  vendorsById,
  onOpenVendor,
}: {
  teams: ProvenTeam[];
  vendorsById: Map<string, Vendor>;
  onOpenVendor?: (vendorId: string) => void;
}) {
  if (teams.length === 0) {
    return (
      <div className="rounded-[12px] border border-dashed border-border bg-white/60 p-6 text-center">
        <Users size={18} strokeWidth={1.4} className="mx-auto text-ink-faint" />
        <p className="mt-2 font-serif text-[13px] text-ink-muted">
          No proven teams yet — shortlist more vendors to surface repeat
          collaborations.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {teams.slice(0, 6).map((team, i) => (
        <TeamRow
          key={i}
          team={team}
          vendorsById={vendorsById}
          onOpenVendor={onOpenVendor}
        />
      ))}
    </div>
  );
}

function TeamRow({
  team,
  vendorsById,
  onOpenVendor,
}: {
  team: ProvenTeam;
  vendorsById: Map<string, Vendor>;
  onOpenVendor?: (vendorId: string) => void;
}) {
  const vendors = team.vendor_ids
    .map((id) => vendorsById.get(id))
    .filter(Boolean) as Vendor[];

  if (vendors.length === 0) return null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-[12px] border border-gold/30 bg-gradient-to-r from-gold-pale/30 via-white to-white p-3 transition-shadow hover:shadow-[0_8px_20px_-6px_rgba(184,134,11,0.2)]">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="flex -space-x-2">
          {vendors.map((v) => (
            <VendorAvatar key={v.id} vendor={v} onClick={() => onOpenVendor?.(v.id)} />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link2 size={11} strokeWidth={1.8} className="text-gold" />
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-gold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Proven Team · {team.wedding_count} weddings together
            </span>
          </div>
          <p className="mt-1 line-clamp-1 font-serif text-[14px] text-ink">
            {vendors.map((v) => v.name).join(" · ")}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-muted">
            {team.categories
              .map((c) => TOP_CATEGORY_LABEL[c])
              .join(" + ")}
          </p>
        </div>
      </div>
    </div>
  );
}

function VendorAvatar({
  vendor,
  onClick,
}: {
  vendor: Vendor;
  onClick?: () => void;
}) {
  const initial = vendor.name.charAt(0).toUpperCase();
  const img = vendor.cover_image || (vendor.portfolio_images ?? [])[0]?.url;
  return (
    <button
      type="button"
      onClick={onClick}
      title={vendor.name}
      className={cn(
        "relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white bg-ivory-warm transition-transform hover:z-10 hover:scale-110",
      )}
    >
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={vendor.name} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-serif text-[14px] text-ink-muted">
          {initial}
        </span>
      )}
      <span
        className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-ivory-warm text-[7px] leading-3"
      >
        {TOP_CATEGORY_ICON[vendor.category]}
      </span>
    </button>
  );
}

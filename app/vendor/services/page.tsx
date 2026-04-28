"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  Chip,
  GhostButton,
  PageHeader,
  PrimaryButton,
} from "@/components/vendor-portal/ui";
import {
  PackageEditor,
  type PackageDraft,
} from "@/components/vendor-portal/PackageEditor";
import type {
  EventCategory,
  VendorPackage,
} from "@/types/vendor-unified";
import {
  formatPriceDetail,
  PRICE_DISPLAY_LABEL,
} from "@/lib/vendors/price-display";
import { useVendorPackagesStore } from "@/stores/vendor-packages-store";

const EVENT_CATEGORY_LABEL: Record<EventCategory, string> = {
  sangeet: "Sangeet",
  mehndi: "Mehndi",
  ceremony: "Ceremony",
  reception: "Reception",
  full_wedding: "Full Wedding",
};

function isExpired(pkg: VendorPackage, now = new Date()): boolean {
  if (!pkg.seasonal) return false;
  const end = new Date(pkg.seasonal.end_date + "T23:59:59");
  return now.getTime() > end.getTime();
}

function isUpcoming(pkg: VendorPackage, now = new Date()): boolean {
  if (!pkg.seasonal) return false;
  const start = new Date(pkg.seasonal.start_date + "T00:00:00");
  return now.getTime() < start.getTime();
}

type EditorState =
  | { kind: "closed" }
  | { kind: "create"; seasonal: boolean }
  | { kind: "edit"; pkg: VendorPackage };

export default function VendorServicesPage() {
  const packages = useVendorPackagesStore((s) => s.packages);
  const addPackage = useVendorPackagesStore((s) => s.addPackage);
  const updatePackage = useVendorPackagesStore((s) => s.updatePackage);
  const deletePackage = useVendorPackagesStore((s) => s.deletePackage);
  const toggleFeatured = useVendorPackagesStore((s) => s.toggleFeatured);
  const movePackage = useVendorPackagesStore((s) => s.movePackage);

  const [editor, setEditor] = useState<EditorState>({ kind: "closed" });

  const { regular, seasonal } = useMemo(() => {
    const sort = (a: VendorPackage, b: VendorPackage) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.order - b.order;
    };
    return {
      regular: packages.filter((p) => !p.seasonal).sort(sort),
      seasonal: packages.filter((p) => p.seasonal).sort(sort),
    };
  }, [packages]);

  function handleSave(draft: PackageDraft) {
    if (editor.kind === "edit") {
      updatePackage(editor.pkg.id, draft);
    } else if (editor.kind === "create") {
      addPackage(draft);
    }
  }

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Services & Packages"
        title="What you offer"
        description="The priced menu couples see. Clear, honest ranges convert better than 'contact for quote'."
        actions={
          <>
            <GhostButton>Import from another vendor</GhostButton>
            <PrimaryButton
              onClick={() => setEditor({ kind: "create", seasonal: false })}
            >
              + Add package
            </PrimaryButton>
          </>
        }
      />

      <div className="space-y-8 px-8 py-6">
        <SummaryStrip
          packagesCount={regular.length}
          seasonalCount={seasonal.length}
          featuredCount={packages.filter((p) => p.featured).length}
        />

        <section>
          <SectionHeader
            title="Your packages"
            hint={
              regular.length
                ? `${regular.length} active · drag order affects your public profile`
                : "Nothing here yet — add your first package."
            }
            action={
              <button
                onClick={() => setEditor({ kind: "create", seasonal: false })}
                className="text-[13px] text-[#9E8245] hover:underline"
              >
                + Add package
              </button>
            }
          />
          {regular.length === 0 ? (
            <EmptyState
              onAdd={() => setEditor({ kind: "create", seasonal: false })}
              label="Add your first package"
              blurb="Couples find you faster when they can see what you offer at what price."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {regular.map((pkg, idx) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  isFirst={idx === 0}
                  isLast={idx === regular.length - 1}
                  onEdit={() => setEditor({ kind: "edit", pkg })}
                  onToggleFeatured={() => toggleFeatured(pkg.id)}
                  onMove={(dir) => movePackage(pkg.id, dir)}
                  onDelete={() => deletePackage(pkg.id)}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionHeader
            title="Seasonal packages"
            hint="Time-limited offerings. These auto-hide on your public profile after their end date."
            action={
              <button
                onClick={() => setEditor({ kind: "create", seasonal: true })}
                className="text-[13px] text-[#9E8245] hover:underline"
              >
                + Add seasonal package
              </button>
            }
          />
          {seasonal.length === 0 ? (
            <EmptyState
              onAdd={() => setEditor({ kind: "create", seasonal: true })}
              label="Create a seasonal package"
              blurb="Great for season-specific promotions — e.g. 'Sangeet Season Special — Book before March 2027'."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {seasonal.map((pkg, idx) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  isFirst={idx === 0}
                  isLast={idx === seasonal.length - 1}
                  onEdit={() => setEditor({ kind: "edit", pkg })}
                  onToggleFeatured={() => toggleFeatured(pkg.id)}
                  onMove={(dir) => movePackage(pkg.id, dir)}
                  onDelete={() => deletePackage(pkg.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <PackageEditor
        open={editor.kind !== "closed"}
        mode={editor.kind === "edit" ? "edit" : "create"}
        initial={editor.kind === "edit" ? editor.pkg : undefined}
        defaultSeasonal={editor.kind === "create" ? editor.seasonal : false}
        onClose={() => setEditor({ kind: "closed" })}
        onSave={handleSave}
        onDelete={
          editor.kind === "edit"
            ? () => deletePackage(editor.pkg.id)
            : undefined
        }
      />
    </div>
  );
}

function SummaryStrip({
  packagesCount,
  seasonalCount,
  featuredCount,
}: {
  packagesCount: number;
  seasonalCount: number;
  featuredCount: number;
}) {
  const stats = [
    { label: "Active packages", value: packagesCount },
    { label: "Seasonal live", value: seasonalCount },
    { label: "Featured", value: featuredCount },
  ];
  return (
    <Card className="flex flex-wrap divide-x divide-[rgba(44,44,44,0.06)]">
      {stats.map((s) => (
        <div key={s.label} className="flex-1 px-5 py-4 min-w-[160px]">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
            {s.label}
          </p>
          <p
            className="mt-1.5 text-[24px] leading-none text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            {s.value}
          </p>
        </div>
      ))}
    </Card>
  );
}

function SectionHeader({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <h2
          className="text-[20px] leading-tight text-[#2C2C2C]"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
        >
          {title}
        </h2>
        {hint && (
          <p className="mt-0.5 text-[12.5px] text-stone-500">{hint}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function EmptyState({
  onAdd,
  label,
  blurb,
}: {
  onAdd: () => void;
  label: string;
  blurb: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <p
        className="text-[18px] text-[#2C2C2C]"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
      >
        {label}
      </p>
      <p className="max-w-md text-[13.5px] text-stone-500">{blurb}</p>
      <button
        onClick={onAdd}
        className="mt-2 inline-flex h-9 items-center rounded-md bg-[#2C2C2C] px-4 text-[13px] font-medium text-[#FAF8F5] hover:bg-[#2e2e2e]"
      >
        + Add package
      </button>
    </Card>
  );
}

function PackageCard({
  pkg,
  isFirst,
  isLast,
  onEdit,
  onToggleFeatured,
  onMove,
  onDelete,
}: {
  pkg: VendorPackage;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onToggleFeatured: () => void;
  onMove: (dir: "up" | "down") => void;
  onDelete: () => void;
}) {
  const expired = isExpired(pkg);
  const upcoming = isUpcoming(pkg);
  const priceLabel = formatPriceDetail(pkg.price_display);

  return (
    <Card
      className={`flex flex-col ${expired ? "opacity-60" : ""}`}
      style={
        pkg.featured && !expired
          ? { boxShadow: "0 0 0 1px rgba(196,162,101,0.35), 0 20px 40px -30px rgba(44,44,44,0.18)" }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {pkg.featured && !expired && <Chip tone="gold">Featured</Chip>}
            {pkg.seasonal && !expired && !upcoming && (
              <Chip tone="teal">Seasonal · live</Chip>
            )}
            {pkg.seasonal && upcoming && (
              <Chip tone="sage">Seasonal · upcoming</Chip>
            )}
            {expired && <Chip tone="rose">Expired · hidden</Chip>}
          </div>
          <h3 className="mt-1.5 text-[17px] font-medium text-[#2C2C2C]">
            {pkg.name}
          </h3>
          {pkg.seasonal && (
            <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-stone-500">
              {formatDate(pkg.seasonal.start_date)} – {formatDate(pkg.seasonal.end_date)}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <p
            className="text-[20px] leading-none text-[#2C2C2C]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            {priceLabel}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-stone-500">
            {PRICE_DISPLAY_LABEL[pkg.price_display.type]}
          </p>
        </div>
      </div>

      {pkg.description && (
        <p
          className="mt-3 px-5 text-[14px] italic leading-snug text-stone-600"
          style={{ fontFamily: "'EB Garamond', serif" }}
        >
          {pkg.description}
        </p>
      )}

      {pkg.event_categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 px-5">
          {pkg.event_categories.map((c) => (
            <span
              key={c}
              className="rounded-full border border-[rgba(44,44,44,0.1)] bg-[#FAF8F5] px-2.5 py-[2px] text-[11px] text-stone-600"
            >
              {EVENT_CATEGORY_LABEL[c]}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-0 px-5 text-[11.5px] text-stone-600">
        {pkg.lead_time && (
          <MetaLine label="Lead time" value={pkg.lead_time} />
        )}
        {pkg.capacity_notes && (
          <MetaLine label="Capacity" value={pkg.capacity_notes} />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[rgba(44,44,44,0.06)] px-3 py-2 mt-4">
        <div className="flex items-center">
          <IconBtn
            label="Move up"
            disabled={isFirst}
            onClick={() => onMove("up")}
          >
            ↑
          </IconBtn>
          <IconBtn
            label="Move down"
            disabled={isLast}
            onClick={() => onMove("down")}
          >
            ↓
          </IconBtn>
          <button
            onClick={onToggleFeatured}
            className={`ml-1 rounded-md px-2.5 py-1 text-[12px] transition-colors ${
              pkg.featured
                ? "text-[#9E8245] hover:bg-[#F5E6D0]"
                : "text-stone-500 hover:bg-[#FAF8F5]"
            }`}
            title={pkg.featured ? "Unfeature" : "Feature"}
          >
            {pkg.featured ? "★ Featured" : "☆ Feature"}
          </button>
        </div>
        <div className="flex items-center gap-1 text-[12px]">
          <button
            onClick={onEdit}
            className="rounded-md px-2.5 py-1 text-[#9E8245] hover:bg-[#F5E6D0]"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                window.confirm(`Delete "${pkg.name}"?`)
              ) {
                onDelete();
              }
            }}
            className="rounded-md px-2.5 py-1 text-[#C0392B] hover:bg-[#F5E0D6]"
          >
            Delete
          </button>
        </div>
      </div>
    </Card>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-0.5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
        {label}
      </span>
      <p className="text-[12.5px] text-stone-700">{value}</p>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`h-7 w-7 rounded-md text-[14px] transition-colors ${
        disabled
          ? "text-stone-300"
          : "text-stone-600 hover:bg-[#FAF8F5] hover:text-[#2C2C2C]"
      }`}
    >
      {children}
    </button>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

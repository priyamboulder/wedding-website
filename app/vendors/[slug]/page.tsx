"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AtSign,
  Calendar,
  Clock,
  FileText,
  Globe,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/shell/TopNav";
import { useVendorsStore } from "@/stores/vendors-store";
import { useVendorWorkspaceStore } from "@/stores/vendor-workspace-store";
import { CATEGORY_LABELS } from "@/lib/vendor-categories";
import { formatPriceShort } from "@/lib/vendors/price-display";
import { isVendorCategory } from "@/lib/vendors/filters";
import {
  EXPERIENCE_DIRECTORY_CONFIG,
  isExperienceSlug,
} from "@/lib/vendors/data";
import type { Vendor } from "@/types/vendor";
import { CategoryDrillIn } from "@/components/vendors/CategoryDrillIn";
import { WorkspaceTab } from "@/components/vendors/workspace/WorkspaceTab";
import { OneLookScoreBadge } from "@/components/one-look/OneLookScoreBadge";
import { OneLookFeed } from "@/components/one-look/OneLookFeed";

type Tab = "details" | "contract" | "messages" | "workspace";

const TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: "details", label: "Vendor Details", icon: FileText },
  { id: "contract", label: "Contract & Payments", icon: Calendar },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "workspace", label: "Workspace", icon: Sparkles },
];

export default function VendorDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const vendors = useVendorsStore((s) => s.vendors);
  const isShortlisted = useVendorsStore((s) => s.isShortlisted);
  const toggleShortlist = useVendorsStore((s) => s.toggleShortlist);

  const [tab, setTab] = useState<Tab>("workspace");
  const vendor = useMemo(
    () => vendors.find((v) => v.id === slug || v.slug === slug) ?? null,
    [vendors, slug],
  );

  // A category slug renders the drill-in directory; an experience slug
  // (boba-cart, mehndi-artist, …) renders the same directory through the
  // experience's parent category with display overrides; anything else is
  // treated as a vendor id and falls through to the profile view below.
  if (slug && isVendorCategory(slug)) {
    return <CategoryDrillIn category={slug} />;
  }
  if (slug && isExperienceSlug(slug)) {
    const exp = EXPERIENCE_DIRECTORY_CONFIG[slug];
    return (
      <CategoryDrillIn
        category={exp.parent}
        experience={{
          title: exp.title,
          noun_singular: exp.noun_singular,
          noun_plural: exp.noun_plural,
          styles: exp.styles,
          keyword: exp.keyword,
        }}
      />
    );
  }

  if (!vendor) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <TopNav />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Vendor not found
            </p>
            <h2 className="mt-2 font-serif text-[20px] text-ink">
              We couldn't find that vendor.
            </h2>
            <button
              onClick={() => router.push("/vendors")}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory"
            >
              <ArrowLeft size={13} strokeWidth={1.8} />
              Back to vendors
            </button>
          </div>
        </main>
      </div>
    );
  }

  const shortlisted = isShortlisted(vendor.id);

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <TopNav />

      {/* Vendor header — editorial hero */}
      <header className="border-b border-gold/15 bg-white">
        <div className="mx-auto max-w-6xl px-8 pt-6">
          <button
            type="button"
            onClick={() => router.push("/vendors")}
            className="group inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={12} strokeWidth={1.8} />
            Back to vendors
          </button>

          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {CATEGORY_LABELS[vendor.category]}
              </p>
              <h1 className="mt-1.5 font-serif text-[32px] leading-[1.1] text-ink">
                {vendor.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-muted">
                {vendor.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} strokeWidth={1.6} />
                    {vendor.location}
                  </span>
                )}
                {vendor.rating !== null && (
                  <span className="flex items-center gap-1.5">
                    <Star
                      size={13}
                      strokeWidth={1.6}
                      className="text-saffron"
                      fill="currentColor"
                    />
                    <span className="font-mono">{vendor.rating.toFixed(1)}</span>
                    <span className="text-ink-faint">
                      ({vendor.review_count})
                    </span>
                  </span>
                )}
                <span className="font-mono text-[11.5px] text-ink-soft">
                  {formatPriceShort(vendor.price_display)}
                </span>
                {vendor.response_time_hours != null && (
                  <span className="flex items-center gap-1.5 font-mono text-[11.5px] text-ink-soft">
                    <Clock size={12} strokeWidth={1.6} />
                    Responds within {vendor.response_time_hours}h
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <OneLookScoreBadge platformVendorId={vendor.id} compact />
              <button
                type="button"
                onClick={() => toggleShortlist(vendor.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-4 py-2 text-[12.5px] font-medium transition-all",
                  shortlisted
                    ? "border-saffron bg-saffron-pale/40 text-saffron"
                    : "border-border bg-white text-ink-muted hover:border-saffron/40 hover:text-saffron",
                )}
              >
                <Heart
                  size={13}
                  strokeWidth={1.8}
                  fill={shortlisted ? "currentColor" : "none"}
                />
                {shortlisted ? "Shortlisted" : "Shortlist"}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <nav
            className="-mb-px mt-7 flex items-center gap-0 border-b border-transparent"
            aria-label="Vendor sections"
          >
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-1.5 px-5 pb-3 pt-2 text-[12.5px] font-medium transition-colors",
                    active
                      ? "text-ink"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  <Icon size={13} strokeWidth={1.8} />
                  {t.label}
                  {active && (
                    <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-ink" />
                  )}
                  {t.id === "workspace" && (
                    <WorkspaceIndicator vendorId={vendor.id} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-8 py-10">
        {tab === "details" && <DetailsTab vendor={vendor} />}
        {tab === "contract" && <ContractStubTab />}
        {tab === "messages" && <MessagesStubTab />}
        {tab === "workspace" && <WorkspaceTab vendor={vendor} />}
      </main>
    </div>
  );
}

// ── Workspace indicator dot (invite-state at a glance) ─────────────────────

function WorkspaceIndicator({ vendorId }: { vendorId: string }) {
  const workspaces = useVendorWorkspaceStore((s) => s.workspaces);
  const workspace = workspaces.find((w) => w.vendor_id === vendorId);
  if (!workspace) return null;
  const dotColor =
    workspace.invite_status === "active"
      ? "bg-sage"
      : workspace.invite_status === "invited"
        ? "bg-gold-light"
        : workspace.invite_status === "revoked"
          ? "bg-rose"
          : "bg-ink-faint";
  return (
    <span
      className={cn("ml-1.5 h-1.5 w-1.5 rounded-full", dotColor)}
      aria-hidden
    />
  );
}

// ── Details tab ────────────────────────────────────────────────────────────

function DetailsTab({ vendor }: { vendor: Vendor }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  // All images: cover first, then portfolio
  const allImages = [
    ...(vendor.cover_image ? [{ url: vendor.cover_image, alt: vendor.name }] : []),
    ...(vendor.portfolio_images ?? []),
  ].filter((img) => img.url);

  const contactRows: Array<{
    label: string;
    value: string;
    icon: React.ElementType;
    href: string | null;
  }> = [
    {
      label: "Email",
      value: vendor.contact.email,
      icon: Mail,
      href: vendor.contact.email ? `mailto:${vendor.contact.email}` : null,
    },
    {
      label: "Phone",
      value: vendor.contact.phone,
      icon: Phone,
      href: vendor.contact.phone ? `tel:${vendor.contact.phone}` : null,
    },
    {
      label: "Website",
      value: vendor.contact.website
        ? vendor.contact.website.replace(/^https?:\/\//, "")
        : "",
      icon: Globe,
      href: vendor.contact.website || null,
    },
    {
      label: "Instagram",
      value: vendor.contact.instagram
        ? vendor.contact.instagram.replace(/^https?:\/\/instagram\.com\//, "@")
        : "",
      icon: AtSign,
      href: vendor.contact.instagram || null,
    },
  ];

  return (
    <>
      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
          {lightbox > 0 && (
            <button
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
            >
              ‹
            </button>
          )}
          {lightbox < allImages.length - 1 && (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
            >
              ›
            </button>
          )}
          <img
            src={allImages[lightbox].url}
            alt={allImages[lightbox].alt ?? vendor.name}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[11px] text-white/50">
            {lightbox + 1} / {allImages.length}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          {/* Photo gallery */}
          {allImages.length > 0 && (
            <div className="rounded-lg border border-border bg-white p-4">
              <h3
                className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Photos · {allImages.length}
              </h3>
              {/* Hero — first image full width */}
              <div
                className="mb-2 cursor-pointer overflow-hidden rounded-md bg-ivory-warm"
                onClick={() => setLightbox(0)}
              >
                <img
                  src={allImages[0].url}
                  alt={allImages[0].alt ?? vendor.name}
                  className="aspect-[16/7] w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                />
              </div>
              {/* Remaining grid */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {allImages.slice(1).map((img, i) => (
                    <div
                      key={i}
                      className="cursor-pointer overflow-hidden rounded-md bg-ivory-warm ring-1 ring-border"
                      onClick={() => setLightbox(i + 1)}
                    >
                      <img
                        src={img.url}
                        alt={img.alt ?? vendor.name}
                        className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-[1.04]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bio */}
          <div className="rounded-lg border border-border bg-white p-6">
            <h3
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              About
            </h3>
            <p className="mt-2 text-[14px] leading-[1.75] text-ink-soft">
              {vendor.bio || (
                <span className="italic text-ink-faint">No bio on file yet.</span>
              )}
            </p>
          </div>

          {/* Style tags */}
          {vendor.style_tags.length > 0 && (
            <div className="rounded-lg border border-border bg-white p-6">
              <h3
                className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Tag size={11} strokeWidth={1.6} />
                Style
              </h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {vendor.style_tags.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-ivory-warm px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* One Look reviews feed */}
          <div className="rounded-lg border border-border bg-white p-6">
            <OneLookFeed platformVendorId={vendor.id} />
          </div>
        </section>

        {/* Contact sidebar */}
        <aside className="space-y-4">
          {/* Instagram stats */}
          {(vendor.instagram_followers ?? 0) > 0 && (
            <div className="rounded-lg border border-border bg-white p-5">
              <h3
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Instagram
              </h3>
              <p className="mt-2 font-mono text-[22px] font-semibold text-ink">
                {(vendor.instagram_followers ?? 0).toLocaleString()}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">followers</p>
            </div>
          )}

          {/* Contact details */}
          <div className="rounded-lg border border-border bg-white p-5">
            <h3
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Contact
            </h3>
            <ul className="mt-3 space-y-3">
              {contactRows.map(({ label, value, icon: Icon, href }) => (
                <li key={label} className="flex items-start gap-3 text-[12.5px]">
                  <Icon size={13} strokeWidth={1.6} className="mt-0.5 shrink-0 text-ink-faint" />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-faint">
                      {label}
                    </p>
                    {value && href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="mt-0.5 block truncate text-[12px] text-saffron underline-offset-2 hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="mt-0.5 truncate text-[12px] text-ink-soft">
                        {value || <span className="italic text-ink-faint">—</span>}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Rating & reviews */}
          {vendor.rating !== null && (
            <div className="rounded-lg border border-border bg-white p-5">
              <h3
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Rating
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <Star size={16} strokeWidth={1.6} className="text-saffron" fill="currentColor" />
                <span className="font-mono text-[20px] font-semibold text-ink">
                  {vendor.rating.toFixed(1)}
                </span>
                {vendor.review_count > 0 && (
                  <span className="font-mono text-[11px] text-ink-faint">
                    ({vendor.review_count} reviews)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Wedding count */}
          {vendor.wedding_count > 0 && (
            <div className="rounded-lg border border-border bg-white p-5">
              <h3
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Experience
              </h3>
              <p className="mt-2 font-mono text-[20px] font-semibold text-ink">
                {vendor.wedding_count}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">weddings</p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

// ── Stubs for tabs that exist for consistency but aren't the focus here ────

function ContractStubTab() {
  return (
    <StubBody
      title="Contract & Payments"
      body="Contract, milestone payments, and invoice log live here. Wiring is in-progress — for now, contract deliverables are tracked inside the Workspace tab."
    />
  );
}

function MessagesStubTab() {
  return (
    <StubBody
      title="Messages"
      body="Threaded messaging with the vendor. Once they've claimed the workspace, messages from both sides surface here."
    />
  );
}

function StubBody({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-white/60 px-6 py-10 text-center">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Coming next
      </p>
      <h2 className="font-serif text-[20px] text-ink">{title}</h2>
      <p className="max-w-md text-[12.5px] text-ink-muted">{body}</p>
      <NextLink
        href="#"
        onClick={(e) => e.preventDefault()}
        className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] text-saffron"
      >
        See Workspace tab →
      </NextLink>
    </div>
  );
}

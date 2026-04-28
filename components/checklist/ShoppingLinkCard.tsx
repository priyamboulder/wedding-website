"use client";

import {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
} from "react";
import {
  ExternalLink,
  Trash2,
  GripVertical,
  ImagePlus,
  ImageOff,
  ChevronDown,
  RefreshCw,
  Info,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { ShoppingLink, ShoppingStatus } from "@/lib/link-preview/types";
import { useShoppingLinks } from "@/contexts/ShoppingLinksContext";

const STATUS_CYCLE: ShoppingStatus[] = [
  "considering",
  "ordered",
  "received",
  "returned",
];

const STATUS_LABEL: Record<ShoppingStatus, string> = {
  considering: "Considering",
  ordered: "Ordered",
  received: "Received",
  returned: "Returned",
};

const STATUS_STYLES: Record<ShoppingStatus, string> = {
  considering: "bg-ink/90 text-ivory",
  ordered: "bg-saffron text-ink",
  received: "bg-sage text-ink",
  returned: "bg-rose/80 text-ivory",
};

// Sites that reliably block server-side preview fetches (DataDome, etc.)
const KNOWN_BLOCKED_DOMAINS = [
  "etsy.com",
  "etsy.me",
  "amazon.com",
  "amazon.co.uk",
  "amazon.ca",
  "amazon.in",
  "a.co",
];

function isBlockedDomain(domain: string): boolean {
  const d = domain.toLowerCase();
  return KNOWN_BLOCKED_DOMAINS.some((b) => d === b || d.endsWith("." + b));
}

function formatPrice(price: number | null, currency: string): string | null {
  if (price == null) return null;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: price % 1 === 0 ? 0 : 2,
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}

export function ShoppingLinkCard({
  link,
  pending,
}: {
  link: ShoppingLink;
  pending: boolean;
}) {
  const { updateLink, deleteLink, refetchLink } = useShoppingLinks();
  const looksEmpty = !link.imageUrl && link.title === link.domain;
  const [noteDraft, setNoteDraft] = useState(link.userNote);
  const [qtyDraft, setQtyDraft] = useState(String(link.quantity));
  const [priceEditing, setPriceEditing] = useState(false);
  const [priceDraft, setPriceDraft] = useState(
    link.price != null ? String(link.price) : "",
  );
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(link.title);
  const [imageEditing, setImageEditing] = useState(false);
  const [imageDraft, setImageDraft] = useState(link.imageUrl ?? "");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  useEffect(() => {
    setNoteDraft(link.userNote);
  }, [link.userNote]);
  useEffect(() => {
    setQtyDraft(String(link.quantity));
  }, [link.quantity]);
  useEffect(() => {
    setPriceDraft(link.price != null ? String(link.price) : "");
  }, [link.price]);
  useEffect(() => {
    setTitleDraft(link.title);
  }, [link.title]);
  useEffect(() => {
    setImageDraft(link.imageUrl ?? "");
  }, [link.imageUrl]);

  useEffect(() => {
    if (!statusMenuOpen) return;
    function handler(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) {
        setStatusMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [statusMenuOpen]);

  function cycleStatus() {
    const idx = STATUS_CYCLE.indexOf(link.status);
    // Skip returned in cycle; use dropdown for that
    const nextIdx = (idx + 1) % 3;
    updateLink(link.id, { status: STATUS_CYCLE[nextIdx] });
  }

  function chooseStatus(s: ShoppingStatus) {
    updateLink(link.id, { status: s });
    setStatusMenuOpen(false);
  }

  function commitNote() {
    if (noteDraft !== link.userNote) {
      updateLink(link.id, { userNote: noteDraft });
    }
  }
  function commitQty() {
    const n = parseInt(qtyDraft, 10);
    if (Number.isFinite(n) && n > 0 && n !== link.quantity) {
      updateLink(link.id, { quantity: n });
    } else {
      setQtyDraft(String(link.quantity));
    }
  }
  function commitPrice() {
    const cleaned = priceDraft.replace(/[^\d.]/g, "");
    if (cleaned === "") {
      updateLink(link.id, { price: null });
      setPriceEditing(false);
      return;
    }
    const n = parseFloat(cleaned);
    if (Number.isFinite(n)) {
      updateLink(link.id, { price: n });
    }
    setPriceEditing(false);
  }
  function commitTitle() {
    const t = titleDraft.trim();
    if (t && t !== link.title) updateLink(link.id, { title: t });
    else setTitleDraft(link.title);
    setTitleEditing(false);
  }
  function commitImage() {
    const trimmed = imageDraft.trim();
    if (trimmed !== (link.imageUrl ?? "")) {
      updateLink(link.id, { imageUrl: trimmed || null });
    }
    setImgError(false);
    setImageEditing(false);
  }

  function onNoteKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
    if (e.key === "Escape") {
      setNoteDraft(link.userNote);
      (e.target as HTMLInputElement).blur();
    }
  }

  function openCard(e: React.MouseEvent) {
    // Don't open when clicking interactive child
    const target = e.target as HTMLElement;
    if (target.closest("button,input,a,[data-stop-open]")) return;
    window.open(link.url, "_blank", "noopener,noreferrer");
  }

  const priceText = formatPrice(link.price, link.currency);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "group relative flex gap-3 rounded-[12px] border border-border bg-white p-3 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(26,26,26,0.06)] hover:border-gold/25",
        isDragging && "opacity-60 shadow-lg",
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        data-stop-open
        aria-label="Reorder"
        className="absolute left-0 top-0 flex h-full w-3 cursor-grab items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical size={12} className="text-ink-faint/60" />
      </button>

      {/* Image */}
      <div
        onClick={(e) => {
          if (looksEmpty && !pending) {
            e.stopPropagation();
            setImageEditing(true);
            return;
          }
          openCard(e);
        }}
        role="link"
        tabIndex={-1}
        className="relative aspect-[4/3] w-24 shrink-0 cursor-pointer overflow-hidden rounded-md bg-ivory-warm"
      >
        {pending ? (
          <div className="skeleton h-full w-full" />
        ) : imageEditing ? (
          <div
            data-stop-open
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 flex items-center justify-center bg-white p-1.5"
          >
            <input
              data-stop-open
              autoFocus
              value={imageDraft}
              onChange={(e) => setImageDraft(e.target.value)}
              onBlur={commitImage}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") {
                  setImageDraft(link.imageUrl ?? "");
                  setImageEditing(false);
                }
              }}
              placeholder="Image URL"
              className="w-full bg-transparent text-center text-[10px] text-ink-soft outline-none placeholder:text-ink-faint/60"
            />
          </div>
        ) : link.imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={link.imageUrl}
            alt={link.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-all duration-300 group-hover:saturate-[1.08]"
            loading="lazy"
          />
        ) : looksEmpty ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-ink-faint/60 transition-colors group-hover:text-gold">
            <ImagePlus size={16} strokeWidth={1.5} />
            <span className="text-[9px] uppercase tracking-wider">Add image</span>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint/40">
            <ImageOff size={18} strokeWidth={1.4} />
          </div>
        )}
      </div>

      {/* Body */}
      <div
        onClick={openCard}
        className="flex min-w-0 flex-1 cursor-pointer flex-col gap-1.5"
      >
        {/* Title */}
        {pending ? (
          <div className="skeleton h-3.5 w-3/4 rounded" />
        ) : titleEditing ? (
          <input
            data-stop-open
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setTitleDraft(link.title);
                setTitleEditing(false);
              }
            }}
            className="bg-transparent font-serif text-[13.5px] leading-snug text-ink outline-none"
          />
        ) : looksEmpty ? (
          <button
            data-stop-open
            onClick={(e) => {
              e.stopPropagation();
              setTitleDraft("");
              setTitleEditing(true);
            }}
            className="text-left font-serif text-[13.5px] italic leading-snug text-ink-faint transition-colors hover:text-gold"
          >
            Add product title…
          </button>
        ) : (
          <h4
            className="line-clamp-2 font-serif text-[13.5px] leading-snug text-ink"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setTitleEditing(true);
            }}
          >
            {link.title}
          </h4>
        )}

        {/* Domain + price row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5 rounded-full bg-ivory-warm px-2 py-0.5">
            {link.faviconUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={link.faviconUrl}
                alt=""
                className="h-3 w-3 shrink-0 rounded-sm"
              />
            )}
            <span
              className="truncate font-mono text-[10px] text-ink-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {link.domain}
            </span>
          </div>
          {pending ? (
            <div className="skeleton h-3 w-12 rounded" />
          ) : priceEditing ? (
            <input
              data-stop-open
              autoFocus
              value={priceDraft}
              onChange={(e) => setPriceDraft(e.target.value)}
              onBlur={commitPrice}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") {
                  setPriceDraft(
                    link.price != null ? String(link.price) : "",
                  );
                  setPriceEditing(false);
                }
              }}
              placeholder="0.00"
              className="w-16 bg-transparent text-right font-mono text-[12px] text-ink outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          ) : (
            <button
              data-stop-open
              onClick={(e) => {
                e.stopPropagation();
                setPriceEditing(true);
              }}
              className={cn(
                "shrink-0 font-mono text-[12px] font-semibold transition-colors",
                link.status === "ordered"
                  ? "text-saffron"
                  : "text-ink hover:text-gold",
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {priceText ?? "—"}
            </button>
          )}
        </div>

        {/* Note + qty row */}
        <div className="flex items-center gap-2">
          <input
            data-stop-open
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            onBlur={commitNote}
            onKeyDown={onNoteKey}
            onClick={(e) => e.stopPropagation()}
            placeholder="Add a note…"
            className="min-w-0 flex-1 bg-transparent text-[11.5px] italic text-ink-muted outline-none placeholder:text-ink-faint/50 focus:not-italic focus:text-ink-soft"
          />
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider text-ink-faint">
              Qty
            </span>
            <input
              data-stop-open
              type="number"
              min={1}
              value={qtyDraft}
              onChange={(e) => setQtyDraft(e.target.value)}
              onBlur={commitQty}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="w-8 bg-transparent text-right font-mono text-[11.5px] text-ink-soft outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>
        </div>

        {/* Status + actions row */}
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <div ref={menuRef} className="relative">
            <div className="flex items-center">
              <button
                data-stop-open
                onClick={(e) => {
                  e.stopPropagation();
                  cycleStatus();
                }}
                className={cn(
                  "rounded-l-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
                  STATUS_STYLES[link.status],
                )}
              >
                {STATUS_LABEL[link.status]}
              </button>
              <button
                data-stop-open
                aria-label="Choose status"
                onClick={(e) => {
                  e.stopPropagation();
                  setStatusMenuOpen((o) => !o);
                }}
                className={cn(
                  "rounded-r-full border-l border-black/10 px-1 py-0.5 transition-colors",
                  STATUS_STYLES[link.status],
                )}
              >
                <ChevronDown size={10} />
              </button>
            </div>
            {statusMenuOpen && (
              <div className="popover-enter absolute left-0 top-full z-10 mt-1 w-32 overflow-hidden rounded-md border border-border bg-white shadow-lg">
                {STATUS_CYCLE.map((s) => (
                  <button
                    key={s}
                    data-stop-open
                    onClick={(e) => {
                      e.stopPropagation();
                      chooseStatus(s);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px] transition-colors hover:bg-ivory-warm",
                      link.status === s && "bg-ivory-warm",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        s === "considering" && "bg-ink/80",
                        s === "ordered" && "bg-saffron",
                        s === "received" && "bg-sage",
                        s === "returned" && "bg-rose",
                      )}
                    />
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            className={cn(
              "flex items-center gap-1 transition-opacity",
              looksEmpty && !pending
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100",
            )}
          >
            {looksEmpty && !pending && (
              <button
                data-stop-open
                onClick={(e) => {
                  e.stopPropagation();
                  refetchLink(link.id);
                }}
                className="rounded-md p-1 text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink"
                aria-label="Retry fetch"
                title="Retry fetch"
              >
                <RefreshCw size={12} strokeWidth={1.6} />
              </button>
            )}
            <a
              data-stop-open
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="rounded-md p-1 text-ink-faint transition-colors hover:bg-ivory-warm hover:text-ink"
              aria-label="Open link"
            >
              <ExternalLink size={12} strokeWidth={1.6} />
            </a>
            <button
              data-stop-open
              onClick={(e) => {
                e.stopPropagation();
                deleteLink(link.id);
              }}
              className="rounded-md p-1 text-ink-faint transition-colors hover:bg-rose-pale hover:text-rose"
              aria-label="Delete link"
            >
              <Trash2 size={12} strokeWidth={1.6} />
            </button>
          </div>
        </div>

        {/* Helper for sites that block preview bots */}
        {looksEmpty && !pending && isBlockedDomain(link.domain) && (
          <div className="flex items-start gap-1 pt-0.5 text-[10px] italic leading-tight text-ink-faint/80">
            <Info size={10} strokeWidth={1.6} className="mt-0.5 shrink-0" />
            <span>
              {link.domain} blocks preview bots — tap the image and title to add
              details manually.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

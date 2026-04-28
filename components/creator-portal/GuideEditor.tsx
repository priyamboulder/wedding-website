"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Trash2,
  Type,
  Image as ImageIcon,
  Package,
  Store,
  Quote,
  GitCompare,
  ListChecks,
  Plus,
} from "lucide-react";
import { useCurrentCreator } from "@/lib/creators/current-creator";
import { useCreatorPortalStore } from "@/stores/creator-portal-store";
import { STORE_PRODUCTS } from "@/lib/store-seed";
import type {
  GuideBodyBlock,
  GuideCategory,
} from "@/types/guide";

type BlockType = GuideBodyBlock["type"];

const BLOCK_TYPES: Array<{ type: BlockType; label: string; icon: typeof Type }> = [
  { type: "rich_text", label: "Rich text", icon: Type },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "product_embed", label: "Product", icon: Package },
  { type: "vendor_mention", label: "Vendor", icon: Store },
  { type: "pull_quote", label: "Pull quote", icon: Quote },
  { type: "comparison", label: "Comparison", icon: GitCompare },
  { type: "list", label: "Checklist", icon: ListChecks },
];

const CATEGORIES: GuideCategory[] = [
  "styling",
  "planning",
  "budget",
  "decor",
  "vendor_review",
  "real_wedding",
  "trend_report",
  "cultural_traditions",
];

function emptyBlock(type: BlockType): GuideBodyBlock {
  switch (type) {
    case "rich_text":
      return { type: "rich_text", html: "" };
    case "image":
      return { type: "image", images: [{ url: "", alt: "" }] };
    case "product_embed":
      return { type: "product_embed", productId: "", context: "" };
    case "vendor_mention":
      return { type: "vendor_mention", vendorId: "", context: "" };
    case "pull_quote":
      return { type: "pull_quote", text: "", attribution: "" };
    case "comparison":
      return { type: "comparison", items: [{ productId: "", highlight: "" }] };
    case "list":
      return { type: "list", variant: "bullets", items: [""] };
  }
}

export function GuideEditor({ guideId }: { guideId?: string }) {
  const router = useRouter();
  const creator = useCurrentCreator();
  const getUserGuide = useCreatorPortalStore((s) => s.getUserGuide);
  const createGuide = useCreatorPortalStore((s) => s.createGuide);
  const updateGuide = useCreatorPortalStore((s) => s.updateGuide);
  const deleteGuide = useCreatorPortalStore((s) => s.deleteGuide);

  const existing = guideId ? getUserGuide(guideId) : undefined;

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [category, setCategory] = useState<GuideCategory>("styling");
  const [blocks, setBlocks] = useState<GuideBodyBlock[]>([
    { type: "rich_text", html: "" },
  ]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title);
    setSubtitle(existing.subtitle);
    setCoverImageUrl(existing.coverImageUrl);
    setCategory(existing.category);
    setBlocks(existing.body.length > 0 ? existing.body : [{ type: "rich_text", html: "" }]);
  }, [existing]);

  if (!creator) return null;

  const addBlock = (type: BlockType) => {
    setBlocks((prev) => [...prev, emptyBlock(type)]);
    setShowAdd(false);
  };

  const updateBlock = (i: number, next: GuideBodyBlock) => {
    setBlocks((prev) => prev.map((b, idx) => (idx === i ? next : b)));
  };

  const removeBlock = (i: number) => {
    setBlocks((prev) => prev.filter((_, idx) => idx !== i));
  };

  const moveBlock = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    setBlocks((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const wordCount = blocks.reduce((acc, b) => {
    if (b.type === "rich_text") {
      return acc + b.html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
    }
    if (b.type === "pull_quote") return acc + b.text.split(/\s+/).filter(Boolean).length;
    if (b.type === "list") return acc + b.items.join(" ").split(/\s+/).filter(Boolean).length;
    return acc + 40;
  }, 0);
  const readTime = Math.max(1, Math.round(wordCount / 200));

  const submit = (status: "draft" | "published") => {
    if (!title.trim()) return;
    if (guideId && existing) {
      updateGuide(guideId, {
        title,
        subtitle,
        coverImageUrl,
        category,
        body: blocks,
        status,
      });
    } else {
      createGuide({
        creatorId: creator.id,
        title,
        subtitle,
        coverImageUrl,
        category,
        body: blocks,
        status,
      });
    }
    router.push("/creator/guides");
  };

  const handleArchive = () => {
    if (!guideId) return;
    if (!confirm("Archive this guide?")) return;
    deleteGuide(guideId);
    router.push("/creator/guides");
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <Link
        href="/creator/guides"
        className="mb-4 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint hover:text-gold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <ArrowLeft size={11} />
        Back to guides
      </Link>

      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-serif text-[26px] text-ink">
          {guideId ? "Edit guide" : "Write a guide"}
        </h1>
        <span
          className="font-mono text-[10px] uppercase tracking-wider text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {wordCount} words · {readTime} min read
        </span>
      </div>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-0 border-b border-transparent bg-transparent py-2 font-serif text-[30px] text-ink focus:border-gold/40 focus:outline-none"
      />
      <input
        type="text"
        placeholder="Subtitle"
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        className="mt-2 w-full border-0 border-b border-transparent bg-transparent py-1 text-[15px] italic text-ink-muted focus:border-gold/40 focus:outline-none"
      />

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <LabelGroup label="Cover image URL">
          <input
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px]"
          />
        </LabelGroup>
        <LabelGroup label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as GuideCategory)}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-[13px]"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace("_", " ")}
              </option>
            ))}
          </select>
        </LabelGroup>
      </div>

      {coverImageUrl && (
        <div
          className="mt-4 h-48 w-full rounded-lg bg-ivory-warm bg-cover bg-center"
          style={{ backgroundImage: `url(${coverImageUrl})` }}
        />
      )}

      {/* Blocks */}
      <div className="mt-8 flex flex-col gap-4">
        {blocks.map((block, i) => (
          <div
            key={i}
            className="group relative rounded-lg border border-border bg-white p-4"
          >
            <div className="absolute -right-12 top-3 hidden flex-col gap-1 group-hover:flex">
              <IconBtn onClick={() => moveBlock(i, -1)} label="Move up">
                <ArrowUp size={11} />
              </IconBtn>
              <IconBtn onClick={() => moveBlock(i, 1)} label="Move down">
                <ArrowDown size={11} />
              </IconBtn>
              <IconBtn onClick={() => removeBlock(i)} label="Delete" tone="rose">
                <Trash2 size={11} />
              </IconBtn>
            </div>
            <BlockEditor
              block={block}
              onChange={(next) => updateBlock(i, next)}
            />
          </div>
        ))}

        {/* Add block */}
        {showAdd ? (
          <div className="rounded-lg border border-dashed border-gold/30 p-3">
            <p
              className="mb-2 font-mono text-[10px] uppercase tracking-wider text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Choose a block
            </p>
            <div className="flex flex-wrap gap-2">
              {BLOCK_TYPES.map((b) => {
                const Icon = b.icon;
                return (
                  <button
                    key={b.type}
                    onClick={() => addBlock(b.type)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] hover:border-gold/40"
                  >
                    <Icon size={12} />
                    {b.label}
                  </button>
                );
              })}
              <button
                onClick={() => setShowAdd(false)}
                className="text-[11.5px] text-ink-muted hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-gold/30 bg-white py-3 text-[12.5px] text-gold hover:bg-gold-pale/20"
          >
            <Plus size={13} />
            Add block
          </button>
        )}
      </div>

      <div className="sticky bottom-0 -mx-6 mt-8 flex items-center justify-between border-t border-gold/15 bg-white/95 px-6 py-3 backdrop-blur">
        {guideId && (
          <button
            type="button"
            onClick={handleArchive}
            className="text-[12px] text-rose hover:underline"
          >
            Archive
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => submit("draft")}
            className="rounded-md border border-border bg-white px-4 py-1.5 text-[12.5px] text-ink hover:bg-ivory-warm"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => submit("published")}
            disabled={!title.trim()}
            className="rounded-md bg-ink px-4 py-1.5 text-[12.5px] text-ivory hover:bg-gold disabled:opacity-40"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}

function LabelGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  tone?: "rose";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`rounded-md border border-border bg-white p-1.5 transition-colors hover:border-gold/40 ${
        tone === "rose" ? "text-rose" : "text-ink-muted"
      }`}
    >
      {children}
    </button>
  );
}

function BlockEditor({
  block,
  onChange,
}: {
  block: GuideBodyBlock;
  onChange: (b: GuideBodyBlock) => void;
}) {
  switch (block.type) {
    case "rich_text":
      return (
        <div>
          <BlockLabel icon={<Type size={11} />} label="Rich text" />
          <textarea
            value={block.html}
            onChange={(e) => onChange({ ...block, html: e.target.value })}
            rows={6}
            placeholder="Write your paragraph. Supports simple HTML: <strong>, <em>, <a>."
            className="w-full resize-none border-0 bg-transparent text-[14px] leading-relaxed text-ink focus:outline-none"
          />
        </div>
      );
    case "image":
      return (
        <div>
          <BlockLabel icon={<ImageIcon size={11} />} label="Image" />
          <input
            type="url"
            value={block.images[0]?.url ?? ""}
            onChange={(e) =>
              onChange({
                ...block,
                images: [
                  { ...block.images[0], url: e.target.value, alt: block.images[0]?.alt ?? "" },
                ],
              })
            }
            placeholder="Image URL"
            className="w-full rounded border border-border bg-white px-3 py-2 text-[13px]"
          />
          <input
            type="text"
            value={block.images[0]?.caption ?? ""}
            onChange={(e) =>
              onChange({
                ...block,
                images: [{ ...block.images[0], caption: e.target.value }],
              })
            }
            placeholder="Caption (optional)"
            className="mt-2 w-full rounded border border-border bg-white px-3 py-2 text-[12.5px]"
          />
          {block.images[0]?.url && (
            <div
              className="mt-3 h-40 w-full rounded bg-ivory-warm bg-cover bg-center"
              style={{ backgroundImage: `url(${block.images[0].url})` }}
            />
          )}
        </div>
      );
    case "product_embed":
      return (
        <div>
          <BlockLabel icon={<Package size={11} />} label="Product" />
          <select
            value={block.productId}
            onChange={(e) => onChange({ ...block, productId: e.target.value })}
            className="w-full rounded border border-border bg-white px-3 py-2 text-[13px]"
          >
            <option value="">— Select a product —</option>
            {STORE_PRODUCTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={block.context ?? ""}
            onChange={(e) => onChange({ ...block, context: e.target.value })}
            placeholder="Your framing (optional)"
            className="mt-2 w-full rounded border border-border bg-white px-3 py-2 text-[12.5px]"
          />
        </div>
      );
    case "vendor_mention":
      return (
        <div>
          <BlockLabel icon={<Store size={11} />} label="Vendor mention" />
          <input
            type="text"
            value={block.vendorId}
            onChange={(e) => onChange({ ...block, vendorId: e.target.value })}
            placeholder="Vendor id (e.g. v-sabya-atelier)"
            className="w-full rounded border border-border bg-white px-3 py-2 text-[13px]"
          />
          <input
            type="text"
            value={block.context ?? ""}
            onChange={(e) => onChange({ ...block, context: e.target.value })}
            placeholder="Context (optional)"
            className="mt-2 w-full rounded border border-border bg-white px-3 py-2 text-[12.5px]"
          />
        </div>
      );
    case "pull_quote":
      return (
        <div>
          <BlockLabel icon={<Quote size={11} />} label="Pull quote" />
          <textarea
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            rows={2}
            placeholder="The quote."
            className="w-full resize-none border-0 bg-transparent font-serif text-[20px] italic text-ink focus:outline-none"
          />
          <input
            type="text"
            value={block.attribution ?? ""}
            onChange={(e) => onChange({ ...block, attribution: e.target.value })}
            placeholder="Attribution"
            className="mt-1 w-full rounded border border-border bg-white px-3 py-2 text-[12px]"
          />
        </div>
      );
    case "comparison":
      return (
        <div>
          <BlockLabel icon={<GitCompare size={11} />} label="Comparison" />
          <input
            type="text"
            value={block.title ?? ""}
            onChange={(e) => onChange({ ...block, title: e.target.value })}
            placeholder="Comparison title"
            className="mb-2 w-full rounded border border-border bg-white px-3 py-2 text-[13px]"
          />
          <div className="flex flex-col gap-2">
            {block.items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <select
                  value={item.productId}
                  onChange={(e) => {
                    const next = [...block.items];
                    next[i] = { ...next[i], productId: e.target.value };
                    onChange({ ...block, items: next });
                  }}
                  className="flex-1 rounded border border-border bg-white px-3 py-2 text-[12.5px]"
                >
                  <option value="">— Product —</option>
                  {STORE_PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={item.highlight ?? ""}
                  onChange={(e) => {
                    const next = [...block.items];
                    next[i] = { ...next[i], highlight: e.target.value };
                    onChange({ ...block, items: next });
                  }}
                  placeholder="Highlight"
                  className="flex-1 rounded border border-border bg-white px-3 py-2 text-[12.5px]"
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...block,
                      items: block.items.filter((_, idx) => idx !== i),
                    })
                  }
                  className="rounded border border-border p-2 text-rose hover:bg-rose/10"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...block,
                items: [...block.items, { productId: "", highlight: "" }],
              })
            }
            disabled={block.items.length >= 3}
            className="mt-2 text-[11.5px] text-gold hover:underline disabled:text-ink-faint"
          >
            + Add item (max 3)
          </button>
        </div>
      );
    case "list":
      return (
        <div>
          <BlockLabel icon={<ListChecks size={11} />} label="List" />
          <select
            value={block.variant}
            onChange={(e) =>
              onChange({
                ...block,
                variant: e.target.value as "numbered" | "checklist" | "bullets",
              })
            }
            className="mb-2 rounded border border-border bg-white px-3 py-1 text-[12px]"
          >
            <option value="bullets">Bullets</option>
            <option value="numbered">Numbered</option>
            <option value="checklist">Checklist</option>
          </select>
          <div className="flex flex-col gap-1.5">
            {block.items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const next = [...block.items];
                    next[i] = e.target.value;
                    onChange({ ...block, items: next });
                  }}
                  placeholder={`Item ${i + 1}`}
                  className="flex-1 rounded border border-border bg-white px-3 py-2 text-[13px]"
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...block,
                      items: block.items.filter((_, idx) => idx !== i),
                    })
                  }
                  className="rounded border border-border p-2 text-rose hover:bg-rose/10"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...block, items: [...block.items, ""] })}
            className="mt-2 text-[11.5px] text-gold hover:underline"
          >
            + Add item
          </button>
        </div>
      );
  }
}

function BlockLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      className="mb-2 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {icon}
      {label}
    </div>
  );
}

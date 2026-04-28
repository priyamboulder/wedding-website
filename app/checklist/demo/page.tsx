"use client";

import { useState } from "react";
import { FileUploader } from "@/components/popout/FileUploader";
import { FileGallery } from "@/components/popout/FileGallery";
import { CommentThread } from "@/components/popout/CommentThread";
import { AIAssistButton } from "@/components/popout/AIAssistButton";
import { ExportButton } from "@/components/popout/ExportButton";
import { useChecklistStore } from "@/stores/checklist-store";

import { PopOutShell } from "@/components/popout/PopOutShell";
import { PopOutSection } from "@/components/popout/PopOutSection";
import { PopOutSplit } from "@/components/popout/PopOutSplit";
import { PopOutTabs } from "@/components/popout/PopOutTabs";
import { PopOutGrid, PopOutCard } from "@/components/popout/PopOutGrid";
import { PopOutEmpty } from "@/components/popout/PopOutEmpty";
import { PopOutInlineEdit } from "@/components/popout/PopOutInlineEdit";
import { PopOutTagInput } from "@/components/popout/PopOutTagInput";
import { PopOutMoodBoard } from "@/components/popout/PopOutMoodBoard";
import {
  MapPin,
  Palette,
  FileText,
  Camera,
  Plus,
  Heart,
  UtensilsCrossed,
  Music,
  Flower2,
  Gem,
  Download,
} from "lucide-react";

export default function InfrastructureDemo() {
  const items = useChecklistStore((s) => s.items);
  const sampleItem = items[0];
  const [aiOutput, setAiOutput] = useState<string | null>(null);

  // State for interactive primitive demos
  const [showShell, setShowShell] = useState(false);
  const [inlineName, setInlineName] = useState("The Taj Falaknuma Palace");
  const [inlineCapacity, setInlineCapacity] = useState("350");
  const [inlineDate, setInlineDate] = useState("2027-02-14");
  const [inlineNotes, setInlineNotes] = useState("");
  const [tags, setTags] = useState(["Haldi", "Mehndi", "Baraat"]);
  const [moodImages, setMoodImages] = useState<
    { id: string; url: string; alt?: string }[]
  >([
    { id: "1", url: "/images/portfolio/best/best-01.jpg", alt: "Venue exterior" },
    { id: "2", url: "/images/portfolio/haldi/haldi-01.jpg", alt: "Floral arrangement" },
    { id: "3", url: "/images/portfolio/wedding/wedding-01.jpg", alt: "Table setting" },
    { id: "4", url: "/images/portfolio/baraat/baraat-01.jpg", alt: "Mandap" },
    { id: "5", url: "/images/portfolio/sangeet/sangeet-01.jpg", alt: "Lighting" },
    { id: "6", url: "/images/portfolio/portrait/portrait-01.jpg", alt: "Bridal entry" },
  ]);

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <p className="text-xs font-mono text-ink-faint tracking-widest uppercase mb-1">
            Component Library
          </p>
          <h1 className="font-serif text-3xl font-bold text-ink tracking-tight">
            Pop-out Layout Primitives
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Reusable building blocks for all 45+ bespoke pop-outs
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10 space-y-16">
        {/* ── 1. PopOutShell ─────────────────────────────────────────── */}
        <section>
          <SectionHeader
            number="01"
            title="PopOutShell"
            description="Header with breadcrumbs, status, actions · scrollable body · footer with save state · Esc + focus trap"
          />
          <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
            {showShell ? (
              <div className="h-[320px]">
                <PopOutShell
                  breadcrumbs={[
                    { label: "Pre-Wedding", onClick: () => {} },
                    { label: "Venue Selection" },
                  ]}
                  status={
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      In Progress
                    </span>
                  }
                  actions={[
                    {
                      icon: <Download size={15} />,
                      label: "Export",
                      onClick: () => alert("Export clicked"),
                    },
                  ]}
                  lastEdited="2 hours ago"
                  saveState="saved"
                  onClose={() => setShowShell(false)}
                >
                  <div className="space-y-4">
                    <p className="text-sm text-ink-muted">
                      This is the shell body with editorial padding and scrollable overflow.
                      Press <kbd className="px-1.5 py-0.5 rounded bg-ivory-deep text-[11px] font-mono">Esc</kbd> to
                      close, or use the X button.
                    </p>
                    <div className="h-[200px] rounded-lg bg-ivory-warm/60 border border-border flex items-center justify-center">
                      <span className="text-sm text-ink-faint">Pop-out body content goes here</span>
                    </div>
                  </div>
                </PopOutShell>
              </div>
            ) : (
              <div className="p-6 flex items-center justify-center">
                <button
                  onClick={() => setShowShell(true)}
                  className="rounded-md bg-gold px-4 py-2 text-sm font-serif font-medium text-ivory hover:bg-gold-light transition-colors"
                >
                  Open Shell Demo
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── 2. PopOutSection ───────────────────────────────────────── */}
        <section>
          <SectionHeader
            number="02"
            title="PopOutSection"
            description="Fraunces title, optional icon, helper text, gold gradient rule"
          />
          <div className="mt-6 rounded-xl border border-border bg-card p-6 space-y-8">
            <PopOutSection
              title="Venue Details"
              icon={<MapPin size={14} />}
              helperText="Primary ceremony and reception location"
            >
              <p className="text-sm text-ink-muted">Section content with icon and helper text.</p>
            </PopOutSection>

            <PopOutSection title="Traditions & Ceremonies" icon={<Gem size={14} />}>
              <p className="text-sm text-ink-muted">Section with icon, no helper text.</p>
            </PopOutSection>

            <PopOutSection title="Plain Section" noRule>
              <p className="text-sm text-ink-muted">Section without the gold rule.</p>
            </PopOutSection>
          </div>
        </section>

        {/* ── 3. PopOutSplit ─────────────────────────────────────────── */}
        <section>
          <SectionHeader
            number="03"
            title="PopOutSplit"
            description="Two-column layout with ratio presets — stacks on mobile"
          />
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <PopOutSplit
              ratio="2:1"
              gap="lg"
              left={
                <div className="rounded-lg bg-gold-pale/30 border border-gold/15 p-6 h-32 flex items-center justify-center">
                  <span className="text-sm font-serif text-gold font-medium">Left — 2fr</span>
                </div>
              }
              right={
                <div className="rounded-lg bg-sage-pale/40 border border-sage/15 p-6 h-32 flex items-center justify-center">
                  <span className="text-sm font-serif text-sage font-medium">Right — 1fr</span>
                </div>
              }
            />
          </div>
        </section>

        {/* ── 4. PopOutTabs ──────────────────────────────────────────── */}
        <section>
          <SectionHeader
            number="04"
            title="PopOutTabs"
            description="Editorial tabs with thin gold underline — not Material-style"
          />
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <PopOutTabs
              tabs={[
                {
                  id: "mood",
                  label: "Mood Board",
                  icon: <Palette size={14} />,
                  content: (
                    <div className="rounded-lg bg-ivory-warm/60 border border-border p-6">
                      <p className="text-sm text-ink-muted">Mood board content — drag-drop images, color palette, etc.</p>
                    </div>
                  ),
                },
                {
                  id: "details",
                  label: "Details",
                  icon: <FileText size={14} />,
                  content: (
                    <div className="rounded-lg bg-ivory-warm/60 border border-border p-6">
                      <p className="text-sm text-ink-muted">Detail fields — capacity, location, amenities, etc.</p>
                    </div>
                  ),
                },
                {
                  id: "notes",
                  label: "Notes",
                  content: (
                    <div className="rounded-lg bg-ivory-warm/60 border border-border p-6">
                      <p className="text-sm text-ink-muted">Free-form notes and reminders.</p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </section>

        {/* ── 5. PopOutGrid + PopOutCard ─────────────────────────────── */}
        <section>
          <SectionHeader
            number="05"
            title="PopOutGrid + PopOutCard"
            description="Responsive card grid with hover lift — for vendor options, ceremony cards, etc."
          />
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <PopOutGrid cols={3} gap="md">
              {[
                { title: "Mehndi", icon: <Flower2 size={18} />, desc: "Henna ceremony" },
                { title: "Sangeet", icon: <Music size={18} />, desc: "Musical evening" },
                { title: "Haldi", icon: <Heart size={18} />, desc: "Turmeric ritual" },
                { title: "Baraat", icon: <Music size={18} />, desc: "Groom's procession" },
                { title: "Pheras", icon: <Gem size={18} />, desc: "Sacred vows" },
                { title: "Reception", icon: <UtensilsCrossed size={18} />, desc: "Dinner & dance" },
              ].map((c) => (
                <PopOutCard key={c.title} title={c.title} interactive onClick={() => {}}>
                  <div className="flex items-center gap-2 text-ink-muted">
                    {c.icon}
                    <span className="text-xs">{c.desc}</span>
                  </div>
                </PopOutCard>
              ))}
            </PopOutGrid>
          </div>
        </section>

        {/* ── 6. PopOutEmpty ─────────────────────────────────────────── */}
        <section>
          <SectionHeader
            number="06"
            title="PopOutEmpty"
            description="Empty state with illustration, description, and call-to-action"
          />
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <PopOutEmpty
              illustration={<Camera size={36} strokeWidth={1} />}
              title="No photos yet"
              body="Upload inspiration photos for your photographer to reference during the shoot."
              action={{
                label: "Add Photos",
                icon: <Plus size={14} />,
                onClick: () => alert("Add photos clicked"),
              }}
            />
          </div>
        </section>

        {/* ── 7. PopOutInlineEdit ────────────────────────────────────── */}
        <section>
          <SectionHeader
            number="07"
            title="PopOutInlineEdit"
            description="Click-to-edit that looks like static text — supports text, number, date, textarea"
          />
          <div className="mt-6 rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-ink-faint uppercase tracking-wider font-medium">
                  Venue Name
                </label>
                <PopOutInlineEdit value={inlineName} onChange={setInlineName} />
              </div>
              <div>
                <label className="text-[11px] text-ink-faint uppercase tracking-wider font-medium">
                  Guest Capacity
                </label>
                <PopOutInlineEdit
                  value={inlineCapacity}
                  onChange={setInlineCapacity}
                  type="number"
                  format={(v) => `${v} guests`}
                />
              </div>
              <div>
                <label className="text-[11px] text-ink-faint uppercase tracking-wider font-medium">
                  Wedding Date
                </label>
                <PopOutInlineEdit value={inlineDate} onChange={setInlineDate} type="date" />
              </div>
              <div>
                <label className="text-[11px] text-ink-faint uppercase tracking-wider font-medium">
                  Notes
                </label>
                <PopOutInlineEdit
                  value={inlineNotes}
                  onChange={setInlineNotes}
                  type="textarea"
                  placeholder="Click to add notes…"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. PopOutTagInput ──────────────────────────────────────── */}
        <section>
          <SectionHeader
            number="08"
            title="PopOutTagInput"
            description="Tag chips with autocomplete suggestions — for traditions, dietary needs, vendor tags"
          />
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <PopOutTagInput
              tags={tags}
              onChange={setTags}
              suggestions={[
                "Haldi",
                "Mehndi",
                "Sangeet",
                "Baraat",
                "Pheras",
                "Vidaai",
                "Kanyadaan",
                "Saptapadi",
                "Jai Mala",
                "Tilak",
              ]}
              placeholder="Add ceremony…"
            />
          </div>
        </section>

        {/* ── 9. PopOutMoodBoard ─────────────────────────────────────── */}
        <section>
          <SectionHeader
            number="09"
            title="PopOutMoodBoard"
            description="Drag-droppable masonry image grid — drag to reorder, hover to delete, click + to add"
          />
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <PopOutMoodBoard
              images={moodImages}
              onAdd={(files) => {
                const newImages = files.map((f, i) => ({
                  id: `new-${Date.now()}-${i}`,
                  url: URL.createObjectURL(f),
                  alt: f.name,
                }));
                setMoodImages((prev) => [...prev, ...newImages]);
              }}
              onRemove={(id) =>
                setMoodImages((prev) => prev.filter((img) => img.id !== id))
              }
              onReorder={setMoodImages}
              maxImages={12}
            />
          </div>
        </section>

        {/* ── 10. Composition Example ────────────────────────────────── */}
        <section>
          <SectionHeader
            number="10"
            title="Full Composition"
            description="All primitives composed into a realistic bespoke pop-out"
          />
          <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden h-[600px]">
            <PopOutShell
              breadcrumbs={[
                { label: "Pre-Wedding" },
                { label: "Venue Selection" },
              ]}
              status={
                <span className="inline-flex items-center gap-1 rounded-full bg-sage-pale px-2 py-0.5 text-[10px] font-medium text-sage">
                  Done
                </span>
              }
              lastEdited="3 hours ago"
              saveState="saved"
              onClose={() => {}}
            >
              <div className="space-y-6">
                <PopOutSection title="Venue Name" icon={<MapPin size={14} />}>
                  <PopOutInlineEdit
                    value="The Taj Falaknuma Palace"
                    onChange={() => {}}
                  />
                </PopOutSection>

                <PopOutTabs
                  tabs={[
                    {
                      id: "mood",
                      label: "Mood Board",
                      icon: <Palette size={14} />,
                      content: (
                        <PopOutMoodBoard
                          images={moodImages.slice(0, 4)}
                          onAdd={() => {}}
                          onRemove={() => {}}
                          maxImages={8}
                        />
                      ),
                    },
                    {
                      id: "details",
                      label: "Details",
                      icon: <FileText size={14} />,
                      content: (
                        <PopOutSplit
                          ratio="2:1"
                          left={
                            <div className="space-y-3">
                              <div>
                                <label className="text-[11px] text-ink-faint uppercase tracking-wider font-medium">Capacity</label>
                                <PopOutInlineEdit value="350" onChange={() => {}} type="number" format={(v) => `${v} guests`} />
                              </div>
                              <div>
                                <label className="text-[11px] text-ink-faint uppercase tracking-wider font-medium">Date</label>
                                <PopOutInlineEdit value="2027-02-14" onChange={() => {}} type="date" />
                              </div>
                            </div>
                          }
                          right={
                            <PopOutSection title="Tags" noRule>
                              <PopOutTagInput
                                tags={["Heritage", "Palace", "Hyderabad"]}
                                onChange={() => {}}
                                suggestions={["Outdoor", "Indoor", "Destination"]}
                              />
                            </PopOutSection>
                          }
                        />
                      ),
                    },
                  ]}
                />
              </div>
            </PopOutShell>
          </div>
        </section>

        {/* ── Original infrastructure demos ──────────────────────────── */}
        <div className="border-t border-border pt-16">
          <div className="mb-10">
            <p className="text-xs font-mono text-ink-faint tracking-widest uppercase mb-1">
              Cross-Cutting Infrastructure
            </p>
            <h2 className="font-serif text-2xl font-bold text-ink tracking-tight">
              Shared Services
            </h2>
          </div>

          {/* File Uploads */}
          <section className="mb-16">
            <SectionHeader
              number="11"
              title="File Uploads"
              description="Drag-and-drop with thumbnail previews and hover-to-delete"
            />
            <div className="mt-6 rounded-xl border border-border bg-card p-6 space-y-6">
              <FileUploader entityId="demo-uploads" />
              <FileGallery entityId="demo-uploads" />
            </div>
          </section>

          {/* Comments */}
          <section className="mb-16">
            <SectionHeader
              number="12"
              title="Correspondence"
              description="Threaded comments with @mentions and one-level replies"
            />
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <CommentThread
                entityType="item"
                entityId="demo-comments"
                author="Ananya"
              />
            </div>
          </section>

          {/* AI Assist */}
          <section className="mb-16">
            <SectionHeader
              number="13"
              title="AI Assist"
              description="Context-aware AI generation with accept, regenerate, and edit"
            />
            <div className="mt-6 rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <AIAssistButton
                  contextPrompt="You are helping plan a beautiful Indian wedding. The couple values tradition blended with modern elegance."
                  entityId="demo-ai"
                  onAccept={(content) => setAiOutput(content)}
                />
                <span className="text-xs text-ink-faint">
                  Click the sparkle button to try it
                </span>
              </div>
              {aiOutput && (
                <div className="rounded-lg border border-gold-pale bg-gold-pale/10 p-4">
                  <p className="text-[10px] font-mono text-gold uppercase tracking-widest mb-2">
                    Accepted Output
                  </p>
                  <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">
                    {aiOutput}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* PDF Export */}
          <section>
            <SectionHeader
              number="14"
              title="PDF Export"
              description="Beautifully formatted PDF with gold accents and editorial layout"
            />
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              {sampleItem ? (
                <div className="flex items-center gap-4">
                  <ExportButton item={sampleItem} />
                  <div className="text-sm text-ink-muted">
                    Exports{" "}
                    <span className="font-serif font-semibold text-ink-soft">
                      {sampleItem.title}
                    </span>{" "}
                    as a styled PDF
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink-faint">
                  No items loaded to export.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <p className="text-xs text-ink-faint text-center">
            These components are documented in{" "}
            <code className="font-mono text-gold">
              components/popout/README.md
            </code>
          </p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-gold font-semibold">
          {number}
        </span>
        <h2 className="font-serif text-xl font-bold text-ink tracking-tight">
          {title}
        </h2>
      </div>
      <p className="text-sm text-ink-muted mt-1 pl-9">{description}</p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Card,
  CardHeader,
  Chip,
  GhostButton,
  PageHeader,
  PrimaryButton,
} from "@/components/vendor-portal/ui";
import type { Wedding } from "@/lib/vendor-portal/seed";

const STATUS_LABEL: Record<Wedding["status"], { label: string; tone: "neutral" | "gold" | "sage" | "rose" | "teal" }> = {
  contracted: { label: "Confirmed", tone: "gold" },
  "in-flight": { label: "In progress", tone: "teal" },
  delivered: { label: "Completed", tone: "sage" },
};

type Tab = "overview" | "tasks" | "documents" | "notes" | "payments";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "tasks", label: "Tasks & Milestones" },
  { id: "documents", label: "Documents" },
  { id: "notes", label: "Private Notes" },
  { id: "payments", label: "Payment Tracking" },
];

export default function WeddingDetailView({ wedding }: { wedding: Wedding }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [tasks, setTasks] = useState(wedding.tasks);
  const [notes, setNotes] = useState(wedding.privateNotes);
  const [newNote, setNewNote] = useState("");

  const status = STATUS_LABEL[wedding.status];
  const openTaskCount = tasks.filter((t) => !t.done).length;
  const paidTotal = wedding.payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + parseAmount(p.amount), 0);
  const totalAmount = wedding.payments.reduce((sum, p) => sum + parseAmount(p.amount), 0);

  function toggleTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function toggleTaskShared(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, sharedWithCouple: !t.sharedWithCouple } : t)),
    );
  }

  function addNote() {
    if (!newNote.trim()) return;
    setNotes((prev) => [
      {
        id: `n-${Date.now()}`,
        body: newNote.trim(),
        addedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      },
      ...prev,
    ]);
    setNewNote("");
  }

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow={
          <Link href="/vendor/weddings" className="hover:text-[#B8860B]">
            ← Weddings
          </Link>
        }
        title={wedding.coupleName}
        description={`${wedding.weddingDate} · ${wedding.venue}, ${wedding.city} · ${wedding.totalGuests} guests`}
        actions={
          <>
            <Chip tone={status.tone}>{status.label}</Chip>
            {wedding.threadId && (
              <GhostButton as="a" href={`/vendor/inbox?thread=${wedding.threadId}`}>
                ✉ Conversation
              </GhostButton>
            )}
            <PrimaryButton>Share update</PrimaryButton>
          </>
        }
      />

      {/* Sub-header stats band */}
      <div className="border-b border-[rgba(26,26,26,0.06)] bg-[#FBF9F4]/70 px-8 py-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCell label="T-minus" value={`${wedding.daysAway} days`} />
          <StatCell label="Open tasks" value={String(openTaskCount)} accent={openTaskCount > 0} />
          <StatCell label="Paid" value={`${wedding.paidPct}%`} sub={`${formatINR(paidTotal)} of ${formatINR(totalAmount)}`} />
          <StatCell label="Package" value={wedding.package} />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[rgba(26,26,26,0.08)] px-8">
        <div className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const isActive = tab === t.id;
            const badge =
              t.id === "tasks" && openTaskCount > 0
                ? openTaskCount
                : t.id === "documents"
                  ? wedding.documents.length
                  : t.id === "notes"
                    ? notes.length
                    : t.id === "payments"
                      ? wedding.payments.filter((p) => p.status !== "paid").length || undefined
                      : undefined;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-[13px] transition-colors ${
                  isActive
                    ? "border-b-2 border-[#B8860B] text-[#1a1a1a]"
                    : "border-b-2 border-transparent text-stone-500 hover:text-[#1a1a1a]"
                }`}
              >
                {t.label}
                {badge !== undefined && badge > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-[1px] text-[10px] font-medium ${
                      isActive ? "bg-[#F0E4C8] text-[#7a5a16]" : "bg-[#F5F1E8] text-stone-500"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-8 py-6">
        {tab === "overview" && <OverviewTab wedding={wedding} />}
        {tab === "tasks" && (
          <TasksTab
            tasks={tasks}
            onToggle={toggleTask}
            onToggleShared={toggleTaskShared}
          />
        )}
        {tab === "documents" && <DocumentsTab wedding={wedding} />}
        {tab === "notes" && (
          <NotesTab
            notes={notes}
            newNote={newNote}
            onNewNoteChange={setNewNote}
            onAddNote={addNote}
          />
        )}
        {tab === "payments" && <PaymentsTab wedding={wedding} />}
      </div>
    </div>
  );
}

// ── Stat cell ────────────────────────────────────────────────

function StatCell({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">{label}</p>
      <p
        className="mt-1 text-[18px] text-[#1a1a1a]"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 500,
          color: accent ? "#B8860B" : undefined,
        }}
      >
        {value}
      </p>
      {sub && <p className="text-[11.5px] text-stone-500">{sub}</p>}
    </div>
  );
}

// ── Overview tab ─────────────────────────────────────────────

function OverviewTab({ wedding }: { wedding: Wedding }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Card>
          <CardHeader title="Events" hint={`${wedding.events.length} functions across ${wedding.weddingDate}`} />
          <div className="divide-y divide-[rgba(26,26,26,0.06)]">
            {wedding.events.map((e) => (
              <div key={e.name} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-4 sm:grid-cols-[120px_1fr_auto]">
                <div>
                  <p className="text-[14px] font-medium text-[#1a1a1a]">{e.name}</p>
                  <p className="text-[11.5px] text-stone-500">{e.date}</p>
                </div>
                <p className="text-[13px] text-stone-700 sm:col-span-1">{e.venue}</p>
                <p className="whitespace-nowrap text-right font-mono text-[12px] text-stone-600">
                  {e.guests} guests
                </p>
              </div>
            ))}
          </div>
        </Card>

        {wedding.threadPreview && (
          <Card>
            <CardHeader
              title="From the conversation"
              hint="Latest context pulled from the inquiry thread."
              action={
                wedding.threadId ? (
                  <GhostButton as="a" href={`/vendor/inbox?thread=${wedding.threadId}`}>
                    Open thread
                  </GhostButton>
                ) : undefined
              }
            />
            <div className="px-5 py-4">
              <p
                className="text-[15px] italic leading-relaxed text-stone-700"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                &ldquo;{wedding.threadPreview}&rdquo;
              </p>
            </div>
          </Card>
        )}
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader title="Couple" />
          <dl className="space-y-3 px-5 py-4 text-[13px]">
            <DetailRow label="Bride" value={wedding.contact.brideName} />
            <DetailRow label="Groom" value={wedding.contact.groomName} />
            <DetailRow label="Email" value={wedding.contact.email} mono />
            <DetailRow label="Phone" value={wedding.contact.phone} mono />
            {wedding.contact.plannerName && (
              <DetailRow label="Planner" value={wedding.contact.plannerName} />
            )}
          </dl>
        </Card>

        <Card>
          <CardHeader title="Booking" />
          <dl className="space-y-3 px-5 py-4 text-[13px]">
            <DetailRow label="Package" value={wedding.package} />
            <DetailRow label="Total" value={wedding.amount} />
            <DetailRow label="Venue" value={wedding.venue} />
            <DetailRow label="City" value={wedding.city} />
            <DetailRow label="Guests" value={String(wedding.totalGuests)} />
          </dl>
        </Card>

        {wedding.status === "delivered" && (
          <Card>
            <CardHeader title="Portfolio" hint="Link delivered work to build your track record." />
            <div className="px-5 py-4">
              {wedding.portfolioItemIds && wedding.portfolioItemIds.length > 0 ? (
                <>
                  <p className="text-[12.5px] text-stone-600">
                    Linked to {wedding.portfolioItemIds.length} portfolio items.
                  </p>
                  <div className="mt-3">
                    <GhostButton as="a" href="/vendor/portfolio">
                      Manage portfolio
                    </GhostButton>
                  </div>
                </>
              ) : (
                <PrimaryButton as="a" href="/vendor/portfolio">
                  + Link to portfolio
                </PrimaryButton>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-start gap-3">
      <dt className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-stone-500">
        {label}
      </dt>
      <dd
        className={`text-stone-800 ${mono ? "font-mono text-[12px]" : ""}`}
        style={{ wordBreak: "break-word" }}
      >
        {value}
      </dd>
    </div>
  );
}

// ── Tasks tab ────────────────────────────────────────────────

function TasksTab({
  tasks,
  onToggle,
  onToggleShared,
}: {
  tasks: Wedding["tasks"];
  onToggle: (id: string) => void;
  onToggleShared: (id: string) => void;
}) {
  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Open"
          hint={`${open.length} to complete. Toggle "share" to surface a task in the couple's workspace.`}
          action={<PrimaryButton>+ Add task</PrimaryButton>}
        />
        <ul className="divide-y divide-[rgba(26,26,26,0.06)]">
          {open.map((t) => (
            <TaskRow key={t.id} task={t} onToggle={onToggle} onToggleShared={onToggleShared} />
          ))}
          {open.length === 0 && (
            <li className="px-5 py-8 text-center text-[13px] text-stone-500">
              All caught up. Breathe.
            </li>
          )}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Done" hint={`${done.length} completed.`} />
        <ul className="divide-y divide-[rgba(26,26,26,0.06)]">
          {done.map((t) => (
            <TaskRow key={t.id} task={t} onToggle={onToggle} onToggleShared={onToggleShared} />
          ))}
          {done.length === 0 && (
            <li className="px-5 py-6 text-center text-[12.5px] text-stone-400">
              Nothing done yet.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onToggleShared,
}: {
  task: Wedding["tasks"][number];
  onToggle: (id: string) => void;
  onToggleShared: (id: string) => void;
}) {
  return (
    <li className="flex items-start gap-3 px-5 py-3.5">
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? "Mark incomplete" : "Mark complete"}
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
          task.done
            ? "border-[#B8860B] bg-[#B8860B] text-[#FBF9F4]"
            : "border-[rgba(26,26,26,0.25)] bg-white hover:border-[#B8860B]"
        }`}
      >
        {task.done && <span className="text-[10px] leading-none">✓</span>}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={`text-[13.5px] ${task.done ? "text-stone-400 line-through" : "text-[#1a1a1a]"}`}
        >
          {task.label}
        </p>
        <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-stone-500">
          Due {task.dueDate}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onToggleShared(task.id)}
        className={`shrink-0 rounded-full px-2 py-[2px] text-[10.5px] font-medium uppercase tracking-wider transition-colors ${
          task.sharedWithCouple
            ? "bg-[#F0E4C8] text-[#7a5a16]"
            : "border border-[rgba(26,26,26,0.12)] bg-white text-stone-500 hover:text-[#1a1a1a]"
        }`}
      >
        {task.sharedWithCouple ? "Shared" : "Private"}
      </button>
    </li>
  );
}

// ── Documents tab ────────────────────────────────────────────

const KIND_LABEL: Record<Wedding["documents"][number]["kind"], string> = {
  contract: "Contract",
  proposal: "Proposal",
  invoice: "Invoice",
  moodboard: "Moodboard",
  other: "Other",
};

const KIND_GLYPH: Record<Wedding["documents"][number]["kind"], string> = {
  contract: "§",
  proposal: "◈",
  invoice: "₹",
  moodboard: "▤",
  other: "⌘",
};

function DocumentsTab({ wedding }: { wedding: Wedding }) {
  return (
    <Card>
      <CardHeader
        title="Files"
        hint="Contracts, proposals, invoices, moodboards — everything shared with the couple lives here."
        action={<PrimaryButton>+ Upload file</PrimaryButton>}
      />
      <ul className="divide-y divide-[rgba(26,26,26,0.06)]">
        {wedding.documents.map((d) => (
          <li key={d.id} className="flex items-center gap-4 px-5 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5F1E8] text-[14px] text-[#7a5a16]">
              {KIND_GLYPH[d.kind]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium text-[#1a1a1a]">{d.name}</p>
              <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-stone-500">
                {KIND_LABEL[d.kind]} · {d.size} · {d.uploadedAt}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-[2px] text-[10.5px] font-medium uppercase tracking-wider ${
                d.sharedWithCouple
                  ? "bg-[#F0E4C8] text-[#7a5a16]"
                  : "border border-[rgba(26,26,26,0.12)] bg-white text-stone-500"
              }`}
            >
              {d.sharedWithCouple ? "Shared" : "Private"}
            </span>
            <GhostButton>Download</GhostButton>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ── Notes tab ────────────────────────────────────────────────

function NotesTab({
  notes,
  newNote,
  onNewNoteChange,
  onAddNote,
}: {
  notes: Wedding["privateNotes"];
  newNote: string;
  onNewNoteChange: (v: string) => void;
  onAddNote: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <Card>
        <CardHeader
          title="Your notes"
          hint="Private to you — the couple never sees this. Preferences, allergies, family dynamics, internal reminders."
        />
        <ul className="divide-y divide-[rgba(26,26,26,0.06)]">
          {notes.map((n) => (
            <li key={n.id} className="px-5 py-4">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-stone-500">
                {n.addedAt}
              </p>
              <p
                className="mt-1.5 text-[14.5px] leading-relaxed text-stone-800"
                style={{ fontFamily: "'EB Garamond', serif", fontSize: "15px" }}
              >
                {n.body}
              </p>
            </li>
          ))}
          {notes.length === 0 && (
            <li className="px-5 py-8 text-center text-[13px] text-stone-500">
              No notes yet.
            </li>
          )}
        </ul>
      </Card>

      <Card className="h-fit">
        <CardHeader title="Add a note" hint="Only you will see this." />
        <div className="px-5 py-4">
          <textarea
            value={newNote}
            onChange={(e) => onNewNoteChange(e.target.value)}
            rows={6}
            placeholder="E.g. Bride's uncle is diabetic — no sugar in the welcome drink at the haldi."
            className="w-full resize-none rounded-lg border bg-white p-3.5 text-[14px] text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B8860B]/40"
            style={{ borderColor: "rgba(26,26,26,0.12)" }}
          />
          <div className="mt-3 flex justify-end">
            <PrimaryButton onClick={onAddNote}>Save note</PrimaryButton>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Payments tab ─────────────────────────────────────────────

function PaymentsTab({ wedding }: { wedding: Wedding }) {
  const paid = wedding.payments.filter((p) => p.status === "paid");
  const paidTotal = paid.reduce((s, p) => s + parseAmount(p.amount), 0);
  const totalAmount = wedding.payments.reduce((s, p) => s + parseAmount(p.amount), 0);
  const outstanding = totalAmount - paidTotal;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryTile label="Contract total" value={formatINR(totalAmount)} />
        <SummaryTile label="Received" value={formatINR(paidTotal)} tone="sage" />
        <SummaryTile label="Outstanding" value={formatINR(outstanding)} tone={outstanding > 0 ? "gold" : "sage"} />
      </div>

      <Card>
        <CardHeader
          title="Milestones"
          hint="For your own records. Ananya doesn't process payments (yet) — mark received when the transfer lands."
        />
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[rgba(26,26,26,0.06)] text-left font-mono text-[10.5px] uppercase tracking-[0.2em] text-stone-500">
                <th className="px-5 py-3 font-medium">Milestone</th>
                <th className="px-3 py-3 font-medium">Amount</th>
                <th className="px-3 py-3 font-medium">Due</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {wedding.payments.map((p) => {
                const tone: "sage" | "gold" | "rose" =
                  p.status === "paid" ? "sage" : p.status === "overdue" ? "rose" : "gold";
                const label = p.status === "paid" ? "Paid" : p.status === "overdue" ? "Overdue" : "Pending";
                return (
                  <tr key={p.id} className="border-b border-[rgba(26,26,26,0.04)] last:border-0">
                    <td className="px-5 py-4 text-[#1a1a1a]">{p.label}</td>
                    <td className="px-3 py-4 font-mono text-stone-700">{p.amount}</td>
                    <td className="px-3 py-4 text-stone-700">
                      {p.dueDate}
                      {p.paidOn && (
                        <span className="ml-1 text-[11px] text-stone-500">· paid {p.paidOn}</span>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <Chip tone={tone}>{label}</Chip>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {p.status === "paid" ? (
                        <GhostButton>Receipt</GhostButton>
                      ) : (
                        <PrimaryButton>Mark received</PrimaryButton>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "sage" | "gold";
}) {
  const bg = tone === "sage" ? "#E8F0E0" : tone === "gold" ? "#F0E4C8" : "#F5F1E8";
  const fg = tone === "sage" ? "#4a6b3a" : tone === "gold" ? "#7a5a16" : "#1a1a1a";
  return (
    <Card className="p-5" style={{ background: bg }}>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.22em]" style={{ color: fg }}>
        {label}
      </p>
      <p
        className="mt-2 text-[26px] leading-none"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: fg,
        }}
      >
        {value}
      </p>
    </Card>
  );
}

// ── helpers ──────────────────────────────────────────────────

function parseAmount(s: string): number {
  const n = Number(s.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatINR(n: number): string {
  if (!n) return "₹0";
  // Indian grouping: last three digits, then pairs
  const str = Math.round(n).toString();
  if (str.length <= 3) return `₹${str}`;
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3);
  const withCommas = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `₹${withCommas},${last3}`;
}

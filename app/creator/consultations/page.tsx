"use client";

import { useMemo, useState } from "react";
import { Plus, Calendar, Star, Clock, X, Check } from "lucide-react";
import { PortalPageHeader, PortalStatCard } from "@/components/creator-portal/PortalPageHeader";
import { useCurrentCreator, formatUsd } from "@/lib/creators/current-creator";
import { useMatchingStore } from "@/stores/matching-store";
import type {
  BookingStatus,
  ConsultationBooking,
  CreatorService,
  ServiceType,
} from "@/types/matching";

const SERVICE_TYPES: Array<{ value: ServiceType; label: string }> = [
  { value: "quick_ask", label: "Quick ask" },
  { value: "styling_session", label: "Styling session" },
  { value: "mood_board", label: "Mood board" },
  { value: "full_package", label: "Full package" },
  { value: "custom", label: "Custom" },
];

export default function ConsultationsPage() {
  const creator = useCurrentCreator();
  const [tab, setTab] = useState<"services" | "bookings">("services");

  const services = useMatchingStore((s) =>
    creator ? s.listServicesByCreator(creator.id) : [],
  );
  const bookings = useMatchingStore((s) =>
    creator ? s.listBookingsForCreator(creator.id) : [],
  );
  const stats = useMatchingStore((s) =>
    creator
      ? s.creatorConsultationStats(creator.id)
      : { totalConsultations: 0, averageRating: 0, totalEarnings: 0, pendingPayout: 0 },
  );

  const upcomingThisWeek = useMemo(() => {
    const weekOut = Date.now() + 7 * 24 * 60 * 60 * 1000;
    return bookings.filter(
      (b) =>
        b.status === "scheduled" &&
        b.scheduledAt &&
        new Date(b.scheduledAt).getTime() <= weekOut,
    ).length;
  }, [bookings]);

  if (!creator) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PortalPageHeader
        eyebrow="Business"
        title="Consultations"
        description="Manage the services you offer and the bookings from couples."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <PortalStatCard
          label="Completed"
          value={String(stats.totalConsultations)}
          tone="sage"
        />
        <PortalStatCard
          label="Average rating"
          value={stats.averageRating ? `${stats.averageRating.toFixed(1)} ★` : "—"}
          tone="saffron"
        />
        <PortalStatCard
          label="Earnings (all-time)"
          value={formatUsd(stats.totalEarnings)}
          tone="gold"
        />
        <PortalStatCard
          label="Upcoming this week"
          value={String(upcomingThisWeek)}
          tone="teal"
        />
      </div>

      <div className="mt-6 flex gap-1 border-b border-gold/10">
        <TabButton active={tab === "services"} onClick={() => setTab("services")}>
          Services
        </TabButton>
        <TabButton active={tab === "bookings"} onClick={() => setTab("bookings")}>
          Bookings
        </TabButton>
      </div>

      <div className="mt-5">
        {tab === "services" ? (
          <ServicesTab services={services} creatorId={creator.id} />
        ) : (
          <BookingsTab bookings={bookings} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px rounded-t-md border-b-2 px-4 py-2 text-[13px] transition-colors ${
        active
          ? "border-gold text-ink"
          : "border-transparent text-ink-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function ServicesTab({
  services,
  creatorId,
}: {
  services: CreatorService[];
  creatorId: string;
}) {
  const createService = useMatchingStore((s) => s.createService);
  const updateService = useMatchingStore((s) => s.updateService);
  const deactivateService = useMatchingStore((s) => s.deactivateService);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    title: string;
    description: string;
    serviceType: ServiceType;
    durationMinutes: number | null;
    price: number;
    maxBookingsPerWeek: number | null;
  }>({
    title: "",
    description: "",
    serviceType: "quick_ask",
    durationMinutes: 30,
    price: 100,
    maxBookingsPerWeek: 5,
  });

  const openNew = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      serviceType: "quick_ask",
      durationMinutes: 30,
      price: 100,
      maxBookingsPerWeek: 5,
    });
    setShowForm(true);
  };

  const openEdit = (service: CreatorService) => {
    setEditingId(service.id);
    setForm({
      title: service.title,
      description: service.description,
      serviceType: service.serviceType,
      durationMinutes: service.durationMinutes,
      price: service.price,
      maxBookingsPerWeek: service.maxBookingsPerWeek,
    });
    setShowForm(true);
  };

  const submit = () => {
    if (editingId) {
      updateService(editingId, { ...form });
    } else {
      createService({
        ...form,
        creatorId,
        isActive: true,
      });
    }
    setShowForm(false);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-[17px] text-ink">Your services</h2>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12.5px] text-ivory hover:bg-gold"
        >
          <Plus size={13} /> Add service
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-xl border border-gold/30 bg-ivory-warm p-4">
          <h3 className="font-serif text-[15px] text-ink">
            {editingId ? "Edit service" : "New service"}
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <InputField
              label="Title"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
            />
            <SelectField
              label="Service type"
              value={form.serviceType}
              options={SERVICE_TYPES.map((s) => ({ value: s.value, label: s.label }))}
              onChange={(v) => setForm({ ...form, serviceType: v as ServiceType })}
            />
            <InputField
              label="Duration (minutes)"
              type="number"
              value={String(form.durationMinutes ?? "")}
              onChange={(v) =>
                setForm({ ...form, durationMinutes: v ? parseInt(v, 10) : null })
              }
            />
            <InputField
              label="Price (USD)"
              type="number"
              value={String(form.price)}
              onChange={(v) => setForm({ ...form, price: parseInt(v || "0", 10) })}
            />
            <InputField
              label="Max bookings per week"
              type="number"
              value={String(form.maxBookingsPerWeek ?? "")}
              onChange={(v) =>
                setForm({ ...form, maxBookingsPerWeek: v ? parseInt(v, 10) : null })
              }
              className="md:col-span-1"
            />
            <div className="md:col-span-2">
              <label
                className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="mt-1 w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-[13px]"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] text-ink hover:bg-ivory-warm"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!form.title.trim()}
              className="rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:bg-gold disabled:opacity-40"
            >
              {editingId ? "Save" : "Create"}
            </button>
          </div>
        </div>
      )}

      {services.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gold/20 px-4 py-12 text-center text-[12.5px] italic text-ink-muted">
          No services yet. Add one to start accepting consultations.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {services.map((s) => (
            <div
              key={s.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p
                    className="font-mono text-[9.5px] uppercase tracking-wider text-gold"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {s.serviceType.replace("_", " ")}
                  </p>
                  <h4 className="mt-0.5 font-serif text-[15px] text-ink">{s.title}</h4>
                </div>
                <span className="font-serif text-[18px] text-ink">
                  {formatUsd(s.price)}
                </span>
              </div>
              <p className="line-clamp-2 text-[12px] text-ink-muted">{s.description}</p>
              <div
                className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-ink-faint"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {s.durationMinutes && <span>{s.durationMinutes} min</span>}
                {s.maxBookingsPerWeek && <span>Max {s.maxBookingsPerWeek}/wk</span>}
                <span>{s.isActive ? "Active" : "Inactive"}</span>
              </div>
              <div className="mt-1 flex gap-2">
                <button
                  onClick={() => openEdit(s)}
                  className="rounded-md border border-border bg-white px-3 py-1 text-[11.5px] hover:bg-ivory-warm"
                >
                  Edit
                </button>
                {s.isActive && (
                  <button
                    onClick={() => deactivateService(s.id)}
                    className="text-[11.5px] text-rose hover:underline"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookingsTab({ bookings }: { bookings: ConsultationBooking[] }) {
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [view, setView] = useState<"list" | "calendar">("list");
  const confirmBooking = useMatchingStore((s) => s.confirmBooking);
  const cancelBooking = useMatchingStore((s) => s.cancelBooking);
  const scheduleBooking = useMatchingStore((s) => s.scheduleBooking);
  const completeBooking = useMatchingStore((s) => s.completeBooking);
  const services = useMatchingStore((s) => s.services);
  const getReviewForBooking = useMatchingStore((s) => s.getReviewForBooking);

  const filtered = bookings.filter((b) => filter === "all" || b.status === filter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {(["all", "requested", "confirmed", "scheduled", "completed", "cancelled"] as const).map(
            (s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full border px-3 py-1 text-[11.5px] capitalize ${
                  filter === s
                    ? "border-gold/40 bg-gold-pale/40 text-ink"
                    : "border-border bg-white text-ink-muted hover:border-gold/30"
                }`}
              >
                {s}
              </button>
            ),
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setView("list")}
            className={`rounded-md border px-3 py-1 text-[11.5px] ${
              view === "list"
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted"
            }`}
          >
            List
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`rounded-md border px-3 py-1 text-[11.5px] ${
              view === "calendar"
                ? "border-ink bg-ink text-ivory"
                : "border-border bg-white text-ink-muted"
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {view === "calendar" ? (
        <CalendarView bookings={bookings.filter((b) => b.status === "scheduled")} />
      ) : filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gold/20 px-4 py-12 text-center text-[12.5px] italic text-ink-muted">
          No bookings match this filter.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((b) => {
            const service = services.find((s) => s.id === b.serviceId);
            const review = getReviewForBooking(b.id);
            return (
              <div
                key={b.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 md:flex-row md:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusPill status={b.status} />
                    <span
                      className="font-mono text-[10px] uppercase tracking-wider text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {initialsFromId(b.coupleUserId)} · {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 font-serif text-[15px] text-ink">
                    {service?.title ?? "Service"}
                  </p>
                  <p className="line-clamp-2 text-[12px] text-ink-muted">{b.coupleNote}</p>
                  {b.scheduledAt && (
                    <p
                      className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-gold"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <Clock size={10} /> {new Date(b.scheduledAt).toLocaleString()}
                    </p>
                  )}
                  {review && (
                    <p className="mt-2 text-[12px] italic text-ink-muted">
                      <Star size={10} className="inline text-gold" /> {review.rating}/5 — "{review.reviewText}"
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {b.status === "requested" && (
                    <>
                      <button
                        onClick={() => confirmBooking(b.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-sage px-3 py-1.5 text-[11.5px] text-white hover:bg-sage/90"
                      >
                        <Check size={11} /> Confirm
                      </button>
                      <button
                        onClick={() => cancelBooking(b.id, "Declined by creator")}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-[11.5px] text-rose hover:bg-rose/10"
                      >
                        <X size={11} /> Decline
                      </button>
                    </>
                  )}
                  {b.status === "confirmed" && (
                    <button
                      onClick={() => {
                        const date = prompt("Scheduled date/time (ISO format, e.g. 2026-05-01T14:00)");
                        const link = prompt("Meeting link") ?? "";
                        if (date) scheduleBooking(b.id, new Date(date).toISOString(), link);
                      }}
                      className="rounded-md bg-ink px-3 py-1.5 text-[11.5px] text-ivory hover:bg-gold"
                    >
                      Schedule
                    </button>
                  )}
                  {b.status === "scheduled" && (
                    <button
                      onClick={() => {
                        const url = prompt("Deliverable URL (optional)") ?? "";
                        completeBooking(b.id, url || null);
                      }}
                      className="rounded-md bg-ink px-3 py-1.5 text-[11.5px] text-ivory hover:bg-gold"
                    >
                      Mark complete
                    </button>
                  )}
                  {b.status === "completed" && !review && (
                    <span
                      className="font-mono text-[10px] uppercase tracking-wider text-ink-faint"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Awaiting review
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CalendarView({ bookings }: { bookings: ConsultationBooking[] }) {
  // Simple weekly grid for the current week.
  const today = new Date();
  const dayStart = new Date(today);
  dayStart.setHours(0, 0, 0, 0);
  dayStart.setDate(dayStart.getDate() - dayStart.getDay());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(dayStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="grid grid-cols-7 border-b border-border bg-ivory-warm">
        {days.map((d) => (
          <div
            key={d.toISOString()}
            className="border-r border-border px-3 py-2 text-center last:border-r-0"
          >
            <p
              className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {d.toLocaleDateString("en-US", { weekday: "short" })}
            </p>
            <p className="font-serif text-[15px] text-ink">{d.getDate()}</p>
          </div>
        ))}
      </div>
      <div className="grid min-h-[200px] grid-cols-7">
        {days.map((day) => {
          const dayBookings = bookings.filter((b) => {
            if (!b.scheduledAt) return false;
            const sched = new Date(b.scheduledAt);
            return (
              sched.getDate() === day.getDate() &&
              sched.getMonth() === day.getMonth() &&
              sched.getFullYear() === day.getFullYear()
            );
          });
          return (
            <div
              key={day.toISOString()}
              className="border-r border-border p-2 last:border-r-0"
            >
              {dayBookings.map((b) => (
                <div
                  key={b.id}
                  className="mb-1 rounded bg-gold-pale/40 px-2 py-1 text-[10px] text-ink"
                >
                  {b.scheduledAt &&
                    new Date(b.scheduledAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  <span className="ml-1 text-ink-muted">{initialsFromId(b.coupleUserId)}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: BookingStatus }) {
  const TONE: Record<BookingStatus, string> = {
    requested: "bg-saffron/20 text-saffron",
    confirmed: "bg-teal-pale/60 text-teal",
    scheduled: "bg-gold-pale/60 text-gold",
    completed: "bg-sage/20 text-sage",
    cancelled: "bg-rose/15 text-rose",
    refunded: "bg-ink-faint/20 text-ink-faint",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider ${TONE[status]}`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {status}
    </span>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span
        className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-white px-3 py-2 text-[13px]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-white px-3 py-2 text-[13px]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function initialsFromId(id: string): string {
  const seed = id.slice(-2).toUpperCase();
  return `${seed[0] ?? "A"}.${seed[1] ?? "D"}.`;
}

import Link from "next/link";
import {
  Card,
  CardHeader,
  Chip,
  GhostButton,
  PageHeader,
  PrimaryButton,
} from "@/components/vendor-portal/ui";
import { WEDDINGS } from "@/lib/vendor-portal/seed";

const STATUS_LABEL: Record<string, { label: string; tone: "neutral" | "gold" | "sage" | "rose" | "teal" }> = {
  contracted: { label: "Confirmed", tone: "gold" },
  "in-flight": { label: "In progress", tone: "teal" },
  delivered: { label: "Completed", tone: "sage" },
};

export default function VendorWeddingsPage() {
  const upcoming = WEDDINGS.filter((w) => w.status !== "delivered").sort((a, b) => a.daysAway - b.daysAway);
  const past = WEDDINGS.filter((w) => w.status === "delivered");

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Weddings"
        title="Active bookings"
        description="Every couple you've signed. The work doesn't end at the contract — this is your day-of command center."
        actions={<PrimaryButton>Add manual booking</PrimaryButton>}
      />

      <div className="px-8 py-6 space-y-8">
        {/* ── Active ─────────────────────────────────────────── */}
        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-[16px] font-medium text-[#1a1a1a]">Active weddings</h2>
              <p className="text-[12px] text-stone-500">
                {upcoming.length} projects in flight — click any card to open the tracker.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((w) => {
              const stat = STATUS_LABEL[w.status];
              const openTasks = w.tasks.filter((t) => !t.done).length;
              const nextPayment = w.payments.find((p) => p.status !== "paid");
              return (
                <Link
                  key={w.id}
                  href={`/vendor/weddings/${w.id}`}
                  className="group block"
                >
                  <Card className="flex h-full flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_2px_0_rgba(26,26,26,0.03),0_24px_48px_-28px_rgba(26,26,26,0.2)]">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
                          {w.weddingDate}
                        </p>
                        <h3
                          className="mt-1 truncate text-[22px] leading-tight text-[#1a1a1a]"
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 500,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {w.coupleName}
                        </h3>
                      </div>
                      <Chip tone={stat.tone}>{stat.label}</Chip>
                    </div>

                    {/* Venue */}
                    <p className="mt-2 text-[13.5px] text-stone-700">{w.venue}</p>
                    <p className="text-[12px] text-stone-500">{w.city} · {w.totalGuests} guests</p>

                    {/* Events */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {w.events.map((e) => (
                        <span
                          key={e.name}
                          className="rounded-full border border-[rgba(26,26,26,0.1)] bg-[#F5F1E8] px-2 py-[1px] text-[10.5px] text-stone-700"
                        >
                          {e.name}
                        </span>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="my-4 h-px bg-[rgba(26,26,26,0.06)]" />

                    {/* Bottom stats */}
                    <div className="mt-auto space-y-2.5">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-stone-500">T-minus</span>
                        <span
                          className="font-mono"
                          style={{ color: w.daysAway < 30 ? "#B8860B" : "#1a1a1a" }}
                        >
                          {w.daysAway} days
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-stone-500">Paid</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-20 overflow-hidden rounded-full bg-[#F0E4C8]/60">
                            <div
                              className="h-full rounded-full bg-[#B8860B]"
                              style={{ width: `${w.paidPct}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-stone-700">{w.paidPct}%</span>
                        </div>
                      </div>

                      {nextPayment && (
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="text-stone-500">Next payment</span>
                          <span className="text-stone-700">
                            {nextPayment.amount} · {nextPayment.dueDate}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-stone-500">Next up</span>
                        <span className="truncate text-right text-stone-700">
                          {w.nextMilestone.label}
                        </span>
                      </div>
                    </div>

                    {/* Footer links */}
                    <div className="mt-4 flex items-center justify-between border-t border-[rgba(26,26,26,0.06)] pt-3">
                      <span className="text-[11.5px] text-[#C97B63]">
                        {openTasks > 0 ? `${openTasks} open tasks` : "All tasks done"}
                      </span>
                      {w.threadId && (
                        <span
                          className="inline-flex items-center gap-1 text-[11.5px] text-stone-500 transition-colors group-hover:text-[#B8860B]"
                        >
                          ✉ Open thread
                        </span>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Archive ───────────────────────────────────────── */}
        <Card>
          <CardHeader
            title="Archive · delivered"
            hint="Completed weddings — link to portfolio items to build your Ananya track record."
            action={<GhostButton>Export CSV</GhostButton>}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <tbody>
                {past.map((w) => (
                  <tr
                    key={w.id}
                    className="border-b border-[rgba(26,26,26,0.04)] transition-colors last:border-0 hover:bg-[#F5F1E8]/60"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/vendor/weddings/${w.id}`}
                        className="text-[14px] font-medium text-[#1a1a1a] hover:text-[#B8860B]"
                      >
                        {w.coupleName}
                      </Link>
                      <p className="text-[11.5px] text-stone-500">{w.weddingDate} · {w.city}</p>
                    </td>
                    <td className="px-3 py-4 text-stone-600">{w.venue}</td>
                    <td className="px-3 py-4 text-stone-700">{w.amount}</td>
                    <td className="px-3 py-4">
                      {w.portfolioItemIds && w.portfolioItemIds.length > 0 ? (
                        <span className="text-[11.5px] text-stone-500">
                          Linked to {w.portfolioItemIds.length} portfolio items
                        </span>
                      ) : (
                        <span className="text-[11.5px] text-[#B8860B]">
                          + Link to portfolio
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Chip tone="sage">Completed</Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

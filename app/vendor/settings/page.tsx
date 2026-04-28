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

type ChannelMap = { email: boolean; sms: boolean; push: boolean };
type NotificationRow = {
  id: string;
  label: string;
  hint: string;
  channels: ChannelMap;
};

type TeamRole = "admin" | "manager" | "viewer";
type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: "active" | "invited";
};

type Invoice = {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "open";
};

const ROLE_COPY: Record<TeamRole, { label: string; hint: string; tone: "gold" | "sage" | "neutral" }> = {
  admin:   { label: "Admin",   hint: "Full access including billing and team.", tone: "gold" },
  manager: { label: "Manager", hint: "Inbox, weddings, portfolio. No billing.", tone: "sage" },
  viewer:  { label: "Viewer",  hint: "Read-only access across the portal.",     tone: "neutral" },
};

const SECTIONS = [
  { href: "#account",       label: "Account" },
  { href: "#business",      label: "Business details" },
  { href: "#notifications", label: "Notifications" },
  { href: "#team",          label: "Team access" },
  { href: "#billing",       label: "Billing" },
  { href: "#visibility",    label: "Public profile" },
] as const;

export default function VendorSettingsPage() {
  const [active, setActive] = useState<string>("#account");

  // Account
  const [email, setEmail] = useState("priya@aurorastudios.in");
  const [twoFA, setTwoFA] = useState(true);

  // Business details
  const [bizName, setBizName] = useState("Aurora Studios Private Limited");
  const [taxId, setTaxId] = useState("27ABCDE1234F1Z5");
  const [addr1, setAddr1] = useState("42 Linking Road, Bandra West");
  const [addr2, setAddr2] = useState("Mumbai, Maharashtra 400050");
  const [phone, setPhone] = useState("+91 98201 12345");

  // Notifications
  const [notifs, setNotifs] = useState<NotificationRow[]>([
    { id: "inquiry",   label: "New inquiry",             hint: "A couple sent their first message.",            channels: { email: true,  sms: true,  push: true  } },
    { id: "reply",     label: "Message from a couple",   hint: "A reply in an active thread.",                  channels: { email: true,  sms: false, push: true  } },
    { id: "review",    label: "New review received",     hint: "Posted to your public profile.",                channels: { email: true,  sms: false, push: true  } },
    { id: "platform",  label: "Ananya platform updates", hint: "Product news, new features, roadmap.",          channels: { email: true,  sms: false, push: false } },
    { id: "digest",    label: "Weekly performance digest", hint: "Monday morning — views, inquiries, bookings.", channels: { email: true,  sms: false, push: false } },
  ]);

  // Team
  const [team, setTeam] = useState<TeamMember[]>([
    { id: "u_1", name: "Priya Malhotra",  email: "priya@aurorastudios.in",  role: "admin",   status: "active"  },
    { id: "u_2", name: "Raj Kapoor",      email: "raj@aurorastudios.in",    role: "manager", status: "active"  },
    { id: "u_3", name: "Anika Bhatt",     email: "anika@freelance.co",      role: "viewer",  status: "invited" },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("manager");

  // Billing
  const invoices: Invoice[] = useMemo(
    () => [
      { id: "INV-2026-04", date: "Apr 01, 2026", amount: "₹2,400", status: "paid" },
      { id: "INV-2026-03", date: "Mar 01, 2026", amount: "₹2,400", status: "paid" },
      { id: "INV-2026-02", date: "Feb 01, 2026", amount: "₹2,400", status: "paid" },
      { id: "INV-2026-01", date: "Jan 01, 2026", amount: "₹2,400", status: "paid" },
    ],
    [],
  );

  // Visibility
  const [profileActive, setProfileActive] = useState(true);
  const [vacationOn, setVacationOn] = useState(false);
  const [vacationUntil, setVacationUntil] = useState("2026-05-15");

  const setChannel = (rowId: string, ch: keyof ChannelMap, value: boolean) => {
    setNotifs((rows) =>
      rows.map((r) => (r.id === rowId ? { ...r, channels: { ...r.channels, [ch]: value } } : r)),
    );
  };

  const updateRole = (id: string, role: TeamRole) => {
    setTeam((ms) => ms.map((m) => (m.id === id ? { ...m, role } : m)));
  };

  const removeMember = (id: string) => {
    setTeam((ms) => ms.filter((m) => m.id !== id));
  };

  const sendInvite = () => {
    const trimmed = inviteEmail.trim();
    if (!trimmed) return;
    setTeam((ms) => [
      ...ms,
      {
        id: `u_${Date.now()}`,
        name: trimmed.split("@")[0],
        email: trimmed,
        role: inviteRole,
        status: "invited",
      },
    ]);
    setInviteEmail("");
    setInviteRole("manager");
  };

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Settings"
        title="Account & business settings"
        description="Logins, legal details, alerts, teammates, billing, and how your storefront appears to couples."
        actions={<PrimaryButton>Save changes</PrimaryButton>}
      />

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
          <nav
            className="space-y-1 self-start rounded-xl border bg-white p-2 lg:sticky lg:top-6"
            style={{ borderColor: "rgba(44,44,44,0.08)" }}
          >
            {SECTIONS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                onClick={() => setActive(s.href)}
                className={`block rounded-md px-3 py-2 text-[13px] transition-colors ${
                  active === s.href
                    ? "bg-[#F5E6D0] text-[#2C2C2C]"
                    : "text-stone-600 hover:bg-[#F5E6D0]/60 hover:text-[#2C2C2C]"
                }`}
              >
                {s.label}
              </a>
            ))}
          </nav>

          <div className="space-y-5">
            {/* ── Account ─────────────────────────────────────── */}
            <Card>
              <CardHeader id="account" title="Account" hint="Your login and security" />
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  hint="Used for login and all account notifications."
                />
                <PasswordField />
                <div className="sm:col-span-2">
                  <div className="flex flex-wrap items-start justify-between gap-4 rounded-md border bg-[#FAF8F5] p-4"
                       style={{ borderColor: "rgba(44,44,44,0.08)" }}>
                    <div className="max-w-lg">
                      <div className="flex items-center gap-2">
                        <p className="text-[13.5px] font-medium text-[#2C2C2C]">Two-factor authentication</p>
                        {twoFA ? <Chip tone="sage">On</Chip> : <Chip tone="rose">Off</Chip>}
                      </div>
                      <p className="mt-1 text-[12.5px] text-stone-600">
                        Require a one-time code from your authenticator app every time you sign in from a new device.
                      </p>
                    </div>
                    <Toggle on={twoFA} onChange={setTwoFA} ariaLabel="Two-factor authentication" />
                  </div>
                </div>
              </div>
            </Card>

            {/* ── Business details ────────────────────────────── */}
            <Card>
              <CardHeader
                id="business"
                title="Business details"
                hint="Legal entity information used for contracts and future payments"
              />
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Legal business name"
                    value={bizName}
                    onChange={setBizName}
                    hint="Only shown on contracts and invoices — display name stays the same."
                  />
                </div>
                <Input
                  label="EIN / tax ID"
                  value={taxId}
                  onChange={setTaxId}
                  hint="Optional today. Required when we turn on payments."
                  optional
                />
                <Input label="Business phone" value={phone} onChange={setPhone} type="tel" />
                <div className="sm:col-span-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input label="Street address" value={addr1} onChange={setAddr1} />
                  <Input label="City, state, postal" value={addr2} onChange={setAddr2} />
                </div>
              </div>
            </Card>

            {/* ── Notifications ───────────────────────────────── */}
            <Card>
              <CardHeader
                id="notifications"
                title="Notification preferences"
                hint="Choose where each alert lands"
              />
              <div className="overflow-hidden">
                <div
                  className="grid grid-cols-[minmax(0,1fr)_56px_56px_56px] items-center border-b px-5 py-2.5"
                  style={{ borderColor: "rgba(44,44,44,0.06)" }}
                >
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
                    Event
                  </span>
                  <span className="text-center font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">Email</span>
                  <span className="text-center font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">SMS</span>
                  <span className="text-center font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">Push</span>
                </div>
                {notifs.map((row, i) => (
                  <div
                    key={row.id}
                    className={`grid grid-cols-[minmax(0,1fr)_56px_56px_56px] items-center px-5 py-3.5 ${
                      i === notifs.length - 1 ? "" : "border-b"
                    }`}
                    style={{ borderColor: "rgba(44,44,44,0.05)" }}
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-[13.5px] text-[#2C2C2C]">{row.label}</p>
                      <p className="text-[11.5px] text-stone-500">{row.hint}</p>
                    </div>
                    <div className="flex justify-center">
                      <Toggle
                        on={row.channels.email}
                        onChange={(v) => setChannel(row.id, "email", v)}
                        ariaLabel={`${row.label} email`}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Toggle
                        on={row.channels.sms}
                        onChange={(v) => setChannel(row.id, "sms", v)}
                        ariaLabel={`${row.label} SMS`}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Toggle
                        on={row.channels.push}
                        onChange={(v) => setChannel(row.id, "push", v)}
                        ariaLabel={`${row.label} push`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Team access ─────────────────────────────────── */}
            <Card>
              <CardHeader
                id="team"
                title="Team access"
                hint="Invite teammates with scoped permissions — each gets their own login"
              />
              <div className="p-5">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {(Object.keys(ROLE_COPY) as TeamRole[]).map((k) => {
                    const r = ROLE_COPY[k];
                    return (
                      <div
                        key={k}
                        className="rounded-md border bg-[#FAF8F5] p-3"
                        style={{ borderColor: "rgba(44,44,44,0.08)" }}
                      >
                        <div className="flex items-center gap-2">
                          <Chip tone={r.tone}>{r.label}</Chip>
                        </div>
                        <p className="mt-2 text-[11.5px] text-stone-600">{r.hint}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-wrap items-end gap-3">
                  <div className="min-w-[220px] flex-1">
                    <label className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
                      Invite by email
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="teammate@studio.com"
                      className="w-full rounded-md border bg-white px-3 py-2 text-[13.5px] text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#C4A265]/40"
                      style={{ borderColor: "rgba(44,44,44,0.12)" }}
                    />
                  </div>
                  <div className="w-[160px]">
                    <label className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
                      Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                      className="w-full rounded-md border bg-white px-3 py-2 text-[13.5px] text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#C4A265]/40"
                      style={{ borderColor: "rgba(44,44,44,0.12)" }}
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                  <PrimaryButton onClick={sendInvite}>Send invite</PrimaryButton>
                </div>

                <div className="mt-5 overflow-hidden rounded-md border"
                     style={{ borderColor: "rgba(44,44,44,0.08)" }}>
                  <div
                    className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_80px] items-center bg-[#F5E6D0] px-4 py-2"
                  >
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">Member</span>
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">Role</span>
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">Status</span>
                    <span className="sr-only">Actions</span>
                  </div>
                  {team.map((m, i) => (
                    <div
                      key={m.id}
                      className={`grid grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_80px] items-center gap-2 px-4 py-3 ${
                        i === team.length - 1 ? "" : "border-b"
                      }`}
                      style={{ borderColor: "rgba(44,44,44,0.05)" }}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] text-[#2C2C2C]">{m.name}</p>
                        <p className="truncate text-[11.5px] text-stone-500">{m.email}</p>
                      </div>
                      <div>
                        <select
                          value={m.role}
                          onChange={(e) => updateRole(m.id, e.target.value as TeamRole)}
                          className="rounded-md border bg-white px-2 py-1 text-[12.5px] text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#C4A265]/40"
                          style={{ borderColor: "rgba(44,44,44,0.12)" }}
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </div>
                      <div>
                        {m.status === "active" ? (
                          <Chip tone="sage">Active</Chip>
                        ) : (
                          <Chip tone="gold">Invited</Chip>
                        )}
                      </div>
                      <div className="text-right">
                        <button
                          onClick={() => removeMember(m.id)}
                          className="text-[12px] text-stone-500 transition-colors hover:text-[#9a4a30]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* ── Billing ─────────────────────────────────────── */}
            <Card>
              <CardHeader
                id="billing"
                title="Billing"
                action={<Chip tone="gold">Premium</Chip>}
              />
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p
                      className="text-[22px] text-[#2C2C2C]"
                      style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}
                    >
                      Ananya Premium
                    </p>
                    <p
                      className="mt-1 text-[14px] italic text-stone-600"
                      style={{ fontFamily: "'EB Garamond', serif" }}
                    >
                      ₹2,400 / month · unlimited galleries, priority placement, 0% platform fee on bookings under ₹5 L.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <GhostButton>Change plan</GhostButton>
                    <GhostButton>Cancel</GhostButton>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div
                    className="rounded-md border bg-[#FAF8F5] p-4"
                    style={{ borderColor: "rgba(44,44,44,0.08)" }}
                  >
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
                      Payment method
                    </p>
                    <p className="mt-2 text-[14px] text-[#2C2C2C]">Visa · ending 4412</p>
                    <p className="text-[12px] text-stone-500">Expires 09/28</p>
                    <div className="mt-3">
                      <GhostButton>Update card</GhostButton>
                    </div>
                  </div>
                  <div
                    className="rounded-md border bg-[#FAF8F5] p-4"
                    style={{ borderColor: "rgba(44,44,44,0.08)" }}
                  >
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
                      Next charge
                    </p>
                    <p className="mt-2 text-[14px] text-[#2C2C2C]">May 01, 2026 · ₹2,400</p>
                    <p className="text-[12px] text-stone-500">Auto-renews monthly until cancelled.</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
                    Invoice history
                  </p>
                  <div className="overflow-hidden rounded-md border"
                       style={{ borderColor: "rgba(44,44,44,0.08)" }}>
                    <div
                      className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_80px] items-center bg-[#F5E6D0] px-4 py-2"
                    >
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">Invoice</span>
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">Date</span>
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">Amount</span>
                      <span className="sr-only">Download</span>
                    </div>
                    {invoices.map((inv, i) => (
                      <div
                        key={inv.id}
                        className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_80px] items-center gap-2 px-4 py-3 ${
                          i === invoices.length - 1 ? "" : "border-b"
                        }`}
                        style={{ borderColor: "rgba(44,44,44,0.05)" }}
                      >
                        <span className="font-mono text-[12.5px] text-[#2C2C2C]">{inv.id}</span>
                        <span className="text-[12.5px] text-stone-600">{inv.date}</span>
                        <span className="text-[12.5px] text-stone-600">{inv.amount}</span>
                        <a
                          href="#"
                          className="text-right text-[12px] text-[#9E8245] transition-colors hover:text-[#C4A265]"
                        >
                          PDF ↓
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* ── Public profile / visibility ─────────────────── */}
            <Card>
              <CardHeader
                id="visibility"
                title="Public profile controls"
                hint="How couples see your storefront"
              />
              <div className="p-5 space-y-4">
                <div
                  className="flex flex-wrap items-start justify-between gap-4 rounded-md border bg-[#FAF8F5] p-4"
                  style={{ borderColor: "rgba(44,44,44,0.08)" }}
                >
                  <div className="max-w-lg">
                    <div className="flex items-center gap-2">
                      <p className="text-[13.5px] font-medium text-[#2C2C2C]">Profile visibility</p>
                      {profileActive ? <Chip tone="sage">Active</Chip> : <Chip tone="rose">Paused</Chip>}
                    </div>
                    <p className="mt-1 text-[12.5px] text-stone-600">
                      Paused profiles are hidden from marketplace search. Existing conversations and weddings are untouched.
                    </p>
                  </div>
                  <Toggle on={profileActive} onChange={setProfileActive} ariaLabel="Profile visibility" />
                </div>

                <div
                  className="rounded-md border bg-[#FAF8F5] p-4"
                  style={{ borderColor: "rgba(44,44,44,0.08)" }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-lg">
                      <div className="flex items-center gap-2">
                        <p className="text-[13.5px] font-medium text-[#2C2C2C]">Vacation mode</p>
                        {vacationOn && <Chip tone="gold">On</Chip>}
                      </div>
                      <p className="mt-1 text-[12.5px] text-stone-600">
                        Shows a banner on your public profile: <span className="italic">“Not accepting new inquiries until [date].”</span>
                      </p>
                    </div>
                    <Toggle on={vacationOn} onChange={setVacationOn} ariaLabel="Vacation mode" />
                  </div>
                  {vacationOn && (
                    <div className="mt-4 flex flex-wrap items-end gap-3">
                      <div>
                        <label className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
                          Accepting inquiries again on
                        </label>
                        <input
                          type="date"
                          value={vacationUntil}
                          onChange={(e) => setVacationUntil(e.target.value)}
                          className="rounded-md border bg-white px-3 py-2 text-[13.5px] text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#C4A265]/40"
                          style={{ borderColor: "rgba(44,44,44,0.12)" }}
                        />
                      </div>
                      <p className="text-[11.5px] italic text-stone-500">
                        Couples can still browse your portfolio — just can’t start a new inquiry.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Local controls ─────────────────────────────────────────

function Input({
  label,
  value,
  onChange,
  type = "text",
  hint,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
        {label}
        {optional && <span className="font-sans text-[10px] normal-case tracking-normal text-stone-400">optional</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border bg-white px-3 py-2 text-[13.5px] text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#C4A265]/40"
        style={{ borderColor: "rgba(44,44,44,0.12)" }}
      />
      {hint && <p className="mt-1 text-[11.5px] text-stone-500">{hint}</p>}
    </div>
  );
}

function PasswordField() {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.22em] text-stone-500">
        Password
      </label>
      <div className="flex items-center gap-2">
        <input
          type="password"
          value="••••••••••••"
          readOnly
          className="w-full rounded-md border bg-white px-3 py-2 text-[13.5px] text-[#2C2C2C]"
          style={{ borderColor: "rgba(44,44,44,0.12)" }}
        />
        <GhostButton>Change</GhostButton>
      </div>
      <p className="mt-1 text-[11.5px] text-stone-500">Last changed 3 months ago.</p>
    </div>
  );
}

function Toggle({
  on,
  onChange,
  ariaLabel,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        on ? "bg-[#C4A265]" : "bg-stone-200"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
          on ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

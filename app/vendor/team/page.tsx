"use client";

import { useState } from "react";
import { Card, PageHeader, PrimaryButton, GhostButton } from "@/components/vendor-portal/ui";
import { usePortalVendor } from "@/lib/vendor-portal/current-vendor";

type TeamRole = "Second shooter" | "Assistant" | "Editor" | "Videographer" | "Coordinator";
type TeamMemberStatus = "active" | "invited";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: TeamMemberStatus;
  joinedAt: string;
};

const SEED_TEAM: TeamMember[] = [
  { id: "tm-1", name: "Divya Kapoor",  email: "divya@aurorastudios.com",  role: "Second shooter", status: "active",  joinedAt: "2025-06-01" },
  { id: "tm-2", name: "Rohan Mehta",   email: "rohan@aurorastudios.com",   role: "Videographer",   status: "active",  joinedAt: "2025-08-15" },
  { id: "tm-3", name: "Simran Gill",   email: "simran@aurorastudios.com",  role: "Editor",         status: "active",  joinedAt: "2025-10-01" },
  { id: "tm-4", name: "Karan Arora",   email: "karan@freelance.com",       role: "Assistant",      status: "invited", joinedAt: "2026-03-20" },
];

const ROLES: TeamRole[] = ["Second shooter", "Assistant", "Editor", "Videographer", "Coordinator"];

function fmt(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function VendorTeamPage() {
  const vendor = usePortalVendor();
  const [members, setMembers] = useState<TeamMember[]>(SEED_TEAM);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Assistant" as TeamRole });

  function handleInvite() {
    if (!form.name || !form.email) return;
    setMembers((prev) => [
      ...prev,
      {
        id: `tm-${Date.now()}`,
        name: form.name,
        email: form.email,
        role: form.role,
        status: "invited",
        joinedAt: new Date().toISOString(),
      },
    ]);
    setForm({ name: "", email: "", role: "Assistant" });
    setInviteOpen(false);
  }

  function remove(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="pb-16">
      <PageHeader
        eyebrow="Team"
        title={`${vendor.name} team`}
        description="Manage who has access to your vendor portal and what they can do."
        actions={
          <PrimaryButton onClick={() => setInviteOpen(true)}>+ Invite member</PrimaryButton>
        }
      />

      <div className="px-8 py-6 space-y-3 max-w-2xl">
        {members.map((m) => (
          <Card key={m.id} className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5E6D0] text-[14px] font-medium text-[#9E8245]">
                  {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[#2C2C2C] text-[14px]">{m.name}</p>
                    {m.status === "invited" && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-stone-500">{m.email}</p>
                  <p className="text-[12px] text-stone-400 mt-0.5">{m.role} · Since {fmt(m.joinedAt)}</p>
                </div>
              </div>
              <GhostButton onClick={() => remove(m.id)}>Remove</GhostButton>
            </div>
          </Card>
        ))}
      </div>

      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2
              className="text-[22px] text-[#2C2C2C]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Invite a team member
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-[12px] text-stone-500 mb-1">Full name</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#C4A265]"
                  style={{ borderColor: "rgba(44,44,44,0.15)" }}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Priya Sharma"
                />
              </div>
              <div>
                <label className="block text-[12px] text-stone-500 mb-1">Email address</label>
                <input
                  type="email"
                  className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#C4A265]"
                  style={{ borderColor: "rgba(44,44,44,0.15)" }}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="priya@studio.com"
                />
              </div>
              <div>
                <label className="block text-[12px] text-stone-500 mb-1">Role</label>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#C4A265]"
                  style={{ borderColor: "rgba(44,44,44,0.15)" }}
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as TeamRole }))}
                >
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <PrimaryButton onClick={handleInvite}>Send invite</PrimaryButton>
              <GhostButton onClick={() => setInviteOpen(false)}>Cancel</GhostButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

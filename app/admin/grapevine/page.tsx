"use client";

// /admin/grapevine — session list + create form.
// All mutations route through /api/grapevine/admin/* which checks for
// `role === 'admin'` on the JWT. The admin layout's local-flag fallback
// only gates the UI; the admin user still needs role=admin in user
// metadata to actually run mutations against the API.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight, Circle, CircleDot } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser-client";
import {
  SESSION_TYPE_LABEL,
  type GrapevineSession,
  type GrapevineSessionStatus,
  type GrapevineSessionType,
} from "@/types/grapevine-ama";

const DISPLAY = "'Playfair Display', Georgia, serif";

async function getToken(): Promise<string | null> {
  const { data } = await supabaseBrowser.auth.getSession();
  return data.session?.access_token ?? null;
}

function statusBadge(s: GrapevineSessionStatus) {
  const colors: Record<GrapevineSessionStatus, { bg: string; fg: string; label: string }> = {
    upcoming: { bg: "#F0E9DC", fg: "#8B6F2C", label: "UPCOMING" },
    live: { bg: "#FBE5E5", fg: "#B83232", label: "LIVE" },
    ended: { bg: "#E8E2D5", fg: "#6B5B40", label: "ENDED" },
    archived: { bg: "#E6DFD3", fg: "#4F4435", label: "ARCHIVED" },
  };
  const c = colors[s];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-[1.4px]"
      style={{ background: c.bg, color: c.fg }}
    >
      {c.label}
    </span>
  );
}

const SESSION_TYPES: GrapevineSessionType[] = [
  "planner",
  "vendor",
  "real_bride",
  "stylist",
  "expert",
  "pandit",
  "caterer",
];

export default function AdminGrapevinePage() {
  const [sessions, setSessions] = useState<GrapevineSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/grapevine/sessions");
      const j = await res.json();
      setSessions(j?.sessions ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const transition = async (id: string, status: GrapevineSessionStatus) => {
    const token = await getToken();
    await fetch(`/api/grapevine/admin/sessions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status }),
    });
    refresh();
  };

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">
      <div className="flex items-end justify-between gap-4 border-b border-[#E6DFD3] pb-6 mb-8">
        <div>
          <h1 className="text-[#1C1917]" style={{ fontFamily: DISPLAY, fontSize: 32 }}>
            The Grapevine
          </h1>
          <p className="mt-2 text-[14px] text-[#6B6157]">
            Schedule, run, and archive AMA sessions. Live mutations require the admin role on your auth account.
          </p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-5 py-2 text-[12.5px] text-white"
        >
          <Plus size={14} /> {showCreate ? "Close" : "New Session"}
        </button>
      </div>

      {showCreate && <CreateSessionForm onCreated={() => { setShowCreate(false); refresh(); }} />}

      {loading ? (
        <p className="py-10 text-center text-[14px] text-[#6B6157]">Loading…</p>
      ) : sessions.length === 0 ? (
        <p className="py-10 text-center text-[14px] text-[#6B6157]">No sessions yet — create one above.</p>
      ) : (
        <div className="grid gap-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="border border-[#E6DFD3] bg-white p-5 flex items-center gap-5 justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  {statusBadge(s.status)}
                  {s.session_type && (
                    <span className="text-[10px] font-semibold tracking-[1.4px] text-[#8B7E6F]">
                      {SESSION_TYPE_LABEL[s.session_type].toUpperCase()}
                    </span>
                  )}
                </div>
                <h3
                  className="text-[#1C1917]"
                  style={{ fontFamily: DISPLAY, fontSize: 20, lineHeight: 1.2 }}
                >
                  {s.title}
                </h3>
                <p className="text-[12.5px] text-[#6B6157] mt-1">
                  {s.expert_name}
                  {s.expert_title ? ` · ${s.expert_title}` : ""} ·{" "}
                  <span className="text-[#1C1917]">{s.total_questions}</span> Q ·{" "}
                  <span className="text-[#1C1917]">{s.total_answered}</span> answered
                </p>
              </div>
              <div className="flex items-center gap-2">
                {s.status === "upcoming" && (
                  <button
                    onClick={() => transition(s.id, "live")}
                    className="inline-flex items-center gap-1 rounded-full bg-[#B83232] px-4 py-1.5 text-[11.5px] text-white"
                  >
                    <CircleDot size={12} /> Start
                  </button>
                )}
                {s.status === "live" && (
                  <button
                    onClick={() => transition(s.id, "ended")}
                    className="inline-flex items-center gap-1 rounded-full bg-[#6B5B40] px-4 py-1.5 text-[11.5px] text-white"
                  >
                    <Circle size={12} /> End
                  </button>
                )}
                {s.status === "ended" && (
                  <button
                    onClick={() => transition(s.id, "archived")}
                    className="inline-flex items-center gap-1 rounded-full bg-[#1C1917] px-4 py-1.5 text-[11.5px] text-white"
                  >
                    Archive
                  </button>
                )}
                <Link
                  href={`/admin/grapevine/${s.id}`}
                  className="inline-flex items-center gap-1 border border-[#E6DFD3] bg-white px-4 py-1.5 text-[11.5px] text-[#1C1917] hover:bg-[#F0E9DC]"
                >
                  Manage <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateSessionForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [expertName, setExpertName] = useState("");
  const [expertTitle, setExpertTitle] = useState("");
  const [expertBio, setExpertBio] = useState("");
  const [credentials, setCredentials] = useState("");
  const [tags, setTags] = useState("");
  const [type, setType] = useState<GrapevineSessionType | "">("");
  const [scheduled, setScheduled] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!title.trim() || !expertName.trim()) {
      setErr("title and expert name are required");
      return;
    }
    setBusy(true);
    const token = await getToken();
    const res = await fetch("/api/grapevine/admin/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        title,
        slug: slug || undefined,
        description: description || undefined,
        expert_name: expertName,
        expert_title: expertTitle || undefined,
        expert_bio: expertBio || undefined,
        expert_credentials: credentials
          ? credentials.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        tags: tags
          ? tags.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        session_type: type || undefined,
        scheduled_start: scheduled || undefined,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j?.error ?? "Could not create");
      return;
    }
    onCreated();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-3 border border-[#E6DFD3] bg-white p-6"
    >
      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Slug (optional, auto-generated)">
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Expert Name" required>
        <input value={expertName} onChange={(e) => setExpertName(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Expert Title">
        <input value={expertTitle} onChange={(e) => setExpertTitle(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Description" className="md:col-span-2">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} rows={2} />
      </Field>
      <Field label="Expert Bio" className="md:col-span-2">
        <textarea value={expertBio} onChange={(e) => setExpertBio(e.target.value)} className={inputCls} rows={3} />
      </Field>
      <Field label="Expert Credentials (comma-separated)" className="md:col-span-2">
        <input value={credentials} onChange={(e) => setCredentials(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Tags (comma-separated)">
        <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Session Type">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as GrapevineSessionType)}
          className={inputCls}
        >
          <option value="">—</option>
          {SESSION_TYPES.map((t) => (
            <option key={t} value={t}>{SESSION_TYPE_LABEL[t]}</option>
          ))}
        </select>
      </Field>
      <Field label="Scheduled Start (ISO)">
        <input
          type="datetime-local"
          value={scheduled}
          onChange={(e) => setScheduled(e.target.value)}
          className={inputCls}
        />
      </Field>
      {err && <p className="md:col-span-2 text-[12px] text-[#B83232]">{err}</p>}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-[#1C1917] px-6 py-2 text-[12.5px] text-white disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create Session"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full border border-[#E6DFD3] bg-white px-3 py-2 text-[13.5px] text-[#1C1917] focus:border-[#B8755D] outline-none";

function Field({
  label,
  children,
  required,
  className,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block mb-1 text-[10.5px] font-semibold tracking-[1.4px] uppercase text-[#6B6157]">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { PortalPageHeader } from "@/components/creator-portal/PortalPageHeader";
import { useCurrentCreator } from "@/lib/creators/current-creator";
import { useCreatorPortalStore } from "@/stores/creator-portal-store";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsPage() {
  const creator = useCurrentCreator();
  const user = useAuthStore((s) => s.user);
  const getSettings = useCreatorPortalStore((s) => s.getSettings);
  const updateSettings = useCreatorPortalStore((s) => s.updateSettings);
  const isDeactivated = useCreatorPortalStore((s) => s.isDeactivated);
  const toggleDeactivation = useCreatorPortalStore((s) => s.toggleDeactivation);

  const settings = creator ? getSettings(creator.id) : null;
  const [deleteText, setDeleteText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!creator || !settings) return null;

  const deactivated = isDeactivated(creator.id);

  const toggle = (key: keyof typeof settings) => {
    updateSettings(creator.id, { [key]: !settings[key] } as never);
  };

  const confirmDelete = () => {
    if (deleteText !== "DELETE") return;
    alert("Profile deleted (stub). In production this would permanently remove creator data.");
    setShowDeleteConfirm(false);
    setDeleteText("");
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <PortalPageHeader
        eyebrow="Account"
        title="Settings"
        description="Preferences, availability, and account controls."
      />

      {/* Account */}
      <Section title="Account">
        <InfoRow label="Email" value={user?.email ?? creator.handle + "@ananya.local"} />
        <InfoRow label="Password" value="••••••••" action="Change in account settings" />
        <InfoRow label="Two-factor authentication" value="Not set up" action="Enable" />
      </Section>

      {/* Notification preferences */}
      <Section title="Notification preferences">
        <Toggle
          label="New follower notifications"
          checked={settings.notifyOnFollower}
          onChange={() => toggle("notifyOnFollower")}
        />
        <Toggle
          label="Partnership proposal notifications"
          checked={settings.notifyOnProposal}
          onChange={() => toggle("notifyOnProposal")}
        />
        <Toggle
          label="Booking request notifications"
          checked={settings.notifyOnBooking}
          onChange={() => toggle("notifyOnBooking")}
        />
        <Toggle
          label="Drop reminder notifications"
          checked={settings.notifyOnDropReminder}
          onChange={() => toggle("notifyOnDropReminder")}
        />
        <Toggle
          label="Weekly performance digest email"
          checked={settings.weeklyDigest}
          onChange={() => toggle("weeklyDigest")}
        />
      </Section>

      {/* Availability */}
      <Section title="Availability">
        <Toggle
          label="I'm currently accepting consultations"
          description="When off, your services are hidden from couples."
          checked={settings.acceptingConsultations}
          onChange={() => toggle("acceptingConsultations")}
        />
        <Toggle
          label="I'm open to vendor partnerships"
          description="When off, vendors can't propose new partnerships."
          checked={settings.openToPartnerships}
          onChange={() => toggle("openToPartnerships")}
        />
        <Toggle
          label="Vacation mode"
          description="Pauses all creator activity; auto-declines new bookings."
          checked={settings.vacationMode}
          onChange={() => toggle("vacationMode")}
        />
        {settings.vacationMode && (
          <div className="mt-2">
            <label
              className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink-faint"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Away message
            </label>
            <textarea
              value={settings.vacationMessage}
              onChange={(e) =>
                updateSettings(creator.id, { vacationMessage: e.target.value })
              }
              rows={2}
              placeholder="I'm away until…"
              className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-[13px]"
            />
          </div>
        )}
      </Section>

      {/* Danger zone */}
      <div className="mt-8 rounded-xl border border-rose/30 bg-rose/5 p-5">
        <h2 className="flex items-center gap-2 font-serif text-[17px] text-ink">
          <AlertTriangle size={15} className="text-rose" strokeWidth={1.8} />
          Danger zone
        </h2>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded-lg bg-white p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-serif text-[14px] text-ink">
                {deactivated ? "Reactivate profile" : "Deactivate profile"}
              </p>
              <p className="text-[12px] text-ink-muted">
                Temporarily hides your profile and content. Your data is preserved.
              </p>
            </div>
            <button
              onClick={() => toggleDeactivation(creator.id)}
              className="rounded-md border border-rose/40 bg-white px-3 py-1.5 text-[12.5px] text-rose hover:bg-rose/10"
            >
              {deactivated ? "Reactivate" : "Deactivate"}
            </button>
          </div>

          <div className="flex flex-col gap-2 rounded-lg bg-white p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-serif text-[14px] text-ink">Delete creator profile</p>
                <p className="text-[12px] text-ink-muted">
                  Permanent. Past transactions are preserved for accounting.
                </p>
              </div>
              {!showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-md bg-rose px-3 py-1.5 text-[12.5px] text-white hover:bg-rose/90"
                >
                  Delete profile
                </button>
              )}
            </div>
            {showDeleteConfirm && (
              <div className="mt-3 rounded-lg border border-rose/30 bg-rose/10 p-3">
                <p className="text-[12.5px] text-ink">
                  Type <strong>DELETE</strong> to confirm.
                </p>
                <input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-[13px]"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={confirmDelete}
                    disabled={deleteText !== "DELETE"}
                    className="rounded-md bg-rose px-3 py-1.5 text-[12px] text-white hover:bg-rose/90 disabled:opacity-40"
                  >
                    Permanently delete
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteText("");
                    }}
                    className="rounded-md border border-border bg-white px-3 py-1.5 text-[12px] hover:bg-ivory-warm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-xl border border-border bg-white p-5">
      <h2 className="font-serif text-[17px] text-ink">{title}</h2>
      <div className="mt-3 flex flex-col gap-2">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gold/10 py-2 last:border-b-0">
      <div>
        <p
          className="font-mono text-[9.5px] uppercase tracking-wider text-ink-faint"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </p>
        <p className="text-[13px] text-ink">{value}</p>
      </div>
      {action && (
        <span className="text-[11.5px] text-gold hover:underline">{action}</span>
      )}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 py-1.5">
      <div>
        <p className="text-[13px] text-ink">{label}</p>
        {description && <p className="text-[11.5px] text-ink-muted">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        className={`relative mt-1 h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-gold" : "bg-ink-faint/30"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

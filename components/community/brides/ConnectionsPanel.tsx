"use client";

// ── Connections panel ───────────────────────────────────────────────────────
// Two sections: pending requests (with accept/decline), and accepted
// connections (with a "message" shortcut that opens the messages panel).

import { useMemo } from "react";
import { Check, MessageCircle, X } from "lucide-react";
import { BrideAvatar } from "@/components/community/BrideAvatar";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";
import { useCommunitySocialStore } from "@/stores/community-social-store";

export function ConnectionsPanel({
  onOpenThread,
}: {
  onOpenThread: (connectionId: string) => void;
}) {
  // Select raw state; derive the three lists with useMemo so each hook call
  // returns a stable reference until the underlying connections change.
  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const myProfile = useMemo(
    () => (myProfileId ? profiles.find((p) => p.id === myProfileId) : undefined),
    [profiles, myProfileId],
  );
  const getProfile = useMemo(
    () => (id: string) => profiles.find((p) => p.id === id),
    [profiles],
  );

  const allConnections = useCommunitySocialStore((s) => s.connections);
  const incoming = useMemo(
    () =>
      myProfileId
        ? allConnections.filter(
            (c) => c.recipient_id === myProfileId && c.status === "pending",
          )
        : [],
    [allConnections, myProfileId],
  );
  const outgoing = useMemo(
    () =>
      myProfileId
        ? allConnections.filter(
            (c) => c.requester_id === myProfileId && c.status === "pending",
          )
        : [],
    [allConnections, myProfileId],
  );
  const accepted = useMemo(
    () =>
      myProfileId
        ? allConnections.filter(
            (c) =>
              c.status === "accepted" &&
              (c.requester_id === myProfileId ||
                c.recipient_id === myProfileId),
          )
        : [],
    [allConnections, myProfileId],
  );

  const respondConnection = useCommunitySocialStore(
    (s) => s.respondConnection,
  );
  const cancelConnection = useCommunitySocialStore((s) => s.cancelConnection);

  if (!myProfile) {
    return (
      <div className="px-10 py-16 text-center">
        <p className="font-serif text-[22px] italic text-ink">
          set up your profile to manage connections.
        </p>
      </div>
    );
  }

  const openThread = (connectionId: string) => onOpenThread(connectionId);

  return (
    <div className="px-10 py-8">
      <div className="mx-auto max-w-3xl space-y-10">
        {/* Incoming requests */}
        <Section title="Requests" count={incoming.length}>
          {incoming.length === 0 ? (
            <EmptyLine text="no pending requests right now." />
          ) : (
            <ul className="space-y-3">
              {incoming.map((c) => {
                const them = getProfile(c.requester_id);
                if (!them) return null;
                return (
                  <li
                    key={c.id}
                    className="rounded-xl border border-gold/20 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <BrideAvatar
                        name={them.display_name}
                        src={them.avatar_data_url}
                        size={44}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-[17px] font-medium text-ink">
                          {them.display_name}
                        </p>
                        <p className="mt-0.5 text-[12.5px] text-ink-muted">
                          wants to connect
                        </p>
                        {c.message && (
                          <p className="mt-3 rounded-md bg-ivory-warm/40 px-3 py-2 text-[13px] italic leading-[1.6] text-ink">
                            &ldquo;{c.message}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => respondConnection(c.id, "declined")}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-ink-muted transition-colors hover:border-rose/40 hover:text-rose"
                      >
                        <X size={12} strokeWidth={1.8} />
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => respondConnection(c.id, "accepted")}
                        className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-[12.5px] font-medium text-ivory transition-colors hover:bg-ink-soft"
                      >
                        <Check size={12} strokeWidth={1.8} />
                        Accept
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* Outgoing */}
        {outgoing.length > 0 && (
          <Section title="Sent" count={outgoing.length}>
            <ul className="space-y-3">
              {outgoing.map((c) => {
                const them = getProfile(c.recipient_id);
                if (!them) return null;
                return (
                  <ConnectionRow
                    key={c.id}
                    name={them.display_name}
                    avatar={them.avatar_data_url}
                    subline={`waiting for ${them.display_name} to accept`}
                    action={
                      <button
                        type="button"
                        onClick={() => cancelConnection(c.id)}
                        className="text-[12px] text-ink-muted transition-colors hover:text-rose"
                      >
                        Cancel
                      </button>
                    }
                  />
                );
              })}
            </ul>
          </Section>
        )}

        {/* Accepted */}
        <Section title="Your connections" count={accepted.length}>
          {accepted.length === 0 ? (
            <EmptyLine text="no connections yet — say hello to someone on the discover tab." />
          ) : (
            <ul className="space-y-3">
              {accepted.map((c) => {
                const themId =
                  c.requester_id === myProfileId ? c.recipient_id : c.requester_id;
                const them = getProfile(themId);
                if (!them) return null;
                return (
                  <ConnectionRow
                    key={c.id}
                    name={them.display_name}
                    avatar={them.avatar_data_url}
                    subline={
                      them.wedding_city
                        ? `getting married in ${them.wedding_city}`
                        : undefined
                    }
                    action={
                      <button
                        type="button"
                        onClick={() => openThread(c.id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[12.5px] font-medium text-ivory transition-colors hover:bg-ink-soft"
                      >
                        <MessageCircle size={12} strokeWidth={1.8} />
                        Message
                      </button>
                    }
                  />
                );
              })}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

// ── Section + row ──────────────────────────────────────────────────────────

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-baseline gap-3">
        <h3 className="font-serif text-[20px] font-medium text-ink">{title}</h3>
        {count !== undefined && count > 0 && (
          <span
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function ConnectionRow({
  name,
  avatar,
  subline,
  action,
}: {
  name: string;
  avatar?: string;
  subline?: string;
  action: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-gold/15 bg-white px-4 py-3">
      <BrideAvatar name={name} src={avatar} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-serif text-[16px] font-medium text-ink">
          {name}
        </p>
        {subline && (
          <p className="mt-0.5 truncate text-[12.5px] text-ink-muted">
            {subline}
          </p>
        )}
      </div>
      {action}
    </li>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-gold/25 bg-ivory-warm/20 px-4 py-6 text-center text-[13px] italic text-ink-muted">
      {text}
    </p>
  );
}

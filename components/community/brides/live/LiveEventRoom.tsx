"use client";

// ── Live event room ─────────────────────────────────────────────────────────
// Full-screen overlay that presents the live session: big guest tile,
// moderator tile, audience strip with raised-hand indicators, live chat,
// and the "now answering" question banner. No real WebRTC — the guest /
// moderator / speaker tiles are portraits with a simulated pulsing
// active-speaker ring, driven by a rotating timer in useEffect.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Hand,
  MessageCircle,
  Mic,
  MicOff,
  Send,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrideAvatar } from "@/components/community/BrideAvatar";
import type { LiveEvent } from "@/types/community";
import { useCommunityLiveEventsStore } from "@/stores/community-live-events-store";
import { useCommunityProfilesStore } from "@/stores/community-profiles-store";

const MODERATOR_TILE_KEY = "__moderator__";

export function LiveEventRoom({
  event,
  onClose,
}: {
  event: LiveEvent;
  onClose: () => void;
}) {
  const guest = useCommunityLiveEventsStore((s) =>
    s.guests.find((g) => g.id === event.guest_id),
  );

  const myProfileId = useCommunityProfilesStore((s) => s.myProfileId);
  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const myProfile = useMemo(
    () => (myProfileId ? profiles.find((p) => p.id === myProfileId) : undefined),
    [profiles, myProfileId],
  );

  const allAttendees = useCommunityLiveEventsStore((s) => s.attendees);
  const attendees = useMemo(
    () => allAttendees.filter((a) => a.event_id === event.id && a.status === "in_room"),
    [allAttendees, event.id],
  );
  const activeQuestionId = useCommunityLiveEventsStore(
    (s) => s.activeQuestionByEvent[event.id],
  );
  const activeSpeakerKey = useCommunityLiveEventsStore(
    (s) => s.activeSpeakerByEvent[event.id],
  );
  const questions = useCommunityLiveEventsStore((s) => s.questions);
  const chat = useCommunityLiveEventsStore((s) =>
    s.chat
      .filter((c) => c.event_id === event.id)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime(),
      ),
  );

  const joinRoom = useCommunityLiveEventsStore((s) => s.joinRoom);
  const leaveRoom = useCommunityLiveEventsStore((s) => s.leaveRoom);
  const raiseHand = useCommunityLiveEventsStore((s) => s.raiseHand);
  const lowerHand = useCommunityLiveEventsStore((s) => s.lowerHand);
  const inviteToSpeak = useCommunityLiveEventsStore((s) => s.inviteToSpeak);
  const returnToAudience = useCommunityLiveEventsStore(
    (s) => s.returnToAudience,
  );
  const sendChat = useCommunityLiveEventsStore((s) => s.sendChat);
  const setActiveSpeaker = useCommunityLiveEventsStore(
    (s) => s.setActiveSpeaker,
  );
  const setActiveQuestion = useCommunityLiveEventsStore(
    (s) => s.setActiveQuestion,
  );

  // Join the room on mount, leave on unmount. Track my attendee id so we
  // can hand-raise and leave correctly.
  const myAttendeeIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!myProfileId) return;
    const attendee = joinRoom(event.id, { profileId: myProfileId });
    myAttendeeIdRef.current = attendee.id;
    // Seed guest + moderator attendees (no-op if already present).
    if (guest) {
      joinRoom(event.id, { guestId: guest.id, role: "guest" });
    }
    return () => {
      if (myAttendeeIdRef.current) {
        leaveRoom(event.id, myAttendeeIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id, myProfileId, guest?.id]);

  // Simulated active-speaker rotation: every 5-7s pick a new speaker from
  // the set {guest, moderator, any speakers}. Audience members never get
  // picked (they're muted).
  useEffect(() => {
    const speakerKeys: string[] = [];
    if (guest) speakerKeys.push(guest.id);
    speakerKeys.push(MODERATOR_TILE_KEY);
    for (const a of attendees) {
      if (a.role === "speaker" && a.profile_id) {
        speakerKeys.push(a.profile_id);
      }
    }
    if (speakerKeys.length === 0) return;

    // Pick initial speaker: the guest if present, otherwise moderator.
    setActiveSpeaker(event.id, speakerKeys[0]);

    const interval = setInterval(() => {
      const pick =
        speakerKeys[Math.floor(Math.random() * speakerKeys.length)];
      setActiveSpeaker(event.id, pick);
    }, 5500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id, guest?.id, attendees.length]);

  const [chatOpen, setChatOpen] = useState(true);
  const [questionsPanelOpen, setQuestionsPanelOpen] = useState(false);
  const [chatDraft, setChatDraft] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.length]);

  const myAttendee = attendees.find(
    (a) => a.profile_id === myProfileId && !!myProfileId,
  );

  const audience = attendees.filter(
    (a) => a.role === "audience" && a.profile_id,
  );
  const speakers = attendees.filter(
    (a) => a.role === "speaker" && a.profile_id,
  );

  const audienceProfiles = audience
    .map((a) => ({
      attendee: a,
      profile: profiles.find((p) => p.id === a.profile_id),
    }))
    .filter(
      (x): x is { attendee: typeof x.attendee; profile: NonNullable<typeof x.profile> } =>
        !!x.profile,
    );

  const speakerProfiles = speakers
    .map((a) => ({
      attendee: a,
      profile: profiles.find((p) => p.id === a.profile_id),
    }))
    .filter(
      (x): x is { attendee: typeof x.attendee; profile: NonNullable<typeof x.profile> } =>
        !!x.profile,
    );

  const raisedHands = audience.filter((a) => a.hand_raised);

  const activeQuestion = activeQuestionId
    ? questions.find((q) => q.id === activeQuestionId)
    : undefined;
  const activeQuestionAsker = activeQuestion
    ? profiles.find((p) => p.id === activeQuestion.asker_id)
    : undefined;

  const sortedQuestions = [...questions]
    .filter((q) => q.event_id === event.id)
    .sort((a, b) => {
      if (a.status === "answered" && b.status !== "answered") return 1;
      if (b.status === "answered" && a.status !== "answered") return -1;
      return b.vote_count - a.vote_count;
    });

  const handleSendChat = () => {
    if (!myProfileId) return;
    const trimmed = chatDraft.trim();
    if (!trimmed) return;
    sendChat(event.id, { profileId: myProfileId }, trimmed);
    setChatDraft("");
  };

  const handleToggleHand = () => {
    if (!myAttendee) return;
    if (myAttendee.hand_raised) {
      lowerHand(myAttendee.id);
    } else {
      raiseHand(myAttendee.id);
    }
  };

  const handleStepUp = () => {
    if (!myAttendee) return;
    inviteToSpeak(myAttendee.id);
  };

  const handleStepBack = () => {
    if (!myAttendee) return;
    returnToAudience(myAttendee.id);
  };

  const iAmSpeaker = myAttendee?.role === "speaker";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink text-ivory">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-white/10 bg-black/30 px-5 py-3 md:px-8">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose/70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose" />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-rose"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            live · {event.title}
          </p>
          <p className="truncate text-[12px] text-ivory/70">
            {audience.length + speakers.length + 2} in the room · hosted by{" "}
            {event.moderator_name ?? "Ananya"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[12px] font-medium text-ivory transition-colors hover:bg-white/20"
        >
          <X size={13} strokeWidth={1.8} />
          leave
        </button>
      </header>

      {/* Stage + chat */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Stage */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-6">
          {activeQuestion ? (
            <div className="rounded-2xl border border-saffron/40 bg-saffron/10 px-5 py-4">
              <p
                className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-saffron"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                — now answering —
              </p>
              <p className="mt-1.5 font-serif text-[17px] italic leading-[1.3] text-ivory">
                &ldquo;{activeQuestion.body}&rdquo;
              </p>
              <p className="mt-1 text-[11.5px] text-ivory/60">
                asked by {activeQuestionAsker?.display_name ?? "a bride"}
              </p>
            </div>
          ) : null}

          {/* Main speaker grid */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-3">
            {/* Guest — large */}
            <div className="md:col-span-2">
              <SpeakerTile
                name={guest?.name ?? "Guest"}
                subtitle={guest?.title}
                src={guest?.headshot_data_url}
                gradient={guest?.cover_seed_gradient ?? ["#F0D9B8", "#8A5444"]}
                isSpeaking={activeSpeakerKey === guest?.id}
                icon={Mic}
                size="large"
                tag="featured guest"
              />
            </div>

            {/* Right column: moderator + any speakers */}
            <div className="flex flex-col gap-3">
              <SpeakerTile
                name={event.moderator_name ?? "Ananya Studio"}
                subtitle="moderator"
                gradient={["#5C463A", "#1C1918"]}
                isSpeaking={activeSpeakerKey === MODERATOR_TILE_KEY}
                icon={Mic}
                size="small"
                tag="moderator"
              />
              {speakerProfiles.map(({ attendee, profile }) => (
                <SpeakerTile
                  key={attendee.id}
                  name={profile.display_name}
                  subtitle="speaking now"
                  src={profile.avatar_data_url}
                  gradient={["#9C6F5D", "#3A4452"]}
                  isSpeaking={activeSpeakerKey === profile.id}
                  icon={Mic}
                  size="small"
                  tag="audience speaker"
                />
              ))}
              {speakerProfiles.length === 0 && (
                <div className="flex h-full min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-center text-[12px] text-ivory/50">
                  no audience speaker yet — raise your hand to join in
                </div>
              )}
            </div>
          </div>

          {/* Audience */}
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-ivory/60"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                — audience ({audience.length}) —
              </p>
              {raisedHands.length > 0 && (
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-saffron"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {raisedHands.length}{" "}
                  {raisedHands.length === 1 ? "hand" : "hands"} raised
                </p>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {audienceProfiles.map(({ attendee, profile }) => (
                <div key={attendee.id} className="relative">
                  <BrideAvatar
                    name={profile.display_name}
                    src={profile.avatar_data_url}
                    size={32}
                    style={{ boxShadow: "0 0 0 2px rgba(0,0,0,0.3)" }}
                  />
                  {attendee.hand_raised && (
                    <span
                      aria-label="hand raised"
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-saffron text-[9px]"
                    >
                      ✋
                    </span>
                  )}
                </div>
              ))}
              {audienceProfiles.length === 0 && (
                <p className="text-[12px] text-ivory/40">
                  the audience will fill in as brides join.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Chat / Questions side panel */}
        {(chatOpen || questionsPanelOpen) && (
          <aside className="flex min-h-0 w-full flex-col border-t border-white/10 bg-black/20 md:w-[360px] md:border-l md:border-t-0">
            {chatOpen && (
              <ChatPanel
                messages={chat.map((m) => ({
                  id: m.id,
                  body: m.body,
                  kind: m.kind,
                  sender:
                    m.profile_id &&
                    profiles.find((p) => p.id === m.profile_id)?.display_name,
                  guestName:
                    m.guest_id && guest?.id === m.guest_id
                      ? guest?.name
                      : undefined,
                }))}
                draft={chatDraft}
                setDraft={setChatDraft}
                onSend={handleSendChat}
                canSend={!!myProfileId}
                chatEndRef={chatEndRef}
              />
            )}
            {questionsPanelOpen && (
              <QuestionsPanel
                event_id={event.id}
                questions={sortedQuestions}
                activeId={activeQuestionId}
                onAskNow={(qid) => setActiveQuestion(event.id, qid)}
                onClear={() => setActiveQuestion(event.id, undefined)}
              />
            )}
          </aside>
        )}
      </div>

      {/* Control bar */}
      <footer className="flex items-center justify-center gap-2 border-t border-white/10 bg-black/30 px-5 py-3 md:px-8">
        {iAmSpeaker ? (
          <button
            type="button"
            onClick={handleStepBack}
            className="inline-flex items-center gap-1.5 rounded-full bg-saffron px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-saffron/90"
          >
            <MicOff size={13} strokeWidth={1.8} />
            step back to audience
          </button>
        ) : myAttendee?.hand_raised ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleHand}
              className="inline-flex items-center gap-1.5 rounded-full bg-saffron/20 px-4 py-2 text-[12.5px] font-medium text-saffron transition-colors hover:bg-saffron/30"
            >
              <Hand size={13} strokeWidth={1.8} />
              lower hand
            </button>
            <button
              type="button"
              onClick={handleStepUp}
              className="inline-flex items-center gap-1.5 rounded-full bg-saffron px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-saffron/90"
            >
              <Mic size={13} strokeWidth={1.8} />
              step up to speak
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleToggleHand}
            disabled={!myAttendee}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors",
              myAttendee
                ? "bg-white/10 text-ivory hover:bg-white/20"
                : "cursor-not-allowed bg-white/5 text-ivory/40",
            )}
          >
            <Hand size={13} strokeWidth={1.8} />
            raise hand
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setChatOpen((v) => !v);
            if (!chatOpen) setQuestionsPanelOpen(false);
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors",
            chatOpen
              ? "bg-white text-ink"
              : "bg-white/10 text-ivory hover:bg-white/20",
          )}
        >
          <MessageCircle size={13} strokeWidth={1.8} />
          chat
        </button>

        <button
          type="button"
          onClick={() => {
            setQuestionsPanelOpen((v) => !v);
            if (!questionsPanelOpen) setChatOpen(false);
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors",
            questionsPanelOpen
              ? "bg-white text-ink"
              : "bg-white/10 text-ivory hover:bg-white/20",
          )}
        >
          <Video size={13} strokeWidth={1.8} />
          questions
        </button>
      </footer>
    </div>
  );
}

// ── Speaker tile ────────────────────────────────────────────────────────────

function SpeakerTile({
  name,
  subtitle,
  src,
  gradient,
  isSpeaking,
  icon: Icon,
  size,
  tag,
}: {
  name: string;
  subtitle?: string;
  src?: string;
  gradient: [string, string];
  isSpeaking: boolean;
  icon: LucideIcon;
  size: "large" | "small";
  tag?: string;
}) {
  const isLarge = size === "large";
  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border transition-all",
        isSpeaking
          ? "border-rose/60 shadow-[0_0_0_3px_rgba(199,92,92,0.3)]"
          : "border-white/10",
      )}
      style={{
        background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
      }}
    >
      <div
        className={cn(
          "flex flex-1 items-center justify-center",
          isLarge ? "py-10 md:py-14" : "py-6",
        )}
      >
        <div className={isLarge ? "scale-[1.6]" : ""}>
          <BrideAvatar name={name} src={src} size={isLarge ? 96 : 64} />
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-white/15 bg-black/40 px-4 py-2.5 backdrop-blur-sm">
        <Icon
          size={13}
          strokeWidth={1.8}
          className={isSpeaking ? "text-rose" : "text-ivory/60"}
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate font-serif font-medium leading-[1.15] text-ivory",
              isLarge ? "text-[17px]" : "text-[13px]",
            )}
          >
            {name}
          </p>
          {subtitle ? (
            <p className="truncate text-[11px] text-ivory/70">{subtitle}</p>
          ) : null}
        </div>
        {tag ? (
          <span
            className="font-mono text-[9px] uppercase tracking-[0.2em] text-ivory/50"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {tag}
          </span>
        ) : null}
      </div>
    </div>
  );
}

// ── Chat panel ──────────────────────────────────────────────────────────────

function ChatPanel({
  messages,
  draft,
  setDraft,
  onSend,
  canSend,
  chatEndRef,
}: {
  messages: {
    id: string;
    body: string;
    kind?: string;
    sender?: string | null;
    guestName?: string;
  }[];
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  canSend: boolean;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-white/10 px-4 py-3">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ivory/60"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          — live chat —
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-2.5">
          {messages.length === 0 ? (
            <p className="text-[12.5px] text-ivory/40">
              say hi, drop a ❤️, ask a question in chat.
            </p>
          ) : (
            messages.map((m) => (
              <p key={m.id} className="text-[13px] leading-[1.45] text-ivory">
                <span className="font-medium text-ivory/90">
                  {m.guestName ?? m.sender ?? "a bride"}:
                </span>{" "}
                <span className="text-ivory/85">{m.body}</span>
              </p>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-white/10 bg-black/20 p-3">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={canSend ? "type a message…" : "set up your profile to chat"}
          disabled={!canSend}
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[13px] text-ivory placeholder:text-ivory/40 focus:border-rose/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!canSend || !draft.trim()}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            canSend && draft.trim()
              ? "bg-rose text-white hover:bg-rose/90"
              : "cursor-not-allowed bg-white/10 text-ivory/40",
          )}
        >
          <Send size={13} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

// ── Questions panel ─────────────────────────────────────────────────────────

function QuestionsPanel({
  event_id,
  questions,
  activeId,
  onAskNow,
  onClear,
}: {
  event_id: string;
  questions: ReturnType<
    typeof useCommunityLiveEventsStore.getState
  >["questions"];
  activeId?: string;
  onAskNow: (id: string) => void;
  onClear: () => void;
}) {
  const profiles = useCommunityProfilesStore((s) => s.profiles);
  const relevant = questions.filter((q) => q.event_id === event_id);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ivory/60"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          — community questions —
        </p>
        {activeId ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] text-ivory/50 transition-colors hover:text-ivory"
          >
            clear
          </button>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-3">
          {relevant.length === 0 ? (
            <p className="text-[12.5px] text-ivory/40">
              no pre-submitted questions yet.
            </p>
          ) : (
            relevant.map((q) => {
              const asker = profiles.find((p) => p.id === q.asker_id);
              const isActive = q.id === activeId;
              const isAnswered = q.status === "answered";
              return (
                <div
                  key={q.id}
                  className={cn(
                    "rounded-xl border p-3 transition-colors",
                    isAnswered
                      ? "border-white/10 bg-white/[0.03] opacity-60"
                      : isActive
                        ? "border-saffron/60 bg-saffron/10"
                        : "border-white/10 bg-white/[0.04]",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory/50"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {isAnswered
                        ? "answered"
                        : isActive
                          ? "asking now"
                          : `▲ ${q.vote_count}`}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-[1.45] text-ivory">
                    &ldquo;{q.body}&rdquo;
                  </p>
                  <p className="mt-1 text-[11px] text-ivory/50">
                    — {asker?.display_name ?? "a bride"}
                  </p>
                  {!isAnswered && !isActive && (
                    <button
                      type="button"
                      onClick={() => onAskNow(q.id)}
                      className="mt-2 rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-medium text-ivory transition-colors hover:bg-white/20"
                    >
                      ask this now →
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

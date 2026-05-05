"use client";

// ── /share/interview ────────────────────────────────────────────────────────
// AI-assisted submission path. If the couple hasn't filled basics yet, we
// collect names + a quick events checklist inline. Then the chat opens.
// When the AI emits the "interview complete" signal, we call /api/share/draft
// and move to the review screen pre-filled with the AI's blocks.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Send, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { ShareNav } from "@/components/share/ShareNav";
import { ShareSessionBootstrap } from "@/components/share/ShareSessionBootstrap";
import { ShareDots } from "@/components/share/ShareDots";
import { Badge } from "@/components/share/Badge";
import {
  EditorialInput,
  EditorialLabel,
} from "@/components/share/EditorialInput";
import { EventTagPill } from "@/components/share/EventTagPill";
import { useShareShaadiStore } from "@/stores/share-shaadi-store";
import type { EventTag, InterviewMessage } from "@/types/share-shaadi";

const ALL_EVENTS: EventTag[] = [
  "ROKA",
  "ENGAGEMENT",
  "HALDI",
  "MEHENDI",
  "SANGEET",
  "CEREMONY",
  "RECEPTION",
  "AFTER_PARTY",
];

export default function InterviewPage() {
  const draft = useShareShaadiStore((s) => s.draft);
  const patch = useShareShaadiStore((s) => s.patch);
  const toggleEvent = useShareShaadiStore((s) => s.toggleEvent);
  const resetDraft = useShareShaadiStore((s) => s.resetDraft);

  // Set the path to ai_interview if landing fresh.
  useEffect(() => {
    if (draft.path !== "ai_interview" && draft.brideName === "" && draft.groomName === "") {
      resetDraft("ai_interview");
    } else if (draft.path !== "ai_interview") {
      patch({ path: "ai_interview" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [stage, setStage] = useState<"basics" | "chat">(
    (draft.brideName ?? "").trim() &&
      (draft.groomName ?? "").trim() &&
      /.+@.+\..+/.test((draft.contactEmail ?? "").trim())
      ? "chat"
      : "basics",
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-ivory">
      <ShareDots />
      <ShareSessionBootstrap />
      <ShareNav
        right={
          <Link
            href="/share"
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-gold/30 hover:text-ink"
          >
            <ArrowLeft size={12} strokeWidth={1.8} />
            Back
          </Link>
        }
      />

      {stage === "basics" ? (
        <BasicsGate
          onContinue={() => setStage("chat")}
          brideName={draft.brideName}
          groomName={draft.groomName}
          contactEmail={draft.contactEmail ?? ""}
          weddingMonth={draft.weddingMonth}
          venue={draft.venue}
          city={draft.city}
          events={draft.events}
          patch={patch}
          toggleEvent={toggleEvent}
        />
      ) : (
        <InterviewChat />
      )}
    </div>
  );
}

// ── Basics gate ─────────────────────────────────────────────────────────────

function BasicsGate({
  onContinue,
  brideName,
  groomName,
  contactEmail,
  weddingMonth,
  venue,
  city,
  events,
  patch,
  toggleEvent,
}: {
  onContinue: () => void;
  brideName: string;
  groomName: string;
  contactEmail: string;
  weddingMonth: string | null;
  venue: string;
  city: string;
  events: EventTag[];
  patch: (
    p: Partial<{
      brideName: string;
      groomName: string;
      contactEmail: string;
      weddingMonth: string | null;
      venue: string;
      city: string;
    }>,
  ) => void;
  toggleEvent: (e: EventTag) => void;
}) {
  const canContinue =
    (brideName ?? "").trim().length > 0 &&
    (groomName ?? "").trim().length > 0 &&
    /.+@.+\..+/.test((contactEmail ?? "").trim());
  return (
    <main className="relative z-10 mx-auto max-w-3xl px-6 py-16 md:px-10 md:py-24">
      <Badge tone="gold">GUIDED BY AI</Badge>
      <h1
        className="mt-5 text-[40px] font-medium leading-[1.05] text-ink md:text-[56px]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Before we <em className="italic text-gold">chat.</em>
      </h1>
      <p className="mt-4 max-w-xl text-[15.5px] leading-[1.7] text-ink-muted md:text-[16.5px]">
        Just a few facts so our editor knows who they&rsquo;re talking to. We&rsquo;ll
        do the rest in conversation.
      </p>

      <div className="mt-10 rounded-2xl border border-gold/15 bg-white/80 p-7 md:p-9">
        <EditorialLabel>The couple</EditorialLabel>
        <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-5">
          <EditorialInput
            display
            placeholder="Bride / Partner"
            value={brideName}
            onChange={(e) => patch({ brideName: e.target.value })}
          />
          <span
            className="hidden text-center text-[34px] italic text-gold md:block"
            style={{ fontFamily: "var(--font-display)" }}
          >
            &amp;
          </span>
          <EditorialInput
            display
            placeholder="Partner / Groom"
            value={groomName}
            onChange={(e) => patch({ groomName: e.target.value })}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-7 md:grid-cols-2">
          <div>
            <EditorialLabel>Wedding month</EditorialLabel>
            <EditorialInput
              type="month"
              value={weddingMonth ?? ""}
              onChange={(e) => patch({ weddingMonth: e.target.value || null })}
            />
          </div>
          <div>
            <EditorialLabel>City</EditorialLabel>
            <EditorialInput
              placeholder="Jodhpur"
              value={city}
              onChange={(e) => patch({ city: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <EditorialLabel>Venue</EditorialLabel>
            <EditorialInput
              placeholder="Umaid Bhawan Palace"
              value={venue}
              onChange={(e) => patch({ venue: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <EditorialLabel hint="we'll use this to follow up about your feature.">
              Best email to reach you
            </EditorialLabel>
            <EditorialInput
              type="email"
              placeholder="you@gmail.com"
              value={contactEmail}
              onChange={(e) => patch({ contactEmail: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-8">
          <EditorialLabel>Events held</EditorialLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            {ALL_EVENTS.map((e) => (
              <EventTagPill
                key={e}
                event={e}
                active={events.includes(e)}
                onClick={() => toggleEvent(e)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          disabled={!canContinue}
          onClick={onContinue}
          className="group inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-6 py-3 text-[12.5px] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:bg-ink/90"
        >
          Start the interview
          <ArrowRight
            size={14}
            strokeWidth={2}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </main>
  );
}

// ── Chat ────────────────────────────────────────────────────────────────────

function InterviewChat() {
  const router = useRouter();
  const draft = useShareShaadiStore((s) => s.draft);
  const transcript = useShareShaadiStore((s) => s.draft.interviewTranscript);
  const appendInterviewMessage = useShareShaadiStore(
    (s) => s.appendInterviewMessage,
  );
  const setAIDraft = useShareShaadiStore((s) => s.setAIDraft);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Kick off the very first assistant message if the transcript is empty.
  useEffect(() => {
    if (transcript.length === 0) {
      void send(""); // empty-string seed = "open the conversation"
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll on new messages.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [transcript.length, sending]);

  async function send(userMessage: string) {
    setError(null);
    setSending(true);
    if (userMessage.trim()) {
      appendInterviewMessage({ role: "user", content: userMessage.trim() });
    }
    try {
      const res = await fetch("/api/share/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basics: {
            brideName: draft.brideName,
            groomName: draft.groomName,
            weddingMonth: draft.weddingMonth,
            venue: draft.venue,
            city: draft.city,
            guestCount: draft.guestCount,
            events: draft.events,
          },
          transcript: useShareShaadiStore.getState().draft.interviewTranscript,
          userMessage,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? `HTTP ${res.status}`);
      }
      const json = (await res.json()) as { content: string; done?: boolean };
      const msg: InterviewMessage = {
        role: "assistant",
        content: json.content,
        isFinal: Boolean(json.done),
      };
      appendInterviewMessage(msg);
      if (json.done) setDone(true);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  async function generateDraft() {
    setDrafting(true);
    setError(null);
    try {
      const res = await fetch("/api/share/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basics: {
            brideName: draft.brideName,
            groomName: draft.groomName,
            weddingMonth: draft.weddingMonth,
            venue: draft.venue,
            city: draft.city,
            guestCount: draft.guestCount,
            events: draft.events,
          },
          transcript,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? `HTTP ${res.status}`);
      }
      const aiDraft = await res.json();
      setAIDraft(aiDraft);
      router.push("/share/review");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
    } finally {
      setDrafting(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    void send(input);
    setInput("");
  }

  return (
    <main className="relative z-10 mx-auto flex max-w-3xl flex-col px-4 py-8 md:px-6 md:py-12">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 px-2">
        <div>
          <Badge tone="gold">GUIDED BY AI</Badge>
          <h1
            className="mt-3 text-[28px] font-medium leading-tight text-ink md:text-[36px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Marigold Editor &times; {draft.brideName} &amp; {draft.groomName}
          </h1>
        </div>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {transcript.filter((m) => m.role === "user").length} of ~10 answers
        </span>
      </header>

      <div
        ref={scrollRef}
        className="space-y-5 rounded-2xl border border-gold/15 bg-white/70 px-4 py-6 md:px-6 md:py-8"
        style={{ minHeight: 360 }}
      >
        {transcript.length === 0 && sending && (
          <AssistantBubble pending />
        )}
        {transcript.map((m, i) => (
          <Bubble
            key={i}
            role={m.role}
            content={m.content}
            authorName={
              m.role === "assistant"
                ? "Marigold Editor"
                : `${draft.brideName || "you"}`
            }
          />
        ))}
        {sending && transcript.length > 0 && <AssistantBubble pending />}
      </div>

      {error && (
        <p
          className="mt-3 rounded-md border border-rose/30 bg-rose-pale/30 px-4 py-2 text-[13px] text-rose"
          role="alert"
        >
          {error}
        </p>
      )}

      {!done ? (
        <form
          onSubmit={onSubmit}
          className="mt-5 flex items-end gap-2 rounded-full border border-gold/30 bg-white px-2 py-1.5 shadow-[0_1px_0_0_rgba(184,134,11,0.05)] focus-within:border-gold"
        >
          <textarea
            rows={1}
            placeholder="Type your answer…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e as any);
              }
            }}
            className="min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-[15px] leading-[1.5] text-ink outline-none placeholder:italic placeholder:text-ink-faint"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-ivory transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:bg-ink/90"
            aria-label="Send"
          >
            {sending ? (
              <Loader2 size={15} className="animate-spin" strokeWidth={2} />
            ) : (
              <Send size={14} strokeWidth={2} />
            )}
          </button>
        </form>
      ) : (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-gold/30 bg-gold-pale/40 px-6 py-8 text-center">
          <Sparkles size={22} strokeWidth={1.6} className="text-gold" />
          <p
            className="text-[22px] italic text-ink md:text-[26px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            I have everything I need. Let me put this together for you.
          </p>
          <button
            type="button"
            onClick={generateDraft}
            disabled={drafting}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-[12.5px] font-semibold uppercase tracking-[0.18em] text-ivory shadow-[0_2px_24px_-12px_rgba(184,134,11,0.6)] transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#9C720A]"
          >
            {drafting ? (
              <>
                <Loader2 size={14} className="animate-spin" strokeWidth={2} />
                Drafting your story…
              </>
            ) : (
              <>
                Draft my story
                <ArrowRight size={14} strokeWidth={2} />
              </>
            )}
          </button>
        </div>
      )}
    </main>
  );
}

function Bubble({
  role,
  content,
  authorName,
}: {
  role: InterviewMessage["role"];
  content: string;
  authorName: string;
}) {
  if (role === "assistant") {
    return (
      <div className="flex max-w-[88%] flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-pale text-gold"
          >
            ✦
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {authorName}
          </span>
        </div>
        <p
          className="rounded-2xl rounded-tl-md border border-gold/20 bg-ivory-warm/60 px-5 py-3.5 text-[15.5px] leading-[1.65] text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {content}
        </p>
      </div>
    );
  }
  return (
    <div className="ml-auto flex max-w-[88%] flex-col items-end gap-1.5">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-rose"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {authorName}
      </span>
      <p
        className="whitespace-pre-wrap rounded-2xl rounded-tr-md border border-rose/30 bg-[linear-gradient(135deg,#F5E6C8_0%,#F5E0D6_100%)] px-5 py-3.5 text-[15px] leading-[1.6] text-ink"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {content}
      </p>
    </div>
  );
}

function AssistantBubble({ pending }: { pending?: boolean }) {
  return (
    <div className="flex max-w-[88%] flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-pale text-gold"
        >
          ✦
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Marigold Editor
        </span>
      </div>
      <p className="inline-flex items-center gap-1 rounded-2xl rounded-tl-md border border-gold/20 bg-ivory-warm/60 px-5 py-4 text-ink">
        {pending && (
          <>
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold" />
          </>
        )}
      </p>
    </div>
  );
}

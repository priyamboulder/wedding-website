"use client";

// /admin/grapevine/[id] — manage a single session.
// Two columns: incoming questions (queue) + already-answered list. Admin
// can approve / reject / pin pending questions and post answers from the
// queue side.

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pin, X, Check, Star } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser-client";
import type {
  GrapevineQAPair,
  GrapevineQuestion,
  GrapevineQuestionStatus,
  GrapevineSession,
} from "@/types/grapevine-ama";

const DISPLAY = "'Playfair Display', Georgia, serif";

async function getToken(): Promise<string | null> {
  const { data } = await supabaseBrowser.auth.getSession();
  return data.session?.access_token ?? null;
}

interface Props {
  params: Promise<{ id: string }>;
}

interface ApiData {
  session: GrapevineSession;
  answered: GrapevineQAPair[];
  queue: GrapevineQuestion[];
}

export default function AdminGrapevineSessionPage({ params }: Props) {
  const { id } = use(params);
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    // We need slug to call the read API, so first look up the session.
    const sRes = await fetch("/api/grapevine/sessions");
    const sJ = await sRes.json();
    const sess = (sJ?.sessions ?? []).find(
      (x: GrapevineSession) => x.id === id,
    );
    if (!sess) {
      setLoading(false);
      return;
    }
    setSlug(sess.slug);
    const token = await getToken();
    const res = await fetch(`/api/grapevine/sessions/${sess.slug}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
    const j = await res.json();
    setData(j);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setQuestionStatus = async (
    qid: string,
    status: GrapevineQuestionStatus,
  ) => {
    const token = await getToken();
    await fetch(`/api/grapevine/admin/questions/${qid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status }),
    });
    refresh();
  };

  const postAnswer = async (
    qid: string,
    text: string,
    highlight: boolean,
  ) => {
    const token = await getToken();
    await fetch(`/api/grapevine/admin/answers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        question_id: qid,
        answer_text: text,
        is_highlighted: highlight,
      }),
    });
    refresh();
  };

  const toggleAnswerHighlight = async (
    aid: string,
    nextHighlighted: boolean,
  ) => {
    const token = await getToken();
    await fetch(`/api/grapevine/admin/answers/${aid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ is_highlighted: nextHighlighted }),
    });
    refresh();
  };

  const sortedQueue = useMemo(() => {
    if (!data) return [];
    return [...data.queue].sort((a, b) => {
      const aP = a.status === "pinned" ? 1 : 0;
      const bP = b.status === "pinned" ? 1 : 0;
      if (aP !== bP) return bP - aP;
      return (b.total_upvotes ?? 0) - (a.total_upvotes ?? 0);
    });
  }, [data]);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">
      <Link
        href="/admin/grapevine"
        className="inline-flex items-center gap-2 text-[12px] text-[#6B6157] hover:text-[#B8755D]"
      >
        <ArrowLeft size={12} /> All sessions
      </Link>

      {loading ? (
        <p className="py-10 text-center text-[14px] text-[#6B6157]">Loading…</p>
      ) : !data ? (
        <p className="py-10 text-center text-[14px] text-[#6B6157]">
          Session not found.
        </p>
      ) : (
        <>
          <div className="mt-3 mb-8 border-b border-[#E6DFD3] pb-6">
            <p className="text-[10.5px] font-semibold tracking-[1.4px] uppercase text-[#6B6157]">
              {data.session.status} · {data.session.session_type ?? "—"}
            </p>
            <h1
              className="mt-1 text-[#1C1917]"
              style={{ fontFamily: DISPLAY, fontSize: 28, lineHeight: 1.15 }}
            >
              {data.session.title}
            </h1>
            <p className="mt-1 text-[13.5px] text-[#6B6157]">
              {data.session.expert_name}
              {data.session.expert_title ? ` · ${data.session.expert_title}` : ""}
              {slug && (
                <>
                  {" "}
                  ·{" "}
                  <Link
                    href={`/grapevine/${slug}`}
                    className="text-[#B8755D] underline"
                  >
                    public page
                  </Link>
                </>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section>
              <h2
                className="mb-4 text-[#1C1917]"
                style={{ fontFamily: DISPLAY, fontSize: 20 }}
              >
                Queue ({sortedQueue.length})
              </h2>
              {sortedQueue.length === 0 ? (
                <p className="text-[13.5px] text-[#6B6157] italic">
                  Empty queue.
                </p>
              ) : (
                <div className="grid gap-3">
                  {sortedQueue.map((q) => (
                    <QueueCard
                      key={q.id}
                      question={q}
                      onStatus={setQuestionStatus}
                      onAnswer={postAnswer}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2
                className="mb-4 text-[#1C1917]"
                style={{ fontFamily: DISPLAY, fontSize: 20 }}
              >
                Answered ({data.answered.length})
              </h2>
              {data.answered.length === 0 ? (
                <p className="text-[13.5px] text-[#6B6157] italic">
                  Nothing answered yet.
                </p>
              ) : (
                <div className="grid gap-3">
                  {data.answered.map((pair) =>
                    pair.answer ? (
                      <div
                        key={pair.question.id}
                        className="border border-[#E6DFD3] bg-white p-4"
                      >
                        <p className="text-[13px] text-[#1C1917] font-medium leading-snug">
                          {pair.question.question_text}
                        </p>
                        <p className="mt-2 text-[12.5px] leading-relaxed text-[#4F4435] whitespace-pre-wrap">
                          {pair.answer.answer_text}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() =>
                              toggleAnswerHighlight(
                                pair.answer!.id,
                                !pair.answer!.is_highlighted,
                              )
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-semibold tracking-[1px] uppercase ${
                              pair.answer.is_highlighted
                                ? "bg-[#C4A265] text-white"
                                : "border border-[#E6DFD3] bg-white text-[#1C1917]"
                            }`}
                          >
                            <Star size={10} />
                            {pair.answer.is_highlighted
                              ? "Highlighted"
                              : "Highlight"}
                          </button>
                        </div>
                      </div>
                    ) : null,
                  )}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function QueueCard({
  question,
  onStatus,
  onAnswer,
}: {
  question: GrapevineQuestion;
  onStatus: (id: string, s: GrapevineQuestionStatus) => void;
  onAnswer: (id: string, text: string, highlight: boolean) => void;
}) {
  const [answer, setAnswer] = useState("");
  const [highlight, setHighlight] = useState(false);

  return (
    <div className="border border-[#E6DFD3] bg-white p-4">
      <div className="flex items-start justify-between gap-3 mb-1">
        <span className="text-[10.5px] font-semibold tracking-[1.2px] uppercase text-[#8B7E6F]">
          {question.persona_tag ?? "anonymous"} ·{" "}
          {question.total_upvotes ?? question.upvote_count} upvotes
        </span>
        <span
          className="text-[9.5px] font-semibold tracking-[1.2px] uppercase"
          style={{
            color:
              question.status === "pinned"
                ? "#C4A265"
                : question.status === "pending"
                  ? "#8B6F2C"
                  : "#6B6157",
          }}
        >
          {question.status}
        </span>
      </div>
      <p className="text-[13.5px] text-[#1C1917] leading-snug">
        {question.question_text}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {question.status !== "pinned" && (
          <button
            onClick={() => onStatus(question.id, "pinned")}
            className="inline-flex items-center gap-1 border border-[#E6DFD3] bg-white px-2 py-1 text-[10px] uppercase tracking-[1px] hover:bg-[#F0E9DC]"
          >
            <Pin size={10} /> Pin
          </button>
        )}
        {question.status !== "approved" && (
          <button
            onClick={() => onStatus(question.id, "approved")}
            className="inline-flex items-center gap-1 border border-[#E6DFD3] bg-white px-2 py-1 text-[10px] uppercase tracking-[1px] hover:bg-[#F0E9DC]"
          >
            <Check size={10} /> Approve
          </button>
        )}
        <button
          onClick={() => onStatus(question.id, "rejected")}
          className="inline-flex items-center gap-1 border border-[#E6DFD3] bg-white px-2 py-1 text-[10px] uppercase tracking-[1px] text-[#B83232] hover:bg-[#FBE5E5]"
        >
          <X size={10} /> Reject
        </button>
      </div>
      <textarea
        className="mt-3 w-full border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-2 text-[13px] text-[#1C1917] focus:border-[#B8755D] outline-none"
        rows={4}
        placeholder="Type the expert's answer…"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <label className="inline-flex items-center gap-1.5 text-[11px] text-[#6B6157]">
          <input
            type="checkbox"
            checked={highlight}
            onChange={(e) => setHighlight(e.target.checked)}
          />
          Highlight standout
        </label>
        <button
          onClick={() => {
            if (!answer.trim()) return;
            onAnswer(question.id, answer.trim(), highlight);
            setAnswer("");
            setHighlight(false);
          }}
          disabled={!answer.trim()}
          className="rounded-full bg-[#1C1917] px-4 py-1.5 text-[11px] text-white disabled:opacity-40"
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
}

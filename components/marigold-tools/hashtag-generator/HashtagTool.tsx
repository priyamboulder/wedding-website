"use client";

import { useState } from "react";

import styles from "./HashtagTool.module.css";

const VIBE_OPTIONS: { value: string; label: string }[] = [
  { value: "Classic and romantic", label: "Classic and romantic" },
  { value: "Punny and playful", label: "Punny and playful" },
  { value: "Modern and minimal", label: "Modern and minimal" },
  { value: "Bollywood-inspired", label: "Bollywood-inspired" },
];

interface Input {
  name1: string;
  name2: string;
  lastName: string;
  year: string;
  vibe: string;
}

const EMPTY: Input = {
  name1: "",
  name2: "",
  lastName: "",
  year: "",
  vibe: "",
};

interface Hashtag {
  hashtag: string;
  tier: "primary" | "contender" | "fun";
  why: string;
  cringeScore: number;
}

type Stage = "intake" | "loading" | "result" | "error";

export function HashtagTool() {
  const [stage, setStage] = useState<Stage>("intake");
  const [input, setInput] = useState<Input>(EMPTY);
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  const canSubmit =
    input.name1.trim().length > 0 &&
    input.name2.trim().length > 0 &&
    /^\d{4}$/.test(input.year.trim()) &&
    input.vibe.length > 0;

  function update<K extends keyof Input>(key: K, value: Input[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function generate(p: Input) {
    setStage("loading");
    try {
      const res = await fetch("/api/tools/hashtag-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: p }),
      });
      if (!res.ok) throw new Error("bad-status");
      const data = (await res.json()) as { ok: boolean; hashtags: Hashtag[] };
      if (!data.ok || !Array.isArray(data.hashtags) || data.hashtags.length === 0) {
        throw new Error("no-hashtags");
      }
      setHashtags(data.hashtags);
      setStage("result");
      requestAnimationFrame(() => {
        document
          .getElementById("hashtag-output")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch {
      setStage("error");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    void generate(input);
  }

  function handleStartOver() {
    setStage("intake");
    setInput(EMPTY);
    setHashtags([]);
  }

  function handleCopy(tag: string) {
    void navigator.clipboard.writeText(tag).then(() => {
      setCopiedKey(tag);
      setTimeout(() => setCopiedKey((k) => (k === tag ? null : k)), 1600);
    });
  }

  function handleCopyAll() {
    if (hashtags.length === 0) return;
    const text = hashtags.map((h) => h.hashtag).join("\n");
    void navigator.clipboard.writeText(text).then(() => {
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 1800);
    });
  }

  const primary = hashtags.find((h) => h.tier === "primary") ?? hashtags[0];
  const contenders = hashtags
    .filter((h) => h.tier === "contender" && h !== primary)
    .slice(0, 4);
  const fun = hashtags.filter((h) => h.tier === "fun").slice(0, 5);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {stage === "intake" && (
          <>
            <div className={styles.introCard}>
              <span className={styles.scrawl}>✿ wedding hashtag generator</span>
              <h1 className={styles.heading}>
                Cute, clever, or <em>cringe?</em>
              </h1>
              <p className={styles.sub}>
                Ten hashtags in three tiers. The one for the sign, the four
                you&apos;ll actually consider, and the five for the group chat.
                Built for South Asian names — cringe-o-meter included.
              </p>
              <div className={styles.metaRow}>
                <span className={styles.metaPill}>30 seconds</span>
                <span className={styles.metaPill}>10 results</span>
                <span className={styles.metaPill}>Cringe score</span>
                <span className={styles.metaPill}>No signup</span>
              </div>
            </div>

            <form className={styles.card} onSubmit={handleSubmit}>
              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Partner 1 first name</span>
                  <input
                    className={styles.input}
                    type="text"
                    value={input.name1}
                    onChange={(e) => update("name1", e.target.value.slice(0, 40))}
                    placeholder="Priya"
                    autoComplete="off"
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Partner 2 first name</span>
                  <input
                    className={styles.input}
                    type="text"
                    value={input.name2}
                    onChange={(e) => update("name2", e.target.value.slice(0, 40))}
                    placeholder="Arjun"
                    autoComplete="off"
                  />
                </label>
              </div>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>
                    Shared / hyphenated last name <span className={styles.optional}>optional</span>
                  </span>
                  <input
                    className={styles.input}
                    type="text"
                    value={input.lastName}
                    onChange={(e) => update("lastName", e.target.value.slice(0, 60))}
                    placeholder="Sharma-Patel"
                    autoComplete="off"
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Wedding year</span>
                  <input
                    className={styles.input}
                    type="text"
                    inputMode="numeric"
                    pattern="\d{4}"
                    value={input.year}
                    onChange={(e) =>
                      update("year", e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="2026"
                    autoComplete="off"
                  />
                </label>
              </div>

              <fieldset className={styles.fieldset}>
                <legend className={styles.fieldLabel}>Vibe</legend>
                <div className={styles.vibeGrid}>
                  {VIBE_OPTIONS.map((v) => {
                    const selected = input.vibe === v.value;
                    return (
                      <button
                        key={v.value}
                        type="button"
                        className={styles.vibeBtn}
                        aria-pressed={selected}
                        onClick={() => update("vibe", v.value)}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={!canSubmit}
                >
                  Generate my hashtags →
                </button>
              </div>
            </form>
          </>
        )}

        {stage === "loading" && (
          <div className={styles.loading} aria-live="polite">
            <p className={styles.loadingText}>
              workshopping your name puns
              <span className={styles.dot} aria-hidden="true" />
            </p>
            <p className={styles.loadingSub}>
              ✿ asking the group chat for a second opinion
            </p>
          </div>
        )}

        {stage === "error" && (
          <div className={styles.errorCard}>
            <h2 className={styles.errorTitle}>The pun department is offline.</h2>
            <p className={styles.errorBody}>
              Couldn&apos;t reach the hashtag generator just now. Try again —
              your details are still here.
            </p>
            <div className={styles.errorActions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => generate(input)}
              >
                Try again →
              </button>
              <button
                type="button"
                className={styles.backBtn}
                onClick={handleStartOver}
              >
                start over
              </button>
            </div>
          </div>
        )}

        {stage === "result" && primary && (
          <>
            <article id="hashtag-output" className={styles.output}>
              <header className={styles.outputHeader}>
                <span className={styles.outputScrawl}>✿ ten options, three tiers</span>
                <h2 className={styles.outputTitle}>
                  Your <em>hashtags</em>
                </h2>
                <p className={styles.outputSub}>
                  one for the sign · four to debate · five for the group chat
                </p>
              </header>

              {/* Primary tier */}
              <section className={styles.tierBlock}>
                <p className={styles.tierEyebrow}>The One</p>
                <button
                  type="button"
                  className={styles.heroTag}
                  onClick={() => handleCopy(primary.hashtag)}
                  data-copied={copiedKey === primary.hashtag || undefined}
                  aria-label={`Copy ${primary.hashtag}`}
                >
                  <span className={styles.heroTagText}>{primary.hashtag}</span>
                  <span className={styles.heroTagCopy}>
                    {copiedKey === primary.hashtag ? "Copied ✓" : "Tap to copy"}
                  </span>
                </button>
                <p className={styles.heroWhy}>{primary.why}</p>
                <CringeBar score={primary.cringeScore} />
              </section>

              {/* Contenders */}
              {contenders.length > 0 && (
                <section className={styles.tierBlock}>
                  <p className={styles.tierEyebrow}>Strong Contenders</p>
                  <div className={styles.tagGrid}>
                    {contenders.map((h) => (
                      <TagCard
                        key={h.hashtag}
                        hashtag={h}
                        copied={copiedKey === h.hashtag}
                        onCopy={() => handleCopy(h.hashtag)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Fun tier */}
              {fun.length > 0 && (
                <section className={styles.tierBlock}>
                  <p className={styles.tierEyebrow}>For the Group Chat</p>
                  <div className={styles.tagGrid}>
                    {fun.map((h) => (
                      <TagCard
                        key={h.hashtag}
                        hashtag={h}
                        copied={copiedKey === h.hashtag}
                        onCopy={() => handleCopy(h.hashtag)}
                      />
                    ))}
                  </div>
                </section>
              )}

              <div className={styles.actionsRow}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleCopyAll}
                  data-copied={allCopied || undefined}
                >
                  {allCopied ? "Copied ✓" : "Copy all hashtags"}
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleStartOver}
                >
                  Start over
                </button>
              </div>
            </article>

            <p className={styles.convert}>
              Want to save this and keep planning?{" "}
              <a href="/signup" className={styles.convertLink}>
                Make a free Marigold account →
              </a>
            </p>
          </>
        )}
      </div>
    </section>
  );
}

interface TagCardProps {
  hashtag: Hashtag;
  copied: boolean;
  onCopy: () => void;
}

function TagCard({ hashtag, copied, onCopy }: TagCardProps) {
  return (
    <article className={styles.tagCard}>
      <p className={styles.tagText}>{hashtag.hashtag}</p>
      <p className={styles.tagWhy}>{hashtag.why}</p>
      <CringeBar score={hashtag.cringeScore} compact />
      <button
        type="button"
        className={styles.copyBtn}
        onClick={onCopy}
        data-copied={copied || undefined}
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </article>
  );
}

interface CringeBarProps {
  score: number;
  compact?: boolean;
}

function CringeBar({ score, compact }: CringeBarProps) {
  const clamped = Math.max(0, Math.min(10, score));
  const pct = (clamped / 10) * 100;
  return (
    <div className={compact ? styles.cringeRowCompact : styles.cringeRow}>
      <span className={styles.cringeLabel}>Cringe-o-meter</span>
      <div className={styles.cringeTrack} aria-hidden="true">
        <span className={styles.cringeFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.cringeValue}>{clamped}/10</span>
    </div>
  );
}

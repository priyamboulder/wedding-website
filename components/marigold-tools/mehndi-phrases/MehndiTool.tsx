"use client";

import { useState } from "react";

import styles from "./MehndiTool.module.css";

const TONE_OPTIONS = [
  { value: "Sweet and romantic", label: "Sweet and romantic" },
  { value: "Funny and cheeky", label: "Funny and cheeky" },
  { value: "Mix of both", label: "Mix of both" },
];

const LANG_OPTIONS = [
  { value: "English only", label: "English only" },
  { value: "Hindi + English", label: "Hindi + English" },
  { value: "Urdu + English", label: "Urdu + English" },
];

interface Input {
  groomName: string;
  tone: string;
  language: string;
  detail: string;
}

const EMPTY: Input = {
  groomName: "",
  tone: "",
  language: "",
  detail: "",
};

interface Phrase {
  phrase: string;
  transliteration: string;
  language: string;
  tone: "sweet" | "cheeky" | "classic";
  usageNote: string;
}

const STATIC_FALLBACK: Phrase[] = [
  {
    phrase: "Mera Dil",
    transliteration: "my heart",
    language: "Hindi",
    tone: "sweet",
    usageNote: "Romantic without naming him — the design holds your meaning, not his.",
  },
  {
    phrase: "Finally",
    transliteration: "",
    language: "English",
    tone: "cheeky",
    usageNote: "For the couple who've been together a while — and everyone knows it.",
  },
  {
    phrase: "Tumhara Hi Hoon",
    transliteration: "I am only yours",
    language: "Hindi",
    tone: "sweet",
    usageNote: "A traditional phrasing, hidden in the same place a name would go.",
  },
  {
    phrase: "Always",
    transliteration: "",
    language: "English",
    tone: "sweet",
    usageNote: "Minimal, modern, fits inside almost any design element.",
  },
  {
    phrase: "You're stuck with me",
    transliteration: "",
    language: "English",
    tone: "cheeky",
    usageNote: "For the bride whose vibe is already screenshot-saved in the group chat.",
  },
];

type Stage = "intake" | "loading" | "result" | "error";

export function MehndiTool() {
  const [stage, setStage] = useState<Stage>("intake");
  const [input, setInput] = useState<Input>(EMPTY);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [usedFallback, setUsedFallback] = useState(false);
  const [showCard, setShowCard] = useState<Phrase | null>(null);

  const canSubmit =
    input.groomName.trim().length > 0 &&
    input.tone.length > 0 &&
    input.language.length > 0;

  function update<K extends keyof Input>(key: K, value: Input[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function generate(p: Input) {
    if (!p.detail.trim()) {
      setPhrases(STATIC_FALLBACK);
      setUsedFallback(true);
      setStage("result");
      requestAnimationFrame(() => {
        document
          .getElementById("mehndi-output")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    setStage("loading");
    try {
      const res = await fetch("/api/tools/mehndi-phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: p }),
      });
      if (!res.ok) throw new Error("bad-status");
      const data = (await res.json()) as { ok: boolean; phrases: Phrase[] };
      if (!data.ok || !Array.isArray(data.phrases) || data.phrases.length === 0) {
        throw new Error("no-phrases");
      }
      setPhrases(data.phrases);
      setUsedFallback(false);
      setStage("result");
      requestAnimationFrame(() => {
        document
          .getElementById("mehndi-output")
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
    setPhrases([]);
    setUsedFallback(false);
    setShowCard(null);
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {stage === "intake" && (
          <>
            <div className={styles.introCard}>
              <span className={styles.scrawl}>✿ custom mehndi phrases</span>
              <h1 className={styles.heading}>
                Hide something <em>in the mehndi.</em>
              </h1>
              <p className={styles.sub}>
                Tradition: the bride&apos;s mehendi hides the groom&apos;s name
                somewhere in the design — he searches for it on the wedding
                night. Five custom phrases to hide instead. Short enough to fit
                inside the design.
              </p>
              <div className={styles.metaRow}>
                <span className={styles.metaPill}>30 seconds</span>
                <span className={styles.metaPill}>5 phrases</span>
                <span className={styles.metaPill}>Show your artist</span>
                <span className={styles.metaPill}>No signup</span>
              </div>
            </div>

            <form className={styles.card} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Groom&apos;s name</span>
                <input
                  className={styles.input}
                  type="text"
                  value={input.groomName}
                  onChange={(e) =>
                    update("groomName", e.target.value.slice(0, 60))
                  }
                  placeholder="Rohan"
                  autoComplete="off"
                />
              </label>

              <fieldset className={styles.fieldset}>
                <legend className={styles.fieldLabel}>Tone</legend>
                <div className={styles.choiceGrid}>
                  {TONE_OPTIONS.map((t) => {
                    const selected = input.tone === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        className={styles.choiceBtn}
                        aria-pressed={selected}
                        onClick={() => update("tone", t.value)}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className={styles.fieldset}>
                <legend className={styles.fieldLabel}>Language</legend>
                <div className={styles.choiceGrid}>
                  {LANG_OPTIONS.map((l) => {
                    const selected = input.language === l.value;
                    return (
                      <button
                        key={l.value}
                        type="button"
                        className={styles.choiceBtn}
                        aria-pressed={selected}
                        onClick={() => update("language", l.value)}
                      >
                        {l.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>
                  Share something only you two would understand{" "}
                  <span className={styles.optional}>optional</span>
                </span>
                <textarea
                  className={styles.textarea}
                  value={input.detail}
                  onChange={(e) =>
                    update("detail", e.target.value.slice(0, 400))
                  }
                  placeholder="the airport in Hyderabad, the cold pakora incident, his nickname for you..."
                  rows={3}
                />
              </label>

              <p className={styles.helperBlock}>
                ✿ Skip the personal detail and we&apos;ll show you a curated
                starter set instead.
              </p>

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={!canSubmit}
                >
                  Generate phrases →
                </button>
              </div>
            </form>
          </>
        )}

        {stage === "loading" && (
          <div className={styles.loading} aria-live="polite">
            <p className={styles.loadingText}>
              tucking it into the design
              <span className={styles.dot} aria-hidden="true" />
            </p>
            <p className={styles.loadingSub}>
              ✿ short enough to fit between the petals
            </p>
          </div>
        )}

        {stage === "error" && (
          <div className={styles.errorCard}>
            <h2 className={styles.errorTitle}>The henna paste is offline.</h2>
            <p className={styles.errorBody}>
              Couldn&apos;t reach the phrase generator just now. Try again —
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

        {stage === "result" && (
          <>
            <article id="mehndi-output" className={styles.output}>
              <header className={styles.outputHeader}>
                <span className={styles.outputScrawl}>✿ five options</span>
                <h2 className={styles.outputTitle}>
                  Tucked into the <em>design</em>
                </h2>
                <p className={styles.outputSub}>
                  {usedFallback
                    ? "a curated starter set"
                    : "custom-written for the two of you"}
                </p>
              </header>

              <div className={styles.phraseGrid}>
                {phrases.map((p, i) => (
                  <article key={i} className={styles.phraseCard}>
                    <p className={styles.phraseText}>{p.phrase}</p>
                    {p.transliteration && (
                      <p className={styles.translit}>{p.transliteration}</p>
                    )}
                    <div className={styles.phraseMeta}>
                      <span className={styles.toneTag} data-tone={p.tone}>
                        {p.tone}
                      </span>
                      <span className={styles.langTag}>{p.language}</span>
                    </div>
                    {p.usageNote && (
                      <p className={styles.usageNote}>{p.usageNote}</p>
                    )}
                    <button
                      type="button"
                      className={styles.showBtn}
                      onClick={() => setShowCard(p)}
                    >
                      Show your mehendi artist →
                    </button>
                  </article>
                ))}
              </div>

              <div className={styles.actionsRow}>
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

        {/* Artist card overlay */}
        {showCard && (
          <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="artist-card-phrase"
            onClick={() => setShowCard(null)}
          >
            <div className={styles.artistCard} onClick={(e) => e.stopPropagation()}>
              <span className={styles.artistEyebrow}>For the mehendi artist</span>
              <p id="artist-card-phrase" className={styles.artistPhrase}>
                {showCard.phrase}
              </p>
              {showCard.transliteration && (
                <p className={styles.artistTranslit}>
                  {showCard.transliteration}
                </p>
              )}
              <p className={styles.artistInstruction}>
                Please incorporate this phrase somewhere in the bride&apos;s
                mehendi design.
              </p>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowCard(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

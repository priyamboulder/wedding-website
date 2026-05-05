// ── ShareDots ───────────────────────────────────────────────────────────────
// Scattered decorative dots used across The Marigold's editorial backgrounds.
// Pure CSS — no client component needed.

const DOTS = [
  { top: "8%", left: "6%", color: "var(--color-gold)", size: 6, opacity: 0.55 },
  { top: "14%", left: "82%", color: "var(--color-rose)", size: 5, opacity: 0.45 },
  { top: "22%", left: "46%", color: "var(--color-saffron)", size: 4, opacity: 0.55 },
  { top: "31%", left: "9%", color: "var(--color-ink-faint)", size: 4, opacity: 0.4 },
  { top: "40%", left: "92%", color: "var(--color-gold)", size: 5, opacity: 0.4 },
  { top: "52%", left: "4%", color: "var(--color-rose-light)", size: 6, opacity: 0.4 },
  { top: "60%", left: "78%", color: "var(--color-saffron)", size: 4, opacity: 0.5 },
  { top: "70%", left: "38%", color: "var(--color-ink-faint)", size: 3, opacity: 0.45 },
  { top: "82%", left: "88%", color: "var(--color-gold)", size: 5, opacity: 0.4 },
  { top: "90%", left: "14%", color: "var(--color-rose)", size: 4, opacity: 0.4 },
];

export function ShareDots() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {DOTS.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            background: d.color,
            opacity: d.opacity,
          }}
        />
      ))}
    </div>
  );
}

import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  tone = "champagne",
}: {
  children: ReactNode;
  className?: string;
  tone?: "champagne" | "ivory";
}) {
  const bg = tone === "champagne" ? "#FBF3E4" : "#FFFFFA";
  return (
    <section
      className={`overflow-hidden rounded-xl border ${className}`}
      style={{
        backgroundColor: bg,
        borderColor: "rgba(196,162,101,0.25)",
      }}
    >
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  sub,
  deltaUp,
  deltaText,
  warnText,
  sparkline,
  ratingStars,
}: {
  label: string;
  value: string;
  sub?: string;
  deltaUp?: boolean;
  deltaText?: string;
  warnText?: string;
  sparkline?: number[];
  ratingStars?: number;
}) {
  return (
    <Card>
      <div className="flex flex-col gap-2 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">
          {label}
        </p>
        <div className="flex items-end justify-between gap-3">
          <p
            className="text-[32px] leading-none text-[#2C2C2C]"
            style={{
              fontFamily:
                "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
              fontWeight: 500,
              letterSpacing: "-0.02em",
            }}
          >
            {value}
          </p>
          {sparkline && <Sparkline values={sparkline} />}
          {typeof ratingStars === "number" && (
            <div className="flex items-center gap-0.5 text-[14px]" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    color: i < Math.round(ratingStars) ? "#C4A265" : "#E8D5D0",
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          )}
        </div>
        {deltaText && (
          <p
            className={`text-[11.5px] ${
              deltaUp ? "text-emerald-700" : "text-stone-500"
            }`}
          >
            <span aria-hidden>{deltaUp ? "↑" : "→"}</span> {deltaText}
          </p>
        )}
        {sub && !deltaText && (
          <p className="text-[11.5px] text-stone-500">{sub}</p>
        )}
        {sub && deltaText && (
          <p className="text-[11.5px] text-stone-500">{sub}</p>
        )}
        {warnText && (
          <p className="text-[11.5px] text-[#B23A2A]">
            <span aria-hidden>⚠</span> {warnText}
          </p>
        )}
      </div>
    </Card>
  );
}

export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 68;
  const h = 22;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = values[values.length - 1];
  const lastX = w;
  const lastY = h - ((last - min) / span) * h;
  return (
    <svg width={w} height={h} className="shrink-0" aria-hidden>
      <polyline
        fill="none"
        stroke="#C4A265"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
      <circle cx={lastX} cy={lastY} r="2" fill="#C4A265" />
    </svg>
  );
}

export function SectionHeading({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3 pb-3">
      <div className="flex items-center gap-2.5">
        <h2
          className="text-[22px] leading-none text-[#2C2C2C]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
        {typeof count === "number" && count > 0 && (
          <span
            className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[10px] font-semibold text-[#7a5a16]"
            style={{ backgroundColor: "#F5E6D0" }}
          >
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

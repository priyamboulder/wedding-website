// ── Tiny editorial markdown renderer ──────────────────────────────────────
// The detail panel prose supports a deliberately narrow slice of markdown:
// paragraph breaks (double newline), **bold**, and *italic*. Rolling our
// own lets us avoid pulling in a markdown library for 100-word blurbs.

import type { ReactNode } from "react";

const INLINE_SPLIT = /(\*\*[^*]+\*\*|\*[^*\n]+\*)/g;

function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  for (const match of text.matchAll(INLINE_SPLIT)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      out.push(text.slice(lastIndex, idx));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      out.push(
        <strong key={`b-${key++}`} className="font-semibold text-ink">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      out.push(<em key={`i-${key++}`}>{token.slice(1, -1)}</em>);
    }
    lastIndex = idx + token.length;
  }
  if (lastIndex < text.length) {
    out.push(text.slice(lastIndex));
  }
  return out;
}

export function EditorialProse({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className="text-[15px] leading-[1.7] text-ink-muted [&+p]:mt-4"
        >
          {renderInline(p)}
        </p>
      ))}
    </div>
  );
}

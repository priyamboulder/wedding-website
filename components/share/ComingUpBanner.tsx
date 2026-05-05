// ── ComingUpBanner ──────────────────────────────────────────────────────────
// The Marigold's pill-shaped "COMING UP" banner pattern, repurposed here as a
// salmon/pink announcement bar. Used at the top of the Real Weddings tab and
// elsewhere as a soft CTA.

import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  message: React.ReactNode;
  href?: string;
  cta?: string;
  className?: string;
};

export function ComingUpBanner({ label, message, href, cta = "Share your story", className }: Props) {
  const Inner = (
    <div
      className={cn(
        "group flex flex-wrap items-center gap-3 rounded-full border border-rose/40 px-4 py-2 transition-colors md:gap-4 md:px-5",
        "bg-gradient-to-r from-rose-pale/90 via-saffron-pale/70 to-rose-pale/80 hover:from-rose-pale to-saffron-pale",
        className,
      )}
      style={{
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4)",
      }}
    >
      <span
        className="rounded-full bg-rose px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ivory"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        ✦ {label}
      </span>
      <span className="flex-1 text-[13.5px] font-medium text-ink md:text-[14.5px]">
        {message}
      </span>
      {href && (
        <span
          className="ml-auto inline-flex items-center gap-1 whitespace-nowrap text-[12.5px] font-semibold uppercase tracking-[0.14em] text-ink transition-transform group-hover:translate-x-0.5"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {cta}
          <span aria-hidden="true">→</span>
        </span>
      )}
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block">
        {Inner}
      </Link>
    );
  }
  return Inner;
}

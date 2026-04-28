import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <p
        className="text-[11px] uppercase tracking-[0.3em] text-ink-faint"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        404 · Page not found
      </p>
      <h1
        className="mt-4 text-ink"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(28px, 4vw, 56px)",
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: "-0.015em",
        }}
      >
        This page doesn&apos;t exist
      </h1>
      <p className="mt-4 max-w-[380px] text-[14px] leading-relaxed text-ink-muted">
        The page you&apos;re looking for may have moved or been removed. Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/"
          className="rounded-full bg-ink px-6 py-2.5 text-[13px] text-white transition-opacity hover:opacity-80"
          style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
          Go home
        </Link>
        <Link
          href="/community"
          className="text-[13px] text-ink-muted transition-colors hover:text-ink"
          style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
          Visit community
        </Link>
      </div>
    </div>
  );
}

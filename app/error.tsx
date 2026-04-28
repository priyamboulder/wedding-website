"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <p
        className="text-[11px] uppercase tracking-[0.3em] text-ink-faint"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        Something went wrong
      </p>
      <h1
        className="mt-4 text-ink"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(28px, 4vw, 48px)",
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
        }}
      >
        An unexpected error occurred
      </h1>
      <p className="mt-4 max-w-[400px] text-[14px] leading-relaxed text-ink-muted">
        We apologize for the inconvenience. Please try again, or return home.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={reset}
          className="rounded-full bg-ink px-6 py-2.5 text-[13px] text-white transition-opacity hover:opacity-80"
          style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-[13px] text-ink-muted transition-colors hover:text-ink"
          style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

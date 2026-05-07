"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          margin: 0,
          fontFamily: "'DM Sans', system-ui, sans-serif",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <p style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#999", margin: 0 }}>
          Critical error
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: "#1a1a1a",
            margin: "16px 0 0",
          }}
        >
          Something went wrong
        </h1>
        <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.65, color: "#666", maxWidth: 400 }}>
          The application encountered an unexpected error. Please refresh the page.
        </p>
        <div style={{ marginTop: 32, display: "flex", gap: 16, alignItems: "center" }}>
          <button
            onClick={reset}
            style={{
              background: "#1a1a1a",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "10px 24px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{ fontSize: 13, color: "#666", textDecoration: "none" }}
          >
            Go home
          </a>
        </div>
      </body>
    </html>
  );
}

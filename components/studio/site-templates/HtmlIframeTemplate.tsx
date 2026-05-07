"use client";

import { useEffect, useRef } from "react";
import type { TemplateRenderProps } from "@/types/wedding-site";
import { TEMPLATES } from "@/components/studio/template-catalog";

interface Props extends TemplateRenderProps {
  htmlFile: string;
}

export default function HtmlIframeTemplate({ htmlFile, content, mode }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const src = `/marigold-templates/${htmlFile}`;

  // Inject couple data after iframe loads (showcase mode only).
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const handleLoad = () => {
      try {
        iframe.contentWindow?.postMessage(
          {
            type: "ANANYA_COUPLE_DATA",
            first: content.couple.first,
            second: content.couple.second,
            date: content.weddingDate,
            venue: content.primaryVenue,
            hashtag: content.couple.hashtag,
          },
          "*",
        );
      } catch {
        // cross-origin blocked — template shows its built-in placeholder names
      }
    };
    iframe.addEventListener("load", handleLoad);
    return () => iframe.removeEventListener("load", handleLoad);
  }, [content, htmlFile]);

  if (mode === "preview") {
    // Show a static gradient + text card — loading 17 full HTML files simultaneously
    // in tiny thumbnails is extremely slow and causes broken-image flicker.
    // The real template is previewed on the full-page /studio/templates/[id]/preview route.
    const template = TEMPLATES.find((t) => t.htmlFile === htmlFile);
    const gradient = template?.heroGradient ?? template?.pagePreviews[0] ?? "linear-gradient(135deg, #FAF7F2, #E8DCC8)";
    const palette = template?.palette ?? ["#1A1A1A", "#C9A961", "#FAF7F2", "#E8DCC8", "#6B6B6B"];
    const [, , accent] = palette;
    const isDark = isDarkColor(palette[0]);
    const textColor = isDark ? "#FAF7F2" : "#1A1A1A";
    const subColor = isDark ? "rgba(250,247,242,0.65)" : "rgba(26,26,26,0.55)";

    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: gradient,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "12px 16px",
          overflow: "hidden",
        }}
      >
        <div style={{ color: subColor, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "var(--font-mono, monospace)", marginBottom: 8 }}>
          {template?.style ?? "Template"}
        </div>
        <div style={{ color: textColor, fontSize: 22, fontWeight: 300, fontFamily: "Georgia, serif", lineHeight: 1.1, marginBottom: 8 }}>
          {content.couple.first} &amp; {content.couple.second}
        </div>
        <div style={{ width: 28, height: 1, background: accent, margin: "0 auto 8px" }} />
        <div style={{ color: subColor, fontSize: 10, letterSpacing: "0.16em", fontFamily: "var(--font-mono, monospace)" }}>
          {template?.tagline ?? ""}
        </div>
      </div>
    );
  }

  // Showcase — full scrollable template in an iframe
  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={htmlFile.replace(".html", "")}
      style={{ width: "100%", height: "100vh", border: "none", display: "block" }}
    />
  );
}

function isDarkColor(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length !== 6) return false;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.4;
}

"use client";

import { useEffect, useState } from "react";
import styles from "./Loading.module.css";

const PHRASES = [
  "Reading the stars...",
  "Calculating your Ashtakoota Milan...",
  "Checking for doshas...",
  "Preparing your compatibility report...",
];

export function Loading() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setIdx((p) => (p + 1) % PHRASES.length), 750);
    return () => clearInterval(i);
  }, []);

  return (
    <div className={styles.wrap} aria-live="polite" aria-busy="true">
      <div className={styles.constellation} aria-hidden>
        <svg viewBox="0 0 240 240" width="180" height="180">
          <defs>
            <radialGradient id="kundli-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(212,168,83,0.6)" />
              <stop offset="60%" stopColor="rgba(212,168,83,0.15)" />
              <stop offset="100%" stopColor="rgba(212,168,83,0)" />
            </radialGradient>
          </defs>
          <circle cx="120" cy="120" r="100" fill="url(#kundli-glow)" />
          <g className={styles.spin}>
            <circle cx="120" cy="20" r="3.5" fill="var(--gold)" />
            <circle cx="195" cy="55" r="2.5" fill="var(--gold)" />
            <circle cx="220" cy="120" r="3" fill="var(--gold)" />
            <circle cx="195" cy="185" r="2.5" fill="var(--gold)" />
            <circle cx="120" cy="220" r="3.5" fill="var(--gold)" />
            <circle cx="45" cy="185" r="2.5" fill="var(--gold)" />
            <circle cx="20" cy="120" r="3" fill="var(--gold)" />
            <circle cx="45" cy="55" r="2.5" fill="var(--gold)" />
            <circle
              cx="120"
              cy="120"
              r="100"
              fill="none"
              stroke="rgba(212,168,83,0.35)"
              strokeWidth="1"
              strokeDasharray="2 6"
            />
          </g>
          <g className={styles.spinReverse}>
            <circle
              cx="120"
              cy="120"
              r="60"
              fill="none"
              stroke="rgba(75,21,40,0.25)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
          </g>
          <circle cx="120" cy="120" r="6" fill="var(--wine)" />
        </svg>
      </div>
      <p className={styles.phrase} key={idx}>
        {PHRASES[idx]}
      </p>
    </div>
  );
}

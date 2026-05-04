'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './RevealOnScroll.module.css';

interface Props {
  children: ReactNode;
  /** Margin (px) below the viewport bottom at which to trigger the reveal. */
  rootMargin?: string;
  /** Reveal threshold — fraction of the wrapper that must intersect. */
  threshold?: number;
}

export function RevealOnScroll({
  children,
  rootMargin = '0px 0px -10% 0px',
  threshold = 0.05,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div
      ref={ref}
      className={`${styles.wrapper} ${revealed ? styles.revealed : ''}`}
    >
      {children}
    </div>
  );
}

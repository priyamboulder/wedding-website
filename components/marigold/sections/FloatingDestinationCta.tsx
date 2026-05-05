'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './FloatingDestinationCta.module.css';

type Props = {
  heroId?: string;
  endRegionId?: string;
  href?: string;
};

export function FloatingDestinationCta({
  heroId = 'marigold-hero',
  // The first section of the "hide zone" (testimonials → poll → final CTA → footer).
  // Once this section is in the viewport OR has scrolled above it, the bar stays hidden.
  endRegionId = 'marigold-testimonials',
  href = '/tools/destinations',
}: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [heroOut, setHeroOut] = useState(false);
  const [inEndRegion, setInEndRegion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || dismissed) return;

    const hero = document.getElementById(heroId);
    const endRegion = document.getElementById(endRegionId);

    let heroObserver: IntersectionObserver | null = null;
    let endObserver: IntersectionObserver | null = null;

    if (hero) {
      heroObserver = new IntersectionObserver(
        ([entry]) => setHeroOut(!entry.isIntersecting),
        { threshold: 0, rootMargin: '0px 0px -85% 0px' }
      );
      heroObserver.observe(hero);
    } else {
      setHeroOut(true);
    }

    if (endRegion) {
      endObserver = new IntersectionObserver(
        ([entry]) => {
          // Hidden when the section is intersecting OR has already scrolled
          // above the viewport — covers poll, final CTA, and footer too.
          setInEndRegion(
            entry.isIntersecting || entry.boundingClientRect.top < 0,
          );
        },
        { threshold: 0 },
      );
      endObserver.observe(endRegion);
    }

    return () => {
      heroObserver?.disconnect();
      endObserver?.disconnect();
    };
  }, [mounted, dismissed, heroId, endRegionId]);

  if (!mounted || dismissed) return null;

  const visible = heroOut && !inEndRegion;

  return (
    <div
      className={`${styles.wrapper} ${visible ? styles.visible : ''}`}
      aria-hidden={!visible}
    >
      <div className={styles.bar} role="region" aria-label="Destinations call to action">
        <p className={styles.message}>Ready to find your perfect destination?</p>
        <Link
          href={href}
          className={styles.cta}
          tabIndex={visible ? 0 : -1}
        >
          Explore Destinations
          <span className={styles.arrow} aria-hidden="true">→</span>
        </Link>
        <button
          type="button"
          className={styles.dismiss}
          onClick={() => setDismissed(true)}
          aria-label="Dismiss destinations banner"
          tabIndex={visible ? 0 : -1}
        >
          ×
        </button>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
};

export function ScrollReveal({ children, className }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const baseTransform = window.getComputedStyle(node).transform;
    const restingTransform = baseTransform === 'none' ? '' : baseTransform;

    node.style.opacity = '0';
    node.style.transform = `${restingTransform} translateY(24px)`.trim();
    node.style.transition = 'opacity 0.7s ease, transform 0.7s ease';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            node.style.opacity = '1';
            node.style.transform = restingTransform || 'translateY(0)';
            observer.unobserve(node);
          }
        });
      },
      { threshold: 0.08 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

import type { ReactNode } from 'react';
import { ScrollReveal } from '@/components/marigold/ui/ScrollReveal';
import styles from './FeatureStrip.module.css';

type FeatureStripProps = {
  reverse?: boolean;
  visual: ReactNode;
  children: ReactNode;
  className?: string;
};

export function FeatureStrip({ reverse, visual, children, className }: FeatureStripProps) {
  const cls = [styles.strip, reverse ? styles.reverse : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <ScrollReveal className={cls}>
      <div className={styles.visual}>{visual}</div>
      <div className={styles.text}>{children}</div>
    </ScrollReveal>
  );
}

type FeatureStripTextProps = {
  label?: string;
  title: string;
  body?: string;
  detail?: string;
  scrawl?: string;
  children?: ReactNode;
};

export function FeatureStripText({
  label,
  title,
  body,
  detail,
  scrawl,
  children,
}: FeatureStripTextProps) {
  return (
    <>
      {label && <div className={styles.label}>{label}</div>}
      <h3
        className={styles.heading}
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {body && <p className={styles.body}>{body}</p>}
      {detail && <p className={styles.detail}>{detail}</p>}
      {scrawl && <span className={styles.scrawlNote}>{scrawl}</span>}
      {children}
    </>
  );
}

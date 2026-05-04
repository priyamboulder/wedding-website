import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './MiniToolShell.module.css';

type MiniToolShellProps = {
  name: string;
  tagline: string;
  estimatedTime?: string;
  children: ReactNode;
};

// Universal layout for the 45 mini tools per the Ananya build spec.
// Centered 680px column, brand header, body slot, "back to tools" footer.
export function MiniToolShell({
  name,
  tagline,
  estimatedTime,
  children,
}: MiniToolShellProps) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <Link href="/tools" className={styles.backLink}>
          ← Back to all tools
        </Link>

        <header className={styles.header}>
          {estimatedTime && (
            <span className={styles.timeBadge}>⚡ {estimatedTime}</span>
          )}
          <span className={styles.scrawl}>The Marigold Tool</span>
          <h1 className={styles.title}>{name}</h1>
          <p className={styles.tagline}>{tagline}</p>
        </header>

        <div className={styles.body}>{children}</div>

        <footer className={styles.footer}>
          <Link href="/tools" className={styles.footerLink}>
            Try another tool →
          </Link>
          <span className={styles.footerNote}>
            no signup, no save — just answers
          </span>
        </footer>
      </div>
    </section>
  );
}

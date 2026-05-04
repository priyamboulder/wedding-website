'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/shopping', label: 'Shopping' },
  { href: '/vendors-directory', label: 'Vendors' },
];

const TAIL_LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'The Edit' },
];

// Tools shown in the navbar dropdown. Live tools only — coming-soon items
// live on the /tools hub. Keep this in sync with the seed in
// supabase/migrations/0022_marigold_budget_tools_schema.sql.
const TOOLS_DROPDOWN: {
  href: string;
  title: string;
  titleHtml?: string;
  sub: string;
}[] = [
  {
    href: '/tools/budget',
    title: 'Shaadi Budget',
    titleHtml: 'Shaadi <em>Budget™</em>',
    sub: 'the budget that gets indian weddings',
  },
  {
    href: '/tools/destinations',
    title: 'Destination Explorer',
    sub: 'udaipur to lake como, real cost',
  },
  {
    href: '/tools/match',
    title: 'Match Me',
    sub: 'budget → where you can go',
  },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLSpanElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname() ?? '';
  const isPro = pathname.startsWith('/for');
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const openSignIn = useAuthStore((s) => s.openSignIn);
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    setOpen(false);
  };

  // Close dropdown on outside click / escape.
  useEffect(() => {
    if (!toolsOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!toolsRef.current?.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setToolsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [toolsOpen]);

  // Close on route change.
  useEffect(() => {
    setToolsOpen(false);
  }, [pathname]);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setToolsOpen(false), 180);
  };

  return (
    <nav className={`${styles.nav} ${isPro ? styles.navPro : ''}`}>
      <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
        The <i>Marigold</i>
        {isPro && <span className={styles.proSuffix}> · for professionals</span>}
      </Link>

      <div className={styles.links}>
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={styles.link}>
            {link.label}
          </Link>
        ))}

        <span
          ref={toolsRef}
          className={styles.navItem}
          data-open={toolsOpen}
          onMouseEnter={() => {
            cancelClose();
            setToolsOpen(true);
          }}
          onMouseLeave={scheduleClose}
        >
          <button
            type="button"
            className={styles.link}
            onClick={() => setToolsOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={toolsOpen}
          >
            Tools
            <span aria-hidden="true" className={styles.caret}>▾</span>
          </button>
          <span
            className={styles.dropdown}
            role="menu"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <span className={styles.dropdownArrow} aria-hidden="true" />
            {TOOLS_DROPDOWN.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className={styles.dropdownItem}
                role="menuitem"
                onClick={() => setToolsOpen(false)}
              >
                <span
                  className={styles.dropdownItemTitle}
                  dangerouslySetInnerHTML={{
                    __html: tool.titleHtml ?? tool.title,
                  }}
                />
                <span className={styles.dropdownItemSub}>{tool.sub}</span>
              </Link>
            ))}
            <span className={styles.dropdownDivider} aria-hidden="true" />
            <Link
              href="/tools"
              className={styles.dropdownAllLink}
              onClick={() => setToolsOpen(false)}
            >
              <span>→ All tools</span>
              <span aria-hidden="true">✿</span>
            </Link>
          </span>
        </span>

        {TAIL_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={styles.link}>
            {link.label}
          </Link>
        ))}

        {user ? (
          <>
            <Link href="/dashboard" className={styles.link} onClick={() => setOpen(false)}>
              Dashboard
            </Link>
            <button
              type="button"
              className={`${styles.link} ${styles.cta}`}
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={styles.link}
              onClick={() => openSignIn('generic')}
            >
              Sign In
            </button>
            <Link href="/pricing" className={`${styles.link} ${styles.cta}`}>
              Start Planning
            </Link>
          </>
        )}
        <button
          type="button"
          className={styles.toggle}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      <div className={`${styles.mobilePanel} ${open ? styles.open : ''}`}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={styles.link}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}

        <Link
          href="/tools"
          className={styles.link}
          onClick={() => setOpen(false)}
        >
          Tools
        </Link>
        <div className={styles.mobileSubgroup}>
          <span className={styles.mobileSubgroupLabel}>Live tools</span>
          {TOOLS_DROPDOWN.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={styles.mobileSubItem}
              onClick={() => setOpen(false)}
              dangerouslySetInnerHTML={{ __html: tool.titleHtml ?? tool.title }}
            />
          ))}
        </div>

        {TAIL_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={styles.link}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}

        {user ? (
          <>
            <Link href="/dashboard" className={styles.link} onClick={() => setOpen(false)}>
              Dashboard
            </Link>
            <button type="button" className={`${styles.link} ${styles.cta}`} onClick={handleSignOut}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={styles.link}
              onClick={() => { openSignIn('generic'); setOpen(false); }}
            >
              Sign In
            </button>
            <Link href="/pricing" className={`${styles.link} ${styles.cta}`} onClick={() => setOpen(false)}>
              Start Planning
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

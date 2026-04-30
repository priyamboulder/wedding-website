'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/shopping', label: 'Shopping' },
  { href: '/vendors-directory', label: 'Vendors' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'The Edit' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
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

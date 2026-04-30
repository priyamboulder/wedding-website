import Link from 'next/link';
import styles from './Footer.module.css';

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'Checklist', href: '/features/checklist' },
      { label: 'Workspaces', href: '/features/workspaces' },
      { label: 'Vendors', href: '/features/vendors' },
      { label: 'Guest Management', href: '/features/guests' },
      { label: 'Registry', href: '/features/registry' },
      { label: 'Studio', href: '/features/studio' },
    ],
  },
  {
    title: 'The Edit',
    links: [
      { label: 'Editorial', href: '/blog' },
      { label: 'Real Weddings', href: '/blog' },
      { label: 'The Magazine', href: '/blog' },
      { label: 'Submit Your Wedding', href: '/blog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Careers', href: '/about' },
      { label: 'Press', href: '/about' },
      { label: 'Contact', href: '/about' },
      { label: 'Privacy', href: '/about' },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <Link href="/" className={styles.brand}>
            The Marigold
          </Link>
          <div className={styles.tagline}>where beautiful chaos blooms</div>
        </div>
        <div className={styles.cols}>
          {COLUMNS.map((col) => (
            <div key={col.title} className={styles.col}>
              <h4>{col.title}</h4>
              {col.links.map((link) => (
                <Link key={link.label} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© 2026 The Marigold. Made with love and a concerning amount of chai.</span>
        <span>Not responsible for any aunty-related incidents.</span>
      </div>
    </footer>
  );
}

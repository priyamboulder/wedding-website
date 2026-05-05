import styles from './ScrapbookMockups.module.css';

type ChecklistRow = {
  task: string;
  phase: string;
  tone: 'mehendi' | 'sangeet' | 'wedding' | 'pre' | 'bridal';
  checked: boolean;
  ai?: boolean;
};

const CHECKLIST_ROWS: ChecklistRow[] = [
  { task: 'Book mehendi artist', phase: 'MEHENDI', tone: 'mehendi', checked: true },
  { task: 'Confirm baraat route', phase: 'WEDDING', tone: 'wedding', checked: true },
  { task: 'Send sangeet playlist to DJ', phase: 'SANGEET', tone: 'sangeet', checked: false, ai: true },
  { task: 'Order welcome bags', phase: 'PRE-EVENT', tone: 'pre', checked: false },
  { task: 'Final fitting — lehenga', phase: 'BRIDAL', tone: 'bridal', checked: true },
];

export function ChecklistMockup() {
  return (
    <div className={styles.checklist}>
      <div className={styles.mockHeader}>
        <span className={styles.mockTitle}>The Checklist</span>
        <span className={styles.mockMeta}>13 phases · 582 tasks</span>
      </div>
      <ul className={styles.checklistRows}>
        {CHECKLIST_ROWS.map((row, i) => (
          <li
            key={i}
            className={`${styles.checklistRow} ${row.ai ? styles.checklistRowAi : ''}`}
          >
            <span
              className={`${styles.checkbox} ${row.checked ? styles.checkboxChecked : ''}`}
              aria-hidden="true"
            >
              {row.checked && (
                <svg viewBox="0 0 12 12" width="10" height="10">
                  <path
                    d="M2 6.5 l2.5 2.5 l5.5 -6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className={styles.taskName}>{row.task}</span>
            {row.ai && <span className={styles.aiTag}>AI suggested</span>}
            <span className={`${styles.phasePill} ${styles[`phasePill_${row.tone}`]}`}>
              {row.phase}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type VendorRow = {
  name: string;
  cat: string;
  rating: string;
  tone: 'a' | 'b' | 'c' | 'd';
  matched?: boolean;
};

const VENDORS: VendorRow[] = [
  { name: 'Lumière Studios', cat: 'PHOTOGRAPHER', rating: '4.9', tone: 'a', matched: true },
  { name: 'Saffron Plate Co.', cat: 'CATERER', rating: '4.8', tone: 'b' },
  { name: 'Marigold Mantap', cat: 'DECORATOR', rating: '4.9', tone: 'c' },
  { name: 'Rasiya Sound', cat: 'DJ', rating: '4.7', tone: 'd' },
];

export function VendorHubMockup() {
  return (
    <div className={styles.vendors}>
      <div className={styles.mockHeader}>
        <span className={styles.mockTitle}>Vendor Hub</span>
        <span className={styles.mockMeta}>Curated · 12 matches</span>
      </div>
      <div className={styles.vendorGrid}>
        {VENDORS.map((v) => (
          <div key={v.name} className={styles.vendorCard}>
            <div className={`${styles.vendorThumb} ${styles[`thumb_${v.tone}`]}`}>
              {v.matched && (
                <span className={styles.matchedBadge}>MATCHED TO YOUR VIBE</span>
              )}
            </div>
            <div className={styles.vendorMeta}>
              <span className={styles.vendorCat}>{v.cat}</span>
              <span className={styles.vendorName}>{v.name}</span>
              <span className={styles.vendorRating}>★ {v.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const WORKSPACE_TABS = ['Moodboard', 'The Brief', 'Messages', 'Files'] as const;
const WORKSPACE_SWATCHES = ['s1', 's2', 's3', 's4', 's5', 's6'] as const;
const WORKSPACE_KEYWORDS = ['romantic', 'palace', 'jewel tones'];

export function VendorWorkspacesMockup() {
  return (
    <div className={styles.workspace}>
      <div className={styles.tabs}>
        {WORKSPACE_TABS.map((t) => (
          <span
            key={t}
            className={`${styles.tab} ${t === 'Moodboard' ? styles.tabActive : ''}`}
          >
            {t}
          </span>
        ))}
      </div>
      <div className={styles.moodboard}>
        {WORKSPACE_SWATCHES.map((sw) => (
          <span key={sw} className={`${styles.swatch} ${styles[`swatch_${sw}`]}`} />
        ))}
      </div>
      <div className={styles.keywords}>
        {WORKSPACE_KEYWORDS.map((k) => (
          <span key={k} className={styles.keyword}>{k}</span>
        ))}
      </div>
    </div>
  );
}

type GuestRow = {
  name: string;
  side: string;
  status: 'confirmed' | 'pending' | 'reminder';
  statusText: string;
  ai?: boolean;
};

const GUEST_ROWS: GuestRow[] = [
  { name: 'Sharma Family (4)', side: 'Bride', status: 'confirmed', statusText: '✓ Confirmed' },
  { name: 'Patel, R.', side: 'Groom', status: 'pending', statusText: '⏳ Pending' },
  { name: 'Kapoor, S. & family', side: 'Bride', status: 'confirmed', statusText: '✓ Confirmed' },
  { name: 'Mehta family', side: 'Bride', status: 'reminder', statusText: 'Did you forget?', ai: true },
];

export function GuestManagementMockup() {
  return (
    <div className={styles.guests}>
      <div className={styles.mockHeader}>
        <span className={styles.mockTitle}>Guest Management</span>
        <span className={styles.mockMeta}>Per-event RSVPs</span>
      </div>
      <div className={styles.guestTable}>
        <div className={styles.guestHead}>
          <span>Name</span>
          <span>Side</span>
          <span>RSVP</span>
        </div>
        {GUEST_ROWS.map((r, i) => (
          <div
            key={i}
            className={`${styles.guestRow} ${r.ai ? styles.guestRowAi : ''}`}
          >
            <span className={styles.guestName}>{r.name}</span>
            <span className={styles.guestSide}>{r.side}</span>
            <span className={`${styles.guestStatus} ${styles[`guestStatus_${r.status}`]}`}>
              {r.statusText}
            </span>
            {r.ai && (
              <span className={styles.aiNote}>
                AI reminder: did you forget the Mehtas?
              </span>
            )}
          </div>
        ))}
      </div>
      <div className={styles.guestSummary}>
        <span>Bride Side: 142</span>
        <span className={styles.guestSummaryDivider}>|</span>
        <span>Groom Side: 158</span>
      </div>
    </div>
  );
}

const PALETTE = ['#7A1F2C', '#C8964B', '#FFF8F2', '#F4D6CC', '#3F5A40'];

export function RegistryGiftsMockup() {
  return (
    <div className={styles.registry}>
      <div className={styles.registrySplit}>
        <div className={styles.honeymoon}>
          <div className={styles.honeymoonHead}>
            <span aria-hidden="true">🌴</span>
            <span className={styles.honeymoonTitle}>Honeymoon Fund</span>
          </div>
          <div className={styles.progressBar} aria-hidden="true">
            <span className={styles.progressFill} />
          </div>
          <div className={styles.honeymoonAmount}>
            <strong>$8,450</strong> of $13,000
          </div>
        </div>
        <div className={styles.shagun}>
          <div className={styles.shagunTitle}>Shagun Pool</div>
          <ul className={styles.shagunList}>
            <li>
              <span aria-hidden="true">🥇</span> Sharma family
              <span className={styles.shagunAmount}>$2,500</span>
            </li>
            <li>
              <span aria-hidden="true">🥈</span> Patel uncle
              <span className={styles.shagunAmount}>$1,500</span>
            </li>
            <li>
              <span aria-hidden="true">🥉</span> Kapoor aunty
              <span className={styles.shagunAmount}>$1,000</span>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.thankYouTracker}>
        Thank-you tracker: <strong>12 of 34</strong> sent
      </div>
    </div>
  );
}

export function TheStudioMockup() {
  return (
    <div className={styles.studio}>
      <div className={styles.studioGrid}>
        <div className={styles.monogram} aria-hidden="true">
          <svg viewBox="0 0 60 60" width="100%" height="100%">
            <rect x="3" y="3" width="54" height="54" fill="none" stroke="currentColor" strokeWidth="0.7" />
            <rect x="6" y="6" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="0.4" />
            <text
              x="30"
              y="38"
              textAnchor="middle"
              className={styles.monogramText}
            >
              P&amp;A
            </text>
            <line x1="14" y1="48" x2="46" y2="48" stroke="currentColor" strokeWidth="0.4" />
            <circle cx="30" cy="13" r="1" fill="currentColor" />
          </svg>
        </div>
        <div className={styles.studioMeta}>
          <div className={styles.studioCouple}>Priya &amp; Arjun</div>
          <div className={styles.studioDate}>December 2026 · Udaipur</div>
          <div className={styles.palette}>
            {PALETTE.map((c, i) => (
              <span
                key={i}
                className={styles.paletteSwatch}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className={styles.studioSurfaces}>
        <div className={styles.studioSurface}>
          <span className={styles.surfaceTag}>Website</span>
          <div className={styles.surfaceLines} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className={styles.studioSurface}>
          <span className={styles.surfaceTag}>Invitation</span>
          <div className={styles.invitePreview} aria-hidden="true">
            <span className={styles.inviteCorner} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlanningCircleMockup() {
  return (
    <div className={styles.community}>
      <div className={styles.feedItem}>
        <div className={styles.feedHead}>
          <span className={styles.feedKind}>The Confessional</span>
          <span className={styles.feedTrending}>🔥 TRENDING</span>
        </div>
        <div className={styles.feedTitle}>
          My MIL rewrote the seating chart at 2am
        </div>
      </div>
      <div className={styles.feedItem}>
        <div className={styles.feedHead}>
          <span className={styles.feedKind}>Real Talk</span>
          <span className={styles.feedReplies}>34 replies</span>
        </div>
        <div className={styles.feedTitle}>
          Is a $50K sangeet budget reasonable for 200 guests?
        </div>
      </div>
      <div className={styles.liveEvent}>
        <span className={styles.liveDot} aria-hidden="true" />
        <span className={styles.liveLabel}>LIVE EVENT</span>
        <span className={styles.liveText}>Ask a Planner — Fri 8pm ET</span>
      </div>
    </div>
  );
}

export const MOCKUPS = {
  checklist: ChecklistMockup,
  vendors: VendorHubMockup,
  workspaces: VendorWorkspacesMockup,
  guests: GuestManagementMockup,
  registry: RegistryGiftsMockup,
  studio: TheStudioMockup,
  community: PlanningCircleMockup,
} as const;

export type ModuleSlug = keyof typeof MOCKUPS;

import styles from './Mockup.module.css';

export function CommunityMockup() {
  return (
    <div className={styles.mockup} style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          background: 'var(--pink)',
          color: 'white',
          fontSize: 10,
          fontWeight: 600,
          textAlign: 'center',
          padding: 8,
          fontFamily: 'var(--font-syne), sans-serif',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}
      >
        LIVE NOW — Ask Marcy Blum anything · join now →
      </div>

      <div style={{ padding: 18 }}>
        <div className={styles.label} style={{ fontSize: 8, color: 'var(--pink)', letterSpacing: 2, marginBottom: 4 }}>
          COMMUNITY
        </div>
        <div className={styles.title} style={{ fontSize: 22, marginBottom: 2 }}>
          the planning circle.
        </div>
        <div
          style={{
            fontFamily: 'var(--font-instrument-serif), serif',
            fontStyle: 'italic',
            fontSize: 13,
            color: 'var(--mauve)',
            marginBottom: 12,
          }}
        >
          stories from the studio — and the brides figuring it out alongside you.
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 14, fontSize: 11, color: 'var(--mauve)', flexWrap: 'wrap' }}>
          <span className={`${styles.tab} ${styles.tabActive}`}>Editorial</span>
          <span className={styles.tab}>Real Weddings</span>
          <span className={styles.tab}>Connect</span>
          <span className={styles.tab}>The Confessional</span>
          <span className={styles.tab}>The Grapevine</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div
            style={{
              flex: 1,
              background: 'var(--peach)',
              borderRadius: 4,
              height: 70,
              display: 'flex',
              alignItems: 'flex-end',
              padding: 8,
            }}
          >
            <span
              style={{
                fontSize: 8,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1,
                background: 'var(--wine)',
                color: 'white',
                padding: '2px 8px',
                borderRadius: 2,
                fontFamily: 'var(--font-syne), sans-serif',
              }}
            >
              VENDOR SPOTLIGHTS
            </span>
          </div>
          <div
            style={{
              flex: 1,
              background: 'var(--sky)',
              borderRadius: 4,
              height: 70,
              display: 'flex',
              alignItems: 'flex-end',
              padding: 8,
            }}
          >
            <span
              style={{
                fontSize: 8,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1,
                background: 'var(--wine)',
                color: 'white',
                padding: '2px 8px',
                borderRadius: 2,
                fontFamily: 'var(--font-syne), sans-serif',
              }}
            >
              PLANNING TIPS
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            fontFamily: 'var(--font-instrument-serif), serif',
            fontSize: 13,
            color: 'var(--wine)',
          }}
        >
          What your caterer wishes you knew about multi-day menus
        </div>
      </div>
    </div>
  );
}

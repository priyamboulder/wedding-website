import styles from './Mockup.module.css';

export function VendorsMockup() {
  return (
    <div className={styles.mockup}>
      <div
        style={{
          background: 'linear-gradient(135deg, var(--cream), var(--gold-light))',
          borderRadius: 6,
          padding: 14,
          marginBottom: 14,
        }}
      >
        <div className={styles.label} style={{ fontSize: 9, color: 'var(--gold)', marginBottom: 4 }}>
          CAN'T DECIDE?
        </div>
        <div className={styles.title} style={{ fontSize: 18 }}>
          Spin the Vendor Roulette
        </div>
        <div style={{ fontSize: 11, color: 'var(--mauve)', marginTop: 2 }}>
          We'll surface a random vendor from your open categories
        </div>
      </div>

      <div className={styles.label} style={{ fontSize: 8, color: 'var(--gold)', marginBottom: 4 }}>
        YOUR VENDOR TEAM
      </div>
      <div style={{ fontSize: 11, color: 'var(--mauve)', marginBottom: 10 }}>
        December 12, 2026 · The Leela Palace · 300 guests · ₹1.5Cr–₹3.6Cr
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        <span className={styles.chip}>Pithi</span>
        <span className={styles.chip}>Haldi</span>
        <span className={styles.chip}>Sangeet</span>
        <span className={styles.chip}>Ceremony</span>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div
          style={{
            flex: 1,
            background: 'var(--blush)',
            borderRadius: 4,
            height: 84,
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
              background: 'var(--gold)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: 2,
              fontFamily: 'var(--font-syne), sans-serif',
            }}
          >
            TOP MATCH
          </span>
        </div>
        <div
          style={{
            flex: 1,
            background: 'var(--lavender)',
            borderRadius: 4,
            height: 84,
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
              background: 'var(--deep-pink)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: 2,
              fontFamily: 'var(--font-syne), sans-serif',
            }}
          >
            RISING STAR
          </span>
        </div>
      </div>
    </div>
  );
}

import styles from './Mockup.module.css';

export function RegistryMockup() {
  return (
    <div className={styles.mockup}>
      <div className={styles.title} style={{ fontSize: 20, marginBottom: 10 }}>
        Gifts so far
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>TOTAL RECEIVED</div>
          <div className={styles.statValue}>$8,724</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>SHAGUN POOL</div>
          <div className={styles.statValue}>$1,854</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, background: 'var(--mint)', padding: 10, borderRadius: 4 }}>
          <div style={{ fontSize: 10, color: 'var(--wine)', fontWeight: 600 }}>Honeymoon fund</div>
          <div className={styles.title} style={{ fontSize: 18 }}>
            $3,300 <span style={{ fontSize: 11, color: 'var(--mauve)' }}>/ $12,000</span>
          </div>
          <div
            style={{
              background: 'rgba(0,0,0,0.08)',
              height: 4,
              borderRadius: 2,
              marginTop: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                background: 'var(--gold)',
                height: '100%',
                width: '28%',
                borderRadius: 2,
              }}
            />
          </div>
        </div>
        <div style={{ flex: 1, background: 'var(--lavender)', padding: 10, borderRadius: 4 }}>
          <div style={{ fontSize: 10, color: 'var(--wine)', fontWeight: 600 }}>
            Charitable giving
          </div>
          <div className={styles.title} style={{ fontSize: 18 }}>
            $1,390
          </div>
        </div>
      </div>

      <div className={styles.title} style={{ fontSize: 14, marginBottom: 6 }}>
        Top contributors
      </div>
      <div
        style={{
          fontSize: 11,
          display: 'flex',
          justifyContent: 'space-between',
          padding: '4px 0',
          color: 'var(--wine)',
        }}
      >
        <span>
          01. Anjali &amp; Dev · <span style={{ color: 'var(--mauve)' }}>Bride side</span>
        </span>
        <span>$1,700</span>
      </div>
      <div
        style={{
          fontSize: 11,
          display: 'flex',
          justifyContent: 'space-between',
          padding: '4px 0',
          color: 'var(--wine)',
        }}
      >
        <span>
          02. Ravi Chacha · <span style={{ color: 'var(--mauve)' }}>Groom side</span>
        </span>
        <span>$1,600</span>
      </div>
    </div>
  );
}

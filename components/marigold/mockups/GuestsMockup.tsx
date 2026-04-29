import styles from './Mockup.module.css';

export function GuestsMockup() {
  return (
    <div className={styles.mockup}>
      <div className={styles.title} style={{ fontSize: 22, marginBottom: 4 }}>
        All Guests
      </div>
      <div className={styles.label} style={{ fontSize: 8, marginBottom: 10 }}>
        99 INVITED · 90 CONFIRMED
      </div>

      <div
        style={{
          background: 'var(--mint)',
          height: 6,
          borderRadius: 3,
          marginBottom: 12,
          overflow: 'hidden',
        }}
      >
        <div style={{ background: '#4abe7a', height: '100%', width: '91%', borderRadius: 3 }} />
      </div>

      <div className={styles.aiBubble} style={{ marginBottom: 12, fontSize: 11 }}>
        ✨ Add the Sharma family — 4 people, groom's side, Jaipur
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 10,
            padding: '4px 10px',
            background: 'var(--wine)',
            color: 'white',
            borderRadius: 2,
            fontWeight: 600,
            fontFamily: 'var(--font-syne), sans-serif',
          }}
        >
          All 99
        </span>
        <span className={styles.chip}>Bride 48</span>
        <span className={styles.chip}>Groom 46</span>
        <span className={styles.chip}>Mutual 5</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className={styles.taskRow} style={{ fontSize: 11 }}>
          <span>
            Mr. Pankaj Agarwal · <span style={{ color: 'var(--mauve)' }}>Family friend</span>
          </span>
          <span style={{ color: 'var(--mauve)' }}>Partial · 2/4</span>
        </div>
        <div className={styles.taskRow} style={{ fontSize: 11 }}>
          <span>
            Ms. Zara Ahmed · <span style={{ color: 'var(--mauve)' }}>MBA classmate</span>
          </span>
          <span style={{ color: 'var(--mauve)' }}>All events</span>
        </div>
        <div className={styles.taskRow} style={{ fontSize: 11 }}>
          <span>
            Col. Bikram Bajwa · <span style={{ color: 'var(--mauve)' }}>Nana's cousin</span>
          </span>
          <span style={{ color: 'var(--mauve)' }}>Partial · 2/3</span>
        </div>
      </div>
    </div>
  );
}

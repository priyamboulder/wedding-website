import styles from './Mockup.module.css';

export function WorkspacesMockup() {
  return (
    <div className={styles.mockup}>
      <div className={styles.label} style={{ fontSize: 8, color: 'var(--pink)', letterSpacing: 2, marginBottom: 4 }}>
        WORKSPACE · PHOTOGRAPHY
      </div>
      <div className={styles.title} style={{ fontSize: 22, marginBottom: 12 }}>
        Photography
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <span className={`${styles.tab} ${styles.tabActive}`}>Vision &amp; Mood</span>
        <span className={styles.tab}>Group Photos</span>
        <span className={styles.tab}>Album &amp; Gallery</span>
        <span className={styles.tab}>Inspiration</span>
      </div>

      <div
        style={{
          background: 'var(--gold-light)',
          borderRadius: 6,
          padding: '12px 14px',
          marginBottom: 14,
        }}
      >
        <div className={styles.label} style={{ fontSize: 8, color: 'var(--gold)', marginBottom: 2 }}>
          NOT SURE WHERE TO START?
        </div>
        <div className={styles.title} style={{ fontSize: 16 }}>
          Your photography style in 5 questions
        </div>
        <div style={{ fontSize: 10, color: 'var(--mauve)', marginTop: 2 }}>
          We'll turn your answers into a draft brief, style keywords, and a colour palette
        </div>
      </div>

      <div className={styles.title} style={{ fontSize: 15, marginBottom: 8 }}>
        Style keywords
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
        <span className={styles.kw}>+ joyful</span>
        <span className={styles.kw}>+ nostalgic</span>
        <span className={styles.kw}>+ moody</span>
        <span className={styles.kw}>+ film-grain</span>
        <span className={styles.kw}>+ editorial</span>
        <span className={styles.kw}>+ golden-hour</span>
      </div>

      <div className={styles.title} style={{ fontSize: 15, marginBottom: 4 }}>
        Colour &amp; tone
      </div>
      <div style={{ fontSize: 10, color: 'var(--mauve)', marginBottom: 8 }}>
        Slide to see how your photos will feel — same frame, re-graded in real time.
      </div>
      <div
        style={{
          height: 44,
          borderRadius: 4,
          background: 'linear-gradient(90deg, #e8d5c4, #f5dcc8, #d4a890)',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '6px 10px',
        }}
      >
        <span
          style={{
            fontSize: 8,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: 'white',
            background: 'rgba(0,0,0,0.25)',
            padding: '2px 8px',
            borderRadius: 2,
            fontFamily: 'var(--font-syne), sans-serif',
          }}
        >
          SOFTLY EDITORIAL · 55
        </span>
      </div>
    </div>
  );
}

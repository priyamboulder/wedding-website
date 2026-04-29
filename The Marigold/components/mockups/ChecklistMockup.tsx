import styles from './Mockup.module.css';

export function ChecklistMockup() {
  return (
    <div className={styles.mockup}>
      <div className={styles.row} style={{ marginBottom: 14 }}>
        <div className={styles.title} style={{ fontSize: 22 }}>
          Foundation &amp; Vision
        </div>
        <div className={styles.label} style={{ fontSize: 9 }}>
          PHASE 1 OF 13
        </div>
      </div>

      <div className={styles.progress} style={{ marginBottom: 16 }}>
        <div className={styles.progressFill} style={{ width: '0%' }} />
      </div>

      <div className={styles.aiBubble} style={{ marginBottom: 14 }}>
        ✨ Compare 3 florists for mandap decor by end of month
      </div>

      <div className={styles.label} style={{ fontSize: 8, marginBottom: 8 }}>
        COUPLE ALIGNMENT · 0/7
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className={styles.taskRow}>
          <span>Discuss overall wedding vision</span>
          <span className={styles.due}>Apr 27</span>
        </div>
        <div className={styles.taskRow}>
          <span>Align on core values</span>
          <span className={styles.due}>Apr 28</span>
        </div>
        <div className={styles.taskRow}>
          <span>Decide how many events total</span>
          <span className={styles.dueGold}>Apr 29</span>
        </div>
        <div className={styles.taskRow}>
          <span>Agree on tradition lead per ceremony</span>
          <span className={styles.dueGold}>Apr 29</span>
        </div>
      </div>
    </div>
  );
}

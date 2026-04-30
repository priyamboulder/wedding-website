import { Fragment } from 'react';
import styles from './StatsStrip.module.css';

const STATS: Array<[string, string]> = [
  ['582', 'Planning Tasks'],
  ['13', 'Phases'],
  ['12+', 'Vendor Workspaces'],
  ['∞', 'Moodboard Pins'],
  ['1', 'Platform'],
  ['0', 'Spreadsheets'],
];

export function StatsStrip() {
  return (
    <div className={styles.strip}>
      <div className={styles.inner}>
        {[0, 1].map((loop) => (
          <Fragment key={loop}>
            {STATS.map(([num, lbl], i) => (
              <div key={`${loop}-${i}`} className={styles.stat}>
                <span className={styles.num}>{num}</span>
                <span className={styles.lbl}>{lbl}</span>
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

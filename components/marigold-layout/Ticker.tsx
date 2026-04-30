import { Fragment } from 'react';
import styles from './Ticker.module.css';

const MESSAGES = [
  'WELCOME TO THE MARIGOLD',
  'WHERE BRIDEZILLAS & MOMZILLAS UNITE',
  "582 TASKS SO YOU DON'T HAVE TO THINK",
  "YOUR MOM'S OPINIONS? WE HAVE A TAB FOR THAT",
  "VENDOR ROULETTE EXISTS AND YES IT'S AMAZING",
  'SHAGUN POOL TRACKING BECAUSE AUNTY KEEPS SCORE',
];

export function Ticker() {
  return (
    <div className={styles.bar} role="marquee" aria-label="Marigold announcements">
      <div className={styles.inner}>
        {[0, 1].map((loop) => (
          <Fragment key={loop}>
            {MESSAGES.map((msg, i) => (
              <Fragment key={`${loop}-${i}`}>
                <span>{msg}</span>
                <span className={styles.sep}>/</span>
              </Fragment>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

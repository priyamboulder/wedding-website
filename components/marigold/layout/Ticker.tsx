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

const FONT = "var(--font-syne), sans-serif";

export function Ticker() {
  return (
    <div
      role="marquee"
      aria-label="Marigold announcements"
      style={{
        background: 'var(--wine)',
        padding: '9px 0',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          width: 'max-content',
          animation: 'ticker-scroll 35s linear infinite',
        }}
      >
        {[0, 1].map((loop) => (
          <Fragment key={loop}>
            {MESSAGES.map((msg, i) => (
              <Fragment key={`${loop}-${i}`}>
                <span
                  style={{
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: 3,
                    textTransform: 'uppercase',
                    color: 'var(--hot-pink)',
                    marginRight: 50,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {msg}
                </span>
                <span
                  style={{
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: 11,
                    color: 'var(--gold)',
                    marginRight: 50,
                    flexShrink: 0,
                  }}
                >
                  /
                </span>
              </Fragment>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

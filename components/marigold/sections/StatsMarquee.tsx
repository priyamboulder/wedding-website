import { Fragment } from 'react';

const stats = [
  { num: '582', label: 'Tasks' },
  { num: '13', label: 'Phases' },
  { num: '12+', label: 'Vendor Workspaces' },
  { num: '∞', label: 'Moodboard Pins' },
  { num: '1', label: 'Platform' },
  { num: '0', label: 'Spreadsheets' },
];

export function StatsMarquee() {
  return (
    <div
      style={{
        background: 'var(--pink)',
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {stats.map((s, i) => (
        <Fragment key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <span
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: 34,
                fontWeight: 400,
                color: 'white',
              }}
            >
              {s.num}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontSize: 10,
                letterSpacing: 1.5,
                fontWeight: 600,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              {s.label}
            </span>
          </div>
          {i < stats.length - 1 && (
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 20, flexShrink: 0 }}>/</span>
          )}
        </Fragment>
      ))}
    </div>
  );
}

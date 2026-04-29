const stats = [
  { num: '582', label: 'Tasks' },
  { num: '13', label: 'Phases' },
  { num: '12+', label: 'Vendor Workspaces' },
  { num: '∞', label: 'Moodboard Pins' },
  { num: '1', label: 'Platform' },
  { num: '0', label: 'Spreadsheets' },
];

export function StatsMarquee() {
  const items = [...stats, ...stats];
  return (
    <div className="overflow-hidden bg-pink py-6">
      <div
        className="flex flex-shrink-0 whitespace-nowrap"
        style={{ animation: 'marquee 20s linear infinite', gap: 70 }}
      >
        {items.map((s, i) => (
          <div
            key={i}
            className="flex flex-shrink-0 items-center gap-3 text-white"
            style={{ paddingRight: 0 }}
          >
            <span className="font-serif" style={{ fontSize: 34, fontWeight: 400 }}>
              {s.num}
            </span>
            <span
              className="font-syne uppercase"
              style={{
                fontSize: 10,
                letterSpacing: 1.5,
                fontWeight: 600,
                opacity: 0.7,
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

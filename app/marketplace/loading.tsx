export default function MarketplaceLoading() {
  return (
    <div style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Filter bar skeleton */}
      <div style={{ display: "flex", gap: 12, marginBottom: 40, flexWrap: "wrap" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{ height: 36, width: 100 + i * 20, borderRadius: 100, background: "#E8E4DC", animation: "pulse 1.5s ease-in-out infinite" }}
          />
        ))}
      </div>

      {/* Card grid skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{ borderRadius: 12, overflow: "hidden", background: "#F0EBE3" }}>
            <div style={{ aspectRatio: "16/10", background: "#E0D9CF", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ padding: "16px" }}>
              <div style={{ height: 16, width: "70%", background: "#E0D9CF", borderRadius: 4, marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ height: 12, width: "40%", background: "#E8E2D8", borderRadius: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default function StudioLoading() {
  return (
    <div style={{ display: "flex", height: "100vh", background: "#0F0F0F" }}>
      {/* Sidebar skeleton */}
      <div style={{ width: 240, borderRight: "1px solid #1F1F1F", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ height: 36, borderRadius: 8, background: "#1A1A1A", animation: "pulse 1.5s ease-in-out infinite" }} />
        ))}
      </div>

      {/* Main area skeleton */}
      <div style={{ flex: 1, padding: "40px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ height: 32, width: 220, background: "#1A1A1A", borderRadius: 6, animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ aspectRatio: "16/10", borderRadius: 10, background: "#1A1A1A", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

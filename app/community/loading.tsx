export default function CommunityLoading() {
  return (
    <div style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ height: 40, width: 280, background: "#E8E4DC", borderRadius: 6, marginBottom: 12, animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ height: 20, width: 440, background: "#EFE9E0", borderRadius: 4, marginBottom: 48, animation: "pulse 1.5s ease-in-out infinite" }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ borderRadius: 12, background: "#E8E2D8", height: 260, animation: "pulse 1.5s ease-in-out infinite" }} />
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

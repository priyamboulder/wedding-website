import VenueTopNav from "@/components/venue/VenueTopNav";

export const metadata = {
  title: "Venue — Ananya",
};

export default function VenueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#FAF8F5",
        color: "#2C2C2C",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <VenueTopNav />
      <main className="pb-24">{children}</main>
    </div>
  );
}

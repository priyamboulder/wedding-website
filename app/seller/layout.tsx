import SellerTopBar from "@/components/seller/SellerTopBar";

export default function SellerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#FAF8F5",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: "#2C2C2C",
      }}
    >
      <SellerTopBar />
      <main>{children}</main>
    </div>
  );
}

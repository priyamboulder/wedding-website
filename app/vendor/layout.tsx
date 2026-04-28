import VendorSidebar from "@/components/vendor-portal/VendorSidebar";
import VendorTopBar from "@/components/vendor-portal/VendorTopBar";

export default function VendorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: "#FAF8F5",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#2C2C2C",
      }}
    >
      <VendorSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <VendorTopBar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

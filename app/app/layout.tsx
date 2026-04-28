import PortalSidebar from "@/components/portal-hub/PortalSidebar";

export default function CouplePortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#FFFFF0" }}>
      <PortalSidebar portalId="couple" />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

import PlannerTopNav from "@/components/planner/PlannerTopNav";

export const metadata = {
  title: "Planner — Ananya",
};

export default function PlannerLayout({
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
      <PlannerTopNav />
      <main className="pb-24">{children}</main>
    </div>
  );
}

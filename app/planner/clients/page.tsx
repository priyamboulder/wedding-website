import ClientsBoard from "@/components/planner/clients/ClientsBoard";

export const metadata = {
  title: "Clients — Planner · Ananya",
};

export default function PlannerClientsPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-8 py-10">
      <ClientsBoard />
    </div>
  );
}

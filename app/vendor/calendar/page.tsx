import CalendarClient from "@/components/vendor-portal/calendar/CalendarClient";
import { PageHeader } from "@/components/vendor-portal/ui";
import { CALENDAR_ENTRIES } from "@/lib/vendor-portal/seed";

const DEMO_TODAY = "2026-04-20";

export default function VendorCalendarPage() {
  return (
    <div className="pb-24 md:pb-16">
      <PageHeader
        eyebrow="Calendar"
        title="Your studio schedule"
        description="Weddings, tasks, consultations, and blocked time — everything across your active couples, in one view."
      />
      <CalendarClient initialEntries={CALENDAR_ENTRIES} today={DEMO_TODAY} />
    </div>
  );
}

import { cn } from "@/lib/utils";
import type { PartnershipStatus } from "@/types/partnership";
import { STATUS_LABEL } from "@/types/partnership";

const TONE: Record<PartnershipStatus, string> = {
  pending: "bg-saffron/15 text-saffron border-saffron/30",
  negotiating: "bg-rose/15 text-rose border-rose/30",
  accepted: "bg-teal/15 text-teal border-teal/30",
  in_progress: "bg-teal/15 text-teal border-teal/30",
  delivered: "bg-gold-pale/40 text-gold border-gold/30",
  approved: "bg-sage/15 text-sage border-sage/30",
  completed: "bg-sage/15 text-sage border-sage/30",
  cancelled: "bg-ink-faint/10 text-ink-muted border-border",
  declined: "bg-rose/10 text-rose border-rose/20",
};

export function StatusBadge({
  status,
  className,
}: {
  status: PartnershipStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.18em]",
        TONE[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

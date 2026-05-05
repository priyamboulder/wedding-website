// ── GradientCard ────────────────────────────────────────────────────────────
// Warm gold-to-pink gradient card used by the angle selector, the path
// selector on /share, and other key feature cards.

import { cn } from "@/lib/utils";

type Variant = "gold-pink" | "rose-saffron" | "ivory" | "wine";

const VARIANT_BG: Record<Variant, string> = {
  "gold-pink":
    "bg-[linear-gradient(135deg,#F0E4C8_0%,#F5E0D6_45%,#F5E6C8_100%)]",
  "rose-saffron":
    "bg-[linear-gradient(135deg,#F5E0D6_0%,#F5E6C8_60%,#FBF9F4_100%)]",
  ivory:
    "bg-[linear-gradient(135deg,#FBF9F4_0%,#F5F1E8_100%)]",
  wine:
    "bg-[linear-gradient(135deg,#7E1F3D_0%,#5A1A2E_100%)] text-ivory",
};

export function GradientCard({
  children,
  variant = "gold-pink",
  className,
  selected,
  as: Comp = "div",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
  selected?: boolean;
  as?: any;
}) {
  return (
    <Comp
      {...rest}
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all",
        VARIANT_BG[variant],
        selected
          ? "border-gold shadow-[0_0_0_2px_rgba(184,134,11,0.35)]"
          : "border-gold/20 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[0_8px_24px_-12px_rgba(184,134,11,0.4)]",
        className,
      )}
    >
      {/* Subtle texture overlay */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.6) 0%, transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(184,134,11,0.18) 0%, transparent 60%)",
        }}
      />
      <div className="relative">{children}</div>
    </Comp>
  );
}

import type { LogoProps } from "@/types/logo";
import { LOGO_INK } from "@/types/logo";

const displaySerif = "'Fraunces', 'Didot', 'Bodoni 72', Georgia, serif";

// Gizelle — tall condensed high-contrast serif, single line, all caps,
// tracked. "& " between names, editorial feel.
export function Gizelle({ names, connector = "&", color = LOGO_INK }: LogoProps) {
  const [first, second] = names;
  return (
    <svg
      viewBox="0 0 880 220"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Gizelle logo — ${first} ${connector} ${second}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <text
        x="440"
        y="140"
        textAnchor="middle"
        fontFamily={displaySerif}
        fontSize="84"
        fontWeight="500"
        letterSpacing="6"
        fill={color}
        style={{ fontStretch: "condensed" as const, fontVariant: "small-caps" }}
      >
        {first.toUpperCase()}
        <tspan dx="24" dy="0" fontStyle="italic" fontWeight="300" letterSpacing="0">
          {connector}
        </tspan>
        <tspan dx="24" dy="0">{second.toUpperCase()}</tspan>
      </text>

      <line x1="220" y1="170" x2="660" y2="170" stroke={color} strokeWidth="0.75" opacity="0.35" />
    </svg>
  );
}

export default Gizelle;

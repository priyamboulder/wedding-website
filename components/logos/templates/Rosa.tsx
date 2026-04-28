import type { LogoProps } from "@/types/logo";
import { LOGO_INK } from "@/types/logo";

const serif = "'Fraunces', Georgia, serif";

// Rosa — small tracked caps with italic "and" ligature, flanked by dot
// bullets. Quiet, refined, masthead-style.
export function Rosa({ names, connector = "and", color = LOGO_INK }: LogoProps) {
  const [first, second] = names;
  return (
    <svg
      viewBox="0 0 880 180"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Rosa logo — ${first} ${connector} ${second}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <circle cx="120" cy="90" r="4" fill={color} />

      <text
        x="440"
        y="102"
        textAnchor="middle"
        fontFamily={serif}
        fontSize="30"
        fontWeight="500"
        letterSpacing="10"
        fill={color}
      >
        {first.toUpperCase()}
        <tspan
          dx="16"
          dy="0"
          fontStyle="italic"
          fontWeight="400"
          letterSpacing="2"
          fontSize="30"
        >
          {connector.toLowerCase()}
        </tspan>
        <tspan dx="16" dy="0">{second.toUpperCase()}</tspan>
      </text>

      <circle cx="760" cy="90" r="4" fill={color} />
    </svg>
  );
}

export default Rosa;

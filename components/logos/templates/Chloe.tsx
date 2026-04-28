import type { LogoProps } from "@/types/logo";
import { LOGO_INK } from "@/types/logo";

const script = "'Dancing Script', 'Allura', 'Great Vibes', cursive";

// Chloe — lowercase script, names side-by-side with a thin vertical rule
// between them. Gentle, editorial-casual.
export function Chloe({ names, connector = "|", color = LOGO_INK }: LogoProps) {
  const [first, second] = names;
  return (
    <svg
      viewBox="0 0 820 280"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Chloe logo — ${first} ${connector} ${second}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <text
        x="300"
        y="180"
        textAnchor="middle"
        fontFamily={script}
        fontSize="110"
        fontWeight="500"
        fill={color}
      >
        {first.toLowerCase()}
      </text>

      {connector === "|" ? (
        <line x1="410" y1="90" x2="410" y2="220" stroke={color} strokeWidth="1" opacity="0.6" />
      ) : (
        <text
          x="410"
          y="180"
          textAnchor="middle"
          fontFamily={script}
          fontSize="60"
          fontWeight="400"
          fill={color}
          opacity="0.75"
        >
          {connector}
        </text>
      )}

      <text
        x="520"
        y="180"
        textAnchor="middle"
        fontFamily={script}
        fontSize="110"
        fontWeight="500"
        fill={color}
      >
        {second.toLowerCase()}
      </text>
    </svg>
  );
}

export default Chloe;

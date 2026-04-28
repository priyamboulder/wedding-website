import type { LogoProps } from "@/types/logo";
import { LOGO_INK } from "@/types/logo";

const displaySerif = "'Fraunces', 'Didot', 'Playfair Display', Georgia, serif";

// Rowan — bold display serif, stacked on three lines. Names top and bottom,
// "AND" tracked small-caps on the middle line. Strong editorial feel.
export function Rowan({ names, connector = "and", color = LOGO_INK }: LogoProps) {
  const [first, second] = names;
  return (
    <svg
      viewBox="0 0 640 480"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Rowan logo — ${first} ${connector} ${second}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <text
        x="320"
        y="180"
        textAnchor="middle"
        fontFamily={displaySerif}
        fontSize="108"
        fontWeight="700"
        letterSpacing="4"
        fill={color}
      >
        {first.toUpperCase()}
      </text>

      <text
        x="320"
        y="262"
        textAnchor="middle"
        fontFamily={displaySerif}
        fontSize="22"
        fontWeight="500"
        letterSpacing="10"
        fill={color}
        opacity="0.7"
      >
        {connector.toUpperCase()}
      </text>

      <text
        x="320"
        y="360"
        textAnchor="middle"
        fontFamily={displaySerif}
        fontSize="108"
        fontWeight="700"
        letterSpacing="4"
        fill={color}
      >
        {second.toUpperCase()}
      </text>
    </svg>
  );
}

export default Rowan;

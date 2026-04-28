import type { LogoProps } from "@/types/logo";
import { LOGO_INK } from "@/types/logo";

const script = "'Dancing Script', 'Snell Roundhand', 'Great Vibes', cursive";
const serif = "'Fraunces', Georgia, serif";

// Lisbeth — flowing handwritten script, names stacked on two lines with a
// small italic-serif "and" between them. Names offset left/right for rhythm.
export function Lisbeth({ names, connector = "and", color = LOGO_INK }: LogoProps) {
  const [first, second] = names;
  return (
    <svg
      viewBox="0 0 720 400"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Lisbeth logo — ${first} ${connector} ${second}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <text
        x="240"
        y="180"
        textAnchor="middle"
        fontFamily={script}
        fontSize="128"
        fontWeight="500"
        fill={color}
      >
        {first}
      </text>

      <text
        x="360"
        y="230"
        textAnchor="middle"
        fontFamily={serif}
        fontSize="30"
        fontStyle="italic"
        fill={color}
        opacity="0.75"
      >
        {connector}
      </text>

      <text
        x="480"
        y="312"
        textAnchor="middle"
        fontFamily={script}
        fontSize="128"
        fontWeight="500"
        fill={color}
      >
        {second}
      </text>
    </svg>
  );
}

export default Lisbeth;

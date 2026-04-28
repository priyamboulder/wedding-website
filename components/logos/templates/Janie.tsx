import type { LogoProps } from "@/types/logo";
import { LOGO_INK } from "@/types/logo";

const serif = "'Fraunces', Georgia, serif";

// Janie — light serif stacked, thin horizontal rules top and bottom, "AND"
// in tracked small caps on the middle line. Generous spacing, heirloom feel.
export function Janie({ names, connector = "and", color = LOGO_INK }: LogoProps) {
  const [first, second] = names;
  return (
    <svg
      viewBox="0 0 720 420"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Janie logo — ${first} ${connector} ${second}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <line x1="180" y1="80" x2="540" y2="80" stroke={color} strokeWidth="1" opacity="0.55" />

      <text
        x="360"
        y="170"
        textAnchor="middle"
        fontFamily={serif}
        fontSize="72"
        fontWeight="300"
        letterSpacing="2"
        fill={color}
      >
        {first.toUpperCase()}
      </text>

      <text
        x="360"
        y="232"
        textAnchor="middle"
        fontFamily={serif}
        fontSize="18"
        fontWeight="500"
        letterSpacing="10"
        fill={color}
        opacity="0.65"
      >
        {connector.toUpperCase()}
      </text>

      <text
        x="360"
        y="310"
        textAnchor="middle"
        fontFamily={serif}
        fontSize="72"
        fontWeight="300"
        letterSpacing="2"
        fill={color}
      >
        {second.toUpperCase()}
      </text>

      <line x1="180" y1="350" x2="540" y2="350" stroke={color} strokeWidth="1" opacity="0.55" />
    </svg>
  );
}

export default Janie;

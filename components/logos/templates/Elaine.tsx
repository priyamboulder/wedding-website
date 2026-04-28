import type { LogoProps } from "@/types/logo";
import { LOGO_INK } from "@/types/logo";

const script = "'Dancing Script', 'Snell Roundhand', 'Great Vibes', cursive";
const serif = "'Fraunces', Georgia, serif";

// Elaine — stacked script names on the left, thin vertical rule, small
// botanical sprig on the right. Italic-serif connector between the names.
export function Elaine({ names, connector = "and", color = LOGO_INK }: LogoProps) {
  const [first, second] = names;
  return (
    <svg
      viewBox="0 0 720 400"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Elaine logo — ${first} ${connector} ${second}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <text
        x="300"
        y="160"
        textAnchor="middle"
        fontFamily={script}
        fontSize="96"
        fontWeight="500"
        fill={color}
      >
        {first}
      </text>

      <text
        x="300"
        y="212"
        textAnchor="middle"
        fontFamily={serif}
        fontSize="26"
        fontStyle="italic"
        fill={color}
        opacity="0.75"
      >
        {connector}
      </text>

      <text
        x="300"
        y="300"
        textAnchor="middle"
        fontFamily={script}
        fontSize="96"
        fontWeight="500"
        fill={color}
      >
        {second}
      </text>

      <line
        x1="500"
        y1="110"
        x2="500"
        y2="310"
        stroke={color}
        strokeWidth="1"
        opacity="0.55"
      />

      {/* Botanical sprig — hand-drawn feel */}
      <g
        transform="translate(560 210)"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.85"
      >
        <path d="M0 -90 C -4 -40, -4 30, 0 90" />
        <path d="M0 -60 C 14 -70, 26 -66, 36 -54" />
        <path d="M0 -30 C -14 -40, -26 -34, -34 -22" />
        <path d="M0 0 C 16 -6, 30 0, 38 14" />
        <path d="M0 30 C -16 24, -30 28, -36 42" />
        <path d="M0 60 C 14 58, 24 66, 30 80" />
        <ellipse cx="32" cy="-46" rx="7" ry="3" transform="rotate(-30 32 -46)" fill={color} opacity="0.75" stroke="none" />
        <ellipse cx="-30" cy="-16" rx="7" ry="3" transform="rotate(30 -30 -16)" fill={color} opacity="0.75" stroke="none" />
        <ellipse cx="34" cy="18" rx="7" ry="3" transform="rotate(-30 34 18)" fill={color} opacity="0.75" stroke="none" />
        <ellipse cx="-32" cy="46" rx="7" ry="3" transform="rotate(30 -32 46)" fill={color} opacity="0.75" stroke="none" />
      </g>
    </svg>
  );
}

export default Elaine;

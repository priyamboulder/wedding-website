import type { MonogramProps } from "@/types/monogram";
import { MONOGRAM_INK } from "@/types/monogram";

const serif = "'Fraunces', Georgia, serif";
const mono = "'JetBrains Mono', 'Menlo', monospace";

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export function Rose({ initials, date, location, color = MONOGRAM_INK }: MonogramProps) {
  const [a, b] = initials;
  return (
    <svg
      viewBox="0 0 640 400"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Rose monogram — ${a} and ${b}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      {location && (
        <text
          x="320"
          y="90"
          textAnchor="middle"
          fontFamily={mono}
          fontSize="13"
          letterSpacing="4"
          fill={color}
          opacity="0.7"
        >
          {location.toUpperCase()}
        </text>
      )}

      <text
        x="320"
        y="245"
        textAnchor="middle"
        fontFamily={serif}
        fontSize="180"
        fontWeight="400"
        fill={color}
        style={{ fontStyle: "italic" as const }}
      >
        {a}
        <tspan fontWeight="300" fontStyle="normal" dx="-4" dy="0">&amp;</tspan>
        {b}
      </text>

      <g transform="translate(320 320)">
        <rect
          x="-95"
          y="-19"
          width="190"
          height="38"
          rx="19"
          ry="19"
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity="0.8"
        />
        <text
          x="0"
          y="6"
          textAnchor="middle"
          fontFamily={mono}
          fontSize="13"
          letterSpacing="3"
          fill={color}
        >
          {formatDate(date)}
        </text>
      </g>
    </svg>
  );
}

export default Rose;

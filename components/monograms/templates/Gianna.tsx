import type { MonogramProps } from "@/types/monogram";
import { MONOGRAM_INK } from "@/types/monogram";

const serif = "'Fraunces', Georgia, serif";
const mono = "'JetBrains Mono', 'Menlo', monospace";

const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL",
  "MAY", "JUNE", "JULY", "AUGUST",
  "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

export function Gianna({ initials, date, color = MONOGRAM_INK }: MonogramProps) {
  const [a, b] = initials;
  const month = MONTHS[date.getMonth()];
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear());

  return (
    <svg
      viewBox="0 0 640 400"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Gianna monogram — ${a} and ${b}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <line
        x1="220"
        x2="420"
        y1="140"
        y2="140"
        stroke={color}
        strokeWidth="0.75"
        opacity="0.35"
      />
      <line
        x1="220"
        x2="420"
        y1="290"
        y2="290"
        stroke={color}
        strokeWidth="0.75"
        opacity="0.35"
      />

      <text
        x="140"
        y="250"
        textAnchor="middle"
        fontFamily={serif}
        fontSize="180"
        fontWeight="400"
        fill={color}
      >
        {a}
      </text>

      <g>
        <text
          x="320"
          y="180"
          textAnchor="middle"
          fontFamily={mono}
          fontSize="13"
          letterSpacing="5"
          fill={color}
        >
          {month}
        </text>
        <text
          x="320"
          y="240"
          textAnchor="middle"
          fontFamily={serif}
          fontSize="52"
          fontWeight="400"
          fill={color}
        >
          {day}
        </text>
        <text
          x="320"
          y="275"
          textAnchor="middle"
          fontFamily={mono}
          fontSize="13"
          letterSpacing="5"
          fill={color}
        >
          {year}
        </text>
      </g>

      <text
        x="500"
        y="250"
        textAnchor="middle"
        fontFamily={serif}
        fontSize="180"
        fontWeight="400"
        fill={color}
      >
        {b}
      </text>
    </svg>
  );
}

export default Gianna;

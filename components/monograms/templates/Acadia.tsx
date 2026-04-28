import type { MonogramProps } from "@/types/monogram";
import { MONOGRAM_INK } from "@/types/monogram";

const serif = "'Fraunces', Georgia, serif";
const mono = "'JetBrains Mono', 'Menlo', monospace";

export function Acadia({ initials, date, color = MONOGRAM_INK }: MonogramProps) {
  const [a, b] = initials;
  const year = String(date.getFullYear());

  return (
    <svg
      viewBox="0 0 640 400"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Acadia monogram — ${a} and ${b}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <text
        x="140"
        y="250"
        textAnchor="middle"
        fontFamily={serif}
        fontSize="170"
        fontWeight="700"
        fill={color}
      >
        {a}
      </text>

      <text
        x="320"
        y="275"
        textAnchor="middle"
        fontFamily={serif}
        fontSize="300"
        fontWeight="400"
        fill={color}
        style={{ fontStyle: "italic" as const }}
      >
        &amp;
      </text>

      <text
        x="500"
        y="250"
        textAnchor="middle"
        fontFamily={serif}
        fontSize="170"
        fontWeight="700"
        fill={color}
      >
        {b}
      </text>

      <text
        x="320"
        y="355"
        textAnchor="middle"
        fontFamily={mono}
        fontSize="12"
        letterSpacing="6"
        fill={color}
        opacity="0.75"
      >
        EST. {year}
      </text>
    </svg>
  );
}

export default Acadia;

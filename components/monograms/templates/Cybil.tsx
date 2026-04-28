import type { MonogramProps } from "@/types/monogram";
import { MONOGRAM_INK } from "@/types/monogram";

const serif = "'Fraunces', Georgia, serif";
const mono = "'JetBrains Mono', 'Menlo', monospace";

export function Cybil({ initials, date, color = MONOGRAM_INK }: MonogramProps) {
  const [a, b] = initials;
  const year = String(date.getFullYear());

  return (
    <svg
      viewBox="0 0 640 400"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Cybil monogram — ${a} and ${b}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <ellipse
        cx="320"
        cy="200"
        rx="220"
        ry="140"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.9"
      />
      <ellipse
        cx="320"
        cy="200"
        rx="200"
        ry="122"
        fill="none"
        stroke={color}
        strokeWidth="0.5"
        opacity="0.6"
      />

      <text
        x="260"
        y="245"
        textAnchor="middle"
        fontFamily={serif}
        fontSize="150"
        fontWeight="400"
        fill={color}
        style={{ fontStyle: "italic" as const }}
      >
        {a}
      </text>
      <text
        x="380"
        y="245"
        textAnchor="middle"
        fontFamily={serif}
        fontSize="150"
        fontWeight="400"
        fill={color}
        style={{ fontStyle: "italic" as const }}
      >
        {b}
      </text>

      <text
        x="320"
        y="200"
        textAnchor="middle"
        fontFamily={serif}
        fontSize="36"
        fontWeight="300"
        fill={color}
        opacity="0.55"
      >
        &amp;
      </text>

      <text
        x="320"
        y="370"
        textAnchor="middle"
        fontFamily={mono}
        fontSize="11"
        letterSpacing="5"
        fill={color}
        opacity="0.75"
      >
        ANNO {year}
      </text>
    </svg>
  );
}

export default Cybil;

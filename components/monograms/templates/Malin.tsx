import type { MonogramProps } from "@/types/monogram";
import { MONOGRAM_INK } from "@/types/monogram";

const serif = "'Fraunces', Georgia, serif";
const mono = "'JetBrains Mono', 'Menlo', monospace";

export function Malin({ names, date, location, color = MONOGRAM_INK }: MonogramProps) {
  const [first, second] = names;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());

  const archId = "malin-arch";

  return (
    <svg
      viewBox="0 0 640 400"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Malin monogram — ${first} and ${second}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <path id={archId} d="M 100 220 A 240 160 0 0 1 540 220" fill="none" />
      </defs>

      <text
        fontFamily={serif}
        fontSize="30"
        fill={color}
        letterSpacing="6"
        style={{ fontStyle: "italic" as const }}
      >
        <textPath href={`#${archId}`} startOffset="50%" textAnchor="middle">
          {first.toLowerCase()} · {second.toLowerCase()}
        </textPath>
      </text>

      <text
        x="320"
        y="240"
        textAnchor="middle"
        fontFamily={serif}
        fontSize="130"
        fontWeight="500"
        fill={color}
      >
        &amp;
      </text>

      <line
        x1="170"
        x2="470"
        y1="290"
        y2="290"
        stroke={color}
        strokeWidth="0.75"
        opacity="0.6"
      />
      {location && (
        <text
          x="320"
          y="295"
          textAnchor="middle"
          fontFamily={mono}
          fontSize="11"
          letterSpacing="5"
          fill={color}
          style={{ paintOrder: "stroke fill" as const }}
        >
          <tspan dy="-1" fill="#F5F1EA" stroke="#F5F1EA" strokeWidth="10">
            {location.toUpperCase()}
          </tspan>
        </text>
      )}
      {location && (
        <text
          x="320"
          y="295"
          textAnchor="middle"
          fontFamily={mono}
          fontSize="11"
          letterSpacing="5"
          fill={color}
        >
          {location.toUpperCase()}
        </text>
      )}

      <text
        x="110"
        y="355"
        fontFamily={mono}
        fontSize="12"
        letterSpacing="3"
        fill={color}
        opacity="0.8"
      >
        {day} {month}
      </text>
      <text
        x="530"
        y="355"
        textAnchor="end"
        fontFamily={mono}
        fontSize="12"
        letterSpacing="3"
        fill={color}
        opacity="0.8"
      >
        {year}
      </text>
    </svg>
  );
}

export default Malin;

import type { MonogramProps } from "@/types/monogram";
import { MONOGRAM_INK } from "@/types/monogram";

const serif = "'Fraunces', Georgia, serif";

export function Chloe({ names, color = MONOGRAM_INK }: MonogramProps) {
  const [first, second] = names;
  const circleId = "chloe-orbit";
  const orbit = `${first.toLowerCase()}  ◦  ${second.toLowerCase()}  ◦  `;

  return (
    <svg
      viewBox="0 0 640 400"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Chloe monogram — ${first} and ${second}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <path
          id={circleId}
          d="M 320 60 a 140 140 0 1 1 -0.01 0"
          fill="none"
        />
      </defs>

      <circle
        cx="320"
        cy="200"
        r="140"
        fill="none"
        stroke={color}
        strokeWidth="0.5"
        opacity="0.3"
      />

      <text
        fontFamily={serif}
        fontSize="28"
        fill={color}
        letterSpacing="2"
        style={{ fontStyle: "italic" as const }}
      >
        <textPath href={`#${circleId}`} startOffset="0%">
          {orbit + orbit}
        </textPath>
      </text>

      <circle cx="320" cy="200" r="4" fill={color} />
    </svg>
  );
}

export default Chloe;

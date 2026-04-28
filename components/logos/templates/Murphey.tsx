import type { LogoProps } from "@/types/logo";
import { LOGO_INK } from "@/types/logo";

const script = "'Caveat', 'Homemade Apple', 'Kalam', 'Segoe Script', cursive";

// Murphey — casual handwritten script, stacked on two lines with a small
// asterisk/star mark between them.
export function Murphey({ names, connector = "*", color = LOGO_INK }: LogoProps) {
  const [first, second] = names;
  return (
    <svg
      viewBox="0 0 640 400"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Murphey logo — ${first} ${connector} ${second}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <text
        x="320"
        y="150"
        textAnchor="middle"
        fontFamily={script}
        fontSize="100"
        fontWeight="600"
        fill={color}
      >
        {first}
      </text>

      <g transform="translate(320 220)" fill={color}>
        {connector === "*" ? (
          <g>
            <path d="M0 -18 L4 -6 L16 -6 L6 2 L10 14 L0 6 L-10 14 L-6 2 L-16 -6 L-4 -6 Z" />
          </g>
        ) : (
          <text
            textAnchor="middle"
            fontFamily={script}
            fontSize="36"
            dy="6"
          >
            {connector}
          </text>
        )}
      </g>

      <text
        x="320"
        y="310"
        textAnchor="middle"
        fontFamily={script}
        fontSize="100"
        fontWeight="600"
        fill={color}
      >
        {second}
      </text>
    </svg>
  );
}

export default Murphey;

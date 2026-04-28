import type { LogoProps } from "@/types/logo";
import { LOGO_INK } from "@/types/logo";

const deco = "'Fraunces', 'Didot', 'Bodoni 72', 'Playfair Display', Georgia, serif";

// Royal — Art Deco display serif, names stacked with a decorative overlap
// between the last letter of the first name and the first letter of the
// second. High-contrast with a stylized ampersand on the side.
export function Royal({ names, connector = "&", color = LOGO_INK }: LogoProps) {
  const [first, second] = names;
  return (
    <svg
      viewBox="0 0 720 420"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Royal logo — ${first} ${connector} ${second}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      {/* Deco border frame */}
      <g fill="none" stroke={color} strokeWidth="1" opacity="0.4">
        <line x1="100" y1="80" x2="620" y2="80" />
        <line x1="100" y1="340" x2="620" y2="340" />
        <line x1="100" y1="80" x2="100" y2="100" />
        <line x1="620" y1="80" x2="620" y2="100" />
        <line x1="100" y1="340" x2="100" y2="320" />
        <line x1="620" y1="340" x2="620" y2="320" />
      </g>

      {/* First name — hangs slightly left */}
      <text
        x="290"
        y="190"
        textAnchor="middle"
        fontFamily={deco}
        fontSize="84"
        fontWeight="700"
        letterSpacing="2"
        fill={color}
      >
        {first.toUpperCase()}
      </text>

      {/* Overlap glyph — rendered faintly behind the seam between the two names */}
      <text
        x="360"
        y="230"
        textAnchor="middle"
        fontFamily={deco}
        fontSize="120"
        fontWeight="400"
        fill={color}
        opacity="0.12"
      >
        {first.slice(-1).toUpperCase()}{second.slice(0, 1).toUpperCase()}
      </text>

      {/* Second name — hangs slightly right, overlapping upward */}
      <text
        x="430"
        y="270"
        textAnchor="middle"
        fontFamily={deco}
        fontSize="84"
        fontWeight="700"
        letterSpacing="2"
        fill={color}
      >
        {second.toUpperCase()}
      </text>

      {/* Stylized ampersand off to the side */}
      <text
        x="620"
        y="250"
        textAnchor="middle"
        fontFamily={deco}
        fontSize="64"
        fontWeight="300"
        fontStyle="italic"
        fill={color}
        opacity="0.75"
      >
        {connector}
      </text>
    </svg>
  );
}

export default Royal;

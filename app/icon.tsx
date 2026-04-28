import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#1a1208",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 18,
            fontWeight: 400,
            color: "#C9A34E",
            fontStyle: "italic",
            letterSpacing: "-0.5px",
          }}
        >
          A
        </div>
      </div>
    ),
    { ...size },
  );
}

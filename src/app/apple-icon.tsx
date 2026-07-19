import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
        }}
      >
        <svg width="130" height="130" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M11 37V15c0-.9.73-1.6 1.6-1.6.64 0 1.2.36 1.47.93L24 31 33.93 14.33A1.6 1.6 0 0 1 35.4 13.4c.87 0 1.6.72 1.6 1.6V37"
            stroke="#ffffff"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M37 25c3.7-.5 6.8 1 6.8 4.6 0 3.6-2.9 5.6-6.8 5.6-.2-3.6 1.3-6.8 4.1-8.2"
            fill="#22c55e"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0D0D11",
          borderRadius: "8px",
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sun Arc (Orange) */}
          <path
            d="M 8 17 A 8 8 0 0 1 24 17"
            stroke="#F05A28"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Head */}
          <circle cx="16" cy="13.5" r="1.8" fill="#FFFFFF" />
          {/* Raised Arms */}
          <path
            d="M 11.8 11.2 L 14.8 15 M 20.2 11.2 L 17.2 15"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Body & Mountain Peaks */}
          <path
            d="M 3 24 L 9 17 C 11.2 14.5 13 18.5 16 21 C 19 18.5 20.8 14.5 23 17 L 29 24 C 23.5 24 20.5 20 16 21.8 C 11.5 20 8.5 24 3 24 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}

import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function WorshipMountLogo({ className = "", showText = true, size = "md" }: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Emblem SVG */}
      <svg
        className={`${iconSizes[size]} flex-shrink-0`}
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
        <circle cx="16" cy="13.5" r="1.8" fill="currentColor" />

        {/* Raised Arms */}
        <path
          d="M 11.8 11.2 L 14.8 15 M 20.2 11.2 L 17.2 15"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Body & Mountain Peaks */}
        <path
          d="M 3 24 L 9 17 C 11.2 14.5 13 18.5 16 21 C 19 18.5 20.8 14.5 23 17 L 29 24 C 23.5 24 20.5 20 16 21.8 C 11.5 20 8.5 24 3 24 Z"
          fill="currentColor"
        />
      </svg>

      {/* Typography */}
      {showText && (
        <span className="font-bold tracking-wider uppercase text-lg sm:text-xl font-sans">
          <span className="text-[var(--color-text)] font-extrabold">WORSHIP </span>
          <span className="text-[#F05A28] font-extrabold">MOUNT</span>
        </span>
      )}
    </div>
  );
}

import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function WorshipMountLogo({ className = "", size = "md" }: LogoProps) {
  const heights = {
    sm: "h-8",
    md: "h-11",
    lg: "h-16",
  };

  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src="/logo.png"
        alt="Worship Mount"
        className={`${heights[size]} w-auto object-contain`}
      />
    </div>
  );
}

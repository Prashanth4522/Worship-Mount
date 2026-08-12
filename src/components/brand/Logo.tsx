import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function WorshipMountLogo({ className = "", size = "md", showText = true }: LogoProps) {
  const iconSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblem icon (cropped to top 75% of logo image for sharpness) */}
      <div className={`${iconSizes[size]} overflow-hidden flex-shrink-0 flex items-center justify-center`}>
        <img
          src="/logo.png"
          alt="Worship Mount Emblem"
          className="w-full h-[140%] object-cover object-top"
        />
      </div>

      {showText && (
        <span className="font-extrabold tracking-wider uppercase text-lg sm:text-xl font-sans text-[var(--color-text)]">
          WORSHIP <span className="text-[#F05A28]">MOUNT</span>
        </span>
      )}
    </div>
  );
}

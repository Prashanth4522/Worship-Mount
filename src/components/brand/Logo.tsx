import React from "react";
import Image from "next/image";

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
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Header Logo Emblem */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0`}>
        <Image
          src="/header-logo.png"
          alt="Worship Mount Emblem"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 56px, 56px"
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

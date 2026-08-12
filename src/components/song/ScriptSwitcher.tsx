"use client";

import { ScriptMode } from "@/lib/types";

interface ScriptSwitcherProps {
  modes: { id: string; language: ScriptMode; label: string }[];
  activeId: string;
  onSwitch: (id: string) => void;
}

export function ScriptSwitcher({ modes, activeId, onSwitch }: ScriptSwitcherProps) {
  return (
    <div className="mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <div className="inline-flex items-center rounded-xl glass p-1 gap-0.5">
        {modes.map((mode) => {
          const isActive = mode.id === activeId;
          return (
            <button
              key={mode.id}
              onClick={() => onSwitch(mode.id)}
              className={`
                relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${
                  isActive
                    ? "bg-[var(--color-accent)] text-black shadow-lg shadow-amber-500/20"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
                }
              `}
              id={`script-tab-${mode.language}`}
              aria-pressed={isActive}
            >
              {mode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

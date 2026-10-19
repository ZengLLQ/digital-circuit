import React from "react";
import { Layers, HelpCircle, RotateCcw } from "lucide-react";

interface HeaderProps {
  numVars: number;
  onSelectVars: (vars: number) => void;
  showGroups: boolean;
  onToggleShowGroups: () => void;
  onReset: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  numVars,
  onSelectVars,
  showGroups,
  onToggleShowGroups,
  onReset,
  onOpenHelp,
}) => {
  return (
    <header className="h-14 border-b border-[#202228] bg-[#121316]/95 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#18191e] border border-[#272932] p-1 flex items-center justify-center shadow-xs">
          <img src="/logo.svg" alt="K-Map Studio" className="w-full h-full" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-tight text-[#f3f4f6]">
              Karnaugh Studio
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#7c3aed]/15 text-[#c4b5fd] border border-[#7c3aed]/30">
              v1.0
            </span>
          </div>
          <p className="text-[11px] text-[#8c919e] leading-none mt-0.5">
            Boolean Simplification & Gray-Code Map Engine
          </p>
        </div>
      </div>

      {/* Center: Variable Selector */}
      <div className="flex items-center bg-[#16171b] p-0.5 rounded-lg border border-[#262830]">
        <span className="text-[11px] font-medium text-[#8c919e] px-2.5">
          Variables:
        </span>
        {[2, 3, 4].map((v) => {
          const isSelected = numVars === v;
          const varLabels = v === 2 ? "2 (IN1, IN2)" : v === 3 ? "3 (IN1..IN3)" : "4 (IN1..IN4)";
          return (
            <button
              key={v}
              onClick={() => onSelectVars(v)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#282a33] text-[#ffffff] font-semibold border border-[#383a46] shadow-xs"
                  : "text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#202228]"
              }`}
              title={`${varLabels} - 2^${v} = ${1 << v} minterms`}
            >
              {v} Vars
            </button>
          );
        })}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Toggle Overlays (Auto Circle) */}
        <button
          onClick={onToggleShowGroups}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
            showGroups
              ? "bg-[#7c3aed]/25 text-[#ddd6fe] border-[#7c3aed]/60 hover:bg-[#7c3aed]/35 shadow-[0_0_12px_rgba(124,58,237,0.3)]"
              : "bg-[#18191e] text-[#9ca3af] border-[#262830] hover:bg-[#22242c] hover:text-[#e4e4e7]"
          }`}
          title="Toggle automatic K-Map loop circles (Auto Circle)"
        >
          <Layers className="w-3.5 h-3.5 text-[#a78bfa]" />
          <span>{showGroups ? "Auto Circle: ON" : "Auto Circle: OFF"}</span>
        </button>

        {/* Reset / Reload Default */}
        <button
          onClick={onReset}
          className="p-1.5 rounded-md bg-[#18191e] border border-[#262830] text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#22242c] transition-colors cursor-pointer"
          title="Reset to default educational sample"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Help / Guide */}
        <button
          onClick={onOpenHelp}
          className="p-1.5 rounded-md bg-[#18191e] border border-[#262830] text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#22242c] transition-colors cursor-pointer"
          title="Educational Guide & K-Map Rules"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};


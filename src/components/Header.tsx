import React from "react";
import { Moon, Sun, Layers, HelpCircle, RotateCcw } from "lucide-react";

interface HeaderProps {
  numVars: number;
  onSelectVars: (vars: number) => void;
  showGroups: boolean;
  onToggleShowGroups: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onReset: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  numVars,
  onSelectVars,
  showGroups,
  onToggleShowGroups,
  isDark,
  onToggleTheme,
  onReset,
  onOpenHelp,
}) => {
  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 border border-slate-700/60 p-1 flex items-center justify-center shadow-xs">
          <img src="/logo.svg" alt="K-Map Studio" className="w-full h-full" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Karnaugh Studio
            </h1>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">
            Boolean Simplification & Gray-Code Map Engine
          </p>
        </div>
      </div>

      {/* Center: Variable Selector */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-2.5">
          Variables:
        </span>
        {[2, 3, 4].map((v) => {
          const isSelected = numVars === v;
          const varLabels = v === 2 ? "2 (A, B)" : v === 3 ? "3 (A, B, C)" : "4 (A, B, C, D)";
          return (
            <button
              key={v}
              onClick={() => onSelectVars(v)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                isSelected
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title={`${varLabels} - 2^${v} = ${1 << v} minterms`}
            >
              {v} Vars
            </button>
          );
        })}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5">
        {/* Toggle Overlays */}
        <button
          onClick={onToggleShowGroups}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
            showGroups
              ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
          }`}
          title="Toggle K-Map color group contours"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{showGroups ? "Groups On" : "Groups Off"}</span>
        </button>

        {/* Reset / Reload Default */}
        <button
          onClick={onReset}
          className="p-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title="Reset to default educational sample"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Help / Guide */}
        <button
          onClick={onOpenHelp}
          className="p-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title="Educational Guide & K-Map Rules"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};

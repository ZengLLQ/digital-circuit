import React, { useRef } from "react";
import { OutputValue, TruthTableRow } from "../types/kmap";

interface TruthTableProps {
  rows: TruthTableRow[];
  varNames: string[];
  hoveredMinterm: number | null;
  selectedMinterm: number | null;
  onHoverMinterm: (m: number | null) => void;
  onSelectMinterm: (m: number) => void;
  onToggleOutput: (index: number) => void;
  onSetOutput: (index: number, val: OutputValue) => void;
  onSetAll: (val: OutputValue) => void;
  onInvertAll: () => void;
}

export const TruthTable: React.FC<TruthTableProps> = ({
  rows,
  varNames,
  hoveredMinterm,
  selectedMinterm,
  onHoverMinterm,
  onSelectMinterm,
  onToggleOutput,
  onSetOutput,
  onSetAll,
  onInvertAll,
}) => {
  const tableRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (index + 1) % rows.length;
      const el = document.getElementById(`tt-row-${next}`);
      el?.focus();
      onSelectMinterm(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (index - 1 + rows.length) % rows.length;
      const el = document.getElementById(`tt-row-${prev}`);
      el?.focus();
      onSelectMinterm(prev);
    } else if (e.key === "0") {
      e.preventDefault();
      onSetOutput(index, "0");
    } else if (e.key === "1") {
      e.preventDefault();
      onSetOutput(index, "1");
    } else if (e.key.toLowerCase() === "x" || e.key.toLowerCase() === "d") {
      e.preventDefault();
      onSetOutput(index, "X");
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onToggleOutput(index);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Truth Table
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {rows.length} rows ({varNames.join(", ")})
          </p>
        </div>

        {/* Quick Batch Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSetAll("0")}
            className="px-2 py-0.5 text-[11px] font-medium rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Set all outputs to 0"
          >
            All 0
          </button>
          <button
            onClick={() => onSetAll("1")}
            className="px-2 py-0.5 text-[11px] font-medium rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Set all outputs to 1"
          >
            All 1
          </button>
          <button
            onClick={onInvertAll}
            className="px-2 py-0.5 text-[11px] font-medium rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Invert 0 and 1 outputs (preserves X)"
          >
            Invert
          </button>
        </div>
      </div>

      {/* Table container */}
      <div ref={tableRef} className="flex-1 overflow-y-auto overflow-x-hidden">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="sticky top-0 bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 text-[11px] font-semibold tracking-wider border-b border-slate-200 dark:border-slate-700 z-10">
              <th className="py-1.5 px-2 w-12 text-slate-400 dark:text-slate-500 font-mono">m</th>
              {varNames.map((name) => (
                <th key={name} className="py-1.5 px-2 font-mono">
                  {name}
                </th>
              ))}
              <th className="py-1.5 px-2 w-16 text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                F
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {rows.map((row) => {
              const isHovered = hoveredMinterm === row.index;
              const isSelected = selectedMinterm === row.index;

              let outputBadgeClass = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
              if (row.output === "1") {
                outputBadgeClass =
                  "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-300 dark:border-cyan-700/60 shadow-xs";
              } else if (row.output === "X") {
                outputBadgeClass =
                  "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-700/60";
              }

              return (
                <tr
                  id={`tt-row-${row.index}`}
                  key={row.index}
                  tabIndex={0}
                  onFocus={() => onSelectMinterm(row.index)}
                  onKeyDown={(e) => handleKeyDown(e, row.index)}
                  onMouseEnter={() => onHoverMinterm(row.index)}
                  onMouseLeave={() => onHoverMinterm(null)}
                  onClick={() => onSelectMinterm(row.index)}
                  className={`transition-colors cursor-pointer outline-hidden select-none ${
                    isSelected
                      ? "bg-cyan-50/70 dark:bg-cyan-950/30 ring-1 ring-inset ring-cyan-500/50"
                      : isHovered
                      ? "bg-slate-50 dark:bg-slate-800/40"
                      : "hover:bg-slate-50/60 dark:hover:bg-slate-800/20"
                  }`}
                >
                  {/* Minterm Index */}
                  <td className="py-1 px-2 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    {row.index}
                  </td>

                  {/* Variable inputs */}
                  {row.values.map((v, i) => (
                    <td
                      key={i}
                      className="py-1 px-2 font-mono text-slate-700 dark:text-slate-300 font-medium"
                    >
                      {v}
                    </td>
                  ))}

                  {/* Output F toggle button */}
                  <td className="py-1 px-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleOutput(row.index);
                      }}
                      className={`w-9 h-6 mx-auto rounded-md flex items-center justify-center font-mono text-xs transition-transform active:scale-95 ${outputBadgeClass}`}
                      title={`Click or press Space to cycle (0 -> 1 -> X). Current: ${row.output}`}
                    >
                      {row.output}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer shortcut helper */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850/40 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Click or [0, 1, X, Space]</span>
        <span>Arrows [↑, ↓]</span>
      </div>
    </div>
  );
};

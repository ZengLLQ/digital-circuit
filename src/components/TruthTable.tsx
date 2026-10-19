import React, { useRef } from "react";
import { OutputValue, TruthTableRow } from "../types/kmap";

interface TruthTableProps {
  rows: TruthTableRow[];
  varNames: string[];
  hoveredMinterm: number | null;
  selectedMinterm: number | null;
  activeGroupMinterms?: number[];
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
  activeGroupMinterms,
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
    <div className="flex flex-col h-full bg-[#121316] rounded-xl border border-[#202228] shadow-lg overflow-hidden select-none">
      {/* Header bar */}
      <div className="p-3 border-b border-[#202228] flex items-center justify-between bg-[#15161a]">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#f3f4f6]">
            Truth Table
          </h2>
          <p className="text-[11px] text-[#8c919e] mt-0.5">
            {rows.length} rows ({varNames.join(", ")})
          </p>
        </div>

        {/* Quick Batch Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSetAll("0")}
            className="px-2.5 py-0.5 text-[11px] font-medium rounded text-[#cbd0dc] hover:text-[#ffffff] bg-[#1d1f25] hover:bg-[#272933] border border-[#2a2c36] transition-colors cursor-pointer"
            title="Set all outputs to 0"
          >
            All 0
          </button>
          <button
            onClick={() => onSetAll("1")}
            className="px-2.5 py-0.5 text-[11px] font-medium rounded text-[#cbd0dc] hover:text-[#ffffff] bg-[#1d1f25] hover:bg-[#272933] border border-[#2a2c36] transition-colors cursor-pointer"
            title="Set all outputs to 1"
          >
            All 1
          </button>
          <button
            onClick={onInvertAll}
            className="px-2.5 py-0.5 text-[11px] font-medium rounded text-[#cbd0dc] hover:text-[#ffffff] bg-[#1d1f25] hover:bg-[#272933] border border-[#2a2c36] transition-colors cursor-pointer"
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
            <tr className="sticky top-0 bg-[#16171b]/95 backdrop-blur-xs text-[#9ca3af] text-[11px] font-semibold tracking-wider border-b border-[#22242d] z-10">
              <th className="py-2 px-2 w-12 text-[#9ca3af] font-mono font-bold">m</th>
              {varNames.map((name) => (
                <th key={name} className="py-2 px-2 font-mono font-bold text-[#f4f4f5]">
                  {name}
                </th>
              ))}
              <th className="py-2 px-2 w-16 text-[#a78bfa] font-mono font-bold">
                F
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c1d24] text-xs">
            {rows.map((row) => {
              const isHovered = hoveredMinterm === row.index;
              const isSelected = selectedMinterm === row.index;
              const isGroupMember = activeGroupMinterms?.includes(row.index);

              let outputBadgeClass = "bg-[#181920] text-[#cbd0dc] font-semibold border border-[#2b2d38] hover:text-[#ffffff] hover:border-[#3f4252]";
              if (row.output === "1") {
                outputBadgeClass =
                  "bg-[#7c3aed]/25 text-[#ede9fe] font-bold border border-[#7c3aed]/60 shadow-[0_0_12px_rgba(124,58,237,0.35)] hover:bg-[#7c3aed]/35";
              } else if (row.output === "X") {
                outputBadgeClass =
                  "bg-[#f59e0b]/20 text-[#fef3c7] font-bold border border-[#f59e0b]/50 shadow-[0_0_10px_rgba(245,158,11,0.25)] hover:bg-[#f59e0b]/30";
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
                      ? "bg-[#242634] ring-1 ring-inset ring-[#7c3aed]/60"
                      : isHovered
                      ? "bg-[#1c1d25]"
                      : isGroupMember
                      ? "bg-[#181923] border-l-2 border-l-[#7c3aed]"
                      : "hover:bg-[#16171e]/70"
                  }`}
                >
                  {/* Minterm Index */}
                  <td className="py-1 px-2 text-[11px] font-mono font-medium text-[#9ca3af]">
                    {row.index}
                  </td>

                  {/* Variable inputs */}
                  {row.values.map((v, i) => (
                    <td
                      key={i}
                      className="py-1 px-2 font-mono text-[#e4e4e7] font-medium"
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
                      className={`w-9 h-6 mx-auto rounded-md flex items-center justify-center font-mono text-xs transition-transform active:scale-95 cursor-pointer ${outputBadgeClass}`}
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
      <div className="p-2.5 border-t border-[#202228] bg-[#15161a] text-[10px] text-[#9ca3af] flex items-center justify-between">
        <span className="italic font-medium">Click or [0, 1, X, Space] to edit</span>
        <span className="italic font-medium">Navigate with [↑, ↓]</span>
      </div>
    </div>
  );
};

import React, { useRef, useState, useEffect } from "react";
import { OutputValue, TruthTableRow } from "../types/kmap";
import { Plus, X } from "lucide-react";

interface TruthTableProps {
  rows: TruthTableRow[];
  varNames: string[];
  outputNames: string[];
  activeOutputName: string;
  allOutputs: Record<string, OutputValue[]>;
  hoveredMinterm: number | null;
  selectedMinterm: number | null;
  activeGroupMinterms?: number[];
  onHoverMinterm: (m: number | null) => void;
  onSelectMinterm: (m: number) => void;
  onToggleOutput: (index: number, outputName?: string) => void;
  onSetOutput: (index: number, val: OutputValue, outputName?: string) => void;
  onSetAll: (val: OutputValue) => void;
  onInvertAll: () => void;
  onRenameVariable?: (index: number, newName: string) => void;
  onAddOutput?: () => void;
  onDeleteOutput?: (outputName: string) => void;
  onSelectActiveOutput?: (outputName: string) => void;
}

const InlineVarEditor: React.FC<{
  value: string;
  onChange?: (val: string) => void;
}> = ({ value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(value);

  useEffect(() => {
    setTempVal(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    const trimmed = tempVal.trim();
    if (trimmed && trimmed !== value) {
      onChange?.(trimmed);
    } else {
      setTempVal(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setTempVal(value);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        autoFocus
        value={tempVal}
        onChange={(e) => setTempVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="min-w-10 max-w-24 w-auto text-center bg-[#252836] text-white border border-[#7c3aed] rounded px-1.5 py-0.5 text-xs font-mono outline-hidden shadow-inner"
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:text-[#38bdf8] hover:bg-[#20222a] px-1 py-0.5 rounded transition-colors inline-block"
      title="Click to rename variable"
    >
      {value}
    </span>
  );
};

export const TruthTable: React.FC<TruthTableProps> = ({
  rows,
  varNames,
  outputNames,
  activeOutputName,
  allOutputs,
  hoveredMinterm,
  selectedMinterm,
  activeGroupMinterms,
  onHoverMinterm,
  onSelectMinterm,
  onToggleOutput,
  onSetOutput,
  onSetAll,
  onInvertAll,
  onRenameVariable,
  onAddOutput,
  onDeleteOutput,
  onSelectActiveOutput,
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
      onSetOutput(index, "0", activeOutputName);
    } else if (e.key === "1") {
      e.preventDefault();
      onSetOutput(index, "1", activeOutputName);
    } else if (e.key.toLowerCase() === "x" || e.key.toLowerCase() === "d") {
      e.preventDefault();
      onSetOutput(index, "X", activeOutputName);
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onToggleOutput(index, activeOutputName);
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
            {rows.length} rows | Output: <span className="font-mono text-[#a78bfa] font-bold">{activeOutputName}</span>
          </p>
        </div>

        {/* Quick Batch Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSetAll("0")}
            className="px-2.5 py-0.5 text-[11px] font-medium rounded text-[#cbd0dc] hover:text-[#ffffff] bg-[#1d1f25] hover:bg-[#272933] border border-[#2a2c36] transition-colors cursor-pointer"
            title={`Set all ${activeOutputName} outputs to 0`}
          >
            All 0
          </button>
          <button
            onClick={() => onSetAll("1")}
            className="px-2.5 py-0.5 text-[11px] font-medium rounded text-[#cbd0dc] hover:text-[#ffffff] bg-[#1d1f25] hover:bg-[#272933] border border-[#2a2c36] transition-colors cursor-pointer"
            title={`Set all ${activeOutputName} outputs to 1`}
          >
            All 1
          </button>
          <button
            onClick={onInvertAll}
            className="px-2.5 py-0.5 text-[11px] font-medium rounded text-[#cbd0dc] hover:text-[#ffffff] bg-[#1d1f25] hover:bg-[#272933] border border-[#2a2c36] transition-colors cursor-pointer"
            title={`Invert ${activeOutputName} (0 <-> 1, X preserved)`}
          >
            Invert
          </button>
        </div>
      </div>

      {/* Table container */}
      <div ref={tableRef} className="flex-1 overflow-y-auto overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            {/* Row 1: Categorical Columns: m, Input, Output */}
            <tr className="sticky top-0 bg-[#16171b] text-[#9ca3af] text-[11px] font-bold border-b border-[#22242d] z-20 h-[30px]">
              <th
                rowSpan={2}
                className="py-1 px-2 w-10 text-[#9ca3af] font-mono border-r border-[#22242d] align-middle bg-[#16171b]"
              >
                m
              </th>
              <th
                colSpan={varNames.length}
                className="py-1 px-2 text-[#38bdf8] font-bold tracking-wider uppercase border-r border-[#22242d] bg-[#161922]"
              >
                <div className="flex items-center justify-center gap-1.5 leading-none">
                  <span>Input</span>
                  <span className="text-[10px] text-[#64748b] font-normal lowercase italic">(click var to rename)</span>
                </div>
              </th>
              <th
                colSpan={outputNames.length}
                className="py-1 px-2 text-[#a78bfa] font-bold tracking-wider uppercase bg-[#1a1726]"
              >
                <div className="flex items-center justify-center gap-2 leading-none">
                  <span>Output</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddOutput?.();
                    }}
                    className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-[#7c3aed]/30 hover:bg-[#7c3aed] text-[#ddd6fe] hover:text-white border border-[#7c3aed]/50 transition-all cursor-pointer flex items-center gap-0.5 shadow-xs"
                    title="Add new output column (e.g. O1, O2...)"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </th>
            </tr>

            {/* Row 2: Sub-headers: Individual inputs and outputs */}
            <tr className="sticky top-[30px] bg-[#141519] text-[#9ca3af] text-[11px] font-semibold border-b border-[#22242d] z-20 h-[28px]">
              {varNames.map((name, i) => (
                <th
                  key={i}
                  className="py-1 px-1 font-mono font-bold text-[#f4f4f5] border-r border-[#202228]/50"
                >
                  <InlineVarEditor
                    value={name}
                    onChange={(newVal) => onRenameVariable?.(i, newVal)}
                  />
                </th>
              ))}
              {outputNames.map((outName) => {
                const isActive = outName === activeOutputName;
                return (
                  <th
                    key={outName}
                    className={`py-1 px-1.5 font-mono font-bold border-r border-[#202228]/50 transition-colors ${
                      isActive
                        ? "bg-[#7c3aed]/25 text-[#c4b5fd]"
                        : "text-[#9ca3af] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectActiveOutput?.(outName)}
                        className={`font-mono text-xs font-bold hover:underline cursor-pointer ${
                          isActive ? "text-[#ddd6fe] font-extrabold" : "text-[#9ca3af]"
                        }`}
                        title={`Click to set ${outName} as active function in K-Map`}
                      >
                        {outName}
                      </button>
                      {isActive && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] inline-block animate-pulse"
                          title="Active in K-Map"
                        />
                      )}
                      {outputNames.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteOutput?.(outName);
                          }}
                          className="text-[#6b7280] hover:text-rose-400 p-0.5 rounded cursor-pointer transition-colors"
                          title={`Delete output column ${outName}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c1d24] text-xs">
            {rows.map((row) => {
              const isHovered = hoveredMinterm === row.index;
              const isSelected = selectedMinterm === row.index;
              const isGroupMember = activeGroupMinterms?.includes(row.index);

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
                  <td className="py-1 px-2 text-[11px] font-mono font-medium text-[#9ca3af] border-r border-[#202228]/40">
                    {row.index}
                  </td>

                  {/* Variable inputs */}
                  {row.values.map((v, i) => (
                    <td
                      key={i}
                      className="py-1 px-2 font-mono text-[#e4e4e7] font-medium border-r border-[#202228]/40"
                    >
                      {v}
                    </td>
                  ))}

                  {/* Outputs columns */}
                  {outputNames.map((outName) => {
                    const val =
                      allOutputs[outName]?.[row.index] ??
                      (outName === activeOutputName ? row.output : "0");
                    const isActive = outName === activeOutputName;

                    let outputBadgeClass =
                      "bg-[#181920] text-[#cbd0dc] font-semibold border border-[#2b2d38] hover:text-[#ffffff] hover:border-[#3f4252]";
                    if (val === "1") {
                      outputBadgeClass = isActive
                        ? "bg-[#7c3aed]/30 text-[#ede9fe] font-bold border border-[#7c3aed]/70 shadow-[0_0_10px_rgba(124,58,237,0.35)] hover:bg-[#7c3aed]/40"
                        : "bg-[#7c3aed]/20 text-[#ddd6fe] font-semibold border border-[#7c3aed]/40 hover:bg-[#7c3aed]/30";
                    } else if (val === "X") {
                      outputBadgeClass = isActive
                        ? "bg-[#f59e0b]/25 text-[#fef3c7] font-bold border border-[#f59e0b]/60 shadow-[0_0_8px_rgba(245,158,11,0.25)] hover:bg-[#f59e0b]/35"
                        : "bg-[#f59e0b]/15 text-[#fef3c7] font-semibold border border-[#f59e0b]/35 hover:bg-[#f59e0b]/25";
                    }

                    return (
                      <td
                        key={outName}
                        className={`py-1 px-1.5 border-r border-[#202228]/30 ${
                          isActive ? "bg-[#7c3aed]/5" : ""
                        }`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleOutput(row.index, outName);
                          }}
                          className={`w-8 h-6 mx-auto rounded-md flex items-center justify-center font-mono text-xs transition-transform active:scale-95 cursor-pointer ${outputBadgeClass}`}
                          title={`Click or press Space to cycle ${outName} (0 -> 1 -> X). Current: ${val}`}
                        >
                          {val}
                        </button>
                      </td>
                    );
                  })}
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
export default TruthTable;

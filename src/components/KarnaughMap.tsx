import React from "react";
import { ImplicantGroup, KMapGrid, OutputValue } from "../types/kmap";
import { GroupOverlay } from "./GroupOverlay";
import { getGroupColor } from "../utils/colors";

interface KarnaughMapProps {
  grid: KMapGrid;
  groups: ImplicantGroup[];
  showGroups: boolean;
  hoveredMinterm: number | null;
  selectedMinterm: number | null;
  hoveredGroupId: string | null;
  selectedGroupId: string | null;
  onHoverMinterm: (m: number | null) => void;
  onSelectMinterm: (m: number) => void;
  onHoverGroup: (id: string | null) => void;
  onSelectGroup: (id: string | null) => void;
  onToggleCell: (minterm: number) => void;
  onSetCellOutput?: (minterm: number, val: OutputValue) => void;
  isDark?: boolean;
}

export const KarnaughMap: React.FC<KarnaughMapProps> = ({
  grid,
  groups,
  showGroups,
  hoveredMinterm,
  selectedMinterm,
  hoveredGroupId,
  selectedGroupId,
  onHoverMinterm,
  onSelectMinterm,
  onHoverGroup,
  onSelectGroup,
  onToggleCell,
  onSetCellOutput,
}) => {
  const rowCount = grid.cells.length;
  const colCount = grid.cells[0]?.length ?? 2;

  // Responsive cell size
  const cellSize = grid.num_vars === 4 ? 68 : 78;
  const gapSize = 4;

  const rowVarsLabel = grid.row_vars.join("");
  const colVarsLabel = grid.col_vars.join("");

  const activeGroup = groups.find(
    (g) => g.id === (hoveredGroupId || selectedGroupId)
  );
  const activeColor = activeGroup ? getGroupColor(activeGroup.color_index ?? 0) : null;

  const handleCellKeyDown = (
    e: React.KeyboardEvent,
    r: number,
    c: number,
    minterm: number
  ) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextC = (c + 1) % colCount;
      const el = document.getElementById(`kmap-cell-${r}-${nextC}`);
      el?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevC = (c - 1 + colCount) % colCount;
      const el = document.getElementById(`kmap-cell-${r}-${prevC}`);
      el?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextR = (r + 1) % rowCount;
      const el = document.getElementById(`kmap-cell-${nextR}-${c}`);
      el?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevR = (r - 1 + rowCount) % rowCount;
      const el = document.getElementById(`kmap-cell-${prevR}-${c}`);
      el?.focus();
    } else if (e.key === "0") {
      e.preventDefault();
      onSetCellOutput?.(minterm, "0");
    } else if (e.key === "1") {
      e.preventDefault();
      onSetCellOutput?.(minterm, "1");
    } else if (e.key.toLowerCase() === "x" || e.key.toLowerCase() === "d") {
      e.preventDefault();
      onSetCellOutput?.(minterm, "X");
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onToggleCell(minterm);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#121316] rounded-xl border border-[#202228] shadow-lg select-none">
      {/* Top Legend / Guide */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-[#202228] text-xs text-[#8c919e]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#f3f4f6]">
            {grid.num_vars}-Variable K-Map
          </span>
          <span className="text-[11px] font-mono text-[#8c919e] italic">
            (Gray Code: Adjacent cells differ by 1 bit)
          </span>
        </div>
        <div className="text-[11px] font-normal italic text-[#9ca3af]">
          Click or [0, 1, X, Space] to edit
        </div>
      </div>

      {/* Map Layout */}
      <div className="mt-6 flex flex-col items-center">
        {/* Column Headers Row */}
        <div className="flex items-end">
          {/* Top-left corner diagonal label */}
          <div
            className="flex items-center justify-center text-xs font-mono font-semibold text-[#e4e4e7] bg-[#18191e] rounded-lg border border-[#262832] mr-2 mb-2"
            style={{ width: cellSize, height: 44 }}
            title={`Rows: ${rowVarsLabel} \\ Columns: ${colVarsLabel}`}
          >
            <div className="text-center leading-none">
              <span className="text-[#a78bfa] font-bold">{rowVarsLabel}</span>
              <span className="text-[#71717a] mx-1 font-light">\</span>
              <span className="text-[#38bdf8] font-bold">{colVarsLabel}</span>
            </div>
          </div>

          {/* Column Gray-Code Headers */}
          <div
            className="grid gap-1 mb-2"
            style={{
              gridTemplateColumns: `repeat(${colCount}, ${cellSize}px)`,
              gap: `${gapSize}px`,
            }}
          >
            {grid.col_headers.map((hdr, cIdx) => (
              <div
                key={cIdx}
                className="h-11 flex flex-col items-center justify-center bg-[#18191e] rounded-lg border border-[#262832] font-mono text-xs font-semibold text-[#e4e4e7]"
              >
                <span>{hdr}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rows and Grid Body */}
        <div className="flex">
          {/* Row Gray-Code Headers */}
          <div
            className="grid gap-1 mr-2"
            style={{
              gridTemplateRows: `repeat(${rowCount}, ${cellSize}px)`,
              gap: `${gapSize}px`,
            }}
          >
            {grid.row_headers.map((hdr, rIdx) => (
              <div
                key={rIdx}
                style={{ width: cellSize }}
                className="flex items-center justify-center bg-[#18191e] rounded-lg border border-[#262832] font-mono text-xs font-semibold text-[#e4e4e7]"
              >
                <span>{hdr}</span>
              </div>
            ))}
          </div>

          {/* Cells Container with SVG Group Overlay */}
          <div
            className="relative"
            style={{
              width: colCount * cellSize + (colCount - 1) * gapSize,
              height: rowCount * cellSize + (rowCount - 1) * gapSize,
            }}
          >
            {/* Cell Grid */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${colCount}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${rowCount}, ${cellSize}px)`,
                gap: `${gapSize}px`,
              }}
            >
              {grid.cells.map((rowCells, rIdx) =>
                rowCells.map((cell, cIdx) => {
                  const isHovered = hoveredMinterm === cell.minterm;
                  const isSelected = selectedMinterm === cell.minterm;
                  const isGroupCovered = activeGroup?.covered_minterms.includes(
                    cell.minterm
                  );

                  let valueClass = "text-[#a1a1aa] font-semibold";
                  let bgClass = "bg-[#15161b]";

                  if (cell.output === "1") {
                    valueClass = "text-[#ffffff] font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]";
                    bgClass = "bg-[#1d1f28]";
                  } else if (cell.output === "X") {
                    valueClass = "text-[#fbbf24] font-bold drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]";
                    bgClass = "bg-[#241d13]";
                  }

                  let borderClass = "border-[#242630]";
                  const customStyle: React.CSSProperties = {
                    width: cellSize,
                    height: cellSize,
                  };

                  if (isSelected) {
                    borderClass = "ring-2 ring-[#7c3aed] border-[#7c3aed] bg-[#222432] z-20 shadow-[0_0_16px_rgba(124,58,237,0.4)]";
                  } else if (isHovered) {
                    borderClass = "border-[#8b5cf6] bg-[#1a1c26] z-20 shadow-[0_0_12px_rgba(139,92,246,0.25)]";
                  } else if (isGroupCovered && activeColor) {
                    borderClass = "z-15 shadow-sm";
                    customStyle.borderColor = activeColor.border;
                    customStyle.backgroundColor = activeColor.pillBgDark;
                  }

                  return (
                    <div
                      id={`kmap-cell-${rIdx}-${cIdx}`}
                      key={`cell-${rIdx}-${cIdx}`}
                      tabIndex={0}
                      onClick={() => {
                        onSelectMinterm(cell.minterm);
                        onToggleCell(cell.minterm);
                      }}
                      onKeyDown={(e) =>
                        handleCellKeyDown(e, rIdx, cIdx, cell.minterm)
                      }
                      onMouseEnter={() => onHoverMinterm(cell.minterm)}
                      onMouseLeave={() => onHoverMinterm(null)}
                      style={customStyle}
                      className={`relative flex flex-col items-center justify-center rounded-xl border transition-all cursor-pointer select-none outline-hidden focus:ring-2 focus:ring-[#7c3aed] ${bgClass} ${borderClass} hover:shadow-sm active:scale-95`}
                      title={`Minterm m${cell.minterm} (${cell.binary}) = ${cell.output}. Press 0, 1, X, or Space to edit.`}
                    >
                      {/* Secondary Minterm Index Label */}
                      <span className="absolute top-1.5 left-2 text-[10px] font-mono font-medium text-[#9ca3af]">
                        m{cell.minterm}
                      </span>

                      {/* Binary Coordinates tooltip badge */}
                      <span className="absolute top-1.5 right-2 text-[9px] font-mono font-medium text-[#8c919e]">
                        {cell.binary}
                      </span>

                      {/* Large Center Logic Value */}
                      <span className={`text-2xl font-mono leading-none ${valueClass}`}>
                        {cell.output}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Superimposed SVG Group Contours */}
            <GroupOverlay
              groups={groups}
              rowCount={rowCount}
              colCount={colCount}
              cellSize={cellSize}
              gapSize={gapSize}
              hoveredGroupId={hoveredGroupId}
              selectedGroupId={selectedGroupId}
              onHoverGroup={onHoverGroup}
              onSelectGroup={onSelectGroup}
              showGroups={showGroups}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

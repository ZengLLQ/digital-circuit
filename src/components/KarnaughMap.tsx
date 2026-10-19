import React from "react";
import { ImplicantGroup, KMapGrid } from "../types/kmap";
import { GroupOverlay } from "./GroupOverlay";

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
}) => {
  const rowCount = grid.cells.length;
  const colCount = grid.cells[0]?.length ?? 2;

  // Responsive cell size
  const cellSize = grid.num_vars === 4 ? 68 : 78;
  const gapSize = 4;

  const rowVarsLabel = grid.row_vars.join("");
  const colVarsLabel = grid.col_vars.join("");

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs select-none">
      {/* Top Legend / Guide */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {grid.num_vars}-Variable K-Map
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            (Gray Code: Adjacent cells differ by 1 bit)
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Click cell to cycle value (0 → 1 → X)
        </div>
      </div>

      {/* Map Layout */}
      <div className="mt-6 flex flex-col items-center">
        {/* Column Headers Row */}
        <div className="flex items-end">
          {/* Top-left corner diagonal label */}
          <div
            className="flex items-center justify-center text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mr-2 mb-2"
            style={{ width: cellSize, height: 44 }}
            title={`Rows: ${rowVarsLabel} \\ Columns: ${colVarsLabel}`}
          >
            <div className="text-center leading-none">
              <span className="text-cyan-600 dark:text-cyan-400">{rowVarsLabel}</span>
              <span className="text-slate-400 dark:text-slate-500 mx-1">\</span>
              <span className="text-violet-600 dark:text-violet-400">{colVarsLabel}</span>
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
                className="h-11 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/80 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300"
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
                className="flex items-center justify-center bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/80 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300"
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

                  // Check if cell is covered by hovered or selected group
                  const activeGroup = groups.find(
                    (g) => g.id === (hoveredGroupId || selectedGroupId)
                  );
                  const isGroupCovered = activeGroup?.covered_minterms.includes(
                    cell.minterm
                  );

                  let valueClass = "text-slate-400 dark:text-slate-600 font-normal";
                  let bgClass = "bg-slate-50 dark:bg-slate-800/30";

                  if (cell.output === "1") {
                    valueClass = "text-slate-900 dark:text-white font-bold";
                    bgClass = "bg-white dark:bg-slate-800/80";
                  } else if (cell.output === "X") {
                    valueClass = "text-amber-600 dark:text-amber-400 font-bold";
                    bgClass = "bg-amber-50/50 dark:bg-amber-950/20";
                  }

                  let borderClass = "border-slate-200 dark:border-slate-700/70";
                  if (isSelected) {
                    borderClass = "ring-2 ring-cyan-500 border-cyan-500 z-20";
                  } else if (isHovered) {
                    borderClass = "border-cyan-400 dark:border-cyan-600 z-20";
                  } else if (isGroupCovered) {
                    borderClass = "border-slate-400 dark:border-slate-500";
                  }

                  return (
                    <div
                      key={`cell-${rIdx}-${cIdx}`}
                      onClick={() => {
                        onSelectMinterm(cell.minterm);
                        onToggleCell(cell.minterm);
                      }}
                      onMouseEnter={() => onHoverMinterm(cell.minterm)}
                      onMouseLeave={() => onHoverMinterm(null)}
                      style={{ width: cellSize, height: cellSize }}
                      className={`relative flex flex-col items-center justify-center rounded-xl border transition-all cursor-pointer select-none ${bgClass} ${borderClass} hover:shadow-xs active:scale-95`}
                      title={`Minterm m${cell.minterm} (${cell.binary}) = ${cell.output}`}
                    >
                      {/* Secondary Minterm Index Label */}
                      <span className="absolute top-1.5 left-2 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        m{cell.minterm}
                      </span>

                      {/* Binary Coordinates tooltip badge */}
                      <span className="absolute top-1.5 right-2 text-[8px] font-mono text-slate-400 dark:text-slate-600 opacity-60">
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

import React from "react";
import { ImplicantGroup } from "../types/kmap";
import { getGroupColor } from "../utils/colors";

interface GroupOverlayProps {
  groups: ImplicantGroup[];
  rowCount: number;
  colCount: number;
  cellSize: number;
  gapSize: number;
  hoveredGroupId: string | null;
  selectedGroupId: string | null;
  onHoverGroup: (id: string | null) => void;
  onSelectGroup: (id: string | null) => void;
  showGroups: boolean;
}

export const GroupOverlay: React.FC<GroupOverlayProps> = ({
  groups,
  rowCount,
  colCount,
  cellSize,
  gapSize,
  hoveredGroupId,
  selectedGroupId,
  onHoverGroup,
  onSelectGroup,
  showGroups,
}) => {
  if (!showGroups || groups.length === 0) {
    return null;
  }

  const svgWidth = colCount * cellSize + (colCount - 1) * gapSize;
  const svgHeight = rowCount * cellSize + (rowCount - 1) * gapSize;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10 overflow-visible"
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
    >
      <defs>
        {groups.map((group, gIdx) => {
          const color = getGroupColor(group.color_index ?? gIdx);
          return (
            <filter
              key={`filter-${group.id}`}
              id={`glow-${group.id}`}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="3"
                floodColor={color.border}
                floodOpacity="0.4"
              />
            </filter>
          );
        })}
      </defs>

      {groups.map((group, gIdx) => {
        const color = getGroupColor(group.color_index ?? gIdx);
        const isHovered = hoveredGroupId === group.id;
        const isSelected = selectedGroupId === group.id;
        const isHighlighted = isHovered || isSelected;
        const hasOtherHighlighted =
          (hoveredGroupId !== null || selectedGroupId !== null) && !isHighlighted;

        // Slight inset offset per group index so concentric groups don't perfectly overlap
        const inset = 3 + (gIdx % 3) * 2;
        const strokeWidth = isHighlighted ? 3.5 : 2;
        const opacity = hasOtherHighlighted ? 0.25 : 1.0;

        return (
          <g
            key={group.id}
            className="transition-all duration-150 pointer-events-auto cursor-pointer"
            opacity={opacity}
            onMouseEnter={() => onHoverGroup(group.id)}
            onMouseLeave={() => onHoverGroup(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelectGroup(selectedGroupId === group.id ? null : group.id);
            }}
          >
            {group.rects.map((rect, rIdx) => {
              const x = rect.c_start * (cellSize + gapSize) + inset;
              const y = rect.r_start * (cellSize + gapSize) + inset;
              const w =
                rect.c_span * cellSize + (rect.c_span - 1) * gapSize - inset * 2;
              const h =
                rect.r_span * cellSize + (rect.r_span - 1) * gapSize - inset * 2;

              const rx = Math.min(14, w / 3, h / 3);

              return (
                <g key={`${group.id}-rect-${rIdx}`}>
                  {/* Visual group contour */}
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx={rx}
                    ry={rx}
                    fill={isHighlighted ? color.fillHover : color.fill}
                    stroke={color.border}
                    strokeWidth={strokeWidth}
                    strokeDasharray={
                      group.rects.length > 1 ? "6 3" : undefined
                    }
                    filter={isHighlighted ? `url(#glow-${group.id})` : undefined}
                  />

                  {/* Group ID badge on primary and wraparound/corner segments */}
                  <g transform={`translate(${x + 4}, ${y + 4})`}>
                    <rect
                      width="24"
                      height="16"
                      rx="4"
                      fill={color.badgeBg}
                      className="shadow-xs"
                      opacity={rIdx === 0 ? 1.0 : 0.85}
                    />
                    <text
                      x="12"
                      y="11.5"
                      fill={color.badgeText}
                      fontSize="9"
                      fontWeight="700"
                      fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
                      textAnchor="middle"
                    >
                      {group.id}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
};

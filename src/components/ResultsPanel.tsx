import React, { useState } from "react";
import { MinimizationResult } from "../types/kmap";
import { getGroupColor } from "../utils/colors";
import { Copy, Check, BookOpen } from "lucide-react";

interface ResultsPanelProps {
  sop: MinimizationResult;
  pos: MinimizationResult;
  activeTab: "sop" | "pos";
  onChangeTab: (tab: "sop" | "pos") => void;
  hoveredGroupId: string | null;
  selectedGroupId: string | null;
  onHoverGroup: (id: string | null) => void;
  onSelectGroup: (id: string | null) => void;
  onHoverMinterm: (m: number | null) => void;
  isDark?: boolean;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  sop,
  pos,
  activeTab,
  onChangeTab,
  hoveredGroupId,
  selectedGroupId,
  onHoverGroup,
  onSelectGroup,
  onHoverMinterm,
}) => {
  const [copied, setCopied] = useState(false);
  const activeResult = activeTab === "sop" ? sop : pos;

  const handleCopy = () => {
    const text = activeResult.expression_plain;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedGroup = activeResult.groups.find(
    (g) => g.id === (selectedGroupId || hoveredGroupId)
  );

  return (
    <div className="flex flex-col h-full bg-[#121316] rounded-xl border border-[#202228] shadow-lg overflow-hidden select-none">
      {/* Tab Navigation */}
      <div className="p-3 border-b border-[#202228] flex items-center justify-between bg-[#15161a]">
        <div className="flex items-center gap-1 bg-[#18191e] p-0.5 rounded-lg border border-[#262832]">
          <button
            onClick={() => {
              onChangeTab("sop");
              onSelectGroup(null);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "sop"
                ? "bg-[#282a33] text-[#c4b5fd] border border-[#7c3aed]/40 shadow-xs"
                : "text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#202228]"
            }`}
          >
            Sum of Products (SoP)
          </button>
          <button
            onClick={() => {
              onChangeTab("pos");
              onSelectGroup(null);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "pos"
                ? "bg-[#282a33] text-[#93c5fd] border border-[#3b82f6]/40 shadow-xs"
                : "text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#202228]"
            }`}
          >
            Product of Sums (PoS)
          </button>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md text-[#cbd0dc] hover:text-[#ffffff] bg-[#1d1f25] hover:bg-[#272933] border border-[#2a2c36] transition-colors cursor-pointer"
          title="Copy plain text expression to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#a78bfa]" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Minimized Expression Card */}
        <div className="p-4 rounded-xl bg-[#18191e] border border-[#252732] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c919e]">
              Minimized Expression
            </span>
            <div className="flex items-center gap-3 text-xs text-[#8c919e]">
              <span>
                Terms: <b className="text-[#ffffff] font-semibold">{activeResult.term_count}</b>
              </span>
              <span>
                Literals: <b className="text-[#ffffff] font-semibold">{activeResult.literal_count}</b>
              </span>
            </div>
          </div>

          {/* Rendered Math Formula with Color Pill Association */}
          <div className="flex items-center flex-wrap gap-2 py-2">
            <span className="text-xl font-mono font-bold text-[#f4f4f5]">
              F =
            </span>

            {activeResult.groups.length === 0 ? (
              <span className="text-2xl font-mono font-bold text-[#ffffff]">
                {activeResult.expression_formatted}
              </span>
            ) : (
              activeResult.groups.map((group, idx) => {
                const color = getGroupColor(group.color_index ?? idx);
                const isSelected = selectedGroupId === group.id;
                const isHovered = hoveredGroupId === group.id;
                const isHighlighted = isSelected || isHovered;

                return (
                  <React.Fragment key={group.id}>
                    {idx > 0 && activeTab === "sop" && (
                      <span className="text-lg font-mono text-[#a78bfa] font-bold px-1">
                        +
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectGroup(isSelected ? null : group.id)}
                      onMouseEnter={() => onHoverGroup(group.id)}
                      onMouseLeave={() => onHoverGroup(null)}
                      style={{
                        backgroundColor: color.pillBgDark,
                        borderColor: color.border,
                        color: color.pillTextDark,
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-base font-mono font-bold tracking-wide transition-all cursor-pointer shadow-xs ${
                        isHighlighted
                          ? "ring-2 ring-offset-2 ring-offset-[#18191e] ring-[#7c3aed] scale-105"
                          : "hover:scale-102 hover:brightness-110"
                      }`}
                      title={`Group ${group.id}: covered minterms m(${group.covered_minterms.join(
                        ", "
                      )})`}
                    >
                      {group.term_formatted}
                    </button>
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Implicants / Groups List */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9ca3af] mb-2.5">
            Covering Implicants ({activeResult.groups.length})
          </h3>

          {activeResult.groups.length === 0 ? (
            <div className="p-3.5 text-xs text-[#d1d5db] bg-[#18191e] rounded-xl border border-[#252732] leading-relaxed">
              {activeResult.is_all_dont_care ? (
                <div>
                  <div className="font-semibold text-[#fbbf24] mb-1 flex items-center gap-1.5">
                    <span>Unspecified Function (All Don't-Care)</span>
                  </div>
                  <p className="text-[#cbd0dc] leading-relaxed">
                    All input combinations are don't-care conditions (X). Under the documented deterministic convention, all outputs evaluate to constant 0 (F = 0).
                  </p>
                </div>
              ) : activeResult.is_constant_zero ? (
                "Function evaluates to constant 0 for all input combinations."
              ) : activeResult.is_constant_one ? (
                "Function evaluates to constant 1 for all input combinations."
              ) : null}
            </div>
          ) : (
            <div className="space-y-2">
              {activeResult.groups.map((group, idx) => {
                const color = getGroupColor(group.color_index ?? idx);
                const isSelected = selectedGroupId === group.id;
                const isHovered = hoveredGroupId === group.id;
                const isHighlighted = isSelected || isHovered;

                return (
                  <div
                    key={group.id}
                    onClick={() => onSelectGroup(isSelected ? null : group.id)}
                    onMouseEnter={() => onHoverGroup(group.id)}
                    onMouseLeave={() => onHoverGroup(null)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isHighlighted
                        ? "bg-[#20222a] border-[#7c3aed] ring-1 ring-[#7c3aed]/50 shadow-sm"
                        : "bg-[#18191e] border-[#242630] hover:border-[#353846] hover:bg-[#1c1d24]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            backgroundColor: color.badgeBg,
                            color: color.badgeText,
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                        >
                          {group.id}
                        </span>
                        <span className="font-mono font-bold text-sm text-[#ffffff]">
                          {group.term_formatted}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {group.is_essential ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#6ee7b7] border border-[#10b981]/35">
                            Essential
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#242630] text-[#cbd0dc] border border-[#303240]">
                            Minimal Cover
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#9ca3af]">
                      <span>Covered minterms:</span>
                      <div className="flex flex-wrap gap-1">
                        {group.covered_minterms.map((m) => (
                          <span
                            key={m}
                            onMouseEnter={() => onHoverMinterm(m)}
                            onMouseLeave={() => onHoverMinterm(null)}
                            className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#131417] border border-[#262832] text-[#cbd0dc] hover:border-[#7c3aed] hover:text-[#ffffff] transition-colors"
                          >
                            m{m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Educational Context Breakdown */}
        {selectedGroup && (
          <div className="p-4 rounded-xl bg-[#1b1929] border border-[#7c3aed]/40 text-xs shadow-md">
            <div className="flex items-center gap-2 mb-1.5 text-[#c4b5fd] font-semibold">
              <BookOpen className="w-4 h-4 text-[#a78bfa]" />
              <span>Educational Insight for {selectedGroup.id} ({selectedGroup.term_formatted})</span>
            </div>
            <p className="text-[#e4e4e7] leading-relaxed mb-3">
              {selectedGroup.explanation}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-[#7c3aed]/25 text-[11px]">
              <div>
                <span className="text-[#9ca3af]">Eliminated ({selectedGroup.eliminated_vars.length}):</span>{" "}
                <b className="font-mono text-[#ffffff] font-semibold">
                  {selectedGroup.eliminated_vars.join(", ") || "None"}
                </b>
              </div>
              <div>
                <span className="text-[#9ca3af]">Retained:</span>{" "}
                <b className="font-mono text-[#ffffff] font-semibold">
                  {selectedGroup.retained_vars.join(", ") || "All"}
                </b>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

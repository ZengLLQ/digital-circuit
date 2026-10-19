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
  isDark: boolean;
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
  isDark,
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
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Tab Navigation */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300/60 dark:border-slate-700/60">
          <button
            onClick={() => {
              onChangeTab("sop");
              onSelectGroup(null);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === "sop"
                ? "bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Sum of Products (SoP)
          </button>
          <button
            onClick={() => {
              onChangeTab("pos");
              onSelectGroup(null);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === "pos"
                ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Product of Sums (PoS)
          </button>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
          title="Copy plain text expression to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Minimized Expression Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Minimized Expression
            </span>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Terms: <b className="text-slate-900 dark:text-slate-100">{activeResult.term_count}</b>
              </span>
              <span>
                Literals: <b className="text-slate-900 dark:text-slate-100">{activeResult.literal_count}</b>
              </span>
            </div>
          </div>

          {/* Rendered Math Formula with Color Pill Association */}
          <div className="flex items-center flex-wrap gap-2 py-2">
            <span className="text-xl font-mono font-bold text-slate-800 dark:text-slate-200">
              F =
            </span>

            {activeResult.groups.length === 0 ? (
              <span className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                {activeResult.expression_formatted}
              </span>
            ) : (
              activeResult.groups.map((group, idx) => {
                const color = getGroupColor(group.color_index ?? idx);
                const isSelected = selectedGroupId === group.id;
                const isHovered = hoveredGroupId === group.id;
                const isHighlighted = isSelected || isHovered;

                const bg = isDark ? color.pillBgDark : color.pillBgLight;
                const textCol = isDark ? color.pillTextDark : color.pillTextLight;

                return (
                  <React.Fragment key={group.id}>
                    {idx > 0 && activeTab === "sop" && (
                      <span className="text-lg font-mono text-slate-400 font-bold px-0.5">
                        +
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectGroup(isSelected ? null : group.id)}
                      onMouseEnter={() => onHoverGroup(group.id)}
                      onMouseLeave={() => onHoverGroup(null)}
                      style={{
                        backgroundColor: bg,
                        borderColor: color.border,
                        color: textCol,
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-base font-mono font-bold tracking-wide transition-all cursor-pointer shadow-2xs ${
                        isHighlighted
                          ? "ring-2 ring-offset-1 ring-cyan-500 scale-105"
                          : "hover:scale-102"
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
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Covering Implicants ({activeResult.groups.length})
          </h3>

          {activeResult.groups.length === 0 ? (
            <div className="p-3.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200/60 dark:border-slate-800">
              {activeResult.is_all_dont_care ? (
                <div>
                  <div className="font-semibold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                    <span>Unspecified Function (All Don't-Care)</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
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
                        ? "bg-slate-100/90 dark:bg-slate-800 border-cyan-500 ring-1 ring-cyan-500/50"
                        : "bg-slate-50/70 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
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
                        <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                          {group.term_formatted}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {group.is_essential ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            Essential
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Minimal Cover
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span>Covered minterms:</span>
                      <div className="flex flex-wrap gap-1">
                        {group.covered_minterms.map((m) => (
                          <span
                            key={m}
                            onMouseEnter={() => onHoverMinterm(m)}
                            onMouseLeave={() => onHoverMinterm(null)}
                            className="font-mono text-[11px] px-1 rounded bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-500"
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
          <div className="p-3.5 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/60 text-xs">
            <div className="flex items-center gap-2 mb-1 text-cyan-800 dark:text-cyan-300 font-semibold">
              <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Educational Insight for {selectedGroup.id} ({selectedGroup.term_formatted})</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
              {selectedGroup.explanation}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-200/60 dark:border-cyan-900/40 text-[11px]">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Eliminated ({selectedGroup.eliminated_vars.length}):</span>{" "}
                <b className="font-mono text-slate-800 dark:text-slate-200">
                  {selectedGroup.eliminated_vars.join(", ") || "None"}
                </b>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Retained:</span>{" "}
                <b className="font-mono text-slate-800 dark:text-slate-200">
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

import { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { TruthTable } from "./components/TruthTable";
import { KarnaughMap } from "./components/KarnaughMap";
import { ResultsPanel } from "./components/ResultsPanel";
import { EducationalModal } from "./components/EducationalModal";
import { ResetConfirmModal } from "./components/ResetConfirmModal";
import { getDefaultState, solveKMap } from "./api";
import { KMapResponse, OutputValue } from "./types/kmap";
import { Loader2 } from "lucide-react";

export function App() {
  const [numVars, setNumVars] = useState<number>(4);
  const [data, setData] = useState<KMapResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"sop" | "pos">("sop");
  const [showGroups, setShowGroups] = useState<boolean>(true);

  // Cross-component interactive highlight states
  const [hoveredMinterm, setHoveredMinterm] = useState<number | null>(null);
  const [selectedMinterm, setSelectedMinterm] = useState<number | null>(null);
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Enforce dark mode permanently
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Load initial educational state
  const loadStateForVars = useCallback(async (v: number) => {
    setLoading(true);
    try {
      const res = await getDefaultState(v);
      setData(res);
      setSelectedMinterm(null);
      setHoveredMinterm(null);
      setSelectedGroupId(null);
      setHoveredGroupId(null);
    } catch (err) {
      console.error("Failed to load state:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStateForVars(4);
  }, [loadStateForVars]);

  // Handle variable count changes while preserving unambiguous existing inputs
  const handleSelectVars = async (newV: number) => {
    if (newV === numVars) return;

    if (data) {
      setLoading(true);
      try {
        const currentOutputs = data.truth_table.map((r) => r.output as OutputValue);
        const newRowCount = 1 << newV;
        const newOutputs: OutputValue[] = [];

        // Preserve existing values for rows common to both configurations
        for (let i = 0; i < newRowCount; i++) {
          if (i < currentOutputs.length) {
            newOutputs.push(currentOutputs[i]);
          } else {
            newOutputs.push("0");
          }
        }

        const res = await solveKMap(newV, newOutputs);
        setData(res);
        setNumVars(newV);
        setSelectedMinterm(null);
        setHoveredMinterm(null);
        setSelectedGroupId(null);
        setHoveredGroupId(null);
      } catch (err) {
        console.error("Failed to switch variable count:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setNumVars(newV);
      loadStateForVars(newV);
    }
  };

  // Update truth table outputs
  const handleUpdateOutputs = async (newOutputs: OutputValue[]) => {
    try {
      const res = await solveKMap(numVars, newOutputs);
      setData(res);
    } catch (err) {
      console.error("Failed to solve K-Map:", err);
    }
  };

  // Toggle single truth table row output: 0 -> 1 -> X -> 0
  const handleToggleOutput = (index: number) => {
    if (!data) return;
    const current = data.truth_table[index].output;
    const next: OutputValue = current === "0" ? "1" : current === "1" ? "X" : "0";
    const newOutputs = data.truth_table.map((r) =>
      r.index === index ? next : r.output
    );
    handleUpdateOutputs(newOutputs);
  };

  // Explicitly set single row output
  const handleSetOutput = (index: number, val: OutputValue) => {
    if (!data) return;
    const newOutputs = data.truth_table.map((r) =>
      r.index === index ? val : r.output
    );
    handleUpdateOutputs(newOutputs);
  };

  // Set all outputs
  const handleSetAll = (val: OutputValue) => {
    if (!data) return;
    const newOutputs = data.truth_table.map(() => val);
    handleUpdateOutputs(newOutputs);
  };

  // Invert outputs (0 <-> 1, X preserved)
  const handleInvertAll = () => {
    if (!data) return;
    const newOutputs = data.truth_table.map((r) => {
      if (r.output === "0") return "1" as OutputValue;
      if (r.output === "1") return "0" as OutputValue;
      return "X" as OutputValue;
    });
    handleUpdateOutputs(newOutputs);
  };

  // Toggle from K-map cell
  const handleToggleCell = (minterm: number) => {
    handleToggleOutput(minterm);
    setSelectedMinterm(minterm);
  };

  // Direct output set from K-map cell keyboard
  const handleSetCellOutput = (minterm: number, val: OutputValue) => {
    handleSetOutput(minterm, val);
    setSelectedMinterm(minterm);
  };

  // Reset with confirmation
  const handleRequestReset = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    setIsResetConfirmOpen(false);
    loadStateForVars(numVars);
  };

  if (!data && loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0c] text-[#f3f4f6]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#a78bfa]" />
          <span className="text-sm font-medium text-[#d1d5db]">Initializing Karnaugh Studio...</span>
        </div>
      </div>
    );
  }

  const currentGroups = activeTab === "sop" ? data?.sop.groups ?? [] : data?.pos.groups ?? [];
  const activeGroup = currentGroups.find(
    (g) => g.id === (hoveredGroupId || selectedGroupId)
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0a0c] text-[#e4e4e7] overflow-hidden font-sans select-none">
      {/* Header */}
      <Header
        numVars={numVars}
        onSelectVars={handleSelectVars}
        showGroups={showGroups}
        onToggleShowGroups={() => setShowGroups((prev) => !prev)}
        onReset={handleRequestReset}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Workspace (3 columns) */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left Area: Truth Table (col-span 3) */}
        <section className="lg:col-span-3 h-full min-h-0">
          {data && (
            <TruthTable
              rows={data.truth_table}
              varNames={data.var_names}
              hoveredMinterm={hoveredMinterm}
              selectedMinterm={selectedMinterm}
              activeGroupMinterms={activeGroup?.covered_minterms}
              onHoverMinterm={setHoveredMinterm}
              onSelectMinterm={setSelectedMinterm}
              onToggleOutput={handleToggleOutput}
              onSetOutput={handleSetOutput}
              onSetAll={handleSetAll}
              onInvertAll={handleInvertAll}
            />
          )}
        </section>

        {/* Center Area: Karnaugh Map Visualization (col-span 5) */}
        <section className="lg:col-span-5 h-full min-h-0 flex flex-col justify-center overflow-auto">
          {data && (
            <KarnaughMap
              grid={data.grid}
              groups={currentGroups}
              showGroups={showGroups}
              hoveredMinterm={hoveredMinterm}
              selectedMinterm={selectedMinterm}
              hoveredGroupId={hoveredGroupId}
              selectedGroupId={selectedGroupId}
              onHoverMinterm={setHoveredMinterm}
              onSelectMinterm={setSelectedMinterm}
              onHoverGroup={setHoveredGroupId}
              onSelectGroup={setSelectedGroupId}
              onToggleCell={handleToggleCell}
              onSetCellOutput={handleSetCellOutput}
            />
          )}
        </section>

        {/* Right Area: Results & Educational Insights (col-span 4) */}
        <section className="lg:col-span-4 h-full min-h-0">
          {data && (
            <ResultsPanel
              sop={data.sop}
              pos={data.pos}
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              hoveredGroupId={hoveredGroupId}
              selectedGroupId={selectedGroupId}
              onHoverGroup={setHoveredGroupId}
              onSelectGroup={setSelectedGroupId}
              onHoverMinterm={setHoveredMinterm}
            />
          )}
        </section>
      </main>

      {/* Educational Guide Modal */}
      <EducationalModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        numVars={numVars}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}

export default App;

import { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { TruthTable } from "./components/TruthTable";
import { KarnaughMap } from "./components/KarnaughMap";
import { ResultsPanel } from "./components/ResultsPanel";
import { EducationalModal } from "./components/EducationalModal";
import { ResetConfirmModal } from "./components/ResetConfirmModal";
import { getDefaultState, getDefaultOutputs, solveKMap } from "./api";
import { KMapResponse, OutputValue } from "./types/kmap";
import { Loader2 } from "lucide-react";

export function App() {
  const [numVars, setNumVars] = useState<number>(4);
  const [data, setData] = useState<KMapResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"sop" | "pos">("sop");
  const [showGroups, setShowGroups] = useState<boolean>(true);

  // Variable names state: user can change freely, default IN1, IN2, IN3, IN4
  const [varNames, setVarNames] = useState<string[]>([
    "IN1",
    "IN2",
    "IN3",
    "IN4",
  ]);
  const [varNamesCache, setVarNamesCache] = useState<string[]>([
    "IN1",
    "IN2",
    "IN3",
    "IN4",
  ]);

  // Multiple outputs state: prefix "O", default O0
  const [outputNames, setOutputNames] = useState<string[]>(["O0"]);
  const [activeOutputName, setActiveOutputName] = useState<string>("O0");
  const [allOutputs, setAllOutputs] = useState<Record<string, OutputValue[]>>({
    O0: getDefaultOutputs(4),
  });

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

  // Solve active output function
  const solveActiveFunction = useCallback(
    async (
      varsCount: number,
      currentVarNames: string[],
      activeOut: string,
      outputsMap: Record<string, OutputValue[]>
    ) => {
      const currentOutputs =
        outputsMap[activeOut] || getDefaultOutputs(varsCount);
      try {
        const res = await solveKMap(varsCount, currentOutputs, currentVarNames);
        setData(res);
      } catch (err) {
        console.error("Failed to solve K-Map:", err);
      }
    },
    []
  );

  // Load initial educational state
  const loadInitialState = useCallback(
    async (v: number) => {
      setLoading(true);
      try {
        const initialVars = Array.from({ length: v }, (_, i) => `IN${i + 1}`);
        const defaultOuts = getDefaultOutputs(v);
        const initialAllOutputs: Record<string, OutputValue[]> = {
          O0: defaultOuts,
        };

        setNumVars(v);
        setVarNames(initialVars);
        setVarNamesCache(["IN1", "IN2", "IN3", "IN4"]);
        setOutputNames(["O0"]);
        setActiveOutputName("O0");
        setAllOutputs(initialAllOutputs);

        const res = await getDefaultState(v, initialVars);
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
    },
    []
  );

  useEffect(() => {
    loadInitialState(4);
  }, [loadInitialState]);

  // Handle variable count changes while preserving existing inputs
  const handleSelectVars = async (newV: number) => {
    if (newV === numVars) return;

    setLoading(true);
    try {
      // Adjust variable names: preserve custom names from cache, or use defaults
      const newVarNames = Array.from({ length: newV }, (_, i) => {
        return varNamesCache[i] || `IN${i + 1}`;
      });

      const newRowCount = 1 << newV;
      const updatedAllOutputs: Record<string, OutputValue[]> = {};

      for (const name of outputNames) {
        const prev = allOutputs[name] || [];
        const next: OutputValue[] = [];
        for (let i = 0; i < newRowCount; i++) {
          next.push(i < prev.length ? prev[i] : "0");
        }
        updatedAllOutputs[name] = next;
      }

      setNumVars(newV);
      setVarNames(newVarNames);
      setAllOutputs(updatedAllOutputs);

      await solveActiveFunction(
        newV,
        newVarNames,
        activeOutputName,
        updatedAllOutputs
      );

      setSelectedMinterm(null);
      setHoveredMinterm(null);
      setSelectedGroupId(null);
      setHoveredGroupId(null);
    } catch (err) {
      console.error("Failed to switch variable count:", err);
    } finally {
      setLoading(false);
    }
  };

  // Rename variable
  const handleRenameVariable = (index: number, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const nextVarNames = [...varNames];
    nextVarNames[index] = trimmed;
    setVarNames(nextVarNames);

    const nextCache = [...varNamesCache];
    nextCache[index] = trimmed;
    setVarNamesCache(nextCache);

    solveActiveFunction(numVars, nextVarNames, activeOutputName, allOutputs);
  };

  // Add new output column (e.g. O1, O2, O3...)
  const handleAddOutput = () => {
    let nextIdx = 0;
    while (outputNames.includes(`O${nextIdx}`)) {
      nextIdx++;
    }
    const newName = `O${nextIdx}`;
    const rowCount = 1 << numVars;
    const newValues: OutputValue[] = new Array(rowCount).fill("0");

    const nextOutputs = { ...allOutputs, [newName]: newValues };
    const nextNames = [...outputNames, newName];

    setOutputNames(nextNames);
    setAllOutputs(nextOutputs);
    setActiveOutputName(newName);

    solveActiveFunction(numVars, varNames, newName, nextOutputs);
  };

  // Delete an output column
  const handleDeleteOutput = (outputToDelete: string) => {
    if (outputNames.length <= 1) return;

    const nextNames = outputNames.filter((n) => n !== outputToDelete);
    const nextOutputs = { ...allOutputs };
    delete nextOutputs[outputToDelete];

    const nextActive =
      activeOutputName === outputToDelete ? nextNames[0] : activeOutputName;

    setOutputNames(nextNames);
    setAllOutputs(nextOutputs);
    setActiveOutputName(nextActive);

    solveActiveFunction(numVars, varNames, nextActive, nextOutputs);
  };

  // Switch which output is displayed in K-Map and solved
  const handleSelectActiveOutput = (outputName: string) => {
    if (!outputNames.includes(outputName)) return;
    setActiveOutputName(outputName);
    solveActiveFunction(numVars, varNames, outputName, allOutputs);
  };

  // Toggle single output cell: 0 -> 1 -> X -> 0
  const handleToggleOutput = (index: number, outputName?: string) => {
    const target = outputName || activeOutputName;
    const currentList = allOutputs[target] || [];
    const currentVal = currentList[index] || "0";
    const nextVal: OutputValue =
      currentVal === "0" ? "1" : currentVal === "1" ? "X" : "0";

    const nextList = [...currentList];
    nextList[index] = nextVal;
    const nextAllOutputs = { ...allOutputs, [target]: nextList };
    setAllOutputs(nextAllOutputs);

    if (activeOutputName !== target) {
      setActiveOutputName(target);
    }
    solveActiveFunction(numVars, varNames, target, nextAllOutputs);
  };

  // Explicitly set single row output
  const handleSetOutput = (
    index: number,
    val: OutputValue,
    outputName?: string
  ) => {
    const target = outputName || activeOutputName;
    const currentList = allOutputs[target] || [];
    const nextList = [...currentList];
    nextList[index] = val;
    const nextAllOutputs = { ...allOutputs, [target]: nextList };
    setAllOutputs(nextAllOutputs);

    if (activeOutputName !== target) {
      setActiveOutputName(target);
    }
    solveActiveFunction(numVars, varNames, target, nextAllOutputs);
  };

  // Set all outputs for active output
  const handleSetAll = (val: OutputValue) => {
    const rowCount = 1 << numVars;
    const nextList: OutputValue[] = new Array(rowCount).fill(val);
    const nextAllOutputs = { ...allOutputs, [activeOutputName]: nextList };
    setAllOutputs(nextAllOutputs);

    solveActiveFunction(numVars, varNames, activeOutputName, nextAllOutputs);
  };

  // Invert outputs for active output (0 <-> 1, X preserved)
  const handleInvertAll = () => {
    const currentList = allOutputs[activeOutputName] || [];
    const nextList = currentList.map((val) => {
      if (val === "0") return "1" as OutputValue;
      if (val === "1") return "0" as OutputValue;
      return "X" as OutputValue;
    });
    const nextAllOutputs = { ...allOutputs, [activeOutputName]: nextList };
    setAllOutputs(nextAllOutputs);

    solveActiveFunction(numVars, varNames, activeOutputName, nextAllOutputs);
  };

  // Toggle from K-map cell
  const handleToggleCell = (minterm: number) => {
    handleToggleOutput(minterm, activeOutputName);
    setSelectedMinterm(minterm);
  };

  // Direct output set from K-map cell keyboard
  const handleSetCellOutput = (minterm: number, val: OutputValue) => {
    handleSetOutput(minterm, val, activeOutputName);
    setSelectedMinterm(minterm);
  };

  // Reset confirmation
  const handleRequestReset = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    setIsResetConfirmOpen(false);
    loadInitialState(numVars);
  };

  if (!data && loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0c] text-[#f3f4f6]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#a78bfa]" />
          <span className="text-sm font-medium text-[#d1d5db]">
            Initializing Karnaugh Studio...
          </span>
        </div>
      </div>
    );
  }

  const currentGroups =
    activeTab === "sop" ? data?.sop.groups ?? [] : data?.pos.groups ?? [];
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
        {/* Left Area: Truth Table (col-span 4) */}
        <section className="lg:col-span-4 h-full min-h-0">
          {data && (
            <TruthTable
              rows={data.truth_table}
              varNames={varNames}
              outputNames={outputNames}
              activeOutputName={activeOutputName}
              allOutputs={allOutputs}
              hoveredMinterm={hoveredMinterm}
              selectedMinterm={selectedMinterm}
              activeGroupMinterms={activeGroup?.covered_minterms}
              onHoverMinterm={setHoveredMinterm}
              onSelectMinterm={setSelectedMinterm}
              onToggleOutput={handleToggleOutput}
              onSetOutput={handleSetOutput}
              onSetAll={handleSetAll}
              onInvertAll={handleInvertAll}
              onRenameVariable={handleRenameVariable}
              onAddOutput={handleAddOutput}
              onDeleteOutput={handleDeleteOutput}
              onSelectActiveOutput={handleSelectActiveOutput}
            />
          )}
        </section>

        {/* Center Area: Karnaugh Map Visualization (col-span 4) */}
        <section className="lg:col-span-4 h-full min-h-0 flex flex-col justify-center overflow-auto">
          {data && (
            <KarnaughMap
              grid={data.grid}
              groups={currentGroups}
              showGroups={showGroups}
              activeOutputName={activeOutputName}
              outputNames={outputNames}
              onSelectOutput={handleSelectActiveOutput}
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
              activeOutputName={activeOutputName}
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

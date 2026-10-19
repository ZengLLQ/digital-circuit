import { invoke, isTauri } from "@tauri-apps/api/core";
import { KMapResponse, OutputValue } from "./types/kmap";

export async function solveKMap(
  numVars: number,
  outputs: OutputValue[]
): Promise<KMapResponse> {
  if (isTauri()) {
    return await invoke<KMapResponse>("solve_kmap", {
      numVars,
      outputs,
    });
  }

  // Fallback for standalone web preview mode
  return await mockSolveKMap(numVars, outputs);
}

export async function getDefaultState(numVars: number): Promise<KMapResponse> {
  if (isTauri()) {
    return await invoke<KMapResponse>("get_default_state", {
      numVars,
    });
  }

  const defaultOuts = getDefaultOutputs(numVars);
  return await mockSolveKMap(numVars, defaultOuts);
}

function getDefaultOutputs(numVars: number): OutputValue[] {
  const rowCount = 1 << numVars;
  if (numVars === 2) {
    return ["0", "1", "1", "1"];
  } else if (numVars === 3) {
    return ["1", "0", "1", "0", "0", "1", "0", "1"];
  } else {
    const outs: OutputValue[] = new Array(rowCount).fill("0");
    for (const m of [0, 2, 8, 10, 5, 7, 13, 15]) {
      outs[m] = "1";
    }
    return outs;
  }
}

// Minimal fallback so browser previews don't blank out
async function mockSolveKMap(
  numVars: number,
  outputs: OutputValue[]
): Promise<KMapResponse> {
  const varNames = numVars === 2 ? ["A", "B"] : numVars === 3 ? ["A", "B", "C"] : ["A", "B", "C", "D"];
  const rowCount = 1 << numVars;
  const rows = [];
  for (let i = 0; i < rowCount; i++) {
    const vals = [];
    for (let b = numVars - 1; b >= 0; b--) {
      vals.push((i >> b) & 1);
    }
    rows.push({
      index: i,
      values: vals,
      output: outputs[i] || "0",
    });
  }

  // Mock grid
  const rowCountGrid = numVars === 4 ? 4 : 2;
  const colCountGrid = numVars === 2 ? 2 : 4;
  const cells = [];
  const gray2 = [0, 1];
  const gray4 = [0, 1, 3, 2];

  for (let r = 0; r < rowCountGrid; r++) {
    const rowCells = [];
    for (let c = 0; c < colCountGrid; c++) {
      const rVal = numVars === 4 ? gray4[r] : gray2[r];
      const cVal = numVars === 2 ? gray2[c] : gray4[c];
      const shift = numVars === 4 ? 2 : numVars === 3 ? 2 : 1;
      const minterm = (rVal << shift) | cVal;
      rowCells.push({
        row: r,
        col: c,
        minterm,
        binary: minterm.toString(2).padStart(numVars, "0"),
        output: outputs[minterm] || "0",
      });
    }
    cells.push(rowCells);
  }

  return {
    num_vars: numVars,
    var_names: varNames,
    truth_table: rows,
    grid: {
      num_vars: numVars,
      row_vars: numVars === 4 ? ["A", "B"] : ["A"],
      col_vars: numVars === 2 ? ["B"] : numVars === 3 ? ["B", "C"] : ["C", "D"],
      row_headers: numVars === 4 ? ["00", "01", "11", "10"] : ["0", "1"],
      col_headers: numVars === 2 ? ["0", "1"] : ["00", "01", "11", "10"],
      cells,
    },
    sop: {
      expression_formatted: "Please run via Tauri Desktop for full Rust Quine-McCluskey engine",
      expression_plain: "Please run via Tauri Desktop for full Rust Quine-McCluskey engine",
      term_count: 0,
      literal_count: 0,
      groups: [],
      is_constant_zero: false,
      is_constant_one: false,
      is_all_dont_care: false,
    },
    pos: {
      expression_formatted: "Please run via Tauri Desktop for full Rust Quine-McCluskey engine",
      expression_plain: "Please run via Tauri Desktop for full Rust Quine-McCluskey engine",
      term_count: 0,
      literal_count: 0,
      groups: [],
      is_constant_zero: false,
      is_constant_one: false,
      is_all_dont_care: false,
    },
  };
}

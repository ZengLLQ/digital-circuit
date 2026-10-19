import { invoke, isTauri } from "@tauri-apps/api/core";
import { KMapResponse, OutputValue } from "./types/kmap";
import { solveKMapInBrowser } from "./utils/solver";

export async function solveKMap(
  numVars: number,
  outputs: OutputValue[],
  varNames?: string[]
): Promise<KMapResponse> {
  if (isTauri()) {
    try {
      return await invoke<KMapResponse>("solve_kmap", {
        numVars,
        outputs,
        varNames: varNames ?? null,
      });
    } catch (err) {
      console.warn("Tauri invoke solve_kmap failed, falling back to browser solver:", err);
    }
  }

  // Fallback for standalone web preview mode and instant responsiveness
  return solveKMapInBrowser({
    numVars,
    outputs,
    varNames,
  });
}

export async function getDefaultState(
  numVars: number,
  varNames?: string[]
): Promise<KMapResponse> {
  if (isTauri()) {
    try {
      return await invoke<KMapResponse>("get_default_state", {
        numVars,
        varNames: varNames ?? null,
      });
    } catch (err) {
      console.warn("Tauri invoke get_default_state failed, falling back to browser solver:", err);
    }
  }

  const defaultOuts = getDefaultOutputs(numVars);
  return solveKMapInBrowser({
    numVars,
    outputs: defaultOuts,
    varNames,
  });
}

export function getDefaultOutputs(numVars: number): OutputValue[] {
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

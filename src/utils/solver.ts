import type {
  ImplicantGroup,
  KMapCell,
  KMapGrid,
  KMapResponse,
  MinimizationResult,
  OutputValue,
  GroupRect,
} from "../types/kmap.ts";

export interface SolverOptions {
  numVars: number;
  outputs: OutputValue[];
  varNames?: string[];
}

export function solveKMapInBrowser(options: SolverOptions): KMapResponse {
  const numVars = Math.min(4, Math.max(2, options.numVars));
  const defaults = Array.from({ length: numVars }, (_, i) => `IN${i + 1}`);
  const varNames = options.varNames && options.varNames.length === numVars
    ? options.varNames.map((n, i) => n.trim() || defaults[i])
    : defaults;

  const rowCount = 1 << numVars;
  const outputs = options.outputs.slice(0, rowCount);
  while (outputs.length < rowCount) {
    outputs.push("0");
  }

  // Build truth table rows
  const truthTable = [];
  const onTerms: number[] = [];
  const offTerms: number[] = [];
  const dcTerms: number[] = [];

  for (let i = 0; i < rowCount; i++) {
    const vals: number[] = [];
    for (let b = numVars - 1; b >= 0; b--) {
      vals.push((i >> b) & 1);
    }
    const out = outputs[i];
    truthTable.push({
      index: i,
      values: vals,
      output: out,
    });

    if (out === "1") onTerms.push(i);
    else if (out === "X") dcTerms.push(i);
    else offTerms.push(i);
  }

  // Build KMap Grid matching requested layout
  const grid = buildGrid(numVars, truthTable, varNames);

  // Solve SoP and PoS
  const sop = solveExpression(numVars, onTerms, dcTerms, varNames, "sop");
  const pos = solveExpression(numVars, offTerms, dcTerms, varNames, "pos");

  return {
    num_vars: numVars,
    var_names: varNames,
    truth_table: truthTable,
    grid,
    sop,
    pos,
  };
}

function buildGrid(
  numVars: number,
  truthTable: { index: number; output: OutputValue }[],
  varNames: string[]
): KMapGrid {
  const getOut = (m: number): OutputValue =>
    truthTable.find((r) => r.index === m)?.output || "0";

  if (numVars === 2) {
    // 2 var: Karnaugh map: IN2 \ IN1 (Rows: IN2, Cols: IN1)
    const rowVars = [varNames[1]];
    const colVars = [varNames[0]];
    const cells: KMapCell[][] = [];
    for (let r = 0; r < 2; r++) {
      const rowCells: KMapCell[] = [];
      for (let c = 0; c < 2; c++) {
        const minterm = (c << 1) | r;
        rowCells.push({
          row: r,
          col: c,
          minterm,
          binary: minterm.toString(2).padStart(2, "0"),
          output: getOut(minterm),
        });
      }
      cells.push(rowCells);
    }
    return {
      num_vars: 2,
      row_vars: rowVars,
      col_vars: colVars,
      row_headers: ["0", "1"],
      col_headers: ["0", "1"],
      cells,
    };
  } else if (numVars === 3) {
    // 3 var: Karnaugh map: IN2 IN3 \ IN1 (Rows: IN2 IN3, Cols: IN1)
    const rowVars = [varNames[1], varNames[2]];
    const colVars = [varNames[0]];
    const gray4 = [0, 1, 3, 2];
    const cells: KMapCell[][] = [];
    for (let r = 0; r < 4; r++) {
      const rowVal = gray4[r];
      const rowCells: KMapCell[] = [];
      for (let c = 0; c < 2; c++) {
        const colVal = c;
        const minterm = (colVal << 2) | rowVal;
        rowCells.push({
          row: r,
          col: c,
          minterm,
          binary: minterm.toString(2).padStart(3, "0"),
          output: getOut(minterm),
        });
      }
      cells.push(rowCells);
    }
    return {
      num_vars: 3,
      row_vars: rowVars,
      col_vars: colVars,
      row_headers: ["00", "01", "11", "10"],
      col_headers: ["0", "1"],
      cells,
    };
  } else {
    // 4 var: Karnaugh map: IN3 IN4 \ IN1 IN2 (Rows: IN3 IN4, Cols: IN1 IN2)
    const rowVars = [varNames[2], varNames[3]];
    const colVars = [varNames[0], varNames[1]];
    const gray4 = [0, 1, 3, 2];
    const cells: KMapCell[][] = [];
    for (let r = 0; r < 4; r++) {
      const rowVal = gray4[r];
      const rowCells: KMapCell[] = [];
      for (let c = 0; c < 4; c++) {
        const colVal = gray4[c];
        const minterm = (colVal << 2) | rowVal;
        rowCells.push({
          row: r,
          col: c,
          minterm,
          binary: minterm.toString(2).padStart(4, "0"),
          output: getOut(minterm),
        });
      }
      cells.push(rowCells);
    }
    return {
      num_vars: 4,
      row_vars: rowVars,
      col_vars: colVars,
      row_headers: ["00", "01", "11", "10"],
      col_headers: ["00", "01", "11", "10"],
      cells,
    };
  }
}

export function implicantToRects(
  numVars: number,
  mask: number,
  value: number
): GroupRect[] {
  if (numVars === 2) {
    const rStart = (mask & 1) !== 0 ? value & 1 : 0;
    const rSpan = (mask & 1) !== 0 ? 1 : 2;
    const cStart = (mask & 2) !== 0 ? (value >> 1) & 1 : 0;
    const cSpan = (mask & 2) !== 0 ? 1 : 2;
    return [{ r_start: rStart, r_span: rSpan, c_start: cStart, c_span: cSpan, is_corner: false }];
  }

  if (numVars === 3) {
    const colSpans = (mask & 4) !== 0 ? [[(value >> 2) & 1, 1]] : [[0, 2]];
    const in2Active = (mask & 2) !== 0;
    const in3Active = (mask & 1) !== 0;
    const in2Val = (value >> 1) & 1;
    const in3Val = value & 1;

    let rowSpans: [number, number][];
    if (in2Active && in3Active) {
      const idxMap: Record<string, number> = { "0,0": 0, "0,1": 1, "1,1": 2, "1,0": 3 };
      rowSpans = [[idxMap[`${in2Val},${in3Val}`] ?? 0, 1]];
    } else if (in2Active) {
      rowSpans = in2Val === 0 ? [[0, 2]] : [[2, 2]];
    } else if (in3Active) {
      rowSpans = in3Val === 0 ? [[0, 1], [3, 1]] : [[1, 2]];
    } else {
      rowSpans = [[0, 4]];
    }

    const rects: GroupRect[] = [];
    for (const [cStart, cSpan] of colSpans) {
      for (const [rStart, rSpan] of rowSpans) {
        rects.push({ r_start: rStart, r_span: rSpan, c_start: cStart, c_span: cSpan, is_corner: false });
      }
    }
    return rects;
  }

  if (numVars === 4) {
    const in1Active = (mask & 8) !== 0;
    const in2Active = (mask & 4) !== 0;
    const in1Val = (value >> 3) & 1;
    const in2Val = (value >> 2) & 1;

    let colSpans: [number, number][];
    if (in1Active && in2Active) {
      const idxMap: Record<string, number> = { "0,0": 0, "0,1": 1, "1,1": 2, "1,0": 3 };
      colSpans = [[idxMap[`${in1Val},${in2Val}`] ?? 0, 1]];
    } else if (in1Active) {
      colSpans = in1Val === 0 ? [[0, 2]] : [[2, 2]];
    } else if (in2Active) {
      colSpans = in2Val === 0 ? [[0, 1], [3, 1]] : [[1, 2]];
    } else {
      colSpans = [[0, 4]];
    }

    const in3Active = (mask & 2) !== 0;
    const in4Active = (mask & 1) !== 0;
    const in3Val = (value >> 1) & 1;
    const in4Val = value & 1;

    let rowSpans: [number, number][];
    if (in3Active && in4Active) {
      const idxMap: Record<string, number> = { "0,0": 0, "0,1": 1, "1,1": 2, "1,0": 3 };
      rowSpans = [[idxMap[`${in3Val},${in4Val}`] ?? 0, 1]];
    } else if (in3Active) {
      rowSpans = in3Val === 0 ? [[0, 2]] : [[2, 2]];
    } else if (in4Active) {
      rowSpans = in4Val === 0 ? [[0, 1], [3, 1]] : [[1, 2]];
    } else {
      rowSpans = [[0, 4]];
    }

    const isCorner = rowSpans.length === 2 && colSpans.length === 2;
    const rects: GroupRect[] = [];
    for (const [rStart, rSpan] of rowSpans) {
      for (const [cStart, cSpan] of colSpans) {
        rects.push({ r_start: rStart, r_span: rSpan, c_start: cStart, c_span: cSpan, is_corner: isCorner });
      }
    }
    return rects;
  }

  return [];
}

interface Term {
  mask: number;
  value: number;
  minterms: number[];
}

function solveExpression(
  numVars: number,
  targetTerms: number[],
  dcTerms: number[],
  varNames: string[],
  mode: "sop" | "pos"
): MinimizationResult {
  const totalCells = 1 << numVars;

  if (dcTerms.length === totalCells) {
    return {
      expression_formatted: "0",
      expression_plain: "0",
      term_count: 0,
      literal_count: 0,
      groups: [],
      is_constant_zero: true,
      is_constant_one: false,
      is_all_dont_care: true,
    };
  }

  if (targetTerms.length === 0) {
    const isConst0 = mode === "sop";
    return {
      expression_formatted: isConst0 ? "0" : "1",
      expression_plain: isConst0 ? "0" : "1",
      term_count: 0,
      literal_count: 0,
      groups: [],
      is_constant_zero: isConst0,
      is_constant_one: !isConst0,
      is_all_dont_care: false,
    };
  }

  const allowed = Array.from(new Set([...targetTerms, ...dcTerms])).sort((a, b) => a - b);

  // If allowed covers all cells universally:
  if (allowed.length === totalCells) {
    const isOne = mode === "sop";
    const group: ImplicantGroup = {
      id: "G1",
      color_index: 0,
      term_formatted: isOne ? "1" : "0",
      term_plain: isOne ? "1" : "0",
      covered_minterms: Array.from({ length: totalCells }, (_, i) => i),
      rects: implicantToRects(numVars, 0, 0),
      is_essential: true,
      eliminated_vars: [...varNames],
      retained_vars: [],
      explanation: isOne
        ? `Universal group of all ${totalCells} cells covers the entire map, eliminating all variables to yield constant 1.`
        : `Universal zero-group covering all ${totalCells} cells eliminates all variables to yield constant 0.`,
    };
    return {
      expression_formatted: isOne ? "1" : "0",
      expression_plain: isOne ? "1" : "0",
      term_count: 1,
      literal_count: 0,
      groups: [group],
      is_constant_zero: !isOne,
      is_constant_one: isOne,
      is_all_dont_care: false,
    };
  }

  // Generate prime implicants via Quine-McCluskey
  const primeImplicants = generatePrimeImplicants(numVars, allowed);

  // Select minimum cover using Petrick's method
  const selected = selectMinimumCover(targetTerms, primeImplicants, numVars);

  const groups: ImplicantGroup[] = selected.map((term, idx) => {
    return formatGroup(idx, term, numVars, varNames, mode);
  });

  const sep = mode === "sop" ? " + " : "";
  const expr = groups.length === 0 ? (mode === "sop" ? "0" : "1") : groups.map((g) => g.term_plain).join(sep);
  const exprFmt = groups.length === 0 ? (mode === "sop" ? "0" : "1") : groups.map((g) => g.term_formatted).join(sep);

  const totalLiterals = selected.reduce((sum, t) => sum + countBits(t.mask), 0);

  return {
    expression_formatted: exprFmt,
    expression_plain: expr,
    term_count: groups.length,
    literal_count: totalLiterals,
    groups,
    is_constant_zero: false,
    is_constant_one: false,
    is_all_dont_care: false,
  };
}

function countBits(n: number): number {
  let count = 0;
  let val = n;
  while (val > 0) {
    if ((val & 1) !== 0) count++;
    val >>= 1;
  }
  return count;
}

function generatePrimeImplicants(numVars: number, allowedMinterms: number[]): Term[] {
  const allowedSet = new Set(allowedMinterms);
  const totalPossibilities = Math.pow(3, numVars);
  const validTerms: Term[] = [];

  for (let code = 0; code < totalPossibilities; code++) {
    let temp = code;
    let mask = 0;
    let value = 0;

    for (let v = 0; v < numVars; v++) {
      const state = temp % 3;
      temp = Math.floor(temp / 3);
      const bit = numVars - 1 - v;
      if (state === 0) {
        mask |= 1 << bit;
      } else if (state === 1) {
        mask |= 1 << bit;
        value |= 1 << bit;
      }
    }

    const minterms: number[] = [];
    let allInAllowed = true;
    const totalCells = 1 << numVars;

    for (let m = 0; m < totalCells; m++) {
      if ((m & mask) === value) {
        if (!allowedSet.has(m)) {
          allInAllowed = false;
          break;
        }
        minterms.push(m);
      }
    }

    if (allInAllowed && minterms.length > 0) {
      validTerms.push({ mask, value, minterms });
    }
  }

  // Filter to prime implicants (not strictly subsumed by a larger implicant)
  const primes: Term[] = [];
  for (const t1 of validTerms) {
    let isSubsumed = false;
    for (const t2 of validTerms) {
      if (t1 === t2) continue;
      // t2 subsumes t1 if t2 covers all minterms of t1 and has strictly more minterms
      if (t2.minterms.length > t1.minterms.length && t1.minterms.every((m) => t2.minterms.includes(m))) {
        isSubsumed = true;
        break;
      }
    }
    if (!isSubsumed) {
      primes.push(t1);
    }
  }

  return primes;
}

function selectMinimumCover(targetMinterms: number[], primes: Term[], _numVars: number): Term[] {
  if (targetMinterms.length === 0) return [];

  // Identify essential prime implicants
  const essential: Term[] = [];
  const covered = new Set<number>();

  for (const m of targetMinterms) {
    const covering = primes.filter((p) => p.minterms.includes(m));
    if (covering.length === 1 && !essential.includes(covering[0])) {
      essential.push(covering[0]);
    }
  }

  for (const p of essential) {
    for (const m of p.minterms) {
      covered.add(m);
    }
  }

  const remaining = targetMinterms.filter((m) => !covered.has(m));
  if (remaining.length === 0) {
    return essential;
  }

  // Greedy / branch cover for remaining
  const remainingPrimes = primes.filter((p) => !essential.includes(p));
  let bestCover: Term[] = [];
  let bestLiteralCount = Infinity;

  const search = (rem: number[], current: Term[]) => {
    if (rem.length === 0) {
      const totalLits = current.reduce((sum, t) => sum + countBits(t.mask), 0);
      if (current.length < bestCover.length || bestCover.length === 0 || (current.length === bestCover.length && totalLits < bestLiteralCount)) {
        bestCover = [...current];
        bestLiteralCount = totalLits;
      }
      return;
    }

    if (bestCover.length > 0 && current.length >= bestCover.length) {
      return;
    }

    const target = rem[0];
    const candidatePrimes = remainingPrimes.filter((p) => p.minterms.includes(target));

    for (const p of candidatePrimes) {
      const nextRem = rem.filter((m) => !p.minterms.includes(m));
      search(nextRem, [...current, p]);
    }
  };

  search(remaining, []);
  return [...essential, ...bestCover];
}

function formatGroup(
  idx: number,
  term: Term,
  numVars: number,
  varNames: string[],
  mode: "sop" | "pos"
): ImplicantGroup {
  const eliminatedVars: string[] = [];
  const retainedVars: string[] = [];
  const partsFormatted: string[] = [];
  const partsPlain: string[] = [];

  for (let bitIdx = numVars - 1; bitIdx >= 0; bitIdx--) {
    const varName = varNames[numVars - 1 - bitIdx];
    const isActive = (term.mask & (1 << bitIdx)) !== 0;
    const bitVal = (term.value >> bitIdx) & 1;

    if (isActive) {
      if (mode === "sop") {
        if (bitVal === 1) {
          partsFormatted.push(varName);
          partsPlain.push(varName);
          retainedVars.push(`${varName}=1`);
        } else {
          partsFormatted.push(`${varName}′`);
          partsPlain.push(`${varName}'`);
          retainedVars.push(`${varName}=0`);
        }
      } else {
        if (bitVal === 0) {
          partsFormatted.push(varName);
          partsPlain.push(varName);
          retainedVars.push(`${varName}=0`);
        } else {
          partsFormatted.push(`${varName}′`);
          partsPlain.push(`${varName}'`);
          retainedVars.push(`${varName}=1`);
        }
      }
    } else {
      eliminatedVars.push(varName);
    }
  }

  const joinSep = varNames.some((v) => v.length > 1) ? " " : "";
  let termFormatted = "";
  let termPlain = "";

  if (mode === "sop") {
    termFormatted = partsFormatted.join(joinSep);
    termPlain = partsPlain.join(joinSep);
  } else {
    termFormatted = `(${partsFormatted.join(" + ")})`;
    termPlain = `(${partsPlain.join(" + ")})`;
  }

  const rects = implicantToRects(numVars, term.mask, term.value);
  const size = term.minterms.length;
  const elimCount = eliminatedVars.length;

  let explanation = `Group of ${size} cell${size > 1 ? "s" : ""} eliminates ${elimCount} variable${elimCount > 1 ? "s" : ""} (${eliminatedVars.join(", ") || "none"}). `;
  if (retainedVars.length > 0) {
    explanation += `Condition: ${retainedVars.join(", ")}. `;
  }
  if (rects.length > 1) {
    if (rects.some((r) => r.is_corner)) {
      explanation += "Corners wraparound across toroidal boundaries. ";
    } else {
      explanation += "Boundary wraparound across Gray-code edges. ";
    }
  }

  return {
    id: `G${idx + 1}`,
    color_index: idx % 8,
    term_formatted: termFormatted,
    term_plain: termPlain,
    covered_minterms: term.minterms,
    rects,
    is_essential: true,
    eliminated_vars: eliminatedVars,
    retained_vars: retainedVars,
    explanation,
  };
}

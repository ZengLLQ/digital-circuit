export type OutputValue = "0" | "1" | "X";

export interface TruthTableRow {
  index: usize;
  values: number[]; // e.g. [0, 1]
  output: OutputValue;
}

export type usize = number;

export interface KMapCell {
  row: usize;
  col: usize;
  minterm: usize;
  binary: string;
  output: OutputValue;
}

export interface KMapGrid {
  num_vars: usize;
  row_vars: string[];
  col_vars: string[];
  row_headers: string[];
  col_headers: string[];
  cells: KMapCell[][];
}

export interface GroupRect {
  r_start: usize;
  r_span: usize;
  c_start: usize;
  c_span: usize;
  is_corner: boolean;
}

export interface ImplicantGroup {
  id: string; // "G1", "G2"
  color_index: usize;
  term_formatted: string;
  term_plain: string;
  covered_minterms: usize[];
  rects: GroupRect[];
  is_essential: boolean;
  eliminated_vars: string[];
  retained_vars: string[];
  explanation: string;
}

export interface MinimizationResult {
  expression_formatted: string;
  expression_plain: string;
  term_count: usize;
  literal_count: usize;
  groups: ImplicantGroup[];
  is_constant_zero: boolean;
  is_constant_one: boolean;
  is_all_dont_care: boolean;
}

export interface KMapResponse {
  num_vars: usize;
  var_names: string[];
  truth_table: TruthTableRow[];
  grid: KMapGrid;
  sop: MinimizationResult;
  pos: MinimizationResult;
}

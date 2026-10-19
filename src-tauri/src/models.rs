use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TruthTableRow {
    pub index: usize,
    pub values: Vec<u8>,
    pub output: String, // "0", "1", "X"
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct KMapCell {
    pub row: usize,
    pub col: usize,
    pub minterm: usize,
    pub binary: String,
    pub output: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct KMapGrid {
    pub num_vars: usize,
    pub row_vars: Vec<String>,
    pub col_vars: Vec<String>,
    pub row_headers: Vec<String>,
    pub col_headers: Vec<String>,
    pub cells: Vec<Vec<KMapCell>>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct GroupRect {
    pub r_start: usize,
    pub r_span: usize,
    pub c_start: usize,
    pub c_span: usize,
    pub is_corner: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ImplicantGroup {
    pub id: String,
    pub color_index: usize,
    pub term_formatted: String,
    pub term_plain: String,
    pub covered_minterms: Vec<usize>,
    pub rects: Vec<GroupRect>,
    pub is_essential: bool,
    pub eliminated_vars: Vec<String>,
    pub retained_vars: Vec<String>,
    pub explanation: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct MinimizationResult {
    pub expression_formatted: String,
    pub expression_plain: String,
    pub term_count: usize,
    pub literal_count: usize,
    pub groups: Vec<ImplicantGroup>,
    pub is_constant_zero: bool,
    pub is_constant_one: bool,
    pub is_all_dont_care: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct KMapResponse {
    pub num_vars: usize,
    pub var_names: Vec<String>,
    pub truth_table: Vec<TruthTableRow>,
    pub grid: KMapGrid,
    pub sop: MinimizationResult,
    pub pos: MinimizationResult,
}

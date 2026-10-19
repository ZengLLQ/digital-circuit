use crate::models::{GroupRect, KMapCell, KMapGrid, TruthTableRow};
use crate::truth_table::get_default_variable_names;

pub fn build_kmap_grid(
    num_vars: usize,
    truth_table: &[TruthTableRow],
    var_names: Option<&[String]>,
) -> KMapGrid {
    let defaults = get_default_variable_names(num_vars);
    let resolved_vars = var_names.unwrap_or(&defaults);

    match num_vars {
        2 => build_2var_grid(truth_table, resolved_vars),
        3 => build_3var_grid(truth_table, resolved_vars),
        4 => build_4var_grid(truth_table, resolved_vars),
        _ => build_2var_grid(truth_table, resolved_vars),
    }
}

fn get_output_for_minterm(truth_table: &[TruthTableRow], m: usize) -> String {
    truth_table
        .iter()
        .find(|r| r.index == m)
        .map(|r| r.output.clone())
        .unwrap_or_else(|| "0".to_string())
}

// 2 var: Karnaugh map: IN2 \ IN1
// Rows: IN2 (bit 0), Cols: IN1 (bit 1)
fn build_2var_grid(truth_table: &[TruthTableRow], var_names: &[String]) -> KMapGrid {
    let row_vars = vec![var_names[1].clone()];
    let col_vars = vec![var_names[0].clone()];
    let row_headers = vec!["0".to_string(), "1".to_string()];
    let col_headers = vec!["0".to_string(), "1".to_string()];

    let mut cells = Vec::new();
    for r in 0..2 {
        let row_val = r; // IN2
        let mut row_cells = Vec::new();
        for c in 0..2 {
            let col_val = c; // IN1
            let minterm = (col_val << 1) | row_val;
            let binary = format!("{:02b}", minterm);
            let output = get_output_for_minterm(truth_table, minterm);
            row_cells.push(KMapCell {
                row: r,
                col: c,
                minterm,
                binary,
                output,
            });
        }
        cells.push(row_cells);
    }

    KMapGrid {
        num_vars: 2,
        row_vars,
        col_vars,
        row_headers,
        col_headers,
        cells,
    }
}

// 3 var: Karnaugh map: IN2 IN3 \ IN1
// Rows: IN2 IN3 (bits 1, 0) - 4 rows (00, 01, 11, 10)
// Cols: IN1 (bit 2) - 2 cols (0, 1)
fn build_3var_grid(truth_table: &[TruthTableRow], var_names: &[String]) -> KMapGrid {
    let row_vars = vec![var_names[1].clone(), var_names[2].clone()];
    let col_vars = vec![var_names[0].clone()];
    let row_headers = vec![
        "00".to_string(),
        "01".to_string(),
        "11".to_string(),
        "10".to_string(),
    ];
    let col_headers = vec!["0".to_string(), "1".to_string()];

    let gray_values = [0b00, 0b01, 0b11, 0b10];

    let mut cells = Vec::new();
    for r in 0..4 {
        let row_val = gray_values[r]; // bits 1, 0 (IN2, IN3)
        let mut row_cells = Vec::new();
        for c in 0..2 {
            let col_val = c; // bit 2 (IN1)
            let minterm = (col_val << 2) | row_val;
            let binary = format!("{:03b}", minterm);
            let output = get_output_for_minterm(truth_table, minterm);
            row_cells.push(KMapCell {
                row: r,
                col: c,
                minterm,
                binary,
                output,
            });
        }
        cells.push(row_cells);
    }

    KMapGrid {
        num_vars: 3,
        row_vars,
        col_vars,
        row_headers,
        col_headers,
        cells,
    }
}

// 4 var: Karnaugh map: IN3 IN4 \ IN1 IN2
// Rows: IN3 IN4 (bits 1, 0) - 4 rows (00, 01, 11, 10)
// Cols: IN1 IN2 (bits 3, 2) - 4 cols (00, 01, 11, 10)
fn build_4var_grid(truth_table: &[TruthTableRow], var_names: &[String]) -> KMapGrid {
    let row_vars = vec![var_names[2].clone(), var_names[3].clone()];
    let col_vars = vec![var_names[0].clone(), var_names[1].clone()];
    let row_headers = vec![
        "00".to_string(),
        "01".to_string(),
        "11".to_string(),
        "10".to_string(),
    ];
    let col_headers = vec![
        "00".to_string(),
        "01".to_string(),
        "11".to_string(),
        "10".to_string(),
    ];

    let gray_values = [0b00, 0b01, 0b11, 0b10];

    let mut cells = Vec::new();
    for r in 0..4 {
        let row_val = gray_values[r]; // bits 1, 0 (IN3, IN4)
        let mut row_cells = Vec::new();
        for c in 0..4 {
            let col_val = gray_values[c]; // bits 3, 2 (IN1, IN2)
            let minterm = (col_val << 2) | row_val;
            let binary = format!("{:04b}", minterm);
            let output = get_output_for_minterm(truth_table, minterm);
            row_cells.push(KMapCell {
                row: r,
                col: c,
                minterm,
                binary,
                output,
            });
        }
        cells.push(row_cells);
    }

    KMapGrid {
        num_vars: 4,
        row_vars,
        col_vars,
        row_headers,
        col_headers,
        cells,
    }
}

// Convert an implicant (mask & value) to visual group rectangles on the K-Map grid
// Bit positions:
// 2-var: bit 1 = IN1 (Col), bit 0 = IN2 (Row)
// 3-var: bit 2 = IN1 (Col), bit 1 = IN2 (Row high), bit 0 = IN3 (Row low)
// 4-var: bit 3 = IN1 (Col high), bit 2 = IN2 (Col low), bit 1 = IN3 (Row high), bit 0 = IN4 (Row low)
pub fn implicant_to_rects(num_vars: usize, mask: u8, value: u8) -> Vec<GroupRect> {
    match num_vars {
        2 => {
            // Row IN2 (bit 0)
            let (r_start, r_span) = if (mask & 1) != 0 {
                let in2 = value & 1;
                (in2 as usize, 1)
            } else {
                (0, 2)
            };

            // Col IN1 (bit 1)
            let (c_start, c_span) = if (mask & 2) != 0 {
                let in1 = (value >> 1) & 1;
                (in1 as usize, 1)
            } else {
                (0, 2)
            };

            vec![GroupRect {
                r_start,
                r_span,
                c_start,
                c_span,
                is_corner: false,
            }]
        }
        3 => {
            // Col IN1 (bit 2)
            let col_spans = if (mask & 4) != 0 {
                let in1 = (value >> 2) & 1;
                vec![(in1 as usize, 1)]
            } else {
                vec![(0, 2)]
            };

            // Rows IN2 IN3 (bits 1, 0)
            let in2_active = (mask & 2) != 0;
            let in3_active = (mask & 1) != 0;
            let in2_val = (value >> 1) & 1;
            let in3_val = value & 1;

            let row_spans: Vec<(usize, usize)> = match (in2_active, in3_active) {
                (true, true) => {
                    let r_idx = match (in2_val, in3_val) {
                        (0, 0) => 0,
                        (0, 1) => 1,
                        (1, 1) => 2,
                        (1, 0) => 3,
                        _ => 0,
                    };
                    vec![(r_idx, 1)]
                }
                (true, false) => {
                    // IN3 is eliminated ('-')
                    // IN2=0 -> rows 0, 1
                    // IN2=1 -> rows 2, 3
                    if in2_val == 0 {
                        vec![(0, 2)]
                    } else {
                        vec![(2, 2)]
                    }
                }
                (false, true) => {
                    // IN2 is eliminated ('-')
                    // IN3=0 -> rows 0, 3 (wraparound!)
                    // IN3=1 -> rows 1, 2
                    if in3_val == 0 {
                        vec![(0, 1), (3, 1)]
                    } else {
                        vec![(1, 2)]
                    }
                }
                (false, false) => {
                    // Both IN2 and IN3 eliminated -> all 4 rows
                    vec![(0, 4)]
                }
            };

            col_spans
                .into_iter()
                .flat_map(|(c_start, c_span)| {
                    row_spans.iter().map(move |&(r_start, r_span)| GroupRect {
                        r_start,
                        r_span,
                        c_start,
                        c_span,
                        is_corner: false,
                    })
                })
                .collect()
        }
        4 => {
            // Cols IN1 IN2 (bits 3, 2)
            let in1_active = (mask & 8) != 0;
            let in2_active = (mask & 4) != 0;
            let in1_val = (value >> 3) & 1;
            let in2_val = (value >> 2) & 1;

            let col_spans: Vec<(usize, usize)> = match (in1_active, in2_active) {
                (true, true) => {
                    let c_idx = match (in1_val, in2_val) {
                        (0, 0) => 0,
                        (0, 1) => 1,
                        (1, 1) => 2,
                        (1, 0) => 3,
                        _ => 0,
                    };
                    vec![(c_idx, 1)]
                }
                (true, false) => {
                    if in1_val == 0 {
                        vec![(0, 2)]
                    } else {
                        vec![(2, 2)]
                    }
                }
                (false, true) => {
                    if in2_val == 0 {
                        vec![(0, 1), (3, 1)] // wraparound!
                    } else {
                        vec![(1, 2)]
                    }
                }
                (false, false) => vec![(0, 4)],
            };

            // Rows IN3 IN4 (bits 1, 0)
            let in3_active = (mask & 2) != 0;
            let in4_active = (mask & 1) != 0;
            let in3_val = (value >> 1) & 1;
            let in4_val = value & 1;

            let row_spans: Vec<(usize, usize)> = match (in3_active, in4_active) {
                (true, true) => {
                    let r_idx = match (in3_val, in4_val) {
                        (0, 0) => 0,
                        (0, 1) => 1,
                        (1, 1) => 2,
                        (1, 0) => 3,
                        _ => 0,
                    };
                    vec![(r_idx, 1)]
                }
                (true, false) => {
                    if in3_val == 0 {
                        vec![(0, 2)]
                    } else {
                        vec![(2, 2)]
                    }
                }
                (false, true) => {
                    if in4_val == 0 {
                        vec![(0, 1), (3, 1)] // wraparound!
                    } else {
                        vec![(1, 2)]
                    }
                }
                (false, false) => vec![(0, 4)],
            };

            let is_four_corners = row_spans.len() == 2 && col_spans.len() == 2;

            let mut rects = Vec::new();
            for &(r_start, r_span) in &row_spans {
                for &(c_start, c_span) in &col_spans {
                    rects.push(GroupRect {
                        r_start,
                        r_span,
                        c_start,
                        c_span,
                        is_corner: is_four_corners,
                    });
                }
            }
            rects
        }
        _ => Vec::new(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::truth_table::generate_truth_table;

    #[test]
    fn test_kmap_minterm_positions() {
        let tt = generate_truth_table(4, None);
        let grid = build_kmap_grid(4, &tt, None);

        // Verify requested 4-variable layout (Rows: IN3 IN4, Cols: IN1 IN2):
        // Row 0 (IN3 IN4 = 00): 0, 4, 12, 8
        assert_eq!(grid.cells[0][0].minterm, 0);
        assert_eq!(grid.cells[0][1].minterm, 4);
        assert_eq!(grid.cells[0][2].minterm, 12);
        assert_eq!(grid.cells[0][3].minterm, 8);

        // Row 1 (IN3 IN4 = 01): 1, 5, 13, 9
        assert_eq!(grid.cells[1][0].minterm, 1);
        assert_eq!(grid.cells[1][1].minterm, 5);
        assert_eq!(grid.cells[1][2].minterm, 13);
        assert_eq!(grid.cells[1][3].minterm, 9);

        // Row 2 (IN3 IN4 = 11): 3, 7, 15, 11
        assert_eq!(grid.cells[2][0].minterm, 3);
        assert_eq!(grid.cells[2][1].minterm, 7);
        assert_eq!(grid.cells[2][2].minterm, 15);
        assert_eq!(grid.cells[2][3].minterm, 11);

        // Row 3 (IN3 IN4 = 10): 2, 6, 14, 10
        assert_eq!(grid.cells[3][0].minterm, 2);
        assert_eq!(grid.cells[3][1].minterm, 6);
        assert_eq!(grid.cells[3][2].minterm, 14);
        assert_eq!(grid.cells[3][3].minterm, 10);
    }

    #[test]
    fn test_wraparound_rects() {
        // 4 corners: IN2=0 (bit 2), IN4=0 (bit 0) -> mask: 0b0101 = 5, value: 0
        let rects = implicant_to_rects(4, 0b0101, 0);
        assert_eq!(rects.len(), 4);
        for r in &rects {
            assert!(r.is_corner);
            assert_eq!(r.r_span, 1);
            assert_eq!(r.c_span, 1);
        }
        // Should cover (0,0), (0,3), (3,0), (3,3)
        assert!(rects.iter().any(|r| r.r_start == 0 && r.c_start == 0));
        assert!(rects.iter().any(|r| r.r_start == 0 && r.c_start == 3));
        assert!(rects.iter().any(|r| r.r_start == 3 && r.c_start == 0));
        assert!(rects.iter().any(|r| r.r_start == 3 && r.c_start == 3));
    }

    #[test]
    fn test_vertical_wraparound_3var() {
        // 3-var: IN3=0 -> mask 0b001, value 0 (IN1 and IN2 eliminated)
        // Rows: IN2 IN3 (bits 1, 0). IN3=0 wraps around rows 0 and 3!
        let rects = implicant_to_rects(3, 0b001, 0);
        assert_eq!(rects.len(), 2);
        assert_eq!(rects[0].r_start, 0);
        assert_eq!(rects[0].r_span, 1);
        assert_eq!(rects[0].c_start, 0);
        assert_eq!(rects[0].c_span, 2);

        assert_eq!(rects[1].r_start, 3);
        assert_eq!(rects[1].r_span, 1);
        assert_eq!(rects[1].c_start, 0);
        assert_eq!(rects[1].c_span, 2);
    }
}

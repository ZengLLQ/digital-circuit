use crate::models::{GroupRect, KMapCell, KMapGrid, TruthTableRow};

pub fn build_kmap_grid(num_vars: usize, truth_table: &[TruthTableRow]) -> KMapGrid {
    match num_vars {
        2 => build_2var_grid(truth_table),
        3 => build_3var_grid(truth_table),
        4 => build_4var_grid(truth_table),
        _ => build_2var_grid(truth_table),
    }
}

fn get_output_for_minterm(truth_table: &[TruthTableRow], m: usize) -> String {
    truth_table
        .iter()
        .find(|r| r.index == m)
        .map(|r| r.output.clone())
        .unwrap_or_else(|| "0".to_string())
}

fn build_2var_grid(truth_table: &[TruthTableRow]) -> KMapGrid {
    let row_vars = vec!["A".to_string()];
    let col_vars = vec!["B".to_string()];
    let row_headers = vec!["0".to_string(), "1".to_string()];
    let col_headers = vec!["0".to_string(), "1".to_string()];

    let mut cells = Vec::new();
    for r in 0..2 {
        let mut row_cells = Vec::new();
        for c in 0..2 {
            let minterm = (r << 1) | c;
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

fn build_3var_grid(truth_table: &[TruthTableRow]) -> KMapGrid {
    let row_vars = vec!["A".to_string()];
    let col_vars = vec!["B".to_string(), "C".to_string()];
    let row_headers = vec!["0".to_string(), "1".to_string()];
    let col_headers = vec![
        "00".to_string(),
        "01".to_string(),
        "11".to_string(),
        "10".to_string(),
    ];

    let col_values = [0b00, 0b01, 0b11, 0b10];

    let mut cells = Vec::new();
    for r in 0..2 {
        let mut row_cells = Vec::new();
        for c in 0..4 {
            let bc = col_values[c];
            let minterm = (r << 2) | bc;
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

fn build_4var_grid(truth_table: &[TruthTableRow]) -> KMapGrid {
    let row_vars = vec!["A".to_string(), "B".to_string()];
    let col_vars = vec!["C".to_string(), "D".to_string()];
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
        let ab = gray_values[r];
        let mut row_cells = Vec::new();
        for c in 0..4 {
            let cd = gray_values[c];
            let minterm = (ab << 2) | cd;
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
// 2-var: bit 1 = A, bit 0 = B
// 3-var: bit 2 = A, bit 1 = B, bit 0 = C
// 4-var: bit 3 = A, bit 2 = B, bit 1 = C, bit 0 = D
pub fn implicant_to_rects(num_vars: usize, mask: u8, value: u8) -> Vec<GroupRect> {
    match num_vars {
        2 => {
            // Row A (bit 1)
            let (r_start, r_span) = if (mask & 2) != 0 {
                let a = (value >> 1) & 1;
                (a as usize, 1)
            } else {
                (0, 2)
            };

            // Col B (bit 0)
            let (c_start, c_span) = if (mask & 1) != 0 {
                let b = value & 1;
                (b as usize, 1)
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
            // Row A (bit 2)
            let (r_start, r_span) = if (mask & 4) != 0 {
                let a = (value >> 2) & 1;
                (a as usize, 1)
            } else {
                (0, 2)
            };

            // Col BC (bits 1, 0)
            let b_active = (mask & 2) != 0;
            let c_active = (mask & 1) != 0;
            let b_val = (value >> 1) & 1;
            let c_val = value & 1;

            let col_spans: Vec<(usize, usize)> = match (b_active, c_active) {
                (true, true) => {
                    let col_idx = match (b_val, c_val) {
                        (0, 0) => 0,
                        (0, 1) => 1,
                        (1, 1) => 2,
                        (1, 0) => 3,
                        _ => 0,
                    };
                    vec![(col_idx, 1)]
                }
                (true, false) => {
                    // C is eliminated ('-')
                    // B=0 -> cols 0, 1
                    // B=1 -> cols 2, 3
                    if b_val == 0 {
                        vec![(0, 2)]
                    } else {
                        vec![(2, 2)]
                    }
                }
                (false, true) => {
                    // B is eliminated ('-')
                    // C=0 -> cols 0, 3 (wraparound!)
                    // C=1 -> cols 1, 2
                    if c_val == 0 {
                        vec![(0, 1), (3, 1)]
                    } else {
                        vec![(1, 2)]
                    }
                }
                (false, false) => {
                    // Both B and C eliminated -> all 4 cols
                    vec![(0, 4)]
                }
            };

            col_spans
                .into_iter()
                .map(|(c_start, c_span)| GroupRect {
                    r_start,
                    r_span,
                    c_start,
                    c_span,
                    is_corner: false,
                })
                .collect()
        }
        4 => {
            // Row AB (bits 3, 2)
            let a_active = (mask & 8) != 0;
            let b_active = (mask & 4) != 0;
            let a_val = (value >> 3) & 1;
            let b_val = (value >> 2) & 1;

            let row_spans: Vec<(usize, usize)> = match (a_active, b_active) {
                (true, true) => {
                    let r_idx = match (a_val, b_val) {
                        (0, 0) => 0,
                        (0, 1) => 1,
                        (1, 1) => 2,
                        (1, 0) => 3,
                        _ => 0,
                    };
                    vec![(r_idx, 1)]
                }
                (true, false) => {
                    if a_val == 0 {
                        vec![(0, 2)]
                    } else {
                        vec![(2, 2)]
                    }
                }
                (false, true) => {
                    if b_val == 0 {
                        vec![(0, 1), (3, 1)] // wraparound!
                    } else {
                        vec![(1, 2)]
                    }
                }
                (false, false) => vec![(0, 4)],
            };

            // Col CD (bits 1, 0)
            let c_active = (mask & 2) != 0;
            let d_active = (mask & 1) != 0;
            let c_val = (value >> 1) & 1;
            let d_val = value & 1;

            let col_spans: Vec<(usize, usize)> = match (c_active, d_active) {
                (true, true) => {
                    let c_idx = match (c_val, d_val) {
                        (0, 0) => 0,
                        (0, 1) => 1,
                        (1, 1) => 2,
                        (1, 0) => 3,
                        _ => 0,
                    };
                    vec![(c_idx, 1)]
                }
                (true, false) => {
                    if c_val == 0 {
                        vec![(0, 2)]
                    } else {
                        vec![(2, 2)]
                    }
                }
                (false, true) => {
                    if d_val == 0 {
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
        let grid = build_kmap_grid(4, &tt);

        // Verify standard 4-variable Gray code layout:
        // Row 0: 0, 1, 3, 2
        assert_eq!(grid.cells[0][0].minterm, 0);
        assert_eq!(grid.cells[0][1].minterm, 1);
        assert_eq!(grid.cells[0][2].minterm, 3);
        assert_eq!(grid.cells[0][3].minterm, 2);

        // Row 1: 4, 5, 7, 6
        assert_eq!(grid.cells[1][0].minterm, 4);
        assert_eq!(grid.cells[1][1].minterm, 5);
        assert_eq!(grid.cells[1][2].minterm, 7);
        assert_eq!(grid.cells[1][3].minterm, 6);

        // Row 2: 12, 13, 15, 14
        assert_eq!(grid.cells[2][0].minterm, 12);
        assert_eq!(grid.cells[2][1].minterm, 13);
        assert_eq!(grid.cells[2][2].minterm, 15);
        assert_eq!(grid.cells[2][3].minterm, 14);

        // Row 3: 8, 9, 11, 10
        assert_eq!(grid.cells[3][0].minterm, 8);
        assert_eq!(grid.cells[3][1].minterm, 9);
        assert_eq!(grid.cells[3][2].minterm, 11);
        assert_eq!(grid.cells[3][3].minterm, 10);
    }

    #[test]
    fn test_wraparound_rects() {
        // 4 corners: B=0, D=0 -> mask: 0b0101 = 5, value: 0
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
    fn test_horizontal_wraparound_3var() {
        // 3-var: C=0 -> mask 0b001, value 0 (A and B eliminated)
        let rects = implicant_to_rects(3, 0b001, 0);
        assert_eq!(rects.len(), 2);
        assert_eq!(rects[0].c_start, 0);
        assert_eq!(rects[0].c_span, 1);
        assert_eq!(rects[1].c_start, 3);
        assert_eq!(rects[1].c_span, 1);
    }
}

use crate::expression::{build_pos_result, build_sop_result};
use crate::kmap::build_kmap_grid;
use crate::models::MinimizationResult;
use crate::truth_table::{extract_terms, generate_truth_table};

// Helper: evaluate SoP expression against a minterm index m
fn eval_sop(sop: &MinimizationResult, m: usize, _num_vars: usize) -> u8 {
    if sop.is_constant_zero {
        return 0;
    }
    if sop.is_constant_one {
        return 1;
    }

    for group in &sop.groups {
        let covers = group.covered_minterms.binary_search(&m).is_ok();
        if covers {
            return 1;
        }
    }
    0
}

// Helper: evaluate PoS expression against a minterm index m
fn eval_pos(pos: &MinimizationResult, m: usize, _num_vars: usize) -> u8 {
    if pos.is_constant_zero {
        return 0;
    }
    if pos.is_constant_one {
        return 1;
    }

    for group in &pos.groups {
        let is_zero_covered = group.covered_minterms.binary_search(&m).is_ok();
        if is_zero_covered {
            return 0;
        }
    }
    1
}

#[test]
fn test_truth_table_generation_2_3_4_vars() {
    for n in 2..=4 {
        let tt = generate_truth_table(n, None);
        assert_eq!(tt.len(), 1 << n);

        for (i, row) in tt.iter().enumerate() {
            assert_eq!(row.index, i);
            assert_eq!(row.values.len(), n);
            // Verify binary values correspond to i
            let mut expected_val = 0;
            for (bit_idx, &bit) in row.values.iter().enumerate() {
                expected_val |= (bit as usize) << (n - 1 - bit_idx);
            }
            assert_eq!(expected_val, i);
        }
    }
}

#[test]
fn test_kmap_gray_code_adjacency() {
    for n in 2..=4 {
        let tt = generate_truth_table(n, None);
        let grid = build_kmap_grid(n, &tt);

        let rows = grid.cells.len();
        let cols = grid.cells[0].len();

        // Check horizontal adjacency (including wraparound)
        for r in 0..rows {
            for c in 0..cols {
                let next_c = (c + 1) % cols;
                let m1 = grid.cells[r][c].minterm;
                let m2 = grid.cells[r][next_c].minterm;
                let diff = (m1 ^ m2).count_ones();
                assert_eq!(
                    diff, 1,
                    "Horizontal neighbor mismatch at ({},{}) and ({},{}): diff={}",
                    r, c, r, next_c, diff
                );
            }
        }

        // Check vertical adjacency (including wraparound)
        for r in 0..rows {
            let next_r = (r + 1) % rows;
            for c in 0..cols {
                let m1 = grid.cells[r][c].minterm;
                let m2 = grid.cells[next_r][c].minterm;
                let diff = (m1 ^ m2).count_ones();
                assert_eq!(
                    diff, 1,
                    "Vertical neighbor mismatch at ({},{}) and ({},{}): diff={}",
                    r, c, next_r, c, diff
                );
            }
        }
    }
}

#[test]
fn test_four_corners_group() {
    // 4 corners on 4-variable map: m0, m2, m8, m10
    // Binary:
    // m0 = 0000
    // m2 = 0010
    // m8 = 1000
    // m10 = 1010
    // Common: B=0 (bit 2=0), D=0 (bit 0=0). Mask = 0b0101, value = 0.
    let on_terms = vec![0, 2, 8, 10];
    let sop = build_sop_result(4, &on_terms, &[]);
    assert_eq!(sop.groups.len(), 1);
    let g = &sop.groups[0];
    assert_eq!(g.covered_minterms, vec![0, 2, 8, 10]);
    assert_eq!(g.rects.len(), 4);
    for r in &g.rects {
        assert!(r.is_corner);
    }
    assert_eq!(g.term_plain, "B'D'");
}

#[test]
fn test_all_16_functions_2_vars_exhaustive() {
    for func_int in 0..16u16 {
        let mut outputs = Vec::new();
        for m in 0..4 {
            let bit = (func_int >> m) & 1;
            outputs.push(bit.to_string());
        }

        let tt = generate_truth_table(2, Some(&outputs));
        let (on_terms, off_terms, dc_terms) = extract_terms(&tt);

        let sop = build_sop_result(2, &on_terms, &dc_terms);
        let pos = build_pos_result(2, &off_terms, &dc_terms);

        for m in 0..4 {
            let expected = ((func_int >> m) & 1) as u8;
            let sop_val = eval_sop(&sop, m, 2);
            let pos_val = eval_pos(&pos, m, 2);

            assert_eq!(
                sop_val, expected,
                "SoP failed for func {} at minterm {}",
                func_int, m
            );
            assert_eq!(
                pos_val, expected,
                "PoS failed for func {} at minterm {}",
                func_int, m
            );
        }
    }
}

#[test]
fn test_all_256_functions_3_vars_exhaustive() {
    for func_int in 0..256u16 {
        let mut outputs = Vec::new();
        for m in 0..8 {
            let bit = (func_int >> m) & 1;
            outputs.push(bit.to_string());
        }

        let tt = generate_truth_table(3, Some(&outputs));
        let (on_terms, off_terms, dc_terms) = extract_terms(&tt);

        let sop = build_sop_result(3, &on_terms, &dc_terms);
        let pos = build_pos_result(3, &off_terms, &dc_terms);

        for m in 0..8 {
            let expected = ((func_int >> m) & 1) as u8;
            let sop_val = eval_sop(&sop, m, 3);
            let pos_val = eval_pos(&pos, m, 3);

            assert_eq!(
                sop_val, expected,
                "SoP failed for 3-var func {} at minterm {}",
                func_int, m
            );
            assert_eq!(
                pos_val, expected,
                "PoS failed for 3-var func {} at minterm {}",
                func_int, m
            );
        }
    }
}

#[test]
fn test_4_variables_structured_and_random_samples() {
    // Test diverse 4-variable patterns:
    // 1. All zeros
    // 2. All ones
    // 3. Singletons
    // 4. Parity function (XOR)
    // 5. Symmetric functions
    // 6. Linear combination functions
    // 7. Random sample of 1000 configurations
    let mut patterns: Vec<u16> = Vec::new();
    patterns.push(0x0000);
    patterns.push(0xFFFF);
    patterns.push(0x5555);
    patterns.push(0xAAAA);
    patterns.push(0x6996); // Parity
    patterns.push(0x0505); // 4 corners
    patterns.push(0xF00F); // Top and bottom row
    patterns.push(0x8001); // Opposite outer corners

    // Add pseudo-random deterministic patterns
    let mut lfsr = 0xACE1u16;
    for _ in 0..500 {
        let bit = ((lfsr >> 0) ^ (lfsr >> 2) ^ (lfsr >> 3) ^ (lfsr >> 5)) & 1;
        lfsr = (lfsr >> 1) | (bit << 15);
        patterns.push(lfsr);
    }

    for (_p_idx, &pattern) in patterns.iter().enumerate() {
        let mut outputs = Vec::new();
        for m in 0..16 {
            let bit = (pattern >> m) & 1;
            outputs.push(bit.to_string());
        }

        let tt = generate_truth_table(4, Some(&outputs));
        let (on_terms, off_terms, dc_terms) = extract_terms(&tt);

        let sop = build_sop_result(4, &on_terms, &dc_terms);
        let pos = build_pos_result(4, &off_terms, &dc_terms);

        for m in 0..16 {
            let expected = ((pattern >> m) & 1) as u8;
            let sop_val = eval_sop(&sop, m, 4);
            let pos_val = eval_pos(&pos, m, 4);

            assert_eq!(
                sop_val, expected,
                "SoP failed for pattern #{:x} at minterm {}",
                pattern, m
            );
            assert_eq!(
                pos_val, expected,
                "PoS failed for pattern #{:x} at minterm {}",
                pattern, m
            );
        }
    }
}

#[test]
fn test_dont_care_optimization() {
    // F(A, B, C, D) has ON-terms at m0, m2
    // Without don't cares: m0, m2 combine to A'B'D' (3 literals)
    // If m8, m10 are Don't Cares (X):
    // Together m0, m2, m8, m10 form 4 corners -> B'D' (2 literals)!
    let on_terms = vec![0, 2];
    let dc_terms = vec![8, 10];

    let sop = build_sop_result(4, &on_terms, &dc_terms);
    assert_eq!(sop.groups.len(), 1);
    let g = &sop.groups[0];
    assert_eq!(g.term_plain, "B'D'");
    assert_eq!(g.covered_minterms, vec![0, 2, 8, 10]);

    // Check that required on-terms are covered
    assert!(g.covered_minterms.contains(&0));
    assert!(g.covered_minterms.contains(&2));
}

#[test]
fn test_determinism() {
    let outputs = vec![
        "1".to_string(), "0".to_string(), "1".to_string(), "0".to_string(),
        "0".to_string(), "1".to_string(), "0".to_string(), "1".to_string(),
        "1".to_string(), "1".to_string(), "0".to_string(), "0".to_string(),
        "0".to_string(), "0".to_string(), "1".to_string(), "1".to_string(),
    ];

    let tt = generate_truth_table(4, Some(&outputs));
    let (on, off, dc) = extract_terms(&tt);

    let sop1 = build_sop_result(4, &on, &dc);
    let sop2 = build_sop_result(4, &on, &dc);
    assert_eq!(sop1.expression_plain, sop2.expression_plain);
    assert_eq!(sop1.groups.len(), sop2.groups.len());

    let pos1 = build_pos_result(4, &off, &dc);
    let pos2 = build_pos_result(4, &off, &dc);
    assert_eq!(pos1.expression_plain, pos2.expression_plain);
}

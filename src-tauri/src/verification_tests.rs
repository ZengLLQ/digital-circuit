use crate::expression::{build_pos_result, build_sop_result};
use crate::kmap::build_kmap_grid;
use crate::models::MinimizationResult;
use crate::truth_table::{extract_terms, generate_truth_table};

// Helper: true mathematical evaluator of SoP algebraic formula against minterm index m
fn eval_sop(sop: &MinimizationResult, m: usize, num_vars: usize) -> u8 {
    if sop.is_constant_zero {
        return 0;
    }
    if sop.is_constant_one {
        return 1;
    }

    for group in &sop.groups {
        if eval_product_term(&group.term_plain, m, num_vars) {
            return 1;
        }
    }
    0
}

fn eval_product_term(term_str: &str, m: usize, num_vars: usize) -> bool {
    if term_str == "1" {
        return true;
    }
    if term_str == "0" {
        return false;
    }

    let mut chars = term_str.chars().peekable();
    while let Some(ch) = chars.next() {
        if ch.is_ascii_uppercase() {
            let var_idx = (ch as u8 - b'A') as usize;
            let bit_pos = num_vars - 1 - var_idx;
            let bit_val = (m >> bit_pos) & 1;

            let is_complemented = if chars.peek() == Some(&'\'') || chars.peek() == Some(&'′') {
                chars.next();
                true
            } else {
                false
            };

            let expected_bit = if is_complemented { 0 } else { 1 };
            if bit_val != expected_bit {
                return false;
            }
        }
    }
    true
}

// Helper: true mathematical evaluator of PoS algebraic formula against minterm index m
fn eval_pos(pos: &MinimizationResult, m: usize, num_vars: usize) -> u8 {
    if pos.is_constant_zero {
        return 0;
    }
    if pos.is_constant_one {
        return 1;
    }

    for group in &pos.groups {
        if !eval_sum_term(&group.term_plain, m, num_vars) {
            return 0;
        }
    }
    1
}

fn eval_sum_term(term_str: &str, m: usize, num_vars: usize) -> bool {
    if term_str == "1" {
        return true;
    }
    if term_str == "0" {
        return false;
    }

    let mut any_literal_one = false;
    let mut chars = term_str.chars().peekable();
    while let Some(ch) = chars.next() {
        if ch.is_ascii_uppercase() {
            let var_idx = (ch as u8 - b'A') as usize;
            let bit_pos = num_vars - 1 - var_idx;
            let bit_val = (m >> bit_pos) & 1;

            let is_complemented = if chars.peek() == Some(&'\'') || chars.peek() == Some(&'′') {
                chars.next();
                true
            } else {
                false
            };

            let lit_val = if is_complemented {
                1 - bit_val
            } else {
                bit_val
            };

            if lit_val == 1 {
                any_literal_one = true;
            }
        }
    }
    any_literal_one
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

// Independent brute-force minimum cover oracle for small variable counts (2 and 3 vars)
// Generates all 3^n possible product terms, identifies valid implicants, and finds
// the exact global minimum (fewest terms, then fewest literals) by exhaustive combinatorial search.
fn brute_force_sop_oracle(on_terms: &[usize], dc_terms: &[usize], num_vars: usize) -> (usize, usize) {
    if on_terms.is_empty() {
        return (0, 0);
    }

    let total_cells = 1 << num_vars;
    let mut allowed_mask = 0u32;
    for &m in on_terms {
        allowed_mask |= 1 << m;
    }
    for &m in dc_terms {
        allowed_mask |= 1 << m;
    }

    let req_mask: u32 = on_terms.iter().map(|&m| 1u32 << m).sum();
    let universal_mask = (1u32 << total_cells) - 1;
    if (allowed_mask & universal_mask) == universal_mask {
        return (1, 0);
    }

    let total_possible_terms = 3usize.pow(num_vars as u32);
    let mut valid_terms: Vec<(u32, usize)> = Vec::new();

    for term_code in 0..total_possible_terms {
        let mut temp = term_code;
        let mut term_mask = 0u8;
        let mut term_val = 0u8;
        let mut lits = 0;

        for v in 0..num_vars {
            let state = temp % 3;
            temp /= 3;
            let bit = num_vars - 1 - v;
            match state {
                0 => {
                    term_mask |= 1 << bit;
                    lits += 1;
                }
                1 => {
                    term_mask |= 1 << bit;
                    term_val |= 1 << bit;
                    lits += 1;
                }
                _ => {}
            }
        }

        let mut covered = 0u32;
        for m in 0..total_cells {
            let m_u8 = m as u8;
            if (m_u8 & term_mask) == term_val {
                covered |= 1 << m;
            }
        }

        if (covered & !allowed_mask) == 0 && (covered & req_mask) != 0 {
            valid_terms.push((covered, lits));
        }
    }

    let mut best_cost = (usize::MAX, usize::MAX);

    for max_k in 1..=valid_terms.len() {
        if max_k > best_cost.0 {
            break;
        }

        fn comb(
            idx: usize,
            terms_left: usize,
            covered: u32,
            lits: usize,
            req: u32,
            valid_terms: &[(u32, usize)],
            best_cost: &mut (usize, usize),
            max_k: usize,
        ) {
            if terms_left == 0 {
                if (covered & req) == req {
                    let cost = (max_k, lits);
                    if cost < *best_cost {
                        *best_cost = cost;
                    }
                }
                return;
            }

            if idx >= valid_terms.len() || (valid_terms.len() - idx) < terms_left {
                return;
            }

            comb(
                idx + 1,
                terms_left - 1,
                covered | valid_terms[idx].0,
                lits + valid_terms[idx].1,
                req,
                valid_terms,
                best_cost,
                max_k,
            );

            comb(
                idx + 1,
                terms_left,
                covered,
                lits,
                req,
                valid_terms,
                best_cost,
                max_k,
            );
        }

        comb(0, max_k, 0, 0, req_mask, &valid_terms, &mut best_cost, max_k);
        if best_cost.0 <= max_k {
            break;
        }
    }

    best_cost
}

#[test]
fn test_optimality_against_independent_brute_force_oracle() {
    // 1. Verify Quine-McCluskey optimality across ALL 16 2-variable functions
    for func in 0..16u16 {
        let mut on_terms = Vec::new();
        for m in 0..4 {
            if ((func >> m) & 1) == 1 {
                on_terms.push(m);
            }
        }
        let sop = build_sop_result(2, &on_terms, &[]);
        let (oracle_terms, oracle_lits) = brute_force_sop_oracle(&on_terms, &[], 2);

        assert_eq!(
            sop.term_count, oracle_terms,
            "2-var term count non-optimal for func {}",
            func
        );
        assert_eq!(
            sop.literal_count, oracle_lits,
            "2-var literal count non-optimal for func {}",
            func
        );
    }

    // 2. Verify Quine-McCluskey optimality across sample 3-variable functions
    for func in (0..256u16).step_by(5) {
        let mut on_terms = Vec::new();
        for m in 0..8 {
            if ((func >> m) & 1) == 1 {
                on_terms.push(m);
            }
        }
        let sop = build_sop_result(3, &on_terms, &[]);
        let (oracle_terms, oracle_lits) = brute_force_sop_oracle(&on_terms, &[], 3);

        assert_eq!(
            sop.term_count, oracle_terms,
            "3-var term count non-optimal for func {}",
            func
        );
        assert_eq!(
            sop.literal_count, oracle_lits,
            "3-var literal count non-optimal for func {}",
            func
        );
    }
}

#[test]
fn test_all_65536_functions_4_vars_exhaustive() {
    // Exhaustive mathematical verification across all 65,536 4-variable Boolean functions
    for func_int in 0..=0xFFFFu32 {
        let mut on_terms = Vec::new();
        let mut off_terms = Vec::new();

        for m in 0..16 {
            let bit = ((func_int >> m) & 1) as u8;
            if bit == 1 {
                on_terms.push(m);
            } else {
                off_terms.push(m);
            }
        }

        let sop = build_sop_result(4, &on_terms, &[]);
        let pos = build_pos_result(4, &off_terms, &[]);

        for m in 0..16 {
            let expected = ((func_int >> m) & 1) as u8;
            let sop_val = eval_sop(&sop, m, 4);
            let pos_val = eval_pos(&pos, m, 4);

            assert_eq!(
                sop_val, expected,
                "Exhaustive 4-var SoP failed for func #{:04x} at minterm {}",
                func_int, m
            );
            assert_eq!(
                pos_val, expected,
                "Exhaustive 4-var PoS failed for func #{:04x} at minterm {}",
                func_int, m
            );
        }
    }
}

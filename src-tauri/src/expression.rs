use crate::kmap::implicant_to_rects;
use crate::minimizer::{solve_minimum_cover, Term};
use crate::models::{ImplicantGroup, MinimizationResult};
use crate::truth_table::get_variable_names;

pub fn build_sop_result(
    num_vars: usize,
    on_terms: &[usize],
    dc_terms: &[usize],
    var_names: Option<&[String]>,
) -> MinimizationResult {
    let total_cells = 1 << num_vars;
    let defaults = get_variable_names(num_vars);
    let resolved_vars = var_names.unwrap_or(&defaults);

    if dc_terms.len() == total_cells {
        return MinimizationResult {
            expression_formatted: "0".to_string(),
            expression_plain: "0".to_string(),
            term_count: 0,
            literal_count: 0,
            groups: Vec::new(),
            is_constant_zero: true,
            is_constant_one: false,
            is_all_dont_care: true,
        };
    }

    if on_terms.is_empty() {
        return MinimizationResult {
            expression_formatted: "0".to_string(),
            expression_plain: "0".to_string(),
            term_count: 0,
            literal_count: 0,
            groups: Vec::new(),
            is_constant_zero: true,
            is_constant_one: false,
            is_all_dont_care: false,
        };
    }

    let mut all_available = on_terms.to_vec();
    all_available.extend_from_slice(dc_terms);
    all_available.sort_unstable();
    all_available.dedup();

    let solution = solve_minimum_cover(on_terms, &all_available, num_vars);

    // If a single universal term covers everything:
    if solution.selected_implicants.len() == 1 && solution.selected_implicants[0].mask == 0 {
        let group = ImplicantGroup {
            id: "G1".to_string(),
            color_index: 0,
            term_formatted: "1".to_string(),
            term_plain: "1".to_string(),
            covered_minterms: (0..total_cells).collect(),
            rects: implicant_to_rects(num_vars, 0, 0),
            is_essential: true,
            eliminated_vars: resolved_vars.to_vec(),
            retained_vars: Vec::new(),
            explanation: format!(
                "Universal group of all {} cells covers the entire map, eliminating all variables to yield constant 1.",
                total_cells
            ),
        };

        return MinimizationResult {
            expression_formatted: "1".to_string(),
            expression_plain: "1".to_string(),
            term_count: 1,
            literal_count: 0,
            groups: vec![group],
            is_constant_zero: false,
            is_constant_one: true,
            is_all_dont_care: false,
        };
    }

    let mut groups = Vec::new();
    let mut total_literals = 0;

    for (idx, term) in solution.selected_implicants.iter().enumerate() {
        let is_essential = solution.essential_indices.contains(&idx);
        let group = format_sop_group(idx, term, num_vars, resolved_vars, is_essential);
        total_literals += term.literal_count();
        groups.push(group);
    }

    let expression_formatted = if groups.is_empty() {
        "0".to_string()
    } else {
        groups
            .iter()
            .map(|g| g.term_formatted.as_str())
            .collect::<Vec<_>>()
            .join(" + ")
    };

    let expression_plain = if groups.is_empty() {
        "0".to_string()
    } else {
        groups
            .iter()
            .map(|g| g.term_plain.as_str())
            .collect::<Vec<_>>()
            .join(" + ")
    };

    MinimizationResult {
        expression_formatted,
        expression_plain,
        term_count: groups.len(),
        literal_count: total_literals,
        groups,
        is_constant_zero: false,
        is_constant_one: false,
        is_all_dont_care: false,
    }
}

pub fn build_pos_result(
    num_vars: usize,
    off_terms: &[usize], // where F = 0
    dc_terms: &[usize],  // where F = X
    var_names: Option<&[String]>,
) -> MinimizationResult {
    let total_cells = 1 << num_vars;
    let defaults = get_variable_names(num_vars);
    let resolved_vars = var_names.unwrap_or(&defaults);

    if dc_terms.len() == total_cells {
        // Documented deterministic convention: all unspecified cells evaluate to F = 0
        return MinimizationResult {
            expression_formatted: "0".to_string(),
            expression_plain: "0".to_string(),
            term_count: 0,
            literal_count: 0,
            groups: Vec::new(),
            is_constant_zero: true,
            is_constant_one: false,
            is_all_dont_care: true,
        };
    }

    if off_terms.is_empty() {
        // No 0s and not all don't care: function is constant 1
        return MinimizationResult {
            expression_formatted: "1".to_string(),
            expression_plain: "1".to_string(),
            term_count: 0,
            literal_count: 0,
            groups: Vec::new(),
            is_constant_zero: false,
            is_constant_one: true,
            is_all_dont_care: false,
        };
    }

    let mut all_available = off_terms.to_vec();
    all_available.extend_from_slice(dc_terms);
    all_available.sort_unstable();
    all_available.dedup();

    let solution = solve_minimum_cover(off_terms, &all_available, num_vars);

    if solution.selected_implicants.len() == 1 && solution.selected_implicants[0].mask == 0 {
        // Covered all 0s universally: function is constant 0
        let group = ImplicantGroup {
            id: "G1".to_string(),
            color_index: 0,
            term_formatted: "0".to_string(),
            term_plain: "0".to_string(),
            covered_minterms: (0..total_cells).collect(),
            rects: implicant_to_rects(num_vars, 0, 0),
            is_essential: true,
            eliminated_vars: resolved_vars.to_vec(),
            retained_vars: Vec::new(),
            explanation: format!(
                "Universal zero-group covering all {} cells eliminates all variables to yield constant 0.",
                total_cells
            ),
        };

        return MinimizationResult {
            expression_formatted: "0".to_string(),
            expression_plain: "0".to_string(),
            term_count: 1,
            literal_count: 0,
            groups: vec![group],
            is_constant_zero: true,
            is_constant_one: false,
            is_all_dont_care: false,
        };
    }

    let mut groups = Vec::new();
    let mut total_literals = 0;

    for (idx, term) in solution.selected_implicants.iter().enumerate() {
        let is_essential = solution.essential_indices.contains(&idx);
        let group = format_pos_group(idx, term, num_vars, resolved_vars, is_essential);
        total_literals += term.literal_count();
        groups.push(group);
    }

    let expression_formatted = if groups.is_empty() {
        "1".to_string()
    } else {
        groups
            .iter()
            .map(|g| g.term_formatted.as_str())
            .collect::<Vec<_>>()
            .join("")
    };

    let expression_plain = if groups.is_empty() {
        "1".to_string()
    } else {
        groups
            .iter()
            .map(|g| g.term_plain.as_str())
            .collect::<Vec<_>>()
            .join("")
    };

    MinimizationResult {
        expression_formatted,
        expression_plain,
        term_count: groups.len(),
        literal_count: total_literals,
        groups,
        is_constant_zero: false,
        is_constant_one: false,
        is_all_dont_care: false,
    }
}

fn format_sop_group(
    idx: usize,
    term: &Term,
    num_vars: usize,
    var_names: &[String],
    is_essential: bool,
) -> ImplicantGroup {
    let mut parts_formatted = Vec::new();
    let mut parts_plain = Vec::new();
    let mut eliminated_vars = Vec::new();
    let mut retained_vars = Vec::new();

    for bit_idx in (0..num_vars).rev() {
        let var_name = &var_names[num_vars - 1 - bit_idx];
        let is_active = (term.mask & (1 << bit_idx)) != 0;
        let bit_val = (term.value >> bit_idx) & 1;

        if is_active {
            if bit_val == 1 {
                parts_formatted.push(var_name.clone());
                parts_plain.push(var_name.clone());
                retained_vars.push(format!("{}=1", var_name));
            } else {
                parts_formatted.push(format!("{}′", var_name));
                parts_plain.push(format!("{}'", var_name));
                retained_vars.push(format!("{}=0", var_name));
            }
        } else {
            eliminated_vars.push(var_name.clone());
        }
    }

    let sep = if var_names.iter().any(|v| v.len() > 1) { " " } else { "" };
    let term_formatted = parts_formatted.join(sep);
    let term_plain = parts_plain.join(sep);

    let rects = implicant_to_rects(num_vars, term.mask, term.value);
    let size = term.minterms.len();
    let elim_count = eliminated_vars.len();

    let mut explanation = format!(
        "Group of {} cell{} eliminates {} variable{} ({}). ",
        size,
        if size > 1 { "s" } else { "" },
        elim_count,
        if elim_count > 1 { "s" } else { "" },
        if eliminated_vars.is_empty() {
            "none".to_string()
        } else {
            eliminated_vars.join(", ")
        }
    );

    if !retained_vars.is_empty() {
        explanation.push_str(&format!(
            "Fixed condition: {}. ",
            retained_vars.join(", ")
        ));
    }

    if rects.len() > 1 {
        if rects.iter().any(|r| r.is_corner) {
            explanation.push_str("Corners wraparound: all 4 corners are mutually adjacent across toroidal boundaries. ");
        } else {
            explanation.push_str("Boundary wraparound: spans opposite outer edges which differ by only 1 bit in Gray code. ");
        }
    }

    if is_essential {
        explanation.push_str("Essential prime implicant (uniquely covers one or more minterms).");
    } else {
        explanation.push_str("Optimal prime implicant chosen for minimum literal cover.");
    }

    ImplicantGroup {
        id: format!("G{}", idx + 1),
        color_index: idx % 8,
        term_formatted,
        term_plain,
        covered_minterms: term.minterms.clone(),
        rects,
        is_essential,
        eliminated_vars,
        retained_vars,
        explanation,
    }
}

fn format_pos_group(
    idx: usize,
    term: &Term,
    num_vars: usize,
    var_names: &[String],
    is_essential: bool,
) -> ImplicantGroup {
    let mut sum_parts_formatted = Vec::new();
    let mut sum_parts_plain = Vec::new();
    let mut eliminated_vars = Vec::new();
    let mut retained_vars = Vec::new();

    for bit_idx in (0..num_vars).rev() {
        let var_name = &var_names[num_vars - 1 - bit_idx];
        let is_active = (term.mask & (1 << bit_idx)) != 0;
        let bit_val = (term.value >> bit_idx) & 1;

        if is_active {
            // In PoS, for zero-implicants:
            // bit_val == 0 -> uncomplemented (A)
            // bit_val == 1 -> complemented (A')
            if bit_val == 0 {
                sum_parts_formatted.push(var_name.clone());
                sum_parts_plain.push(var_name.clone());
                retained_vars.push(format!("{}=0", var_name));
            } else {
                sum_parts_formatted.push(format!("{}′", var_name));
                sum_parts_plain.push(format!("{}'", var_name));
                retained_vars.push(format!("{}=1", var_name));
            }
        } else {
            eliminated_vars.push(var_name.clone());
        }
    }

    let term_formatted = format!("({})", sum_parts_formatted.join(" + "));
    let term_plain = format!("({})", sum_parts_plain.join(" + "));

    let rects = implicant_to_rects(num_vars, term.mask, term.value);
    let size = term.minterms.len();
    let elim_count = eliminated_vars.len();

    let mut explanation = format!(
        "Maxterm zero-group of {} cell{} eliminates {} variable{} ({}). ",
        size,
        if size > 1 { "s" } else { "" },
        elim_count,
        if elim_count > 1 { "s" } else { "" },
        if eliminated_vars.is_empty() {
            "none".to_string()
        } else {
            eliminated_vars.join(", ")
        }
    );

    if !retained_vars.is_empty() {
        explanation.push_str(&format!(
            "Zero condition: {}. ",
            retained_vars.join(", ")
        ));
    }

    if rects.len() > 1 {
        if rects.iter().any(|r| r.is_corner) {
            explanation.push_str("Corners wraparound: 4 corners form a toroidal zero-group. ");
        } else {
            explanation.push_str("Boundary wraparound: spans opposite edges across Gray-code toroidal fold. ");
        }
    }

    if is_essential {
        explanation.push_str("Essential zero-implicant.");
    } else {
        explanation.push_str("Optimal zero-implicant chosen for minimum cover.");
    }

    ImplicantGroup {
        id: format!("G{}", idx + 1),
        color_index: idx % 8,
        term_formatted,
        term_plain,
        covered_minterms: term.minterms.clone(),
        rects,
        is_essential,
        eliminated_vars,
        retained_vars,
        explanation,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sop_and_pos_simple() {
        // 2-var OR function: m(1, 2, 3), off: m(0)
        // Default: IN1, IN2
        let sop = build_sop_result(2, &[1, 2, 3], &[], None);
        assert_eq!(sop.term_count, 2);
        assert_eq!(sop.literal_count, 2);

        let pos = build_pos_result(2, &[0], &[], None);
        assert_eq!(pos.term_count, 1);
        assert_eq!(pos.expression_plain, "(IN1 + IN2)");

        // Custom variable names: A, B
        let custom_vars = vec!["A".to_string(), "B".to_string()];
        let pos_custom = build_pos_result(2, &[0], &[], Some(&custom_vars));
        assert_eq!(pos_custom.expression_plain, "(A + B)");
    }

    #[test]
    fn test_constant_functions() {
        let sop_0 = build_sop_result(2, &[], &[], None);
        assert!(sop_0.is_constant_zero);
        assert_eq!(sop_0.expression_formatted, "0");

        let sop_1 = build_sop_result(2, &[0, 1, 2, 3], &[], None);
        assert!(sop_1.is_constant_one);
        assert_eq!(sop_1.expression_formatted, "1");

        let pos_1 = build_pos_result(2, &[], &[], None);
        assert!(pos_1.is_constant_one);
        assert_eq!(pos_1.expression_formatted, "1");

        let pos_0 = build_pos_result(2, &[0, 1, 2, 3], &[], None);
        assert!(pos_0.is_constant_zero);
        assert_eq!(pos_0.expression_formatted, "0");

        // All don't care: deterministic convention F = 0
        let sop_dc = build_sop_result(2, &[], &[0, 1, 2, 3], None);
        assert!(sop_dc.is_all_dont_care);
        assert!(sop_dc.is_constant_zero);
        assert_eq!(sop_dc.expression_formatted, "0");

        let pos_dc = build_pos_result(2, &[], &[0, 1, 2, 3], None);
        assert!(pos_dc.is_all_dont_care);
        assert!(pos_dc.is_constant_zero);
        assert_eq!(pos_dc.expression_formatted, "0");
    }
}

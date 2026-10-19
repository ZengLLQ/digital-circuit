use std::collections::{BTreeSet, HashSet};

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Term {
    pub mask: u8,
    pub value: u8,
    pub minterms: Vec<usize>,
}

impl Term {
    pub fn new_minterm(m: usize, num_vars: usize) -> Self {
        let mask = ((1 << num_vars) - 1) as u8;
        let value = (m as u8) & mask;
        Self {
            mask,
            value,
            minterms: vec![m],
        }
    }

    pub fn literal_count(&self) -> usize {
        self.mask.count_ones() as usize
    }

    pub fn can_combine(&self, other: &Self) -> bool {
        if self.mask != other.mask {
            return false;
        }
        let diff = self.value ^ other.value;
        diff.count_ones() == 1
    }

    pub fn combine(&self, other: &Self) -> Self {
        let diff = self.value ^ other.value;
        let new_mask = self.mask & !diff;
        let new_value = self.value & new_mask;

        let mut combined_minterms = self.minterms.clone();
        combined_minterms.extend_from_slice(&other.minterms);
        combined_minterms.sort_unstable();
        combined_minterms.dedup();

        Self {
            mask: new_mask,
            value: new_value,
            minterms: combined_minterms,
        }
    }

    pub fn covers(&self, m: usize) -> bool {
        self.minterms.binary_search(&m).is_ok()
    }
}

pub fn find_prime_implicants(all_terms: &[usize], num_vars: usize) -> Vec<Term> {
    if all_terms.is_empty() {
        return Vec::new();
    }

    let mut current_round: Vec<Term> = all_terms
        .iter()
        .map(|&m| Term::new_minterm(m, num_vars))
        .collect();

    current_round.sort();
    current_round.dedup();

    let mut prime_implicants: Vec<Term> = Vec::new();

    while !current_round.is_empty() {
        let mut next_round: Vec<Term> = Vec::new();
        let mut combined_flags = vec![false; current_round.len()];

        for i in 0..current_round.len() {
            for j in (i + 1)..current_round.len() {
                if current_round[i].can_combine(&current_round[j]) {
                    combined_flags[i] = true;
                    combined_flags[j] = true;
                    next_round.push(current_round[i].combine(&current_round[j]));
                }
            }
        }

        for (i, &combined) in combined_flags.iter().enumerate() {
            if !combined {
                prime_implicants.push(current_round[i].clone());
            }
        }

        next_round.sort();
        next_round.dedup();
        current_round = next_round;
    }

    prime_implicants.sort();
    prime_implicants.dedup();
    prime_implicants
}

#[derive(Debug, Clone)]
pub struct MinimizationSolution {
    pub selected_implicants: Vec<Term>,
    pub essential_indices: HashSet<usize>,
}

pub fn solve_minimum_cover(
    required_minterms: &[usize],
    all_terms: &[usize],
    num_vars: usize,
) -> MinimizationSolution {
    if required_minterms.is_empty() {
        return MinimizationSolution {
            selected_implicants: Vec::new(),
            essential_indices: HashSet::new(),
        };
    }

    let total_possible = 1 << num_vars;
    // Check if all terms cover entire space (constant 1 or 0)
    let all_set: HashSet<usize> = all_terms.iter().copied().collect();
    if all_set.len() == total_possible {
        let universal = Term {
            mask: 0,
            value: 0,
            minterms: (0..total_possible).collect(),
        };
        let mut ess = HashSet::new();
        ess.insert(0);
        return MinimizationSolution {
            selected_implicants: vec![universal],
            essential_indices: ess,
        };
    }

    let prime_implicants = find_prime_implicants(all_terms, num_vars);
    if prime_implicants.is_empty() {
        return MinimizationSolution {
            selected_implicants: Vec::new(),
            essential_indices: HashSet::new(),
        };
    }

    // Step 1: Identify essential prime implicants (EPIs)
    let mut essential_pi_indices: BTreeSet<usize> = BTreeSet::new();

    for &req_m in required_minterms {
        let covering_pis: Vec<usize> = prime_implicants
            .iter()
            .enumerate()
            .filter(|(_, pi)| pi.covers(req_m))
            .map(|(idx, _)| idx)
            .collect();

        if covering_pis.len() == 1 {
            essential_pi_indices.insert(covering_pis[0]);
        }
    }

    // Step 2: Determine which minterms are still uncovered
    let mut covered_by_essential: HashSet<usize> = HashSet::new();
    for &pi_idx in &essential_pi_indices {
        for &m in &prime_implicants[pi_idx].minterms {
            covered_by_essential.insert(m);
        }
    }

    let remaining_minterms: Vec<usize> = required_minterms
        .iter()
        .copied()
        .filter(|m| !covered_by_essential.contains(m))
        .collect();

    let mut final_selected_indices = essential_pi_indices.clone();

    if !remaining_minterms.is_empty() {
        // Filter candidate PIs: not already essential, and covers at least one remaining minterm
        let candidate_indices: Vec<usize> = prime_implicants
            .iter()
            .enumerate()
            .filter(|(idx, pi)| {
                !essential_pi_indices.contains(idx)
                    && remaining_minterms.iter().any(|&m| pi.covers(m))
            })
            .map(|(idx, _)| idx)
            .collect();

        let best_cover = find_best_subset_cover(
            &candidate_indices,
            &prime_implicants,
            &remaining_minterms,
        );

        for idx in best_cover {
            final_selected_indices.insert(idx);
        }
    }

    // Convert back to sorted list of terms
    let mut selected_terms: Vec<Term> = final_selected_indices
        .iter()
        .map(|&idx| prime_implicants[idx].clone())
        .collect();

    // Deterministic sort: fewest literals first, then by mask, then by value
    selected_terms.sort_by(|a, b| {
        a.literal_count()
            .cmp(&b.literal_count())
            .then_with(|| a.mask.cmp(&b.mask))
            .then_with(|| a.value.cmp(&b.value))
    });

    let mut essential_set = HashSet::new();
    for (i, term) in selected_terms.iter().enumerate() {
        let is_ess = prime_implicants
            .iter()
            .enumerate()
            .any(|(idx, pi)| essential_pi_indices.contains(&idx) && pi == term);
        if is_ess {
            essential_set.insert(i);
        }
    }

    MinimizationSolution {
        selected_implicants: selected_terms,
        essential_indices: essential_set,
    }
}

// Branch and bound exact minimum cover
fn find_best_subset_cover(
    candidates: &[usize],
    all_pis: &[Term],
    remaining_minterms: &[usize],
) -> Vec<usize> {
    let mut best_selection: Option<Vec<usize>> = None;
    let mut best_cost = (usize::MAX, usize::MAX); // (term_count, literal_count)

    fn search(
        index: usize,
        current_selection: &mut Vec<usize>,
        covered_mask: u32,
        target_mask: u32,
        candidates: &[usize],
        all_pis: &[Term],
        minterms: &[usize],
        best_selection: &mut Option<Vec<usize>>,
        best_cost: &mut (usize, usize),
    ) {
        if covered_mask == target_mask {
            let terms_count = current_selection.len();
            let lits_count: usize = current_selection
                .iter()
                .map(|&idx| all_pis[idx].literal_count())
                .sum();
            let cost = (terms_count, lits_count);

            if cost < *best_cost {
                *best_cost = cost;
                *best_selection = Some(current_selection.clone());
            }
            return;
        }

        if index >= candidates.len() {
            return;
        }

        // Pruning: if current selection already has >= best term count, prune
        if current_selection.len() >= best_cost.0 {
            return;
        }

        let cand_idx = candidates[index];
        let pi = &all_pis[cand_idx];

        // Option 1: Include this candidate if it covers any currently uncovered minterm
        let mut new_covered = covered_mask;
        for (m_idx, &m) in minterms.iter().enumerate() {
            if pi.covers(m) {
                new_covered |= 1 << m_idx;
            }
        }

        if new_covered != covered_mask {
            current_selection.push(cand_idx);
            search(
                index + 1,
                current_selection,
                new_covered,
                target_mask,
                candidates,
                all_pis,
                minterms,
                best_selection,
                best_cost,
            );
            current_selection.pop();
        }

        // Option 2: Exclude this candidate
        search(
            index + 1,
            current_selection,
            covered_mask,
            target_mask,
            candidates,
            all_pis,
            minterms,
            best_selection,
            best_cost,
        );
    }

    let target_mask = (1u32 << remaining_minterms.len()) - 1;
    let mut current_selection = Vec::new();

    search(
        0,
        &mut current_selection,
        0,
        target_mask,
        candidates,
        all_pis,
        remaining_minterms,
        &mut best_selection,
        &mut best_cost,
    );

    best_selection.unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_qm_prime_implicants() {
        // Function F(A, B, C) = m(0, 1, 2, 5, 6, 7)
        let terms = vec![0, 1, 2, 5, 6, 7];
        let pis = find_prime_implicants(&terms, 3);
        assert!(!pis.is_empty());
    }

    #[test]
    fn test_solve_minimum_cover_simple() {
        // F(A, B) = m(0, 1) -> should reduce to A'
        let req = vec![0, 1];
        let all = vec![0, 1];
        let sol = solve_minimum_cover(&req, &all, 2);
        assert_eq!(sol.selected_implicants.len(), 1);
        let pi = &sol.selected_implicants[0];
        // In 2-var: A is bit 1, B is bit 0.
        // m0=00, m1=01 -> A=0, B='-'
        assert_eq!(pi.mask, 0b10);
        assert_eq!(pi.value, 0b00);
    }

    #[test]
    fn test_wraparound_group_of_4() {
        // 4 corners of 4-variable map: m0, m2, m8, m10
        // m0=0000, m2=0010, m8=1000, m10=1010
        // Variables: A, B, C, D (bits 3, 2, 1, 0)
        // B=0, D=0 -> mask: 0b0101 = 5, value = 0
        let req = vec![0, 2, 8, 10];
        let all = vec![0, 2, 8, 10];
        let sol = solve_minimum_cover(&req, &all, 4);
        assert_eq!(sol.selected_implicants.len(), 1);
        let pi = &sol.selected_implicants[0];
        assert_eq!(pi.mask, 0b0101);
        assert_eq!(pi.value, 0);
        assert_eq!(pi.minterms, vec![0, 2, 8, 10]);
    }
}

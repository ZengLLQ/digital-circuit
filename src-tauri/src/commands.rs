use crate::expression::{build_pos_result, build_sop_result};
use crate::kmap::build_kmap_grid;
use crate::models::KMapResponse;
use crate::truth_table::{extract_terms, generate_truth_table, get_variable_names};

#[tauri::command]
pub fn solve_kmap(num_vars: usize, outputs: Vec<String>) -> Result<KMapResponse, String> {
    let n = num_vars.clamp(2, 4);
    let var_names = get_variable_names(n);
    let truth_table = generate_truth_table(n, Some(&outputs));
    let grid = build_kmap_grid(n, &truth_table);
    let (on_terms, off_terms, dc_terms) = extract_terms(&truth_table);

    let sop = build_sop_result(n, &on_terms, &dc_terms);
    let pos = build_pos_result(n, &off_terms, &dc_terms);

    Ok(KMapResponse {
        num_vars: n,
        var_names,
        truth_table,
        grid,
        sop,
        pos,
    })
}

#[tauri::command]
pub fn get_default_state(num_vars: usize) -> KMapResponse {
    let n = num_vars.clamp(2, 4);
    let row_count = 1 << n;
    let default_outputs = match n {
        2 => vec![
            "0".to_string(),
            "1".to_string(),
            "1".to_string(),
            "1".to_string(),
        ],
        3 => vec![
            "1".to_string(),
            "0".to_string(),
            "1".to_string(),
            "0".to_string(),
            "0".to_string(),
            "1".to_string(),
            "0".to_string(),
            "1".to_string(),
        ],
        4 => {
            let mut outs = vec!["0".to_string(); row_count];
            for &m in &[0, 2, 8, 10, 5, 7, 13, 15] {
                outs[m] = "1".to_string();
            }
            outs
        }
        _ => vec!["0".to_string(); row_count],
    };

    solve_kmap(n, default_outputs).unwrap()
}

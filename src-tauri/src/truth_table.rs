use crate::models::TruthTableRow;

pub fn get_variable_names(num_vars: usize) -> Vec<String> {
    match num_vars {
        2 => vec!["A".to_string(), "B".to_string()],
        3 => vec!["A".to_string(), "B".to_string(), "C".to_string()],
        4 => vec![
            "A".to_string(),
            "B".to_string(),
            "C".to_string(),
            "D".to_string(),
        ],
        _ => (0..num_vars)
            .map(|i| ((b'A' + i as u8) as char).to_string())
            .collect(),
    }
}

pub fn generate_truth_table(num_vars: usize, outputs: Option<&[String]>) -> Vec<TruthTableRow> {
    let row_count = 1 << num_vars;
    let mut rows = Vec::with_capacity(row_count);

    for i in 0..row_count {
        let mut values = Vec::with_capacity(num_vars);
        for bit in (0..num_vars).rev() {
            values.push(((i >> bit) & 1) as u8);
        }

        let output = if let Some(outs) = outputs {
            if i < outs.len() {
                normalize_output(&outs[i])
            } else {
                "0".to_string()
            }
        } else {
            "0".to_string()
        };

        rows.push(TruthTableRow {
            index: i,
            values,
            output,
        });
    }

    rows
}

pub fn normalize_output(val: &str) -> String {
    let trimmed = val.trim().to_uppercase();
    if trimmed == "1" {
        "1".to_string()
    } else if trimmed == "X" || trimmed == "D" {
        "X".to_string()
    } else {
        "0".to_string()
    }
}

pub fn extract_terms(rows: &[TruthTableRow]) -> (Vec<usize>, Vec<usize>, Vec<usize>) {
    let mut on_terms = Vec::new();
    let mut off_terms = Vec::new();
    let mut dc_terms = Vec::new();

    for row in rows {
        match row.output.as_str() {
            "1" => on_terms.push(row.index),
            "0" => off_terms.push(row.index),
            "X" => dc_terms.push(row.index),
            _ => off_terms.push(row.index),
        }
    }

    (on_terms, off_terms, dc_terms)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_variable_names() {
        assert_eq!(get_variable_names(2), vec!["A", "B"]);
        assert_eq!(get_variable_names(3), vec!["A", "B", "C"]);
        assert_eq!(get_variable_names(4), vec!["A", "B", "C", "D"]);
    }

    #[test]
    fn test_generate_truth_table() {
        let tt = generate_truth_table(2, None);
        assert_eq!(tt.len(), 4);
        assert_eq!(tt[0].values, vec![0, 0]);
        assert_eq!(tt[1].values, vec![0, 1]);
        assert_eq!(tt[2].values, vec![1, 0]);
        assert_eq!(tt[3].values, vec![1, 1]);
        assert_eq!(tt[0].output, "0");
    }

    #[test]
    fn test_extract_terms() {
        let outs = vec![
            "1".to_string(),
            "0".to_string(),
            "x".to_string(),
            "1".to_string(),
        ];
        let tt = generate_truth_table(2, Some(&outs));
        let (on, off, dc) = extract_terms(&tt);
        assert_eq!(on, vec![0, 3]);
        assert_eq!(off, vec![1]);
        assert_eq!(dc, vec![2]);
    }
}

use crate::models::TruthTableRow;

pub fn get_default_variable_names(num_vars: usize) -> Vec<String> {
    (1..=num_vars).map(|i| format!("IN{}", i)).collect()
}

pub fn get_variable_names(num_vars: usize) -> Vec<String> {
    get_default_variable_names(num_vars)
}

pub fn resolve_variable_names(num_vars: usize, custom_names: Option<&[String]>) -> Vec<String> {
    let defaults = get_default_variable_names(num_vars);
    if let Some(custom) = custom_names {
        if custom.len() == num_vars {
            let mut resolved = Vec::with_capacity(num_vars);
            for (i, name) in custom.iter().enumerate() {
                let trimmed = name.trim();
                if trimmed.is_empty() {
                    resolved.push(defaults[i].clone());
                } else {
                    resolved.push(trimmed.to_string());
                }
            }
            return resolved;
        }
    }
    defaults
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
        assert_eq!(get_variable_names(2), vec!["IN1", "IN2"]);
        assert_eq!(get_variable_names(3), vec!["IN1", "IN2", "IN3"]);
        assert_eq!(get_variable_names(4), vec!["IN1", "IN2", "IN3", "IN4"]);

        let custom = vec!["X".to_string(), "Y".to_string()];
        assert_eq!(resolve_variable_names(2, Some(&custom)), vec!["X", "Y"]);
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

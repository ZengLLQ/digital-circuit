pub mod commands;
pub mod expression;
pub mod kmap;
pub mod minimizer;
pub mod models;
pub mod truth_table;

#[cfg(test)]
pub mod verification_tests;

use commands::{get_default_state, solve_kmap};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![solve_kmap, get_default_state])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

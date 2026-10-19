# Karnaugh Studio — Modern Digital Circuit & Boolean Minimizer Desktop Application

<p align="center">
  <img src="./app-icon.svg" width="128" height="128" alt="Karnaugh Studio Logo" />
</p>

<p align="center">
  <b>A modern, high-performance desktop application for digital logic design, interactive multi-output truth tables, and real-time Karnaugh map Boolean minimization with automatic vector grouping.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Rust-1.80+-orange.svg?logo=rust" alt="Rust" />
  <img src="https://img.shields.io/badge/Tauri-2.0-blue.svg?logo=tauri" alt="Tauri 2" />
  <img src="https://img.shields.io/badge/React-19-cyan.svg?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue.svg?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Platform-Windows%20x64-0078d4.svg?logo=windows" alt="Windows x64" />
</p>

---

## Overview

**Karnaugh Studio** is an educational and professional-grade desktop application built with **Rust** and **Tauri 2**, featuring an elegant **Antigravity Dark Theme** inspired by Linear and Raycast. It pairs exact mathematical Boolean algebra algorithms with reactive, interactive vector visualization to help students, computer engineers, and hardware designers master Boolean minimization.

---

## Key Features

### 1. Interactive Multi-Output Truth Table
- **Two-Tier Categorized Columns**: Clearly organized into **`m`** (minterm index), **`Input`** variables, and **`Output`** functions.
- **Multi-Output Engine (`O0`, `O1`, `O2`, ...)**:
  - Add arbitrary output functions via the **`+ Add`** button in the Truth Table header.
  - Switch active output tabs to analyze, map, and minimize distinct logic functions from the same truth table inputs.
  - Delete extra output columns when no longer needed.
- **Bi-Directional Cell Editing**:
  - Click any truth table cell or select via keyboard to cycle through `0 -> 1 -> X` (don't care).
  - Quick batch operations: **All 0**, **All 1**, and **Invert** (preserves don't cares).
  - Full keyboard accessibility: `ArrowUp`/`ArrowDown` row navigation, `0`, `1`, `X`, `Space`, and `Enter`.

### 2. Arbitrary & Customizable Variable Naming
- **Default Sequential Identifiers**:
  - **4 Variables**: `IN1`, `IN2`, `IN3`, `IN4`
  - **3 Variables**: `IN1`, `IN2`, `IN3`
  - **2 Variables**: `IN1`, `IN2`
- **Inline Click-to-Edit**: Click any input variable in the table header to rename it on the fly (e.g., `CLK`, `RESET`, `ENABLE`, `A`, `B`).
- **Synchronized Throughout UI**: Custom names immediately propagate to the K-Map axes, minterm coordinates, educational explanations, and final algebraic SoP/PoS formulas.
- **Preserved Across Configurations**: Custom variable names are cached and maintained when switching between 2, 3, and 4 variables.

### 3. Standardized Karnaugh Map Layout & Axis Orientations
Exact Gray-code reflected binary axes with high-contrast diagonal variable dividers:
- **4-Variable Map ($4 \times 4$ grid, 16 cells)**:
  $$\text{Row Axis: } \mathbf{IN3\ IN4} \quad \backslash \quad \text{Column Axis: } \mathbf{IN1\ IN2}$$
- **3-Variable Map ($2 \times 4$ grid, 8 cells)**:
  $$\text{Row Axis: } \mathbf{IN2\ IN3} \quad \backslash \quad \text{Column Axis: } \mathbf{IN1}$$
- **2-Variable Map ($2 \times 2$ grid, 4 cells)**:
  $$\text{Row Axis: } \mathbf{IN2} \quad \backslash \quad \text{Column Axis: } \mathbf{IN1}$$

The top-left corner features an authentic **SVG diagonal divider**, highlighting Column variables in Sky-Blue (`#38bdf8`) and Row variables in Violet (`#a78bfa`).

### 4. Real-Time Auto Circle & Grouping Contours
- **Prominent Vector Highlighting**:
  - Groups are rendered in real time as smooth, rounded contours (*true circles* for $1 \times 1$ groups, *stadium pills* for 1-span rows/columns, and rounded bounding blocks for multi-cell areas).
  - Permanent glowing drop-shadow contours designed for dark mode readability.
- **Full Toroidal Wraparound Support**:
  - Horizontal boundary wraparound (left-to-right edges).
  - Vertical boundary wraparound (top-to-bottom edges).
  - Four-corner grouping ($m_0, m_2, m_8, m_{10} \implies IN2' \cdot IN4'$), displayed cleanly as disjoint corner segments without drawing confusing lines across unrelated middle cells.
- **Non-Blocking Click-Through**:
  - The SVG contour layer is configured with `pointer-events-none`, allowing direct editing of K-map cells underneath without interference.
- **Unobtrusive Group Badges**:
  - Group badges ($G_1, G_2, \dots$) are anchored to the bottom-right of primary segments, ensuring that cell minterm labels ($m_n$) at the top-left remain completely visible.

### 5. Dual Boolean Minimization (Rust Core Engine)
- **Sum of Products (SoP)**: Minimal AND-terms joined by OR ($F = IN1' \cdot IN2 + IN2 \cdot IN4'$).
- **Product of Sums (PoS)**: Minimal OR-terms joined by AND ($F = (IN1 + IN2')(IN2 + IN4)$).
- **Exact Algorithm**:
  1. Quine–McCluskey prime implicant generation.
  2. Prime implicant chart reduction with essential prime implicant extraction.
  3. Petrick / Branch-and-bound minimum-cost set cover:
     - Primary objective: **Minimum number of terms**.
     - Secondary objective: **Minimum total literals**.
     - Deterministic tie-breaking for repeatable results.
- **Edge-Case Handling**:
  - Constant 0 ($F = 0$).
  - Constant 1 ($F = 1$).
  - All don't-care functions ($F = 0$ deterministic convention with explicit educational status indicator).

### 6. Educational Insights & Pedagogical Feedback
- **Consensus & Variable Elimination**: Click any term or group badge to inspect which variables disappear and why (consensus theorem $X + X' = 1$, eliminating $k$ variables across a group of size $2^k$).
- **Integrated Guide Modal**: Explains fundamental Karnaugh map axioms, power-of-two group rules, Gray-code adjacency, and don't-care optimization techniques.

### 7. Antigravity Dark Theme & Inter Typography
- **Deep Slate & Charcoal Palette**: `#0a0a0c` canvas, `#121316` cards, `#202228` borders, and `#7c3aed` / `#a78bfa` violet active accents.
- **High-Contrast Readability**: WCAG AA compliant text contrast across all logic values ($0$, $1$, $X$, minterms, and coordinates).
- **Full Inter Font Spectrum**: Bundled offline with `@fontsource/inter` (weights 300 to 900, normal and italic) with OpenType tabular lining figures (`tabular-nums`) for fixed-width digit alignment.
- **Native Window Dark Theme**: Tauri window configured with native Windows DWM dark titlebar and border rendering.

---

## Mathematical Verification & Test Suite

The Rust engine includes an exhaustive mathematical verification test suite with **21 automated tests**:

```bash
cd src-tauri
cargo test
```

### Verified Test Cases:
1. **Exhaustive 4-Variable Verification (`test_all_65536_functions_4_vars_exhaustive`)**:
   - Programmatically tests all **65,536** four-variable Boolean functions.
   - Parses the generated algebraic string formulas (`term_plain` / `expression_plain`) and evaluates them against every minterm binary combination ($0..15$) to guarantee $100\%$ functional equivalence for both SoP and PoS.
2. **Independent Combinatorial Oracle (`test_optimality_against_independent_brute_force_oracle`)**:
   - Searches all $3^n$ possible product terms via an independent brute-force algorithm to prove that Quine–McCluskey achieves the absolute global minimum in terms and literals.
3. **Exhaustive 2-Variable (16 functions) & 3-Variable (256 functions) Tests**.
4. **Toroidal Gray-Code Adjacency & Wraparound Tests**.
5. **Four-Corner Group Isolation ($m_0, m_2, m_8, m_{10}$)**.
6. **Don't-Care Optimization Verification**.
7. **Pure Determinism Consistency Across Repeated Runs**.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Desktop Framework** | [Tauri 2](https://v2.tauri.app/) (native Windows webview, low memory footprint, zero telemetry) |
| **Backend & Math Engine**| [Rust](https://www.rust-lang.org/) (Quine–McCluskey, Petrick cover, Gray-code mapper) |
| **Frontend Framework** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Styling & Theme** | [Tailwind CSS v4](https://tailwindcss.com/) (Antigravity Dark Theme) |
| **Typography** | [Inter](https://rsms.me/inter/) via `@fontsource/inter` (300–900 normal & italic, tabular nums) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Build Tooling** | [Vite 8](https://vitejs.dev/) |
| **Packaging & Installers**| Windows NSIS Installer (`.exe`), Windows MSI (`.msi`) |

---

## Directory Structure

```text
├── .github/workflows/
│   └── build.yml               # CI/CD Windows packaging workflow
├── src/                        # React + TypeScript Frontend
│   ├── api.ts                  # Tauri IPC invoke bridge & web fallback
│   ├── App.css                 # Tailwind CSS styling, Inter font, custom dark scrollbars
│   ├── App.tsx                 # Root layout, multi-output state, reactive solver
│   ├── main.tsx                # Entrypoint with complete Inter font weight bundle
│   ├── types/
│   │   └── kmap.ts             # TypeScript interfaces mirroring Rust models
│   ├── utils/
│   │   ├── colors.ts           # Accessible group color palette (Antigravity violet, cyan, etc.)
│   │   └── solver.ts           # Client-side fallback solver for browser demo mode
│   └── components/
│       ├── Header.tsx          # Titlebar, variable selector (2/3/4), reset, help guide
│       ├── TruthTable.tsx      # Two-tier categorized table, multi-output, inline var rename
│       ├── KarnaughMap.tsx     # Gray-code grid, SVG diagonal header, keyboard navigation
│       ├── GroupOverlay.tsx    # SVG vector group contours, true circles, non-blocking click
│       ├── ResultsPanel.tsx    # SoP/PoS tabs, term counts, literal counts, copy, consensus cards
│       ├── EducationalModal.tsx# Educational student guide & K-map axioms
│       └── ResetConfirmModal.tsx# Confirmation dialog before resetting user inputs
├── src-tauri/                  # Rust Backend Engine
│   ├── Cargo.toml              # Rust crate manifest & dependencies
│   ├── tauri.conf.json         # Tauri 2 configuration & dark window metadata
│   ├── icons/                  # Windows icons (.ico, .png, .icns, tile logos)
│   └── src/
│       ├── main.rs             # Desktop application entry point
│       ├── lib.rs              # Tauri command dispatch & plugin setup
│       ├── commands.rs         # IPC commands (solve_kmap, get_default_truth_table)
│       ├── models.rs           # Shared serializable data models
│       ├── truth_table.rs      # Truth table generation & term extraction
│       ├── kmap.rs             # Gray code ordering & wraparound rect mapping
│       ├── minimizer.rs        # Quine-McCluskey & minimum-cost branch-and-bound cover
│       ├── expression.rs       # SoP/PoS formatting & pedagogical explanations
│       └── verification_tests.rs# Exhaustive 65,536-function test suite & brute force oracle
├── app-icon.svg                # Master vector application logo
└── package.json                # NPM configuration & build scripts
```

---

## Installation & Distribution

Pre-built Windows release packages are available directly in the build output directory:

- **Windows NSIS Installer (`.exe`)**:
  ```
  src-tauri/target/release/bundle/nsis/Karnaugh Studio_1.0.0_x64-setup.exe
  ```
- **Windows MSI Package (`.msi`)**:
  ```
  src-tauri/target/release/bundle/msi/Karnaugh Studio_1.0.0_x64_en-US.msi
  ```
- **Standalone Portable Executable (`.exe`)**:
  ```
  src-tauri/target/release/karnaugh-studio.exe
  ```

---

## Development Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Rust](https://www.rust-lang.org/) (v1.80+ recommended)
- Microsoft Visual Studio C++ Build Tools (for Windows desktop compilation)

### Quick Start
```bash
# 1. Install frontend dependencies
npm install

# 2. Launch the desktop application in development mode (hot-reload enabled)
npm run tauri dev
```

### Running Tests
```bash
# Run all unit tests and exhaustive 65,536 mathematical verifications
cd src-tauri
cargo test
```

### Building Release Package
```bash
# Compile optimized frontend, compile Rust release binary, and bundle NSIS/MSI installers
npm run tauri build
```

---

## License

This project is licensed under the [MIT License](LICENSE).

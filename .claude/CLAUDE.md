# Basis Points — Project Context & Standards

## Purpose

Basis Points is an open-source suite of personal finance tools for do-it-yourself investors. The target user is someone managing their own portfolio — not a finance professional — who wants to understand the real trade-offs between fund choices: factor exposures, expected returns, costs, tax efficiency, and geographic allocation.

The project lives entirely in the browser (no backend, no accounts) and is designed to be hosted for free on GitHub Pages.

## Design Principles

### 1. Calculation accuracy and traceability
Every number shown to the user must be traceable to a published academic source or a well-known data provider. Approximations are acceptable but must be documented. Methodology tooltips in the UI should explain the formula and its source. Do not add metrics that cannot be backed by data or cited literature.

Key academic foundations currently in use:
- **Fama-French three-factor model** (SMB, HML) for factor return estimation
- **CAPE-adjusted equity risk premium** (Shiller) for expected return
- **Markowitz mean-variance** framework for portfolio volatility (σ_p = √(ΣᵢΣⱼ wᵢwⱼσᵢσⱼρᵢⱼ))
- **Geometric return approximation**: geometric ≈ arithmetic − σ²/2 (variance drag)
- **Tax Equivalent Yield**: TEY = muni yield / (1 − marginal rate)

When updating constants (CAPE, bond yields, correlations, etc.), record the source and date in `data.js` comments.

### 2. Pristine, modular code
- Each JS module has a single responsibility (see File Tree below)
- Logic modules (`calculations.js`) must not read from the DOM — UI parameters are passed as arguments by rendering callers
- No build tooling: native ES modules only, works directly in the browser
- Prefer explicit over implicit; no global state outside `state.js`
- New tools should be added as new modules following the existing pattern, not by expanding existing ones

### 3. Openness and simplicity
- No frameworks, no npm dependencies, no login, no tracking
- The entire tool must work offline after initial load
- Code should be readable by a developer unfamiliar with the project within minutes

### 4. GitHub Pages compatibility (hard constraint)
All code must work when served as static files from GitHub Pages with zero server-side logic. Concretely:
- **No build step** — no bundlers (Webpack, Vite, Rollup, esbuild), no TypeScript compilation, no JSX transforms. Files are served exactly as written.
- **No `node_modules`** — all code ships in the repo; no npm install required to run or deploy
- **Relative paths only** — all `import` statements and asset references must use relative paths (e.g. `./data.js`, not bare specifiers like `data`)
- **No server-side redirects or rewrites** — navigation and URL sharing must work with standard query strings (`?a=...`), not hash routing or `history.pushState` paths that require a fallback `index.html` rule
- **`<script type="module">`** is the correct and only module system to use — it is natively supported by all modern browsers and served correctly by GitHub Pages

## Current Tools

| Tool | File(s) | Description |
|---|---|---|
| Portfolio Comparator | `portfolio.js`, `render.js`, `charts.js` | Compare two ETF portfolios across factor exposures, expected return, cost, and 30-year growth |
| Tax Equivalent Yield | `tey.js` | Compare after-tax yields of bond funds and money market funds across tax brackets |

## File Tree

```
finance/
├── index.html          (294 lines — HTML shell only)
├── css/
│   ├── base.css        variables, reset, header, footer, tabs
│   ├── portfolio.css   cards, ETF rows, modals, sliders, total bar
│   ├── stats.css       stats table, butterfly bars, charts, methodology
│   └── tey.css         TEY fund cards and comparison table
└── js/
    ├── data.js         all ETF data, presets, constants, stat definitions
    ├── state.js        portfolio state, localStorage, URL sharing
    ├── calculations.js calcStats, getCorr
    ├── portfolio.js    buildRows, sliders, presets, normalize/reset
    ├── charts.js       renderRadar, renderGrowthChart, setGrowthMode
    ├── render.js       renderAll, stats table HTML
    ├── ui.js           modals (ETF detail, parameters)
    ├── tey.js          TEY fund cards, table, openTeyModal
    └── main.js         init, all event listeners
```

## Module Responsibilities

### `js/data.js`
Pure static data — no imports. Exports:
- `ETFS` — ETF definitions (ticker, PE, PB, SMB, HML, ER, vol, tip, etc.)
- `TICKERS` — ordered array of 8 ticker symbols
- `PRESETS` — named allocation presets (2-Fund, Factor Tilt, etc.)
- `DEFAULTS` — default Portfolio A / B allocations on first load
- `STAT_GROUPS` — stat row definitions (label, key, format fn, better direction)
- `TEY_FUNDS` / `TEY_BRACKETS` — Tax Equivalent Yield tool data
- Pricing constants: `RF`, `CAPE_US`, `CAPE_INTL`, `EPS_GROWTH`, `VPREM`, `SPREM`, `INTL_MKT_WT`, `EM_MKT_WT`
- `CORR_MATRIX` — pairwise ETF correlations for Markowitz variance
- `DATA_DATE`, `INFLATION`

### `js/state.js`
Imports: `data.js`. Exports:
- `state` — mutable portfolio allocation object `{ a: {...}, b: {...} }`
- `settings` — mutable UI state `{ growthMode, showAdvisor }`
- `saveState()` / `loadState()` — localStorage persistence
- `applyURLState(params)` — restore state from URL query params
- `copyShareLink()` — encode state into a shareable URL
- `applyGrowthMode(mode)` / `applyAdvisorMode(show)` — single source of truth for toggling chart mode UI state

### `js/calculations.js`
Imports: `data.js`, `state.js`. Exports:
- `getCorr(a, b)` — lookup pairwise correlation
- `calcStats(p, { rf, advisorOn, advFee })` — compute all portfolio statistics (PE, PB, HML, SMB, ER, factor return, geometric return, volatility, cost drag). Pure function — no DOM reads; callers pass UI parameters.

### `js/portfolio.js`
Imports: `data.js`, `state.js`, `ui.js`. Exports:
- `buildRows(p)` — render ETF slider/input rows into the DOM
- `onSlider(p, tk, v)` / `onNumber(p, tk, v)` — sync slider ↔ number input, update state
- `applyPreset(p, key)` — load a named preset into a portfolio
- `resetPortfolio(p)` — restore default allocations
- `normalizePortfolio(p)` — scale weights to sum to 100%
- `refreshTotal(p)` — update the total allocation bar
- `setRenderAll(fn)` — inject `renderAll` to avoid circular imports

### `js/charts.js`
Imports: `calculations.js`, `state.js`. Exports:
- `renderRadar()` — draw 4-axis factor radar SVG (Earnings Yield, Int'l %, SMB, HML)
- `renderGrowthChart()` — draw 30-year growth projection with uncertainty bands, advisor overlay
- `setGrowthMode(mode)` — switch between nominal/real, persist to state
- `toggleAdvisor()` — toggle advisor wealth overlay

### `js/render.js`
Imports: `data.js`, `calculations.js`, `state.js`, `charts.js`. Exports:
- `renderAll()` — master render: calls radar, growth chart, and stats table; saves state

### `js/ui.js`
Imports: `data.js`. Exports:
- `openModal(ticker, name, tip, stats)` — generic modal opener
- `closeEtfModal()` / `openParamsModal()` / `closeParamsModal()`
- `openEtfModal(tk)` — open ETF detail modal with fund stats

### `js/tey.js`
Imports: `data.js`, `ui.js`. Exports:
- `buildTeyFundCards()` — render editable fund cards (Bond ETFs + Money Market)
- `onTeyYield(i, raw)` — handle yield input change, re-render table
- `renderTeyTable()` — render after-tax yield comparison table by bracket
- `openTeyModal(i)` — open fund detail modal for a TEY fund

### `js/main.js`
Imports: everything. Entry point. Does:
1. Injects `renderAll` into `portfolio.js` via `setRenderAll()`
2. Sets data date labels in the DOM
3. Restores state from URL or localStorage
4. Calls `buildRows`, `refreshTotal`, `renderAll`
5. Attaches all `addEventListener` calls (replaces all inline `onclick`/`oninput` attributes)
6. Initialises the TEY tool

## Dependency Graph

```
data.js
  ├── state.js
  │     └── (used by all)
  ├── calculations.js
  │     ├── charts.js
  │     │     └── render.js
  │     └── render.js
  ├── portfolio.js
  │     └── ui.js
  ├── ui.js
  └── tey.js
        └── ui.js

main.js → imports everything, wires events
```

No circular dependencies. `portfolio.js` calls `renderAll` via an injected function reference set by `main.js`.

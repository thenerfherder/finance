# Basis Points — Project Structure

## Overview

| | Before | After |
|---|---|---|
| Files | 1 | 10 |
| `index.html` lines | 2,316 | 294 |

Uses **native ES modules** (`<script type="module">`) — no build tool required, works on GitHub Pages.

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

### `js/calculations.js`
Imports: `data.js`, `state.js`. Exports:
- `getCorr(a, b)` — lookup pairwise correlation
- `calcStats(p)` — compute all portfolio statistics (PE, PB, HML, SMB, ER, factor return, geometric return, volatility, cost drag)

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

# Basis Points

An open-source suite of personal finance tools for do-it-yourself investors. Compare ETF portfolios across factor exposures, expected returns, and costs — all in the browser, with no login, no tracking, and no server.

Built to run on GitHub Pages with zero dependencies and no build step.

---

## Tools

### Portfolio Comparator
Compare two ETF portfolios side-by-side across:
- **Factor exposures** — Value (HML), Size (SMB), P/E, P/B, International allocation, Emerging Markets
- **Expected return estimates** — CAPE-adjusted equity risk premium blended with Fama-French factor loadings
- **Portfolio volatility** — Markowitz mean-variance with pairwise ETF correlations
- **30-year growth projection** — Geometric CAGR with ±1σ uncertainty bands, real vs. nominal, monthly contributions/withdrawals
- **Cost drag** — Compounded fee impact over 30 years, including optional advisor AUM fee overlay

### Tax Equivalent Yield
Compare after-tax yields of bond ETFs and money market funds across all federal income tax brackets. Yields are editable to reflect current data.

---

## Methodology

All calculations are grounded in published academic literature:

| Model | Source |
|---|---|
| Equity risk premium | CAPE-adjusted (Shiller): ERP = 100/CAPE + EPS growth − RF |
| Factor returns | Fama-French three-factor model (SMB, HML) |
| Portfolio volatility | Markowitz: σ_p = √(ΣᵢΣⱼ wᵢwⱼσᵢσⱼρᵢⱼ) |
| Geometric return | Arithmetic − σ²/2 (variance drag approximation) |
| Tax equivalent yield | TEY = muni yield ÷ (1 − marginal rate) |

Methodology notes and data sources are documented inline in the tool's Methodology sections.

---

## Running Locally

No build step required. Open `index.html` directly in a browser, or serve the directory with any static file server:

```bash
# Python
python3 -m http.server

# Node
npx serve .
```

Then open `http://localhost:8000` (or whichever port).

---

## Project Structure

```
finance/
├── index.html          HTML shell — no inline logic
├── css/
│   ├── base.css        Variables, reset, header, footer, tabs
│   ├── portfolio.css   Portfolio cards, ETF rows, modals
│   ├── stats.css       Stats table, charts, radar
│   └── tey.css         Tax Equivalent Yield tool
└── js/
    ├── data.js         ETF data, presets, constants, stat definitions
    ├── state.js        Portfolio state, localStorage, URL sharing
    ├── calculations.js Pure calculation functions (no DOM)
    ├── portfolio.js    ETF input rows, sliders, presets
    ├── charts.js       Radar and growth chart rendering
    ├── render.js       Stats table, master render
    ├── ui.js           Modals
    ├── tey.js          Tax Equivalent Yield tool
    └── main.js         Entry point, event listeners
```

Native ES modules (`<script type="module">`) — no bundler, works directly on GitHub Pages.

---

## Contributing

Contributions welcome. Before adding a new metric or tool, please ensure:

1. The calculation is backed by a published academic source or well-known data provider
2. The methodology is documented (tooltip or Methodology section)
3. No new dependencies are introduced
4. The code follows the existing module pattern (see `CLAUDE.md` for architectural guidelines)

To update ETF data (P/E, P/B, correlations, yields), edit `js/data.js` and update the source comment with the date and provider.

---

## License

MIT — see [LICENSE](LICENSE).

> **Not investment advice.** This tool is for educational and illustrative purposes only.

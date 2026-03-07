// ================================================================
// ETF DATA
// Source: Vanguard / Avantis fund pages, Morningstar, ETF Database
// Updated: February 2026
// ================================================================
export const ETFS = {
  VTI: {
    ticker:    'VTI',
    name:      'Vanguard Total Stock Market ETF',
    sub:       'US Total Market',
    assetClass:'equity',
    pe:        26.0,
    pb:        4.00,
    intlPct:   0,
    emPct:     0,
    smb:       0.05,
    hml:       0.00,
    er:        0.03,
    vol:       16,
    tip:       'Market-cap weighted index covering ~100% of investable US equity market. ~3,525 holdings. No factor tilt.',
  },
  VXUS: {
    ticker:    'VXUS',
    name:      'Vanguard Total International Stock ETF',
    sub:       'International ex-US',
    assetClass:'equity',
    pe:        15.9,
    pb:        1.80,
    intlPct:   97,
    emPct:     25,
    smb:       0.05,
    hml:       0.10,
    er:        0.05,
    vol:       18,
    tip:       'Market-cap weighted index of ~8,700 non-US stocks. ~75% developed, ~25% emerging markets. No active factor tilt.',
  },
  VT: {
    ticker:    'VT',
    name:      'Vanguard Total World Stock ETF',
    sub:       'Global Total Market',
    assetClass:'equity',
    pe:        22.7,
    pb:        3.10,
    intlPct:   40,
    emPct:     11,
    smb:       0.05,
    hml:       0.04,
    er:        0.06,
    vol:       16,
    tip:       'Market-cap weighted index covering ~10,055 stocks across 50+ countries. ~60% US, ~40% international (developed + emerging). No factor tilt. Single-fund global diversification.',
  },
  AVGE: {
    ticker:    'AVGE',
    name:      'Avantis All Equity Markets ETF',
    sub:       'Global · light factor tilts',
    assetClass:'equity',
    pe:        18.5,
    pb:        2.70,
    intlPct:   32,
    emPct:     10,
    smb:       0.20,
    hml:       0.20,
    er:        0.23,
    vol:       17,
    tip:       'Fund-of-funds (~10 Avantis ETFs, ~9,100 underlying securities). Largest holding: AVUS ~41%. Light value, size, and profitability tilts globally.',
  },
  AVGV: {
    ticker:    'AVGV',
    name:      'Avantis All Equity Markets Value ETF',
    sub:       'Global · strong value tilt',
    assetClass:'equity',
    pe:        14.0,
    pb:        1.85,
    intlPct:   40,
    emPct:     12,
    smb:       0.40,
    hml:       0.45,
    er:        0.26,
    vol:       19,
    tip:       'Fund-of-funds (7 Avantis value ETFs). Largest holding: AVLV ~36%. Concentrated in value factors globally with meaningful small cap and profitability tilts.',
  },
  AVUV: {
    ticker:    'AVUV',
    name:      'Avantis U.S. Small Cap Value ETF',
    sub:       'US Small Cap Value',
    assetClass:'equity',
    pe:        13.4,
    pb:        1.75,
    intlPct:   0,
    emPct:     0,
    smb:       0.82,
    hml:       0.60,
    er:        0.25,
    vol:       22,
    tip:       'Actively managed. ~775 holdings selected for low P/B and high profitability. Strong SMB (0.82) and HML (0.60) loadings. ~30% Financials.',
  },
  AVDV: {
    ticker:    'AVDV',
    name:      'Avantis International Small Cap Value ETF',
    sub:       'Intl Small Cap Value',
    assetClass:'equity',
    pe:        14.1,
    pb:        1.05,
    intlPct:   99,
    emPct:     0,
    smb:       0.78,
    hml:       0.35,
    er:        0.36,
    vol:       22,
    tip:       'Actively managed international small cap value. ~1,686 holdings across developed markets ex-US. Strong SMB (0.78) and HML (0.35) loadings. Complements AVUV for a global SCV allocation.',
  },
  BND: {
    ticker:    'BND',
    name:      'Vanguard Total Bond Market ETF',
    sub:       'US Investment-Grade Bonds',
    assetClass:'fixed',
    bondYield: 4.18,
    pe:        null,
    pb:        null,
    intlPct:   0,
    emPct:     0,
    smb:       0,
    hml:       0,
    er:        0.03,
    vol:       5,
    tip:       'Tracks the Bloomberg U.S. Aggregate Bond Index. ~17,000 investment-grade US bonds — Treasuries (~45%), agencies, and corporates. Duration ~6 years. Broad core bond exposure. Fully taxable interest; best held in tax-advantaged accounts.',
  },
};

export const TICKERS = ['VTI', 'VXUS', 'VT', 'AVGE', 'AVGV', 'AVUV', 'AVDV', 'BND'];

// ================================================================
// PRESETS
// ================================================================
export const PRESETS = {
  '2fund':        { VTI:60, VXUS:40, VT:0,   AVGE:0,  AVGV:0,  AVUV:0,  AVDV:0,  BND:0  },
  'us_only':      { VTI:100,VXUS:0,  VT:0,   AVGE:0,  AVGV:0,  AVUV:0,  AVDV:0,  BND:0  },
  'intl_only':    { VTI:0,  VXUS:100,VT:0,   AVGE:0,  AVGV:0,  AVUV:0,  AVDV:0,  BND:0  },
  '3fund':        { VTI:50, VXUS:30, VT:0,   AVGE:0,  AVGV:0,  AVUV:20, AVDV:0,  BND:0  },
  'avantis_core': { VTI:0,  VXUS:0,  VT:0,   AVGE:60, AVGV:0,  AVUV:40, AVDV:0,  BND:0  },
  'factor_tilt':  { VTI:0,  VXUS:20, VT:0,   AVGE:20, AVGV:0,  AVUV:40, AVDV:20, BND:0  },
  'deep_value':   { VTI:0,  VXUS:0,  VT:0,   AVGE:0,  AVGV:50, AVUV:50, AVDV:0,  BND:0  },
  'all_avantis':  { VTI:0,  VXUS:0,  VT:0,   AVGE:40, AVGV:30, AVUV:20, AVDV:10, BND:0  },
};

export const PRESET_OPTIONS = [
  { key: '2fund',        label: '2-Fund (VTI/VXUS 60/40)'    },
  { key: 'us_only',      label: '100% US (VTI)'               },
  { key: 'intl_only',   label: '100% International (VXUS)'   },
  { key: '3fund',        label: '3-Fund + Small Value'         },
  { key: 'avantis_core', label: 'Avantis Core (AVGE/AVUV)'    },
  { key: 'factor_tilt',  label: 'Factor Tilted'               },
  { key: 'deep_value',   label: 'Deep Value'                  },
  { key: 'all_avantis',  label: 'All Avantis Blend'           },
];

// ================================================================
// DEFAULT PORTFOLIOS
// ================================================================
export const DEFAULTS = {
  a: { VTI:42, VXUS:18, VT:0, AVGE:0, AVGV:0, AVUV:14, AVDV:6, BND:20 },
  b: { VTI:0,  VXUS:0,  VT:80,AVGE:0, AVGV:0, AVUV:0,  AVDV:0, BND:20 },
};

// ================================================================
// PRICING CONSTANTS
// ================================================================
export const RF         = 4.0;
export const CAPE_US    = 37;
export const CAPE_INTL  = 16;
export const EPS_GROWTH = 4.5;
export const VPREM      = 3.5;
export const SPREM      = 2.5;
export const INTL_MKT_WT = 40;
export const EM_MKT_WT   = 11;

// Pairwise annual-return correlations (upper triangle, TICKERS order).
export const CORR_MATRIX = {
  'VTI,VXUS': 0.87, 'VTI,VT':   0.98, 'VTI,AVGE': 0.96, 'VTI,AVGV': 0.91,
  'VTI,AVUV': 0.85, 'VTI,AVDV': 0.82, 'VTI,BND':  0.00,
  'VXUS,VT':  0.97, 'VXUS,AVGE':0.93, 'VXUS,AVGV':0.90,
  'VXUS,AVUV':0.75, 'VXUS,AVDV':0.90, 'VXUS,BND': 0.00,
  'VT,AVGE':  0.98, 'VT,AVGV':  0.94, 'VT,AVUV':  0.83,
  'VT,AVDV':  0.87, 'VT,BND':   0.00,
  'AVGE,AVGV':0.96, 'AVGE,AVUV':0.87, 'AVGE,AVDV':0.90, 'AVGE,BND': 0.00,
  'AVGV,AVUV':0.90, 'AVGV,AVDV':0.93, 'AVGV,BND': 0.00,
  'AVUV,AVDV':0.77, 'AVUV,BND': 0.00,
  'AVDV,BND': 0.00,
};

// ================================================================
// STAT GROUP DEFINITIONS
// ================================================================
export const STAT_GROUPS = [
  {
    label: 'Valuation',
    stats: [
      {
        key:    'pe',
        name:   'P/E Ratio',
        desc:   'Harmonic mean P/E · equity sleeve only',
        tip:    'Harmonic mean P/E of the equity sleeve (bond allocations excluded). Lower = cheaper relative to earnings.',
        fmt:    v => v == null ? '—' : v.toFixed(1) + 'x',
        better: 'lower',
      },
      {
        key:    'pb',
        name:   'P/B Ratio',
        desc:   'Weighted avg P/B · equity sleeve only',
        tip:    'Weighted average price-to-book of the equity sleeve (bond allocations excluded). Lower = more value exposure.',
        fmt:    v => v == null ? '—' : v.toFixed(2) + 'x',
        better: 'lower',
      },
    ],
  },
  {
    label: 'Factor Exposures',
    stats: [
      {
        key:    'hml',
        name:   'Value Tilt (HML)',
        desc:   'Fama-French High-Minus-Low loading',
        tip:    'HML factor loading. 0 = market blend. Higher = more tilted toward value stocks. AVUV ~0.55, VTI ~0.00.',
        fmt:    v => v.toFixed(2),
        better: 'neutral',
      },
      {
        key:    'smb',
        name:   'Size Tilt (SMB)',
        desc:   'Fama-French Small-Minus-Big loading',
        tip:    'SMB factor loading. 0 = large-cap. Higher = more small-cap. AVUV ~0.95, VTI ~0.05.',
        fmt:    v => v.toFixed(2),
        better: 'neutral',
      },
    ],
  },
  {
    label: 'Geographic Exposure',
    stats: [
      {
        key:    'intlPct',
        name:   'International Allocation',
        desc:   `% of equity sleeve in ex-US markets · mkt wt ≈ ${INTL_MKT_WT}%`,
        tip:    `Percentage of the equity portion in non-US markets (developed + emerging). Normalized to equity only — bonds are excluded from the denominator. Global market-cap weight is ~${INTL_MKT_WT}% ex-US (FTSE Global All Cap). The vertical line on the bar marks market weight. Overweight = bar past the line; underweight = bar before it. VXUS = 97%, VTI = 0%.`,
        fmt:    v => v.toFixed(1) + '%',
        mktWt:  INTL_MKT_WT,
        better: 'neutral',
      },
      {
        key:    'emPct',
        name:   'Emerging Markets',
        desc:   `% of equity sleeve in EM (subset of Intl) · mkt wt ≈ ${EM_MKT_WT}%`,
        tip:    `Percentage of the equity portion in emerging markets (China, India, Brazil, Taiwan, etc.). Normalized to equity only — bonds are excluded from the denominator. Included within the International Allocation figure above. Global market-cap weight is ~${EM_MKT_WT}% EM (FTSE Global All Cap). The vertical line marks market weight. VXUS ≈ 25% EM, VT ≈ 11% EM, AVDV = 0% (developed only), AVUV/VTI = 0% (US only).`,
        fmt:    v => v.toFixed(1) + '%',
        mktWt:  EM_MKT_WT,
        better: 'neutral',
      },
    ],
  },
  {
    label: 'Expected Return Estimates (Model)',
    stats: [
      {
        key:    'factorReturnNet',
        name:   'Arithmetic Return (Factor)',
        desc:   `${RF}% RF + CAPE-adj. ERP + HML×${VPREM}% + SMB×${SPREM}% − ER`,
        tip:    `Fama-French arithmetic mean return net of fees. Base equity return = RF (${RF}%) + CAPE-adjusted ERP: 100/CAPE + ${EPS_GROWTH}% EPS growth − RF, blended for US (CAPE≈${CAPE_US}) vs. international (CAPE≈${CAPE_INTL}) exposure. Value premium=${VPREM}%/unit HML, Size premium=${SPREM}%/unit SMB, minus blended expense ratio. This is the arithmetic average — it overstates compounded growth because it ignores volatility drag.`,
        fmt:    v => v.toFixed(2) + '%',
        better: 'higher',
      },
      {
        key:    'portfolioVol',
        name:   'Est. Volatility (σ)',
        desc:   'Weighted-avg annualized std. deviation',
        tip:    'Portfolio annualized volatility via Markowitz formula: σ_p = √(ΣᵢΣⱼ wᵢwⱼσᵢσⱼρᵢⱼ), using approximate pairwise ETF correlations. Properly accounts for diversification — a 60/40 VTI/BND portfolio is much less volatile than either held alone.',
        fmt:    v => v.toFixed(1) + '%',
        better: 'neutral',
      },
      {
        key:    'geometricReturnNet',
        name:   'Geometric Return (est.)',
        desc:   'Arithmetic return − σ²/2 · used for growth chart',
        tip:    'Estimated compound annual growth rate (CAGR), accounting for variance drag: geometric ≈ arithmetic − σ²/2. This is the rate used in the 30-year growth projection. Lower volatility portfolios benefit more from this correction.',
        fmt:    v => v.toFixed(2) + '%',
        better: 'higher',
      },
      {
        key:    'earningsYieldNet',
        name:   'Earnings Yield (net)',
        desc:   'Earnings yield minus expense ratio',
        tip:    'Earnings yield (1/PE × 100%) after subtracting the blended expense ratio. Rough long-run real return proxy for the equity sleeve.',
        fmt:    v => v.toFixed(2) + '%',
        better: 'higher',
      },
    ],
  },
  {
    label: 'Cost',
    stats: [
      {
        key:    'er',
        name:   'Expense Ratio',
        desc:   'Weighted avg annual fund cost',
        tip:    'Blended weighted-average fund expense ratio. When the Advisor toggle is on, the configured AUM fee is added on top. Subtract from expected returns for net estimates.',
        fmt:    v => v.toFixed(3) + '%',
        better: 'lower',
      },
      {
        key:    'costDrag30',
        name:   '30-yr Fee Drag',
        desc:   'Total fee cost on $1M over 30 years (compounded)',
        tip:    'How much total fees (fund ER + any advisor AUM fee) reduce terminal wealth on a $1,000,000 investment over 30 years, assuming the factor model gross return holds. Lower is better.',
        fmt:    v => '$' + Math.round(v).toLocaleString(),
        better: 'lower',
      },
    ],
  },
];

// ================================================================
// METADATA
// ================================================================
export const DATA_DATE = 'February 2026';
export const INFLATION = 2.5;

// ================================================================
// TAX EQUIVALENT YIELD DATA
// ================================================================
export const TEY_FUNDS = [
  { ticker: 'VTEB',  name: 'Vanguard Tax-Exempt Bond ETF',        yield: 3.36, taxExempt: true,  er: 0.05, category: 'etf', tip: 'Broad national municipal bond ETF. Interest is exempt from federal income tax. Holds ~8,000 investment-grade muni bonds. Duration ~5 years. Suitable for taxable accounts at higher brackets.' },
  { ticker: 'BND',   name: 'Vanguard Total Bond Market ETF',       yield: 4.18, taxExempt: false, er: 0.03, category: 'etf', tip: ETFS.BND.tip },
  { ticker: 'VMSXX', name: 'Vanguard Municipal Money Market Fund', yield: 2.42, taxExempt: true,  er: 0.15, category: 'mmf', tip: 'Money market fund investing in short-term municipal securities. Interest is exempt from federal income tax. NAV targets $1.00. Suited for high-bracket investors parking cash in taxable accounts.' },
  { ticker: 'VMFXX', name: 'Vanguard Federal Money Market Fund',   yield: 3.76, taxExempt: false, er: 0.11, category: 'mmf', tip: 'Vanguard\'s default settlement fund. Invests in US government securities and repos. Yield tracks the fed funds rate. Interest is fully taxable at ordinary income rates.' },
];

export const TEY_BRACKETS = [
  { rate: 10, label: '10%', income: 'Up to $23,200 MFJ'         },
  { rate: 12, label: '12%', income: '$23,201 – $94,300 MFJ'     },
  { rate: 22, label: '22%', income: '$94,301 – $201,050 MFJ'    },
  { rate: 24, label: '24%', income: '$201,051 – $383,900 MFJ'   },
  { rate: 32, label: '32%', income: '$383,901 – $487,450 MFJ'   },
  { rate: 35, label: '35%', income: '$487,451 – $731,200 MFJ'   },
  { rate: 37, label: '37%', income: 'Over $731,200 MFJ'         },
];

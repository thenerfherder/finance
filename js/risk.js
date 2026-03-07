// ================================================================
// RISK PROFILE TAB
// Historical portfolio risk characteristics by equity/bond mix.
// Source: Vanguard Portfolio Allocation Models, 1926–2024.
//   Stocks = US equity (S&P 500 proxied by historical US equity indices)
//   Bonds  = US investment-grade bonds (Bloomberg US Aggregate predecessors)
// Updated: February 2026
// ================================================================

// Avg annual return, annual std dev (vol), worst and best calendar-year returns
// for portfolios ranging from 100% bonds (equity=0) to 100% stocks (equity=100).
const RISK_DATA = [
  { equity:   0, ret: 5.2,  vol:  8.2, worstYr:  -8.1, bestYr:  32.6 },
  { equity:  10, ret: 5.8,  vol:  7.5, worstYr:  -8.2, bestYr:  32.7 },
  { equity:  20, ret: 6.4,  vol:  7.1, worstYr: -10.1, bestYr:  29.8 },
  { equity:  30, ret: 7.0,  vol:  7.2, worstYr: -14.2, bestYr:  23.4 },
  { equity:  40, ret: 7.5,  vol:  7.8, worstYr: -18.4, bestYr:  27.9 },
  { equity:  50, ret: 8.0,  vol:  9.0, worstYr: -22.5, bestYr:  22.5 },
  { equity:  60, ret: 8.6,  vol: 10.1, worstYr: -26.6, bestYr:  28.6 },
  { equity:  70, ret: 9.1,  vol: 11.4, worstYr: -30.1, bestYr:  32.0 },
  { equity:  80, ret: 9.5,  vol: 12.8, worstYr: -34.9, bestYr:  37.6 },
  { equity:  90, ret: 10.0, vol: 14.2, worstYr: -39.6, bestYr:  45.0 },
  { equity: 100, ret: 10.4, vol: 15.8, worstYr: -43.1, bestYr:  54.2 },
];

let _selectedEquity = 80;

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

// Catmull-Rom spline converted to cubic bezier for smooth SVG paths.
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = (p1.x + (p2.x - p0.x) / 6).toFixed(1);
    const cp1y = (p1.y + (p2.y - p0.y) / 6).toFixed(1);
    const cp2x = (p2.x - (p3.x - p1.x) / 6).toFixed(1);
    const cp2y = (p2.y - (p3.y - p1.y) / 6).toFixed(1);
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

// Generic risk chart renderer.
// opts: { gridLines: number[], showMinAnnotation: bool, showZeroLine: bool }
function renderRiskChart(svgId, dataKey, yMin, yMax, color, fmtY, opts = {}) {
  const svg = document.getElementById(svgId);
  if (!svg) return;

  const ML = 46, MT = 20, MR = 18, MB = 42;
  const VW = 480, VH = 262;
  const PW = VW - ML - MR;
  const PH = VH - MT - MB;

  const mapX = eq  => ML + (eq / 100) * PW;
  const mapY = val => MT + PH - ((val - yMin) / (yMax - yMin)) * PH;

  let s = '';

  // Y grid lines and labels
  const gridLines = opts.gridLines ?? [];
  for (const gv of gridLines) {
    const y = mapY(gv).toFixed(1);
    s += `<line x1="${ML}" y1="${y}" x2="${ML + PW}" y2="${y}" stroke="var(--border)" stroke-width="1"/>`;
    s += `<text x="${ML - 6}" y="${y}" text-anchor="end" dominant-baseline="middle" font-size="10" fill="var(--muted)" font-family="${FONT}">${fmtY(gv)}</text>`;
  }

  // Zero line
  if (opts.showZeroLine && yMin < 0 && yMax > 0) {
    const y0 = mapY(0).toFixed(1);
    s += `<line x1="${ML}" y1="${y0}" x2="${ML + PW}" y2="${y0}" stroke="#8b949e" stroke-width="1.5"/>`;
    s += `<text x="${ML - 6}" y="${y0}" text-anchor="end" dominant-baseline="middle" font-size="10" fill="#8b949e" font-family="${FONT}">0%</text>`;
  }

  // X axis labels (every 20%)
  for (let e = 0; e <= 100; e += 20) {
    const x = mapX(e).toFixed(1);
    s += `<text x="${x}" y="${MT + PH + 14}" text-anchor="middle" font-size="10" fill="var(--muted)" font-family="${FONT}">${e}%</text>`;
  }

  // X axis caption
  const captY = (MT + PH + 30).toFixed(1);
  const captX = (ML + PW / 2).toFixed(1);
  s += `<text x="${captX}" y="${captY}" text-anchor="middle" font-size="9.5" fill="var(--muted)" font-family="${FONT}">← All Bonds · Equity Allocation · All Stocks →</text>`;

  // Selected equity vertical guide line (drawn behind the curve)
  const selX = mapX(_selectedEquity).toFixed(1);
  s += `<line x1="${selX}" y1="${MT}" x2="${selX}" y2="${MT + PH}" stroke="rgba(88,166,255,0.18)" stroke-width="1" stroke-dasharray="4 3"/>`;

  // Minimum-volatility annotation
  if (opts.showMinAnnotation) {
    const minPt = RISK_DATA.reduce((a, b) => a[dataKey] < b[dataKey] ? a : b);
    const minX  = mapX(minPt.equity).toFixed(1);
    s += `<line x1="${minX}" y1="${MT}" x2="${minX}" y2="${MT + PH}" stroke="var(--green)" stroke-width="1" stroke-dasharray="3 3" opacity="0.55"/>`;
    s += `<text x="${minX}" y="${MT - 5}" text-anchor="middle" font-size="9" fill="var(--green)" font-family="${FONT}" opacity="0.75">Min vol</text>`;
  }

  // Data points for smooth curve
  const pts = RISK_DATA.map(d => ({ x: mapX(d.equity), y: mapY(d[dataKey]) }));

  // Area fill under curve (clamped to chart bottom)
  const curvePath = smoothPath(pts);
  const areaPath  = curvePath
    + ` L ${pts[pts.length - 1].x.toFixed(1)},${(MT + PH).toFixed(1)}`
    + ` L ${pts[0].x.toFixed(1)},${(MT + PH).toFixed(1)} Z`;
  s += `<path d="${areaPath}" fill="${color}" fill-opacity="0.07" stroke="none"/>`;

  // Smooth curve line
  s += `<path d="${curvePath}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;

  // Small dots for every data point (except selected)
  for (const d of RISK_DATA) {
    if (d.equity === _selectedEquity) continue;
    const cx = mapX(d.equity).toFixed(1);
    const cy = mapY(d[dataKey]).toFixed(1);
    s += `<circle cx="${cx}" cy="${cy}" r="3" fill="var(--surface)" stroke="${color}" stroke-width="1.5"/>`;
  }

  // Selected point — large filled dot + value label
  const sel = RISK_DATA.find(d => d.equity === _selectedEquity);
  if (sel) {
    const cx  = mapX(sel.equity);
    const cy  = mapY(sel[dataKey]);
    const val = sel[dataKey];
    // Place label above dot if close to top, otherwise below
    const lblY = cy < MT + 28 ? cy + 18 : cy - 12;
    s += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="6" fill="${color}" stroke="var(--surface)" stroke-width="2"/>`;
    s += `<text x="${cx.toFixed(1)}" y="${lblY.toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="${color}" font-family="${FONT}">${fmtY(val)}</text>`;
  }

  // Chart border
  s += `<rect x="${ML}" y="${MT}" width="${PW}" height="${PH}" fill="none" stroke="var(--border)" stroke-width="1"/>`;

  svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
  svg.innerHTML = s;
}

export function renderRiskCharts() {
  renderRiskChart(
    'risk-vol-svg',
    'vol',
    5.5, 17.5,
    '#58a6ff',
    v => v.toFixed(1) + '%',
    { gridLines: [6, 8, 10, 12, 14, 16], showMinAnnotation: true }
  );
  renderRiskChart(
    'risk-worst-svg',
    'worstYr',
    -52, 8,
    '#f85149',
    v => (v >= 0 ? '+' : '') + v.toFixed(0) + '%',
    { gridLines: [-10, -20, -30, -40, -50], showZeroLine: true }
  );
}

function updateSnapshot(equity) {
  const d = RISK_DATA.find(r => r.equity === equity);
  if (!d) return;

  const label = equity === 0   ? '100% Bonds'
              : equity === 100 ? '100% Stocks'
              : `${equity}% Stocks / ${100 - equity}% Bonds`;

  document.getElementById('risk-snap-equity').textContent  = label;
  document.getElementById('risk-equity-display').textContent = label;

  document.getElementById('risk-snap-ret').textContent   = '+' + d.ret.toFixed(1) + '%';
  document.getElementById('risk-snap-vol').textContent   = d.vol.toFixed(1) + '%';
  document.getElementById('risk-snap-best').textContent  = '+' + d.bestYr.toFixed(1) + '%';

  const worstEl = document.getElementById('risk-snap-worst');
  worstEl.textContent  = d.worstYr.toFixed(1) + '%';
  worstEl.style.color  = d.worstYr <= -30 ? 'var(--red)'
                       : d.worstYr <= -15 ? 'var(--yellow)'
                       : 'var(--green)';
}

export function initRisk() {
  const slider = document.getElementById('risk-equity-slider');
  if (!slider) return;

  slider.value = _selectedEquity;
  updateSnapshot(_selectedEquity);
  renderRiskCharts();

  slider.addEventListener('input', e => {
    _selectedEquity = +e.target.value;
    updateSnapshot(_selectedEquity);
    renderRiskCharts();
  });
}
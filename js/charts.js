import { calcStats } from './calculations.js';
import { settings, saveState, applyGrowthMode, applyAdvisorMode } from './state.js';

// ================================================================
// RENDER RADAR CHART
// ================================================================
export function renderRadar() {
  const rf     = parseFloat(document.getElementById('rf-rate')?.value) || 4.0;
  const advFee = parseFloat(document.getElementById('adv-fee')?.value) || 1.0;
  const sa = calcStats('a', { rf, advisorOn: document.getElementById('advisor-a')?.checked, advFee });
  const sb = calcStats('b', { rf, advisorOn: document.getElementById('advisor-b')?.checked, advFee });

  const nameA = document.getElementById('name-a').value.trim() || 'Portfolio A';
  const nameB = document.getElementById('name-b').value.trim() || 'Portfolio B';
  document.getElementById('radar-leg-a').textContent = nameA;
  document.getElementById('radar-leg-b').textContent = nameB;

  const svg = document.getElementById('radar-svg');
  if (!svg) return;

  if (!sa && !sb) {
    svg.innerHTML = `<text x="215" y="175" text-anchor="middle" dominant-baseline="middle" font-size="13" fill="var(--muted)">Set allocations above to see chart.</text>`;
    return;
  }

  const cx = 213, cy = 175, R = 120;
  const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

  const AXES = [
    { key: 'earningsYield', label: 'Earnings Yield', max: 9.0,  angle: -Math.PI / 2 },
    { key: 'intlPct',       label: "Int'l %",         max: 100,  angle: 0 },
    { key: 'smb',           label: 'Size (SMB)',       max: 1.0,  angle: Math.PI / 2 },
    { key: 'hml',           label: 'Value (HML)',      max: 0.65, angle: Math.PI },
  ];

  const RINGS = [0.25, 0.5, 0.75, 1.0];

  function pt(angle, frac) {
    return [cx + frac * R * Math.cos(angle), cy + frac * R * Math.sin(angle)];
  }

  function labelStyle(angle) {
    const EPS = 0.01;
    if (Math.abs(angle) < EPS)                      return { anchor: 'start',  baseline: 'middle' };
    if (Math.abs(Math.abs(angle) - Math.PI) < EPS)  return { anchor: 'end',    baseline: 'middle' };
    if (angle < 0)                                   return { anchor: 'middle', baseline: 'auto' };
    return                                                  { anchor: 'middle', baseline: 'hanging' };
  }

  let s = '';

  RINGS.forEach((f, i) => {
    const pts   = AXES.map(a => pt(a.angle, f).map(v => v.toFixed(1)).join(',')).join(' ');
    const outer = i === RINGS.length - 1;
    s += `<polygon points="${pts}" fill="${outer ? 'rgba(255,255,255,0.02)' : 'none'}" stroke="var(--border)" stroke-width="${outer ? 1.5 : 1}" opacity="${outer ? 0.9 : 0.4}"/>`;
  });

  AXES.forEach(ax => {
    const [x, y] = pt(ax.angle, 1);
    s += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--border)" stroke-width="1" opacity="0.6"/>`;
  });

  s += `<circle cx="${cx}" cy="${cy}" r="2" fill="var(--border)" opacity="0.5"/>`;

  function drawPortfolio(stats, color) {
    if (!stats) return '';
    const pts = AXES.map(ax => {
      const frac = Math.min(Math.max((stats[ax.key] ?? 0) / ax.max, 0), 1);
      return pt(ax.angle, frac).map(v => v.toFixed(1)).join(',');
    }).join(' ');
    let out = `<polygon points="${pts}" fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
    AXES.forEach(ax => {
      const frac = Math.min(Math.max((stats[ax.key] ?? 0) / ax.max, 0), 1);
      const [dx, dy] = pt(ax.angle, frac);
      out += `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="4" fill="${color}" stroke="var(--bg)" stroke-width="1.5"/>`;
    });
    return out;
  }

  s += drawPortfolio(sb, 'var(--b-color)');
  s += drawPortfolio(sa, 'var(--a-color)');

  const GAP = 18;
  AXES.forEach(ax => {
    const lx = cx + (R + GAP) * Math.cos(ax.angle);
    const ly = cy + (R + GAP) * Math.sin(ax.angle);
    const { anchor, baseline } = labelStyle(ax.angle);
    s += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="${baseline}" font-size="10.5" fill="var(--muted)" font-family="${FONT}">${ax.label}</text>`;
  });

  svg.innerHTML = s;
}

// ================================================================
// GROWTH CHART MODE
// ================================================================
export function setGrowthMode(mode) {
  applyGrowthMode(mode);
  renderGrowthChart();
  saveState();
}

export function toggleAdvisor() {
  applyAdvisorMode(!settings.showAdvisor);
  renderGrowthChart();
  saveState();
}

// ================================================================
// RENDER GROWTH CHART
// ================================================================
export function renderGrowthChart() {
  const svg     = document.getElementById('growth-svg');
  const summary = document.getElementById('growth-summary');
  const advisorA = document.getElementById('advisor-a')?.checked;
  const advisorB = document.getElementById('advisor-b')?.checked;
  const ADV_FEE  = parseFloat(document.getElementById('adv-fee')?.value) || 1.0;
  const RF       = parseFloat(document.getElementById('rf-rate')?.value) || 4.0;

  const sA = calcStats('a', { rf: RF, advisorOn: advisorA, advFee: ADV_FEE });
  const sB = calcStats('b', { rf: RF, advisorOn: advisorB, advFee: ADV_FEE });

  const empty = msg => {
    svg.innerHTML = `<text x="260" y="150" text-anchor="middle" dominant-baseline="middle" font-size="13" fill="var(--muted)">${msg}</text>`;
    summary.innerHTML = '';
  };

  if (!sA || !sB || sA.total < 99 || sB.total < 99) {
    return empty('Set allocations above to see projection.');
  }

  const START    = Math.max(1000, parseFloat(document.getElementById('growth-start').value) || 1000000);
  const CONTRIB  = parseFloat(document.getElementById('growth-contrib').value) || 0;
  const YEARS    = 30;
  const isReal   = settings.growthMode === 'real';
  const INFLATION = parseFloat(document.getElementById('infl-rate')?.value) || 2.5;
  const inflAdj  = isReal ? (1 + INFLATION / 100) : 1;

  const rA = (1 + sA.geometricReturnNet / 100) / inflAdj - 1;
  const rB = (1 + sB.geometricReturnNet / 100) / inflAdj - 1;

  const rAGross  = advisorA ? (1 + (sA.geometricReturnNet + ADV_FEE) / 100) / inflAdj - 1 : 0;
  const rBGross  = advisorB ? (1 + (sB.geometricReturnNet + ADV_FEE) / 100) / inflAdj - 1 : 0;

  const simAdvisor = (rNet, rGross, start, contrib, years) => {
    const rNetMo   = Math.pow(1 + rNet,  1 / 12) - 1;
    const rGrossMo = Math.pow(1 + rGross, 1 / 12) - 1;
    let client = start, adv = 0;
    const data = [0];
    for (let m = 1; m <= years * 12; m++) {
      adv    = adv * (1 + rGrossMo) + client * (ADV_FEE / 100 / 12);
      client = Math.max(0, client * (1 + rNetMo) + contrib);
      if (m % 12 === 0) data.push(adv);
    }
    return data;
  };

  const dataAdA = (settings.showAdvisor && advisorA) ? simAdvisor(rA, rAGross, START, CONTRIB, YEARS) : null;
  const dataAdB = (settings.showAdvisor && advisorB) ? simAdvisor(rB, rBGross, START, CONTRIB, YEARS) : null;

  const portFV = (r, y) => {
    const lump = START * Math.pow(1 + r, y);
    if (CONTRIB === 0) return lump;
    const rMo = Math.pow(1 + r, 1 / 12) - 1;
    const annuity = rMo > 1e-10 ? CONTRIB * (Math.pow(1 + r, y) - 1) / rMo
                                 : CONTRIB * 12 * y;
    return Math.max(0, lump + annuity);
  };

  const dataA = Array.from({ length: YEARS + 1 }, (_, y) => portFV(rA, y));
  const dataB = Array.from({ length: YEARS + 1 }, (_, y) => portFV(rB, y));

  const sigA = sA.portfolioVol / 100;
  const sigB = sB.portfolioVol / 100;
  const dataAUp  = dataA.map((v, y) => v * Math.exp( sigA * Math.sqrt(y)));
  const dataALow = dataA.map((v, y) => v * Math.exp(-sigA * Math.sqrt(y)));
  const dataBUp  = dataB.map((v, y) => v * Math.exp( sigB * Math.sqrt(y)));
  const dataBLow = dataB.map((v, y) => v * Math.exp(-sigB * Math.sqrt(y)));

  const vW = 520, vH = 300;
  const PAD = { top: 18, right: 80, bottom: 36, left: 62 };
  const plotW = vW - PAD.left - PAD.right;
  const plotH = vH - PAD.top - PAD.bottom;

  const allSeries = [...dataAUp, ...dataBUp];
  if (dataAdA) allSeries.push(...dataAdA);
  if (dataAdB) allSeries.push(...dataAdB);
  const maxVal = Math.max(...allSeries);
  const xS = y => PAD.left + (y / YEARS) * plotW;
  const yS = v => PAD.top + plotH - (v / maxVal) * plotH;

  const fmt = v => {
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    if (v >= 1e3) return '$' + Math.round(v / 1e3) + 'k';
    return '$' + Math.round(v);
  };

  const pathFor = data =>
    data.map((v, y) => `${y === 0 ? 'M' : 'L'}${xS(y).toFixed(1)},${yS(v).toFixed(1)}`).join(' ');

  const bandPath = (hi, lo) => {
    let d = hi.map((v, y) => `${y === 0 ? 'M' : 'L'}${xS(y).toFixed(1)},${yS(v).toFixed(1)}`).join(' ');
    for (let y = YEARS; y >= 0; y--) d += ` L${xS(y).toFixed(1)},${yS(lo[y]).toFixed(1)}`;
    return d + ' Z';
  };

  const nTicks = 4;
  let out = '';
  for (let i = 0; i <= nTicks; i++) {
    const v = (i / nTicks) * maxVal;
    const y = yS(v).toFixed(1);
    out += `<line x1="${PAD.left}" y1="${y}" x2="${PAD.left + plotW}" y2="${y}" stroke="var(--border)" stroke-width="1"/>`;
    out += `<text x="${PAD.left - 6}" y="${y}" text-anchor="end" dominant-baseline="middle" font-size="10" fill="var(--muted)">${fmt(v)}</text>`;
  }

  [0, 10, 20, 30].forEach(yr => {
    const x     = xS(yr).toFixed(1);
    const yBase = (PAD.top + plotH).toFixed(1);
    out += `<line x1="${x}" y1="${yBase}" x2="${x}" y2="${(PAD.top + plotH + 4).toFixed(1)}" stroke="var(--border)" stroke-width="1"/>`;
    out += `<text x="${x}" y="${(PAD.top + plotH + 14).toFixed(1)}" text-anchor="middle" font-size="10" fill="var(--muted)">${yr === 0 ? 'Now' : `Yr ${yr}`}</text>`;
  });

  out += `<path d="${bandPath(dataBUp, dataBLow)}" fill="var(--b-color)" fill-opacity="0.10" stroke="none"/>`;
  out += `<path d="${bandPath(dataAUp, dataALow)}" fill="var(--a-color)" fill-opacity="0.10" stroke="none"/>`;
  out += `<path d="${pathFor(dataA)}" fill="none" stroke="var(--a-color)" stroke-width="2.5" stroke-linejoin="round"/>`;
  out += `<path d="${pathFor(dataB)}" fill="none" stroke="var(--b-color)" stroke-width="2.5" stroke-linejoin="round"/>`;

  if (dataAdA) out += `<path d="${pathFor(dataAdA)}" fill="none" stroke="var(--a-color)" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.7"/>`;
  if (dataAdB) out += `<path d="${pathFor(dataAdB)}" fill="none" stroke="var(--b-color)" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.7"/>`;

  const endA  = dataA[YEARS], endB = dataB[YEARS];
  const yEndA = yS(endA).toFixed(1), yEndB = yS(endB).toFixed(1);
  const xEnd  = (PAD.left + plotW + 5).toFixed(1);
  out += `<text x="${xEnd}" y="${yEndA}" dominant-baseline="middle" font-size="10" font-weight="600" fill="var(--a-color)">${fmt(endA)}</text>`;
  out += `<text x="${xEnd}" y="${yEndB}" dominant-baseline="middle" font-size="10" font-weight="600" fill="var(--b-color)">${fmt(endB)}</text>`;

  if (dataAdA) out += `<text x="${xEnd}" y="${yS(dataAdA[YEARS]).toFixed(1)}" dominant-baseline="middle" font-size="9" fill="var(--a-color)" opacity="0.8">Adv ${fmt(dataAdA[YEARS])}</text>`;
  if (dataAdB) out += `<text x="${xEnd}" y="${yS(dataAdB[YEARS]).toFixed(1)}" dominant-baseline="middle" font-size="9" fill="var(--b-color)" opacity="0.8">Adv ${fmt(dataAdB[YEARS])}</text>`;

  svg.innerHTML = out;

  const nameA = document.getElementById('name-a').value.trim() || 'Portfolio A';
  const nameB = document.getElementById('name-b').value.trim() || 'Portfolio B';
  const diff  = Math.abs(endA - endB);
  const rateA = (rA * 100).toFixed(2), rateB = (rB * 100).toFixed(2);
  const modeNote   = isReal ? ` real (${INFLATION}% infl.)` : ' nominal';
  const dragNote   = `geometric CAGR · shading = ±1σ (68% of outcomes)`;
  const contribNote = CONTRIB > 0 ? ` + ${fmt(CONTRIB)}/mo`
                    : CONTRIB < 0 ? ` − ${fmt(-CONTRIB)}/mo withdrawals`
                    : '';
  if (diff < 1) {
    summary.innerHTML = `Both portfolios project the same terminal value — ${dragNote}${modeNote}.`;
  } else {
    const winner    = endA > endB ? nameA : nameB;
    const color     = endA > endB ? 'var(--a-color)' : 'var(--b-color)';
    const dollarNote = isReal ? ' in today\'s dollars' : '';
    summary.innerHTML = `<strong style="color:${color}">${winner}</strong> projects <strong>${fmt(diff)} more</strong> after 30 years${dollarNote} — ${fmt(START)} starting${contribNote}, ${rateA}% vs ${rateB}%${modeNote} CAGR (${dragNote}).`;
  }

  if (settings.showAdvisor && !advisorA && !advisorB) {
    summary.innerHTML += `<br><span style="color:var(--muted);font-size:0.78em">Enable Advisor on a portfolio to see the advisor's projected wealth.</span>`;
  }
}

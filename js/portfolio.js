import { ETFS, TICKERS, PRESETS, DEFAULTS } from './data.js';
import { state } from './state.js';
import { openEtfModal } from './ui.js';

// Imported lazily to avoid circular dep (render.js → portfolio.js would be circular)
// render.js is the entry point for re-rendering; we import it at call time instead.
let _renderAll = null;
export function setRenderAll(fn) { _renderAll = fn; }

// ================================================================
// BUILD PORTFOLIO INPUT ROWS
// ================================================================
export function buildRows(p) {
  const container = document.getElementById(`rows-${p}`);
  container.innerHTML = '';
  let lastClass = null;
  TICKERS.forEach(tk => {
    const etf = ETFS[tk];
    const v   = state[p][tk] ?? 0;

    if (etf.assetClass !== lastClass) {
      const lbl = document.createElement('div');
      lbl.className = 'etf-class-label';
      lbl.textContent = etf.assetClass === 'equity' ? 'Equities' : 'Fixed Income';
      container.appendChild(lbl);
      lastClass = etf.assetClass;
    }

    const row = document.createElement('div');
    row.className = 'etf-row';

    const tickerCol = document.createElement('div');
    tickerCol.className = 'etf-ticker-col';
    const tickerSpan = document.createElement('span');
    tickerSpan.className = 'etf-ticker';
    tickerSpan.textContent = tk;
    tickerSpan.addEventListener('click', () => openEtfModal(tk));
    tickerCol.appendChild(tickerSpan);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 0; slider.max = 100; slider.step = 1; slider.value = v;
    slider.id = `sl-${p}-${tk}`;
    slider.addEventListener('input', () => onSlider(p, tk, slider.value));

    const numInput = document.createElement('input');
    numInput.type = 'number';
    numInput.className = 'w-input';
    numInput.min = 0; numInput.max = 100; numInput.step = 1; numInput.value = v;
    numInput.id = `nu-${p}-${tk}`;
    numInput.addEventListener('input', () => onNumber(p, tk, numInput.value));

    row.appendChild(tickerCol);
    row.appendChild(slider);
    row.appendChild(numInput);
    container.appendChild(row);
  });
}

// ================================================================
// INPUT HANDLERS
// ================================================================
function applyValue(p, tk, v) {
  state[p][tk] = v;
  refreshTotal(p);
  if (_renderAll) _renderAll();
}

export function onSlider(p, tk, raw) {
  const v = Math.max(0, Math.min(100, parseFloat(raw) || 0));
  const num = document.getElementById(`nu-${p}-${tk}`);
  if (num) num.value = v;
  applyValue(p, tk, v);
}

export function onNumber(p, tk, raw) {
  const v = Math.max(0, Math.min(100, parseFloat(raw) || 0));
  const sl = document.getElementById(`sl-${p}-${tk}`);
  if (sl) sl.value = v;
  applyValue(p, tk, v);
}

export function applyPreset(p, key) {
  if (!key || !PRESETS[key]) return;
  const preset = PRESETS[key];
  TICKERS.forEach(tk => {
    state[p][tk] = preset[tk] ?? 0;
    const sl = document.getElementById(`sl-${p}-${tk}`);
    const nu = document.getElementById(`nu-${p}-${tk}`);
    if (sl) sl.value = state[p][tk];
    if (nu) nu.value = state[p][tk];
  });
  document.getElementById(`preset-${p}`).value = '';
  refreshTotal(p);
  if (_renderAll) _renderAll();
}

export function resetPortfolio(p) {
  TICKERS.forEach(tk => {
    state[p][tk] = DEFAULTS[p][tk];
    const sl = document.getElementById(`sl-${p}-${tk}`);
    const nu = document.getElementById(`nu-${p}-${tk}`);
    if (sl) sl.value = state[p][tk];
    if (nu) nu.value = state[p][tk];
  });
  refreshTotal(p);
  if (_renderAll) _renderAll();
}

export function normalizePortfolio(p) {
  const total = TICKERS.reduce((s, tk) => s + (state[p][tk] || 0), 0);
  if (total === 0) return;
  TICKERS.forEach(tk => {
    state[p][tk] = Math.round((state[p][tk] || 0) / total * 100);
  });
  const newTotal = TICKERS.reduce((s, tk) => s + state[p][tk], 0);
  if (newTotal !== 100) {
    const largest = TICKERS.reduce((a, b) => state[p][a] >= state[p][b] ? a : b);
    state[p][largest] += (100 - newTotal);
  }
  TICKERS.forEach(tk => {
    const sl = document.getElementById(`sl-${p}-${tk}`);
    const nu = document.getElementById(`nu-${p}-${tk}`);
    if (sl) sl.value = state[p][tk];
    if (nu) nu.value = state[p][tk];
  });
  refreshTotal(p);
  if (_renderAll) _renderAll();
}

// ================================================================
// TOTAL BAR
// ================================================================
export function refreshTotal(p) {
  const total = TICKERS.reduce((s, tk) => s + (state[p][tk] || 0), 0);
  const valEl = document.getElementById(`total-${p}`);
  const barEl = document.getElementById(`bar-${p}`);
  valEl.textContent = `${total}%`;
  valEl.className   = 'total-val ' + (total === 100 ? 'ok' : total > 100 ? 'over' : 'under');
  const fill = Math.min(total, 100);
  barEl.style.width      = `${fill}%`;
  const colorOk = p === 'a' ? 'var(--a-color)' : 'var(--b-color)';
  barEl.style.background = total === 100 ? colorOk : total > 100 ? 'var(--red)' : 'var(--yellow)';
}

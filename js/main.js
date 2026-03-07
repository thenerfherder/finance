import { DATA_DATE, PRESET_OPTIONS, TICKERS, TEY_BRACKETS } from './data.js';
import { state, settings, applyURLState, loadState } from './state.js';
import { buildRows, refreshTotal, applyPreset, normalizePortfolio, resetPortfolio, setRenderAll } from './portfolio.js';
import { renderAll } from './render.js';
import { setGrowthMode, toggleAdvisor, renderGrowthChart } from './charts.js';
import { closeEtfModal, openParamsModal, closeParamsModal } from './ui.js';
import { buildTeyFundCards, renderTeyTable, setTeyBracket } from './tey.js';
import { initRisk, renderRiskCharts } from './risk.js';

// Wire renderAll into portfolio so it can trigger re-renders without a circular import
setRenderAll(renderAll);

function copyShareLink() {
  const params = new URLSearchParams();
  params.set('a', TICKERS.map(tk => state.a[tk] || 0).join(','));
  params.set('b', TICKERS.map(tk => state.b[tk] || 0).join(','));
  if (settings.nameA && settings.nameA !== 'Portfolio A') params.set('na', settings.nameA);
  if (settings.nameB && settings.nameB !== 'Portfolio B') params.set('nb', settings.nameB);
  if (settings.advisorA)              params.set('aa', '1');
  if (settings.advisorB)              params.set('ab', '1');
  params.set('gm', settings.growthMode);
  if (settings.growthStart   !== 1000000) params.set('gs', settings.growthStart);
  if (settings.growthContrib !== 0)       params.set('gc', settings.growthContrib);
  if (settings.inflRate      !== 2.5)     params.set('ir', settings.inflRate);
  if (settings.rfRate        !== 4.0)     params.set('rr', settings.rfRate);
  if (settings.advFee        !== 1.0)     params.set('af', settings.advFee);
  if (settings.showAdvisor)               params.set('av', '1');
  const url = `${location.origin}${location.pathname}?${params}`;
  const btn = document.getElementById('copy-link-btn');
  navigator.clipboard.writeText(url).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy link'; }, 1500);
  }).catch(() => {
    prompt('Copy this link:', url);
  });
}

// Sync all DOM inputs to match the current settings object.
// Called once after state is restored from URL or localStorage.
function syncDOMFromSettings() {
  document.getElementById('name-a').value          = settings.nameA;
  document.getElementById('name-b').value          = settings.nameB;
  document.getElementById('advisor-a').checked     = settings.advisorA;
  document.getElementById('advisor-b').checked     = settings.advisorB;
  document.getElementById('growth-start').value    = settings.growthStart;
  document.getElementById('growth-contrib').value  = settings.growthContrib;
  document.getElementById('infl-rate').value       = settings.inflRate;
  document.getElementById('rf-rate').value         = settings.rfRate;
  document.getElementById('adv-fee').value         = settings.advFee;
  document.getElementById('mode-nominal').classList.toggle('active', settings.growthMode === 'nominal');
  document.getElementById('mode-real').classList.toggle('active', settings.growthMode === 'real');
  document.getElementById('mode-advisor')?.classList.toggle('active', settings.showAdvisor);
}

function init() {
  // Populate preset dropdowns from data
  ['preset-a', 'preset-b'].forEach(id => {
    const sel = document.getElementById(id);
    PRESET_OPTIONS.forEach(({ key, label }) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = label;
      sel.appendChild(opt);
    });
  });

  // Data date labels
  document.getElementById('footer-data-date').textContent = DATA_DATE;
  document.getElementById('header-data-date').textContent = `Data · ${DATA_DATE}`;
  document.querySelectorAll('.method-data-date').forEach(el => el.textContent = DATA_DATE);

  // Restore state then sync DOM
  const fromURL = applyURLState(new URLSearchParams(location.search));
  if (!fromURL) loadState();
  syncDOMFromSettings();

  // Build portfolio UIs
  buildRows('a');
  buildRows('b');
  refreshTotal('a');
  refreshTotal('b');
  renderAll();

  // ── Portfolio controls ───────────────────────────────────────
  document.getElementById('copy-link-btn').addEventListener('click', copyShareLink);

  document.getElementById('preset-a').addEventListener('change', e => applyPreset('a', e.target.value));
  document.getElementById('preset-b').addEventListener('change', e => applyPreset('b', e.target.value));

  document.getElementById('normalize-a').addEventListener('click', () => normalizePortfolio('a'));
  document.getElementById('normalize-b').addEventListener('click', () => normalizePortfolio('b'));

  document.getElementById('reset-a').addEventListener('click', () => resetPortfolio('a'));
  document.getElementById('reset-b').addEventListener('click', () => resetPortfolio('b'));

  document.getElementById('advisor-a').addEventListener('change', e => { settings.advisorA = e.target.checked; renderAll(); });
  document.getElementById('advisor-b').addEventListener('change', e => { settings.advisorB = e.target.checked; renderAll(); });

  document.getElementById('name-a').addEventListener('input', e => { settings.nameA = e.target.value; renderAll(); });
  document.getElementById('name-b').addEventListener('input', e => { settings.nameB = e.target.value; renderAll(); });

  // ── Growth chart controls ────────────────────────────────────
  document.getElementById('mode-nominal').addEventListener('click', () => setGrowthMode('nominal'));
  document.getElementById('mode-real').addEventListener('click',    () => setGrowthMode('real'));
  document.getElementById('mode-advisor').addEventListener('click', toggleAdvisor);
  document.getElementById('mode-params').addEventListener('click',  openParamsModal);

  document.getElementById('growth-start').addEventListener('input', e => {
    settings.growthStart = parseFloat(e.target.value) || 1000000;
    renderGrowthChart();
  });
  document.getElementById('growth-contrib').addEventListener('input', e => {
    settings.growthContrib = parseFloat(e.target.value) || 0;
    renderGrowthChart();
  });
  document.getElementById('infl-rate').addEventListener('input', e => { settings.inflRate = parseFloat(e.target.value) || 2.5; renderAll(); });
  document.getElementById('rf-rate').addEventListener('input',   e => { settings.rfRate   = parseFloat(e.target.value) || 4.0; renderAll(); });
  document.getElementById('adv-fee').addEventListener('input',   e => { settings.advFee   = parseFloat(e.target.value) || 1.0; renderAll(); });

  // ── Modals ───────────────────────────────────────────────────
  document.getElementById('etf-modal-backdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('etf-modal-backdrop')) closeEtfModal();
  });
  document.querySelector('#etf-modal-backdrop .modal-close').addEventListener('click', closeEtfModal);

  document.getElementById('params-modal-backdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('params-modal-backdrop')) closeParamsModal();
  });
  document.querySelector('#params-modal-backdrop .modal-close').addEventListener('click', closeParamsModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeEtfModal(); closeParamsModal(); }
  });

  // ── Tab switching ────────────────────────────────────────────
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      // Re-render risk charts once the tab is visible (SVG layout is unavailable while hidden)
      if (btn.dataset.tab === 'risk') renderRiskCharts();
    });
  });

  // ── TEY tool ────────────────────────────────────────────────
  buildTeyFundCards();
  renderTeyTable();

  const bracketSel = document.getElementById('tey-bracket-sel');
  TEY_BRACKETS.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.rate;
    opt.textContent = `${b.label} — ${b.income}`;
    bracketSel.appendChild(opt);
  });
  bracketSel.addEventListener('change', e => setTeyBracket(e.target.value ? +e.target.value : null));

  // ── Risk Profile tool ────────────────────────────────────
  initRisk();
}

init();

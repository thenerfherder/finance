import { DATA_DATE, PRESET_OPTIONS } from './data.js';
import { applyURLState, loadState, copyShareLink } from './state.js';
import { buildRows, refreshTotal, applyPreset, normalizePortfolio, resetPortfolio, setRenderAll } from './portfolio.js';
import { renderAll } from './render.js';
import { setGrowthMode, toggleAdvisor, renderGrowthChart } from './charts.js';
import { closeEtfModal, openParamsModal, closeParamsModal } from './ui.js';
import { buildTeyFundCards, renderTeyTable } from './tey.js';

// Wire renderAll into portfolio so it can trigger re-renders without a circular import
setRenderAll(renderAll);

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

  // Restore state
  const fromURL = applyURLState(new URLSearchParams(location.search));
  if (!fromURL) loadState();

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

  document.getElementById('advisor-a').addEventListener('change', renderAll);
  document.getElementById('advisor-b').addEventListener('change', renderAll);

  document.getElementById('name-a').addEventListener('input', renderAll);
  document.getElementById('name-b').addEventListener('input', renderAll);

  // ── Growth chart controls ────────────────────────────────────
  document.getElementById('mode-nominal').addEventListener('click', () => setGrowthMode('nominal'));
  document.getElementById('mode-real').addEventListener('click',    () => setGrowthMode('real'));
  document.getElementById('mode-advisor').addEventListener('click', toggleAdvisor);
  document.getElementById('mode-params').addEventListener('click',  openParamsModal);

  ['growth-start', 'growth-contrib'].forEach(id =>
    document.getElementById(id).addEventListener('input', renderGrowthChart)
  );
  ['infl-rate', 'rf-rate', 'adv-fee'].forEach(id =>
    document.getElementById(id).addEventListener('input', renderAll)
  );

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
    });
  });

  // ── TEY tool ────────────────────────────────────────────────
  buildTeyFundCards();
  renderTeyTable();
}

init();

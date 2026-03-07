import { TICKERS, DEFAULTS } from './data.js';

// ================================================================
// PORTFOLIO ALLOCATIONS
// ================================================================
export const state = {
  a: { ...DEFAULTS.a },
  b: { ...DEFAULTS.b },
};

// ================================================================
// UI STATE
// All mutable UI parameters live here — no DOM reads elsewhere.
// ================================================================
export const settings = {
  growthMode:    'real',
  showAdvisor:   false,
  nameA:         'Portfolio A',
  nameB:         'Portfolio B',
  advisorA:      false,
  advisorB:      false,
  growthStart:   1000000,
  growthContrib: 0,
  inflRate:      2.5,
  rfRate:        4.0,
  advFee:        1.0,
};

// ================================================================
// UI MODE HELPERS  (pure state — no DOM)
// DOM class toggling is handled by callers in charts.js / main.js
// ================================================================
export function applyGrowthMode(mode) {
  settings.growthMode = mode;
}

export function applyAdvisorMode(show) {
  settings.showAdvisor = show;
}

// ================================================================
// PERSISTENCE
// ================================================================
export function saveState() {
  try {
    localStorage.setItem('basispoints', JSON.stringify({
      a: state.a, b: state.b,
      ...settings,
    }));
  } catch(e) { console.warn('basispoints: saveState failed', e); }
}

export function loadState() {
  try {
    const saved = localStorage.getItem('basispoints');
    if (!saved) return;
    const s = JSON.parse(saved);
    if (s.a) TICKERS.forEach(tk => { if (s.a[tk] != null) state.a[tk] = s.a[tk]; });
    if (s.b) TICKERS.forEach(tk => { if (s.b[tk] != null) state.b[tk] = s.b[tk]; });
    if (s.nameA         != null) settings.nameA         = s.nameA;
    if (s.nameB         != null) settings.nameB         = s.nameB;
    if (s.advisorA      != null) settings.advisorA      = s.advisorA;
    if (s.advisorB      != null) settings.advisorB      = s.advisorB;
    if (s.growthMode)            settings.growthMode    = s.growthMode;
    if (s.showAdvisor   != null) settings.showAdvisor   = s.showAdvisor;
    if (s.growthStart   != null) settings.growthStart   = +s.growthStart;
    if (s.growthContrib != null) settings.growthContrib = +s.growthContrib;
    if (s.inflRate      != null) settings.inflRate      = +s.inflRate;
    if (s.rfRate        != null) settings.rfRate        = +s.rfRate;
    if (s.advFee        != null) settings.advFee        = +s.advFee;
  } catch(e) { console.warn('basispoints: loadState failed', e); }
}

// ================================================================
// URL STATE
// ================================================================
export function applyURLState(params) {
  if (!params.has('a') && !params.has('b')) return false;
  if (params.has('a')) {
    const vals = params.get('a').split(',').map(Number);
    TICKERS.forEach((tk, i) => { state.a[tk] = isNaN(vals[i]) ? 0 : vals[i]; });
  }
  if (params.has('b')) {
    const vals = params.get('b').split(',').map(Number);
    TICKERS.forEach((tk, i) => { state.b[tk] = isNaN(vals[i]) ? 0 : vals[i]; });
  }
  if (params.has('na')) settings.nameA         = params.get('na');
  if (params.has('nb')) settings.nameB         = params.get('nb');
  if (params.has('aa')) settings.advisorA      = params.get('aa') === '1';
  if (params.has('ab')) settings.advisorB      = params.get('ab') === '1';
  if (params.has('gm')) settings.growthMode    = params.get('gm');
  if (params.has('gs')) settings.growthStart   = +params.get('gs');
  if (params.has('gc')) settings.growthContrib = +params.get('gc');
  if (params.has('ir')) settings.inflRate      = +params.get('ir');
  if (params.has('rr')) settings.rfRate        = +params.get('rr');
  if (params.has('af')) settings.advFee        = +params.get('af');
  if (params.has('av')) settings.showAdvisor   = params.get('av') === '1';
  return true;
}

export function copyShareLink() {
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
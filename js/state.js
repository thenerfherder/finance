import { TICKERS, DEFAULTS } from './data.js';

// ================================================================
// PORTFOLIO ALLOCATIONS
// ================================================================
export const state = {
  a: { ...DEFAULTS.a },
  b: { ...DEFAULTS.b },
};

// ================================================================
// UI STATE (growth chart mode, advisor overlay)
// ================================================================
export const settings = {
  growthMode:  'real',
  showAdvisor: false,
};

// ================================================================
// UI MODE HELPERS
// ================================================================
export function applyGrowthMode(mode) {
  settings.growthMode = mode;
  document.getElementById('mode-nominal').classList.toggle('active', mode === 'nominal');
  document.getElementById('mode-real').classList.toggle('active', mode === 'real');
}

export function applyAdvisorMode(show) {
  settings.showAdvisor = show;
  document.getElementById('mode-advisor')?.classList.toggle('active', show);
}

// ================================================================
// PERSISTENCE
// ================================================================
export function saveState() {
  try {
    localStorage.setItem('basispoints', JSON.stringify({
      a: state.a, b: state.b,
      nameA:     document.getElementById('name-a')?.value,
      nameB:     document.getElementById('name-b')?.value,
      advisorA:  document.getElementById('advisor-a')?.checked,
      advisorB:  document.getElementById('advisor-b')?.checked,
      growthMode: settings.growthMode,
      showAdvisor: settings.showAdvisor,
      inflRate:  document.getElementById('infl-rate')?.value,
      rfRate:    document.getElementById('rf-rate')?.value,
      advFee:    document.getElementById('adv-fee')?.value,
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
    if (s.nameA) document.getElementById('name-a').value = s.nameA;
    if (s.nameB) document.getElementById('name-b').value = s.nameB;
    if (s.advisorA != null) document.getElementById('advisor-a').checked = s.advisorA;
    if (s.advisorB != null) document.getElementById('advisor-b').checked = s.advisorB;
    if (s.growthMode) applyGrowthMode(s.growthMode);
    if (s.inflRate != null) document.getElementById('infl-rate').value = s.inflRate;
    if (s.rfRate   != null) document.getElementById('rf-rate').value   = s.rfRate;
    if (s.advFee   != null) document.getElementById('adv-fee').value   = s.advFee;
    if (s.showAdvisor != null) applyAdvisorMode(s.showAdvisor);
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
  if (params.has('na')) document.getElementById('name-a').value = params.get('na');
  if (params.has('nb')) document.getElementById('name-b').value = params.get('nb');
  if (params.has('aa')) document.getElementById('advisor-a').checked = params.get('aa') === '1';
  if (params.has('ab')) document.getElementById('advisor-b').checked = params.get('ab') === '1';
  if (params.has('gm')) applyGrowthMode(params.get('gm'));
  if (params.has('gs')) document.getElementById('growth-start').value = params.get('gs');
  if (params.has('gc')) document.getElementById('growth-contrib').value = params.get('gc');
  if (params.has('ir')) document.getElementById('infl-rate').value = params.get('ir');
  if (params.has('rr')) document.getElementById('rf-rate').value   = params.get('rr');
  if (params.has('af')) document.getElementById('adv-fee').value   = params.get('af');
  if (params.has('av')) applyAdvisorMode(params.get('av') === '1');
  return true;
}

export function copyShareLink() {
  const params = new URLSearchParams();
  params.set('a', TICKERS.map(tk => state.a[tk] || 0).join(','));
  params.set('b', TICKERS.map(tk => state.b[tk] || 0).join(','));
  const na = document.getElementById('name-a').value;
  const nb = document.getElementById('name-b').value;
  if (na && na !== 'Portfolio A') params.set('na', na);
  if (nb && nb !== 'Portfolio B') params.set('nb', nb);
  if (document.getElementById('advisor-a').checked) params.set('aa', '1');
  if (document.getElementById('advisor-b').checked) params.set('ab', '1');
  params.set('gm', settings.growthMode);
  const gs = document.getElementById('growth-start').value;
  const gc = document.getElementById('growth-contrib').value;
  const ir = document.getElementById('infl-rate').value;
  const rr = document.getElementById('rf-rate').value;
  const af = document.getElementById('adv-fee').value;
  if (gs && gs !== '1000000') params.set('gs', gs);
  if (gc && gc !== '0')       params.set('gc', gc);
  if (ir && ir !== '2.5')     params.set('ir', ir);
  if (rr && rr !== '4')       params.set('rr', rr);
  if (af && af !== '1')       params.set('af', af);
  if (settings.showAdvisor)   params.set('av', '1');
  const url = `${location.origin}${location.pathname}?${params}`;
  const btn = document.getElementById('copy-link-btn');
  navigator.clipboard.writeText(url).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy link'; }, 1500);
  }).catch(() => {
    prompt('Copy this link:', url);
  });
}

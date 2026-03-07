import { ETFS, TICKERS, CORR_MATRIX, CAPE_US, CAPE_INTL, EPS_GROWTH, VPREM, SPREM } from './data.js';
import { state } from './state.js';

export function getCorr(a, b) {
  if (a === b) return 1;
  return CORR_MATRIX[`${a},${b}`] ?? CORR_MATRIX[`${b},${a}`] ?? 0;
}

export function calcStats(p, { rf = 4.0, advisorOn = false, advFee = 1.0 } = {}) {
  const w     = state[p];
  const total = TICKERS.reduce((s, tk) => s + (w[tk] || 0), 0);
  if (total === 0) return null;

  let eySum   = 0;
  let pbSum   = 0;
  let intlPct = 0;
  let emPct   = 0;
  let smb     = 0;
  let hml     = 0;
  let er      = 0;
  let equityW = 0;
  let bondRet = 0;

  TICKERS.forEach(tk => {
    const frac = (w[tk] || 0) / total;
    const e    = ETFS[tk];
    er      += frac * e.er;
    intlPct += frac * e.intlPct;
    emPct   += frac * e.emPct;
    smb     += frac * e.smb;
    hml     += frac * e.hml;
    if (e.assetClass === 'fixed') {
      bondRet += frac * e.bondYield;
    } else {
      equityW += frac;
      eySum   += frac * (1 / e.pe);
      pbSum   += frac * e.pb;
    }
  });

  if (advisorOn) {
    er += advFee;
  }

  // Markowitz portfolio variance
  let portfolioVariance = 0;
  TICKERS.forEach(tki => {
    TICKERS.forEach(tkj => {
      const wi = (w[tki] || 0) / total;
      const wj = (w[tkj] || 0) / total;
      portfolioVariance += wi * wj * ETFS[tki].vol * ETFS[tkj].vol * getCorr(tki, tkj);
    });
  });
  const portfolioVol = Math.sqrt(portfolioVariance);

  const pe            = equityW > 0 ? equityW / eySum : null;
  const pb            = equityW > 0 ? pbSum / equityW : null;
  const earningsYield = eySum * 100;

  const equityHML     = equityW > 0 ? hml / equityW : 0;
  const equitySMB     = equityW > 0 ? smb / equityW : 0;
  const intlEquityFrac = equityW > 0 ? (intlPct / 100) / equityW : 0;
  const intlPctEquity  = equityW > 0 ? intlPct / equityW : 0;
  const emPctEquity    = equityW > 0 ? emPct   / equityW : 0;
  const erpUS          = Math.max(0, 100 / CAPE_US   + EPS_GROWTH - rf);
  const erpIntl        = Math.max(0, 100 / CAPE_INTL + EPS_GROWTH - rf);
  const mkt            = (1 - intlEquityFrac) * erpUS + intlEquityFrac * erpIntl;
  const equityRet      = rf + mkt + equityHML * VPREM + equitySMB * SPREM;
  const factorReturn    = equityW * equityRet + bondRet;
  const factorReturnNet = factorReturn - er;
  const geometricReturnNet = factorReturnNet - (portfolioVol * portfolioVol) / 200;
  const earningsYieldNet = earningsYield - er;
  const geometricGross = geometricReturnNet + er;
  const costDrag30 = 1000000 * (Math.pow(1 + geometricGross / 100, 30) - Math.pow(1 + geometricReturnNet / 100, 30));

  return {
    pe, pb, earningsYield, earningsYieldNet,
    intlPct: intlPctEquity, emPct: emPctEquity,
    smb, hml, er, factorReturn, factorReturnNet,
    portfolioVol, geometricReturnNet, costDrag30,
    total, equityW,
  };
}

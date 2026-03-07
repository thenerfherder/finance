import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getCorr, calcStats } from './calculations.js';
import { state } from './state.js';
import { TICKERS } from './data.js';

function zero(p) {
  TICKERS.forEach(tk => { state[p][tk] = 0; });
}

// ================================================================
// getCorr
// ================================================================
describe('getCorr', () => {
  test('self-correlation is 1', () => {
    assert.equal(getCorr('VTI', 'VTI'), 1);
    assert.equal(getCorr('BND', 'BND'), 1);
  });

  test('is symmetric', () => {
    assert.equal(getCorr('VTI', 'VXUS'), getCorr('VXUS', 'VTI'));
    assert.equal(getCorr('AVUV', 'AVDV'), getCorr('AVDV', 'AVUV'));
  });

  test('returns known values from CORR_MATRIX', () => {
    assert.equal(getCorr('VTI', 'VXUS'), 0.87);
    assert.equal(getCorr('VTI', 'BND'),  0);
    assert.equal(getCorr('VT',  'AVGE'), 0.98);
  });

  test('returns 0 for unknown pairs', () => {
    assert.equal(getCorr('FAKE', 'VTI'), 0);
  });
});

// ================================================================
// calcStats
// ================================================================
describe('calcStats', () => {
  beforeEach(() => { zero('a'); zero('b'); });

  test('returns null for empty portfolio', () => {
    assert.equal(calcStats('a'), null);
  });

  // ── 100% VTI ─────────────────────────────────────────────────
  describe('100% VTI', () => {
    beforeEach(() => { state.a.VTI = 100; });

    test('expense ratio matches ETF data', () => {
      assert.equal(calcStats('a', { rf: 4.0 }).er, 0.03);
    });

    test('PE matches VTI PE', () => {
      const s = calcStats('a', { rf: 4.0 });
      assert.ok(Math.abs(s.pe - 26.0) < 0.01, `expected PE≈26.0, got ${s.pe}`);
    });

    test('no international allocation', () => {
      assert.equal(calcStats('a', { rf: 4.0 }).intlPct, 0);
    });

    test('single-asset portfolio vol equals ETF vol', () => {
      const s = calcStats('a', { rf: 4.0 });
      // Markowitz with one asset: sqrt(1² * 16²) = 16
      assert.ok(Math.abs(s.portfolioVol - 16) < 0.01, `expected vol≈16, got ${s.portfolioVol}`);
    });

    test('geometric return ≈ arithmetic − σ²/2', () => {
      const s = calcStats('a', { rf: 4.0 });
      const expected = s.factorReturnNet - (s.portfolioVol ** 2) / 200;
      assert.ok(Math.abs(s.geometricReturnNet - expected) < 0.0001,
        `expected ${expected.toFixed(4)}, got ${s.geometricReturnNet.toFixed(4)}`);
    });

    test('equity weight is 1', () => {
      assert.ok(Math.abs(calcStats('a', { rf: 4.0 }).equityW - 1.0) < 0.001);
    });
  });

  // ── 100% BND ─────────────────────────────────────────────────
  describe('100% BND', () => {
    beforeEach(() => { state.a.BND = 100; });

    test('equity valuation stats are null', () => {
      const s = calcStats('a', { rf: 4.0 });
      assert.equal(s.pe, null);
      assert.equal(s.pb, null);
    });

    test('equity weight is zero', () => {
      assert.equal(calcStats('a', { rf: 4.0 }).equityW, 0);
    });

    test('net factor return equals bond yield minus ER', () => {
      const s = calcStats('a', { rf: 4.0 });
      // BND: bondYield=4.18, er=0.03 → net=4.15
      assert.ok(Math.abs(s.factorReturnNet - (4.18 - 0.03)) < 0.001,
        `expected 4.15, got ${s.factorReturnNet}`);
    });
  });

  // ── 50% VTI / 50% BND ────────────────────────────────────────
  describe('50% VTI / 50% BND', () => {
    beforeEach(() => { state.a.VTI = 50; state.a.BND = 50; });

    test('equity weight is 0.5', () => {
      const s = calcStats('a', { rf: 4.0 });
      assert.ok(Math.abs(s.equityW - 0.5) < 0.001);
    });

    test('diversification reduces vol vs pure equity (near-zero VTI/BND correlation)', () => {
      const s = calcStats('a', { rf: 4.0 });
      // Markowitz: sqrt((0.5*16)² + (0.5*5)² + 2*0.5*0.5*16*5*0) = sqrt(64+6.25) ≈ 8.385
      const expected = Math.sqrt(0.25 * 256 + 0.25 * 25);
      assert.ok(Math.abs(s.portfolioVol - expected) < 0.01,
        `expected vol≈${expected.toFixed(2)}, got ${s.portfolioVol.toFixed(2)}`);
      assert.ok(s.portfolioVol < 16, 'diversification should reduce vol below pure-equity level');
    });
  });

  // ── Factor exposures ──────────────────────────────────────────
  describe('factor exposures', () => {
    test('SMB is allocation-weighted across portfolio', () => {
      state.a.VTI = 50;
      state.a.AVUV = 50;
      const s = calcStats('a', { rf: 4.0 });
      // VTI smb=0.05, AVUV smb=0.82 → 0.5*0.05 + 0.5*0.82 = 0.435
      assert.ok(Math.abs(s.smb - 0.435) < 0.001, `expected smb≈0.435, got ${s.smb}`);
    });

    test('HML is allocation-weighted across portfolio', () => {
      state.a.VTI = 50;
      state.a.AVUV = 50;
      const s = calcStats('a', { rf: 4.0 });
      // VTI hml=0.00, AVUV hml=0.60 → 0.5*0.00 + 0.5*0.60 = 0.30
      assert.ok(Math.abs(s.hml - 0.30) < 0.001, `expected hml≈0.30, got ${s.hml}`);
    });

    test('100% VXUS has ~97% international allocation (equity-normalized)', () => {
      state.a.VXUS = 100;
      const s = calcStats('a', { rf: 4.0 });
      // VXUS intlPct=97, equityW=1.0 → intlPctEquity = 97
      assert.ok(Math.abs(s.intlPct - 97) < 0.001, `expected intlPct≈97, got ${s.intlPct}`);
    });

    test('intlPct is normalized to equity sleeve only', () => {
      // 50% VXUS / 50% BND: equity sleeve is 100% VXUS → intlPctEquity = 97
      state.a.VXUS = 50;
      state.a.BND  = 50;
      const s = calcStats('a', { rf: 4.0 });
      assert.ok(Math.abs(s.intlPct - 97) < 0.001,
        `expected intlPct≈97 (equity-normalized), got ${s.intlPct}`);
    });
  });

  // ── Advisor fee ───────────────────────────────────────────────
  describe('advisor fee', () => {
    beforeEach(() => { state.a.VTI = 100; });

    test('adds advFee to ER when advisorOn=true', () => {
      const base = calcStats('a', { rf: 4.0, advisorOn: false, advFee: 1.0 });
      const adv  = calcStats('a', { rf: 4.0, advisorOn: true,  advFee: 1.0 });
      assert.ok(Math.abs(adv.er - base.er - 1.0) < 0.001,
        `expected ER to increase by 1.0, got delta=${(adv.er - base.er).toFixed(3)}`);
    });

    test('reduces net factor return by advFee', () => {
      const base = calcStats('a', { rf: 4.0, advisorOn: false, advFee: 1.0 });
      const adv  = calcStats('a', { rf: 4.0, advisorOn: true,  advFee: 1.0 });
      assert.ok(Math.abs(base.factorReturnNet - adv.factorReturnNet - 1.0) < 0.001,
        `expected net return to decrease by 1.0`);
    });

    test('different advFee values scale correctly', () => {
      const adv05 = calcStats('a', { rf: 4.0, advisorOn: true, advFee: 0.5 });
      const adv15 = calcStats('a', { rf: 4.0, advisorOn: true, advFee: 1.5 });
      assert.ok(Math.abs(adv15.er - adv05.er - 1.0) < 0.001);
    });
  });

  // ── Risk-free rate sensitivity ────────────────────────────────
  describe('risk-free rate', () => {
    beforeEach(() => { state.a.VTI = 100; });

    test('rf cancels out in CAPE model when ERP remains positive', () => {
      // equityRet = rf + max(0, 100/CAPE + EPS - rf)
      // When ERP > 0, rf cancels: equityRet ≈ 100/CAPE + EPS + factor premiums
      // CAPE_US=37, EPS_GROWTH=4.5 → ERP goes negative above rf ≈ 7.2
      const s4 = calcStats('a', { rf: 4.0 });
      const s6 = calcStats('a', { rf: 6.0 });
      assert.ok(Math.abs(s4.factorReturnNet - s6.factorReturnNet) < 0.001,
        'rf should cancel in CAPE model while ERP > 0');
    });

    test('rf above ERP floor increases required return', () => {
      // Above rf ≈ 7.2, ERP is floored at 0; equityRet = rf + factor premiums
      // so further increases in rf raise the expected return
      const s5 = calcStats('a', { rf: 5.0 });
      const s9 = calcStats('a', { rf: 9.0 });
      assert.ok(s9.factorReturnNet > s5.factorReturnNet,
        `expected rf=9 to exceed rf=5 return when ERP is floored; got ${s9.factorReturnNet} vs ${s5.factorReturnNet}`);
    });
  });

  // ── Normalization independence ────────────────────────────────
  describe('normalization independence', () => {
    test('proportional weights produce identical stats', () => {
      state.a.VTI = 60; state.a.VXUS = 40;
      const s1 = calcStats('a', { rf: 4.0 });

      state.a.VTI = 30; state.a.VXUS = 20;
      const s2 = calcStats('a', { rf: 4.0 });

      assert.ok(Math.abs(s1.er           - s2.er)           < 0.0001, 'er mismatch');
      assert.ok(Math.abs(s1.smb          - s2.smb)          < 0.0001, 'smb mismatch');
      assert.ok(Math.abs(s1.portfolioVol - s2.portfolioVol) < 0.0001, 'vol mismatch');
      assert.ok(Math.abs(s1.geometricReturnNet - s2.geometricReturnNet) < 0.0001, 'return mismatch');
    });
  });
});

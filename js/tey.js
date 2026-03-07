import { TEY_FUNDS, TEY_BRACKETS } from './data.js';
import { openModal } from './ui.js';

const badge = f => ({ cls: f.taxExempt ? 'exempt' : 'taxable', txt: f.taxExempt ? 'Tax-Exempt' : 'Taxable' });

let selectedBracketRate = null;
export function setTeyBracket(rate) {
  selectedBracketRate = rate;
  renderTeyTable();
}

export function openTeyModal(i) {
  const f = TEY_FUNDS[i];
  openModal(f.ticker, f.name, f.tip, [
    { val: f.yield.toFixed(2) + '%',   lbl: f.category === 'mmf' ? '7-Day Yield' : 'SEC Yield' },
    { val: f.er.toFixed(2) + '%',      lbl: 'Exp. Ratio'     },
    { val: f.taxExempt ? 'Yes' : 'No', lbl: 'Fed Tax-Exempt' },
    { val: f.category === 'etf' ? 'Bond ETF' : 'Money Market', lbl: 'Type' },
  ]);
}

export function buildTeyFundCards() {
  const container = document.getElementById('tey-funds-container');
  container.innerHTML = '';

  const groups = [
    { key: 'etf', label: 'Bond ETFs' },
    { key: 'mmf', label: 'Money Market Funds' },
  ];

  groups.forEach(grp => {
    const group = document.createElement('div');
    group.className = 'tey-fund-group';
    group.innerHTML = `<div class="tey-fund-group-lbl">${grp.label}</div>`;

    const grid = document.createElement('div');
    grid.className = 'tey-fund-grid';

    TEY_FUNDS.forEach((f, i) => {
      if (f.category !== grp.key) return;
      const { cls: badgeCls, txt: badgeTxt } = badge(f);
      const yieldLbl = grp.key === 'mmf' ? '7-Day Yield' : 'SEC Yield';

      const card = document.createElement('div');
      card.className = 'tey-fund-card';
      card.innerHTML = `
        <div class="tey-fund-ticker">${f.ticker}</div>
        <div class="tey-fund-name">${f.name}</div>
        <div class="tey-badge ${badgeCls}">${badgeTxt}</div>
        <div class="tey-yield-row">
          <span class="tey-yield-lbl">${yieldLbl}</span>
          <input class="tey-yield-input" type="number" min="0" max="20" step="0.01" value="${f.yield.toFixed(2)}">
        </div>
        <div class="tey-er-line">ER: ${f.er.toFixed(2)}%</div>
      `;

      card.querySelector('.tey-fund-ticker').addEventListener('click', () => openTeyModal(i));
      card.querySelector('.tey-yield-input').addEventListener('input', e => onTeyYield(i, e.target.value));

      grid.appendChild(card);
    });

    group.appendChild(grid);
    container.appendChild(group);
  });
}

export function onTeyYield(i, raw) {
  const v = Math.max(0, Math.min(20, parseFloat(raw) || 0));
  TEY_FUNDS[i].yield = v;
  renderTeyTable();
}

export function renderTeyTable() {
  const wrap     = document.getElementById('tey-table');
  const etfFunds = TEY_FUNDS.filter(f => f.category === 'etf');
  const mmfFunds = TEY_FUNDS.filter(f => f.category === 'mmf');

  let html = '<table class="tey-table"><thead>';
  html += '<tr>';
  html += '<th rowspan="2">Federal Bracket</th>';
  html += `<th colspan="${etfFunds.length}" class="th-group">Bond ETFs</th>`;
  html += `<th colspan="${mmfFunds.length}" class="th-group">Money Market Funds</th>`;
  html += '</tr><tr>';
  TEY_FUNDS.forEach(f => {
    const { cls: badgeCls, txt: badgeTxt } = badge(f);
    html += `<th>${f.ticker}<span class="th-badge ${badgeCls}">${badgeTxt} · ${f.yield.toFixed(2)}%</span></th>`;
  });
  html += '</tr></thead><tbody>';

  TEY_BRACKETS.forEach(brkt => {
    const rate     = brkt.rate / 100;
    const afterTax = TEY_FUNDS.map(f => f.taxExempt ? f.yield : f.yield * (1 - rate));

    const catWinner = {};
    ['etf', 'mmf'].forEach(cat => {
      const entries = TEY_FUNDS.map((f, i) => ({ i, at: afterTax[i], category: f.category })).filter(e => e.category === cat);
      const max     = Math.max(...entries.map(e => e.at));
      catWinner[cat] = entries.find(e => e.at === max).i;
    });

    const isSelected = selectedBracketRate === brkt.rate;
    html += `<tr${isSelected ? ' class="tey-row-selected"' : ''}>`;
    html += `<td><div class="tey-brkt-rate">${brkt.label}</div><div class="tey-brkt-income">${brkt.income}</div></td>`;

    TEY_FUNDS.forEach((f, i) => {
      const at        = afterTax[i];
      const isW       = catWinner[f.category] === i;
      const isLastEtf = f.category === 'etf' && (TEY_FUNDS[i + 1]?.category === 'mmf');
      const tey       = f.taxExempt ? (f.yield / (1 - rate)) : null;
      const sub       = f.taxExempt
        ? `<div class="tey-sub">TEY: ${tey.toFixed(2)}%</div>`
        : `<div class="tey-sub">after ${brkt.label} tax</div>`;
      const cls = [isW ? 'tey-cell-winner' : '', isLastEtf ? 'col-group-end' : ''].join(' ').trim();
      html += `<td class="${cls}"><div class="tey-val">${at.toFixed(2)}%</div>${sub}</td>`;
    });

    html += '</tr>';
  });

  html += '</tbody></table>';
  wrap.innerHTML = html;
}

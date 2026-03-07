import { STAT_GROUPS } from './data.js';
import { calcStats } from './calculations.js';
import { settings, saveState } from './state.js';
import { renderRadar, renderGrowthChart } from './charts.js';

export function renderAll() {
  renderRadar();
  renderGrowthChart();

  const sa = calcStats('a', { rf: settings.rfRate, advisorOn: settings.advisorA, advFee: settings.advFee });
  const sb = calcStats('b', { rf: settings.rfRate, advisorOn: settings.advisorB, advFee: settings.advFee });

  const nameA = settings.nameA || 'Portfolio A';
  const nameB = settings.nameB || 'Portfolio B';
  document.getElementById('leg-a').textContent = nameA;
  document.getElementById('leg-b').textContent = nameB;

  const body = document.getElementById('stats-body');

  if (!sa || !sb) {
    body.innerHTML = '<div class="empty-state">Set allocations in both portfolios above to see comparison.</div>';
    return;
  }

  let html = '';

  STAT_GROUPS.forEach(grp => {
    html += `<div class="stat-group-hdr">${grp.label}</div>`;
    grp.stats.forEach(def => {
      const va = sa[def.key];
      const vb = sb[def.key];

      const vaNum = va ?? 0;
      const vbNum = vb ?? 0;
      const maxV  = Math.max(Math.abs(vaNum), Math.abs(vbNum), def.mktWt ?? 0, 0.001);
      const pctA  = (vaNum / maxV) * 90;
      const pctB  = (vbNum / maxV) * 90;
      const tickPx = def.mktWt != null ? (def.mktWt / maxV) * 90 : null;

      let badgeA = '', badgeB = '';
      if (def.better !== 'neutral' && va != null && vb != null && Math.abs(va - vb) > 0.0005) {
        const aWins = def.better === 'higher' ? va > vb : va < vb;
        if (aWins) badgeA = '<span class="badge-up">↑</span>';
        else        badgeB = '<span class="badge-up">↑</span>';
      }

      html += `
        <div class="stat-row" title="${def.tip}">
          <div>
            <div class="stat-name">${def.name}</div>
            <div class="stat-desc">${def.desc}</div>
          </div>
          <div class="stat-val a">${def.fmt(va)}${badgeA}</div>
          <div class="bfly">
            <div class="bfly-half left">
              <div class="bfly-bar a" style="width:${pctA}px"></div>
              ${tickPx != null ? `<div class="bfly-mkt-tick" style="right:${tickPx}px"></div>` : ''}
            </div>
            <div class="bfly-ctr"></div>
            <div class="bfly-half right">
              <div class="bfly-bar b" style="width:${pctB}px"></div>
              ${tickPx != null ? `<div class="bfly-mkt-tick" style="left:${tickPx}px"></div>` : ''}
            </div>
          </div>
          <div class="stat-val b">${def.fmt(vb)}${badgeB}</div>
        </div>
      `;
    });
  });

  body.innerHTML = html;
  saveState();
}

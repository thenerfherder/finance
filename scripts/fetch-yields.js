#!/usr/bin/env node
// Runs server-side (GitHub Actions) — no CORS restrictions.
// Fetches yield data from Yahoo Finance and writes JSON to stdout.
// The workflow pipes stdout to yields.json.

const https = require('https');

const TICKERS = ['VTEB', 'BND', 'VMSXX', 'VMFXX'];

function fetchYield(ticker) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'query1.finance.yahoo.com',
      path: `/v10/finance/quoteSummary/${ticker}?modules=summaryDetail`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; yields-bot/1.0)',
        'Accept': 'application/json',
      },
    };

    https.get(options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${ticker}`));
        res.resume();
        return;
      }
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const sd = json?.quoteSummary?.result?.[0]?.summaryDetail;
          const raw = sd?.yield?.raw ?? sd?.trailingAnnualDividendYield?.raw;
          if (raw == null) {
            reject(new Error(`No yield field for ${ticker}`));
          } else {
            resolve(+(raw * 100).toFixed(2));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const yields = {};
  let anyFailed = false;

  for (const ticker of TICKERS) {
    try {
      yields[ticker] = await fetchYield(ticker);
      process.stderr.write(`${ticker}: ${yields[ticker]}%\n`);
    } catch (e) {
      process.stderr.write(`WARN: ${e.message}\n`);
      anyFailed = true;
    }
  }

  if (Object.keys(yields).length === 0) {
    process.stderr.write('ERROR: No yields fetched — not writing output\n');
    process.exit(1);
  }

  process.stdout.write(JSON.stringify({
    updated: new Date().toISOString(),
    partial: anyFailed,
    yields,
  }, null, 2) + '\n');
}

main();

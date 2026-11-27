#!/usr/bin/env node
// Refresh src/tools/invoice-lottery/data.json from the Ministry of Finance 統一發票中獎號碼 pages.
// Usage: npm run update:invoice   (Node 24+, no dependencies; parse.ts is loaded via Node's built-in type stripping)
// Exits non-zero without touching data.json if a page cannot be fetched or parsed.

import { readFile, writeFile } from 'node:fs/promises';
import {
  mergePeriods,
  parseWinningPage,
  periodOrder,
  validatePeriod,
} from '../src/tools/invoice-lottery/parse.ts';

const DATA = new URL('../src/tools/invoice-lottery/data.json', import.meta.url);
const SOURCES = ['https://invoice.etax.nat.gov.tw/index.html', 'https://invoice.etax.nat.gov.tw/lastNumber.html'];
const KEEP = 12;

async function fetchText(url, attempts = 3) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; tool.6yuwei.com invoice updater)' },
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (error) {
      if (i >= attempts) throw new Error(`${url}: ${error.message}`);
      await new Promise((r) => setTimeout(r, 3_000 * i));
    }
  }
}

async function main() {
  const [current, previous] = await Promise.all(
    SOURCES.map(async (url) => {
      const period = parseWinningPage(await fetchText(url));
      console.log(`${url} → ${period.label} 特別獎 ${period.special}`);
      return period;
    }),
  );
  if (periodOrder(current.period) <= periodOrder(previous.period)) {
    throw new Error(`index.html (${current.period}) should be newer than lastNumber.html (${previous.period})`);
  }

  const existingText = await readFile(DATA, 'utf8');
  const existing = JSON.parse(existingText);
  for (const fresh of [current, previous]) {
    const stored = existing.find((p) => p.period === fresh.period);
    if (stored && JSON.stringify(stored) !== JSON.stringify(fresh)) {
      console.warn(`warning: ${fresh.period} differs from the stored record; using the official page`);
    }
  }

  const merged = mergePeriods(existing, [current, previous], KEEP);
  merged.forEach(validatePeriod);
  const nextText = `${JSON.stringify(merged, null, 2)}\n`;
  if (nextText === existingText) {
    console.log(`data.json unchanged (latest ${merged[0].label}).`);
    return;
  }
  await writeFile(DATA, nextText);
  console.log(`data.json updated: ${merged.length} periods, latest ${merged[0].label}.`);
}

main().catch((error) => {
  console.error(`update-invoice failed: ${error.message}`);
  process.exit(1);
});

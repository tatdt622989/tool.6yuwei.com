import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import data from './data.json';
import {
  InvoiceParseError,
  mergePeriods,
  parseWinningPage,
  periodOrder,
  scheduleFor,
  validatePeriod,
  type InvoicePeriod,
} from './parse';

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');

describe('parseWinningPage', () => {
  it('parses invoice.etax.nat.gov.tw/index.html (current period, split 頭獎 spans)', () => {
    expect(parseWinningPage(fixture('index-115-07-08.html'))).toEqual({
      period: '115-07-08',
      label: '115年07-08月',
      drawDate: '2026-09-25',
      claimStart: '2026-10-06',
      claimEnd: '2027-01-05',
      special: '89996565',
      grand: '91098182',
      first: ['54348835', '44991397', '06595111'],
    });
  });

  it('uses the etw-on menu item, not the first period link, on lastNumber.html', () => {
    const p = parseWinningPage(fixture('lastNumber-115-05-06.html'));
    expect(p.period).toBe('115-05-06');
    expect(p.special).toBe('38548029');
    expect(p.grand).toBe('10138845');
    expect(p.first).toEqual(['24121106', '28589937', '83663333']);
    expect([p.claimStart, p.claimEnd]).toEqual(['2026-08-06', '2026-11-05']);
  });

  it('parses an etax.nat.gov.tw archive page (period in <title>, weekend-shifted claim end)', () => {
    const p = parseWinningPage(fixture('etax-115-03-04.html'));
    expect(p.period).toBe('115-03-04');
    expect(p.special).toBe('19531471');
    expect(p.grand).toBe('85941329');
    expect(p.first).toEqual(['07225810', '20231230', '83518781']);
    expect(p.claimEnd).toBe('2026-09-07');
  });

  it('throws instead of returning partial data', () => {
    const html = fixture('index-115-07-08.html');
    expect(() => parseWinningPage(html.replace('91098182', 'xxxxxxxx'))).toThrow(InvoiceParseError);
    expect(() => parseWinningPage(html.replace(/<span class="fw-bold">06595<\/span>/, ''))).toThrow(/頭獎/);
    expect(() => parseWinningPage(html.replaceAll('115年07-08月', ''))).toThrow(/Period/);
    expect(() => parseWinningPage('<html><body>maintenance</body></html>')).toThrow(InvoiceParseError);
  });

  it('rejects a claim window that belongs to a different period', () => {
    const html = fixture('index-115-07-08.html').replace('領獎期間自115年10月06日', '領獎期間自115年08月06日');
    expect(() => parseWinningPage(html)).toThrow(/領獎期間/);
  });
});

describe('scheduleFor', () => {
  it('draws on the 25th of the following odd month and rolls over the year for 11-12月', () => {
    expect(scheduleFor(115, 9)).toEqual({ drawDate: '2026-11-25', claimStart: '2026-12-06', claimEnd: '2027-03-05' });
    expect(scheduleFor(114, 11)).toEqual({ drawDate: '2026-01-25', claimStart: '2026-02-06', claimEnd: '2026-05-05' });
  });

  it('moves a weekend claim end to Monday', () => {
    expect(scheduleFor(115, 3).claimEnd).toBe('2026-09-07'); // 9/5 Sat
    expect(scheduleFor(115, 1).claimEnd).toBe('2026-07-06'); // 7/5 Sun
  });
});

describe('mergePeriods', () => {
  const p = (period: string) => ({ period }) as InvoicePeriod;

  it('dedupes by period (incoming wins), sorts newest first and keeps N', () => {
    const merged = mergePeriods([p('115-03-04'), p('115-05-06')], [{ ...p('115-05-06'), special: 'new' }, p('115-07-08')], 2);
    expect(merged.map((x) => x.period)).toEqual(['115-07-08', '115-05-06']);
    expect(merged[1].special).toBe('new');
  });

  it('orders across ROC years numerically', () => {
    expect(periodOrder('99-11-12')).toBeLessThan(periodOrder('100-01-02'));
  });
});

describe('data.json', () => {
  const periods = data as InvoicePeriod[];

  it('is valid, unique and newest first', () => {
    periods.forEach(validatePeriod);
    const orders = periods.map((x) => periodOrder(x.period));
    expect(orders).toEqual([...orders].sort((a, b) => b - a));
    expect(new Set(orders).size).toBe(orders.length);
    expect(periods.length).toBeGreaterThanOrEqual(2);
  });

  it('claim windows follow the official schedule (start exact, end at most a few days later)', () => {
    for (const x of periods) {
      const [y, m] = x.period.split('-').map(Number);
      const s = scheduleFor(y, m);
      expect(x.claimStart).toBe(s.claimStart);
      expect(x.claimEnd >= s.claimEnd.slice(0, 8) + '05').toBe(true);
    }
  });
});

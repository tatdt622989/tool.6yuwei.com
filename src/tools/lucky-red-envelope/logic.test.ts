import { describe, expect, it } from 'vitest';
import {
  allRows,
  checkRound,
  checkSplit,
  decodeInvite,
  DEFAULT_DRAFT,
  encodeInvite,
  FRAGMENT_KEY,
  inviteUrl,
  isFinished,
  LIMITS,
  luckiest,
  markSent,
  nextPicker,
  normalizeDraft,
  normalizeRound,
  openAll,
  openEnvelope,
  resultRows,
  resultText,
  roundInvite,
  skipTurn,
  splitAmounts,
  startRound,
  totalOf,
  type RandomSource,
  type Round,
  type RoundInput,
} from './logic';
import { toBase64Url } from '../scratch-card/logic';

/** Deterministic 32-bit generator (mulberry32) so the tests repeat exactly. */
function seeded(seed: number): RandomSource {
  let a = seed >>> 0;
  return (array) => {
    for (let i = 0; i < array.length; i++) {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      array[i] = (t ^ (t >>> 14)) >>> 0;
    }
    return array;
  };
}

const constant = (value: number): RandomSource => (array) => array.fill(value);

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

const input = (over: Partial<RoundInput> = {}): RoundInput => ({
  total: 1000,
  count: 5,
  minimum: 1,
  unit: 1,
  mode: 'pick',
  names: [],
  title: '',
  ...over,
});

function round(over: Partial<RoundInput> = {}, seed = 1): Round {
  const started = startRound(input(over), seeded(seed));
  if ('error' in started) throw new Error(`unexpected error: ${started.error.code}`);
  return started.round;
}

describe('checkSplit', () => {
  it('accepts a normal split', () => {
    expect(checkSplit({ total: 1000, count: 10, minimum: 1, unit: 1 })).toBeNull();
    expect(checkSplit({ total: 1000, count: 10, minimum: 100, unit: 100 })).toBeNull();
  });

  it('rejects a total that is not a positive whole number', () => {
    for (const total of [0, -5, 12.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(checkSplit({ total, count: 5, minimum: 1, unit: 1 })).toEqual({ code: 'total' });
    }
  });

  it('rejects a total over the limit', () => {
    expect(checkSplit({ total: LIMITS.maxTotal + 1, count: 5, minimum: 1, unit: 1 })).toEqual({ code: 'totalMax', max: LIMITS.maxTotal });
    expect(checkSplit({ total: LIMITS.maxTotal, count: 5, minimum: 1, unit: 1 })).toBeNull();
  });

  it('rejects a count outside 2–100', () => {
    for (const count of [0, 1, 101, 2.5, Number.NaN]) {
      expect(checkSplit({ total: 1000, count, minimum: 1, unit: 1 })).toEqual({ code: 'count', min: 2, max: 100 });
    }
    expect(checkSplit({ total: 1000, count: 2, minimum: 1, unit: 1 })).toBeNull();
    expect(checkSplit({ total: 1000, count: 100, minimum: 1, unit: 1 })).toBeNull();
  });

  it('rejects an unknown unit and a minimum below 1', () => {
    expect(checkSplit({ total: 1000, count: 5, minimum: 5, unit: 5 })).toEqual({ code: 'unit' });
    expect(checkSplit({ total: 1000, count: 5, minimum: 0, unit: 1 })).toEqual({ code: 'minimum' });
    expect(checkSplit({ total: 1000, count: 5, minimum: 1.5, unit: 1 })).toEqual({ code: 'minimum' });
  });

  it('rejects a total or minimum that is not a multiple of the unit', () => {
    expect(checkSplit({ total: 1050, count: 5, minimum: 100, unit: 100 })).toEqual({ code: 'totalUnit', unit: 100 });
    expect(checkSplit({ total: 1005, count: 5, minimum: 10, unit: 10 })).toEqual({ code: 'totalUnit', unit: 10 });
    expect(checkSplit({ total: 1000, count: 5, minimum: 50, unit: 100 })).toEqual({ code: 'minimumUnit', unit: 100 });
  });

  it('rejects a total too small for count × minimum and says how much is needed', () => {
    expect(checkSplit({ total: 1000, count: 11, minimum: 100, unit: 100 })).toEqual({ code: 'tooSmall', need: 1100 });
    expect(checkSplit({ total: 5, count: 6, minimum: 1, unit: 1 })).toEqual({ code: 'tooSmall', need: 6 });
    expect(checkSplit({ total: 1000, count: 10, minimum: 100, unit: 100 })).toBeNull();
  });
});

describe('splitAmounts', () => {
  const cases = [
    { total: 1000, count: 5, minimum: 1, unit: 1 },
    { total: 6000, count: 12, minimum: 100, unit: 100 },
    { total: 3600, count: 8, minimum: 10, unit: 10 },
    { total: 100, count: 100, minimum: 1, unit: 1 },
    { total: 101, count: 100, minimum: 1, unit: 1 },
    { total: 50_000, count: 100, minimum: 200, unit: 100 },
    { total: LIMITS.maxTotal, count: 2, minimum: 1, unit: 1 },
    { total: 2, count: 2, minimum: 1, unit: 1 },
  ];

  it.each(cases)('adds up to $total over $count envelopes (min $minimum, unit $unit)', (c) => {
    for (let seed = 1; seed <= 300; seed++) {
      const amounts = splitAmounts(c, seeded(seed));
      expect(amounts).toHaveLength(c.count);
      expect(sum(amounts)).toBe(c.total);
      for (const amount of amounts) {
        expect(Number.isInteger(amount)).toBe(true);
        expect(amount).toBeGreaterThanOrEqual(c.minimum);
        expect(amount % c.unit).toBe(0);
      }
    }
  });

  it('gives everyone the minimum when nothing is left over', () => {
    expect(splitAmounts({ total: 1000, count: 10, minimum: 100, unit: 100 }, seeded(7))).toEqual(new Array(10).fill(100));
  });

  it('leaves everything to the last draw when every earlier draw is zero', () => {
    const amounts = splitAmounts({ total: 500, count: 5, minimum: 10, unit: 10 }, constant(0));
    expect([...amounts].sort((a, b) => a - b)).toEqual([10, 10, 10, 10, 460]);
  });

  it('varies between runs and depends only on the random source', () => {
    const c = { total: 1000, count: 10, minimum: 1, unit: 1 };
    expect(splitAmounts(c, seeded(3))).toEqual(splitAmounts(c, seeded(3)));
    expect(splitAmounts(c, seeded(3))).not.toEqual(splitAmounts(c, seeded(4)));
  });

  it('gives every position the same average', () => {
    const c = { total: 1000, count: 5, minimum: 1, unit: 1 };
    const totals = new Array(c.count).fill(0);
    const runs = 20_000;
    const random = seeded(2027);
    for (let i = 0; i < runs; i++) splitAmounts(c, random).forEach((amount, at) => (totals[at] += amount));
    for (const total of totals) expect(total / runs).toBeGreaterThan(190);
    for (const total of totals) expect(total / runs).toBeLessThan(210);
  });

  it('throws on numbers that cannot be split', () => {
    expect(() => splitAmounts({ total: 5, count: 6, minimum: 1, unit: 1 })).toThrow(RangeError);
  });

  it('works with the browser random source', () => {
    const amounts = splitAmounts({ total: 8800, count: 20, minimum: 100, unit: 100 });
    expect(sum(amounts)).toBe(8800);
  });
});

describe('checkRound and startRound', () => {
  it('uses the number of names as the count', () => {
    const r = round({ names: ['小明', '小華', '阿美'], count: 99 });
    expect(r.amounts).toHaveLength(3);
    expect(totalOf(r)).toBe(1000);
  });

  it('needs names for envelopes with names on them', () => {
    expect(checkRound(input({ mode: 'named' }))).toEqual({ code: 'needNames' });
    expect(checkRound(input({ mode: 'link' }))).toBeNull();
  });

  it('reports one name and too many names as a count problem', () => {
    expect(checkRound(input({ names: ['小明'] }))).toEqual({ code: 'count', min: 2, max: 100 });
    const many = Array.from({ length: 101 }, (_, i) => `員工${i}`);
    expect(checkRound(input({ names: many, total: 99_999 }))).toEqual({ code: 'count', min: 2, max: 100 });
  });

  it('reports repeated names', () => {
    expect(checkRound(input({ names: ['小明', '小華', '小明'] }))).toEqual({ code: 'duplicate', names: ['小明'] });
  });

  it('passes split problems through', () => {
    expect(startRound(input({ total: 3, count: 5 }))).toEqual({ error: { code: 'tooSmall', need: 5 } });
  });

  it('starts a pick round with everyone waiting in list order', () => {
    const r = round({ names: ['小明', '小華', '阿美'] });
    expect(r.queue).toEqual([0, 1, 2]);
    expect(r.owners).toEqual([-1, -1, -1]);
    expect(nextPicker(r)).toBe(0);
  });

  it('starts named and link rounds with one envelope per person', () => {
    for (const mode of ['named', 'link'] as const) {
      const r = round({ mode, names: ['小明', '小華', '阿美'] });
      expect(r.owners).toEqual([0, 1, 2]);
      expect(r.queue).toEqual([]);
    }
  });

  it('starts a round without names with no owners', () => {
    const r = round({ mode: 'link' });
    expect(r.owners).toEqual([-1, -1, -1, -1, -1]);
    expect(nextPicker(r)).toBe(-1);
  });

  it('cleans the title', () => {
    expect(round({ title: '  2027\n尾牙  ' }).title).toBe('2027 尾牙');
  });
});

describe('opening envelopes', () => {
  it('gives the picked envelope to the person at the front', () => {
    let r = round({ names: ['小明', '小華', '阿美'] });
    r = openEnvelope(r, 2);
    expect(r.owners).toEqual([-1, -1, 0]);
    expect(r.opened).toEqual([2]);
    expect(nextPicker(r)).toBe(1);
    r = openEnvelope(r, 0);
    expect(r.owners).toEqual([1, -1, 0]);
  });

  it('ignores an envelope that is already open or does not exist', () => {
    const r = openEnvelope(round(), 1);
    expect(openEnvelope(r, 1)).toBe(r);
    expect(openEnvelope(r, 9)).toBe(r);
    expect(openEnvelope(r, -1)).toBe(r);
    expect(openEnvelope(r, 1.5)).toBe(r);
  });

  it('moves someone who is away to the back', () => {
    let r = round({ names: ['小明', '小華', '阿美'] });
    r = skipTurn(r);
    expect(r.queue).toEqual([1, 2, 0]);
    r = openEnvelope(openEnvelope(r, 0), 1);
    expect(skipTurn(r)).toBe(r);
  });

  it('opens the rest in order and hands them to the people still waiting', () => {
    let r = round({ names: ['小明', '小華', '阿美', '大雄'] });
    r = openEnvelope(skipTurn(r), 3);
    r = openAll(r);
    expect(isFinished(r)).toBe(true);
    expect(r.opened).toEqual([3, 0, 1, 2]);
    expect(r.owners).toEqual([2, 3, 0, 1]);
    expect(r.queue).toEqual([]);
  });

  it('marks the largest only when everything is open, and every envelope on a tie', () => {
    let r: Round = { ...round(), amounts: [300, 100, 300, 200, 100] };
    expect(luckiest(openEnvelope(r, 0))).toEqual([]);
    r = openAll(r);
    expect(luckiest(r)).toEqual([0, 2]);
    expect(resultRows(r).filter((row) => row.best).map((row) => row.envelope)).toEqual([0, 2]);
  });

  it('marks nobody when every envelope holds the same', () => {
    const r = openAll(round({ total: 500, count: 5, minimum: 100, unit: 100 }));
    expect(r.amounts).toEqual([100, 100, 100, 100, 100]);
    expect(luckiest(r)).toEqual([]);
    expect(allRows(r).some((row) => row.best)).toBe(false);
  });

  it('lists results in the order they were opened, with names when there are any', () => {
    let r = round({ names: ['小明', '小華', '阿美'] });
    r = openEnvelope(openEnvelope(r, 1), 2);
    expect(resultRows(r)).toEqual([
      { envelope: 1, name: '小明', amount: r.amounts[1], best: false },
      { envelope: 2, name: '小華', amount: r.amounts[2], best: false },
    ]);
    expect(resultRows(openEnvelope(round(), 4))[0].name).toBe('');
  });

  it('lists every envelope for the host of a link round', () => {
    const r: Round = { ...round({ mode: 'link', names: ['小明', '小華', '阿美'] }), amounts: [200, 700, 100] };
    expect(allRows(r)).toEqual([
      { envelope: 0, name: '小明', amount: 200, best: false },
      { envelope: 1, name: '小華', amount: 700, best: true },
      { envelope: 2, name: '阿美', amount: 100, best: false },
    ]);
  });

  it('remembers which links were sent', () => {
    const r = markSent(round({ mode: 'link' }), 2);
    expect(r.sent).toEqual([2]);
    expect(markSent(r, 2)).toBe(r);
  });
});

describe('resultText', () => {
  const format = (n: number) => n.toLocaleString('en-US');

  it('writes one line per envelope with the luckiest marked', () => {
    let r: Round = { ...round({ names: ['小明', '小華', '阿美'], title: '春酒' }), amounts: [1200, 300, 500] };
    r = openAll(r);
    expect(resultText(r, resultRows(r), format)).toBe(
      ['春酒 拼手氣紅包結果（共 3 包，總金額 2,000 元）', '1. 小明：1,200 元（手氣最佳）', '2. 小華：300 元', '3. 阿美：500 元'].join('\n'),
    );
  });

  it('numbers the envelopes when there are no names', () => {
    let r: Round = { ...round({ count: 2 }), amounts: [400, 600] };
    r = openEnvelope(openEnvelope(r, 1), 0);
    expect(resultText(r, resultRows(r), format)).toBe(
      ['拼手氣紅包結果（共 2 包，總金額 1,000 元）', '1. 第 2 包：600 元（手氣最佳）', '2. 第 1 包：400 元'].join('\n'),
    );
  });
});

describe('normalizeRound', () => {
  it('keeps a valid round through JSON', () => {
    let r = round({ names: ['小明', '小華', '阿美'], title: '尾牙' });
    r = openEnvelope(skipTurn(r), 1);
    expect(normalizeRound(JSON.parse(JSON.stringify(r)))).toEqual(r);
    const link = markSent(round({ mode: 'link', unit: 10, minimum: 10 }), 3);
    expect(normalizeRound(JSON.parse(JSON.stringify(link)))).toEqual(link);
    const named = openAll(round({ mode: 'named', names: ['小明', '小華'] }));
    expect(normalizeRound(JSON.parse(JSON.stringify(named)))).toEqual(named);
  });

  it('drops anything that is not a round', () => {
    for (const raw of [null, undefined, 'x', 3, [], {}, { mode: 'pick' }]) expect(normalizeRound(raw)).toBeNull();
  });

  it('drops rounds that do not add up', () => {
    const r = round({ names: ['小明', '小華', '阿美'] });
    const broken: Record<string, unknown>[] = [
      { ...r, mode: 'other' },
      { ...r, unit: 5 },
      { ...r, amounts: [1, 2.5, 3] },
      { ...r, amounts: [0, 500, 500] },
      { ...r, amounts: [1000] },
      { ...r, minimum: 400 },
      { ...r, minimum: '1' },
      { ...r, names: ['小明', '小華'] },
      { ...r, names: ['小明', '小華', '小明'] },
      { ...r, names: ['小明', '小華', 3] },
      { ...r, opened: [0, 0] },
      { ...r, opened: [5] },
      { ...r, opened: [0] },
      { ...r, owners: [0, -1] },
      { ...r, owners: [0, -1, -1] },
      { ...r, queue: [0, 1] },
      { ...r, queue: [0, 1, 1] },
      { ...r, mode: 'named' },
      { ...r, mode: 'named', queue: [], names: [], owners: [-1, -1, -1] },
    ];
    for (const raw of broken) expect(normalizeRound(raw), JSON.stringify(raw)).toBeNull();
  });

  it('drops amounts that break the unit', () => {
    const r = round({ unit: 10, minimum: 10 });
    expect(normalizeRound({ ...r, amounts: [15, 185, 300, 250, 250] })).toBeNull();
  });

  it('repairs only the sent list and the title', () => {
    const r = round({ mode: 'link' });
    expect(normalizeRound({ ...r, sent: 'x', title: 5 })).toEqual({ ...r, sent: [], title: '' });
    expect(normalizeRound({ ...r, sent: [1, 1, 2] })?.sent).toEqual([1, 2]);
  });
});

describe('personal links', () => {
  it('round-trips an envelope with a name and a title', () => {
    const invite = { name: '王小明', amount: 1280, title: '2027 春酒' };
    expect(decodeInvite(`#${encodeInvite(invite)}`)).toEqual({ status: 'ok', invite });
    expect(decodeInvite(encodeInvite(invite))).toEqual({ status: 'ok', invite });
  });

  it('round-trips an envelope without a name', () => {
    const invite = { name: '', amount: 50, title: '' };
    expect(decodeInvite(encodeInvite(invite))).toEqual({ status: 'ok', invite });
  });

  it('builds the invite of an envelope from the round', () => {
    const r = round({ mode: 'link', names: ['小明', '小華', '阿美'], title: '尾牙' });
    expect(roundInvite(r, 1)).toEqual({ name: '小華', amount: r.amounts[1], title: '尾牙' });
    expect(roundInvite(round({ mode: 'link' }), 4).name).toBe('');
  });

  it('puts the envelope after # and nowhere else', () => {
    const invite = { name: '王小明', amount: 1280, title: '' };
    const url = inviteUrl('https://example.com/lucky-red-envelope/?utm_source=x#old', invite);
    expect(url.startsWith('https://example.com/lucky-red-envelope/?utm_source=x#hb=')).toBe(true);
    expect(url.split('#')).toHaveLength(2);
    expect(url).not.toContain('1280');
    expect(decodeURIComponent(url)).not.toContain('王小明');
  });

  it('ignores other fragments', () => {
    for (const hash of ['', '#', '#faq', '#gift=abc', 'hbx']) expect(decodeInvite(hash)).toEqual({ status: 'none' });
  });

  const wire = (data: unknown) => `#${FRAGMENT_KEY}${toBase64Url(new TextEncoder().encode(JSON.stringify(data)))}`;

  it('rejects malformed links without throwing', () => {
    const bad = [
      '#hb=',
      '#hb=***',
      '#hb=abcde',
      `#hb=${toBase64Url(new Uint8Array([0xff, 0xfe]))}`,
      wire([1, 2]),
      wire('x'),
      wire({ v: 2, a: 100 }),
      wire({ v: 1 }),
      wire({ v: 1, a: '100' }),
      wire({ v: 1, a: 0 }),
      wire({ v: 1, a: -5 }),
      wire({ v: 1, a: 10.5 }),
      wire({ v: 1, a: LIMITS.maxTotal + 1 }),
      wire({ v: 1, a: 100, n: 5 }),
      wire({ v: 1, a: 100, t: {} }),
      `#hb=${'A'.repeat(LIMITS.fragment)}`,
    ];
    for (const hash of bad) expect(decodeInvite(hash), hash).toEqual({ status: 'invalid' });
  });

  it('cleans names and titles that were tampered with', () => {
    const result = decodeInvite(wire({ v: 1, a: 100, n: `  小明\n${'長'.repeat(40)}`, t: '尾‮牙' }));
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.invite.name).toBe(`小明 ${'長'.repeat(17)}`);
    expect(result.invite.title).toBe('尾牙');
  });
});

describe('normalizeDraft', () => {
  it('falls back to the defaults', () => {
    expect(normalizeDraft(null)).toEqual(DEFAULT_DRAFT);
    expect(normalizeDraft({ by: 'x', unit: 7, mode: 'y', total: 5 })).toEqual(DEFAULT_DRAFT);
  });

  it('keeps what was typed', () => {
    const draft = { by: 'names', total: '6000', count: '12', namesText: '小明\n小華', minimum: '100', unit: 100, mode: 'link', title: '春酒' };
    expect(normalizeDraft(draft)).toEqual(draft);
  });
});

import { describe, expect, it } from 'vitest';
import {
  addBonusPrize,
  checkSetup,
  CSV_BOM,
  csvCell,
  defaultPrize,
  drawWinners,
  eligible,
  estimateEm,
  fitNames,
  formatResults,
  isFinished,
  LIMITS,
  normalizeDraft,
  normalizeSession,
  parsePrizeLine,
  parsePrizes,
  progress,
  redrawSlot,
  remainingOf,
  resultsCsv,
  spareCapacity,
  startSession,
  totalSlots,
  unbreakableParts,
  type RandomSource,
  type Session,
} from './logic';

/** Repeatable generator (mulberry32) so statistical tests cannot flake. */
function seeded(seed: number): RandomSource {
  let state = seed >>> 0;
  return (array) => {
    for (let i = 0; i < array.length; i++) {
      state = (state + 0x6d2b79f5) >>> 0;
      let z = state;
      z = Math.imul(z ^ (z >>> 15), z | 1);
      z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
      array[i] = (z ^ (z >>> 14)) >>> 0;
    }
    return array;
  };
}

const PEOPLE = ['小明', '小美', '阿傑', '雅婷', '志豪', '怡君', '家豪', '淑芬'];
const PRIZES = parsePrizes('頭獎 現金一萬 x1\n二獎 氣炸鍋 x2\n普獎 禮券 x3');
const CSV_LABELS = { header: ['獎項', '序號', '姓名', '狀態'] as [string, string, string, string], won: '中獎', absent: '不在場' };

const fresh = (noRepeat = true) => startSession(PEOPLE, PRIZES, noRepeat);
const allWinners = (session: Session) => session.prizes.flatMap((prize) => prize.slots.map((slot) => slot.person));

/** Draws every prize from the last to the first, one winner at a time. */
function drawEverything(session: Session, random: RandomSource): Session {
  while (!isFinished(session)) {
    const result = drawWinners(session, defaultPrize(session), 1, random);
    if (result.slots.length === 0) break;
    session = result.session;
  }
  return session;
}

describe('parsePrizeLine', () => {
  it('reads a quantity written with x, ×, * and spaces', () => {
    expect(parsePrizeLine('頭獎 現金一萬 x1')).toEqual({ name: '頭獎 現金一萬', quantity: 1 });
    expect(parsePrizeLine('二獎 氣炸鍋 x 3')).toEqual({ name: '二獎 氣炸鍋', quantity: 3 });
    expect(parsePrizeLine('三獎 禮券×3')).toEqual({ name: '三獎 禮券', quantity: 3 });
    expect(parsePrizeLine('普獎 *12')).toEqual({ name: '普獎', quantity: 12 });
    expect(parsePrizeLine('Gift card X2')).toEqual({ name: 'Gift card', quantity: 2 });
  });

  it('reads full-width marks, digits and spaces', () => {
    expect(parsePrizeLine('加碼獎＊３')).toEqual({ name: '加碼獎', quantity: 3 });
    expect(parsePrizeLine('特別獎Ｘ３')).toEqual({ name: '特別獎', quantity: 3 });
    expect(parsePrizeLine('參加獎　ｘ　１０')).toEqual({ name: '參加獎', quantity: 10 });
  });

  it('accepts a counter word after the number', () => {
    expect(parsePrizeLine('3 等 ギフトカード x5名')).toEqual({ name: '3 等 ギフトカード', quantity: 5 });
    expect(parsePrizeLine('普獎 x 3 個')).toEqual({ name: '普獎', quantity: 3 });
  });

  it('gives one winner to a line without a quantity', () => {
    expect(parsePrizeLine('  頭獎 機票  ')).toEqual({ name: '頭獎 機票', quantity: 1 });
    expect(parsePrizeLine('現金 5000')).toEqual({ name: '現金 5000', quantity: 1 });
  });

  it('does not mistake a product name for a quantity', () => {
    expect(parsePrizeLine('Xbox 360')).toEqual({ name: 'Xbox 360', quantity: 1 });
    expect(parsePrizeLine('Xbox 360 x2')).toEqual({ name: 'Xbox 360', quantity: 2 });
    expect(parsePrizeLine('Gift box x2')).toEqual({ name: 'Gift box', quantity: 2 });
    expect(parsePrizeLine('現金5000x2')).toEqual({ name: '現金5000', quantity: 2 });
  });

  it('keeps a line that is only a quantity as a name', () => {
    expect(parsePrizeLine('x3')).toEqual({ name: 'x3', quantity: 1 });
  });

  it('keeps the quantity between 1 and the limit', () => {
    expect(parsePrizeLine('普獎 x0')?.quantity).toBe(1);
    expect(parsePrizeLine('普獎 x5000')?.quantity).toBe(LIMITS.quantity);
  });

  it('returns null for a blank line', () => {
    expect(parsePrizeLine('   ')).toBeNull();
  });
});

describe('parsePrizes', () => {
  it('reads one prize per line and skips blank lines', () => {
    expect(parsePrizes('頭獎 x1\r\n\r\n二獎 x2\n  \n三獎')).toEqual([
      { name: '頭獎', quantity: 1 },
      { name: '二獎', quantity: 2 },
      { name: '三獎', quantity: 1 },
    ]);
    expect(totalSlots(PRIZES)).toBe(6);
  });

  it('stops at the limit', () => {
    const text = Array.from({ length: LIMITS.prizes + 20 }, (_, i) => `獎 ${i + 1}`).join('\n');
    expect(parsePrizes(text)).toHaveLength(LIMITS.prizes);
  });
});

describe('checkSetup', () => {
  it('asks for participants, then for prizes', () => {
    expect(checkSetup(0, PRIZES, true)).toBe('noPeople');
    expect(checkSetup(0, [], true)).toBe('noPeople');
    expect(checkSetup(8, [], true)).toBe('noPrizes');
  });

  it('needs a person for every winner when nobody can win twice', () => {
    expect(checkSetup(5, PRIZES, true)).toBe('tooFewPeople');
    expect(checkSetup(6, PRIZES, true)).toBeNull();
    expect(checkSetup(5, PRIZES, false)).toBeNull();
  });

  it('caps the winners of all prizes together', () => {
    const many = Array.from({ length: 11 }, (_, i) => ({ name: `獎 ${i}`, quantity: 999 }));
    expect(checkSetup(20_000, many, false)).toBe('tooManySlots');
  });
});

describe('startSession', () => {
  it('starts on the last prize, with nothing drawn', () => {
    const session = fresh();
    expect(session.current).toBe(2);
    expect(defaultPrize(session)).toBe(2);
    expect(progress(session)).toEqual({ done: 0, total: 6 });
    expect(session.prizes.every((prize) => prize.slots.length === 0 && !prize.bonus)).toBe(true);
    expect(isFinished(session)).toBe(false);
  });
});

describe('drawWinners', () => {
  it('never draws the same person twice when winners cannot repeat', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const session = drawEverything(fresh(), seeded(seed));
      const winners = allWinners(session);
      expect(isFinished(session)).toBe(true);
      expect(winners).toHaveLength(6);
      expect(new Set(winners).size).toBe(6);
    }
  });

  it('draws every remaining winner of a prize at once, all different', () => {
    const { session, slots } = drawWinners(fresh(), 2, 3, seeded(7));
    expect(slots).toEqual([0, 1, 2]);
    expect(new Set(session.prizes[2].slots.map((slot) => slot.person)).size).toBe(3);
    expect(remainingOf(session.prizes[2])).toBe(0);
    expect(defaultPrize(session)).toBe(1);
  });

  it('does not draw more than the prize has left', () => {
    const first = drawWinners(fresh(), 1, 1, seeded(3));
    const second = drawWinners(first.session, 1, 10, seeded(4));
    expect(second.slots).toEqual([1]);
    expect(drawWinners(second.session, 1, 1, seeded(5)).slots).toEqual([]);
  });

  it('stops when nobody is left to draw', () => {
    const session = startSession(['甲', '乙'], [{ name: '獎', quantity: 5 }], false);
    const result = drawWinners(session, 0, 5, seeded(1));
    expect(result.slots).toEqual([0, 1]);
    expect(eligible(result.session, 0)).toEqual([]);
    expect(drawWinners(result.session, 0, 1, seeded(2)).slots).toEqual([]);
  });

  it('leaves the session it was given untouched', () => {
    const session = fresh();
    const copy = structuredClone(session);
    drawWinners(session, 2, 3, seeded(9));
    expect(session).toEqual(copy);
  });

  it('lets a person win different prizes, but not one prize twice, when repeats are allowed', () => {
    const people = ['甲', '乙', '丙'];
    const prizes = [
      { name: 'A', quantity: 3 },
      { name: 'B', quantity: 3 },
    ];
    for (let seed = 1; seed <= 50; seed++) {
      const session = drawEverything(startSession(people, prizes, false), seeded(seed));
      for (const prize of session.prizes) expect(new Set(prize.slots.map((slot) => slot.person)).size).toBe(3);
    }
  });

  it('gives everyone the same chance', () => {
    const counts = new Array(PEOPLE.length).fill(0);
    const random = seeded(2026);
    const rounds = 16_000;
    const session = startSession(PEOPLE, [{ name: '獎', quantity: 1 }], true);
    for (let i = 0; i < rounds; i++) counts[drawWinners(session, 0, 1, random).session.prizes[0].slots[0].person]++;
    for (const count of counts) expect(Math.abs(count - rounds / PEOPLE.length)).toBeLessThan(200);
  });

  it('ignores a prize that does not exist', () => {
    const session = fresh();
    expect(drawWinners(session, 9, 1, seeded(1))).toEqual({ session, slots: [] });
  });
});

describe('redrawSlot', () => {
  it('replaces an absent winner with someone who has not won, and keeps them out for good', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const random = seeded(seed);
      const drawn = drawWinners(fresh(), 2, 3, random).session;
      const before = drawn.prizes[2].slots[1].person;
      const result = redrawSlot(drawn, 2, 1, random)!;
      const slot = result.session.prizes[2].slots[1];
      expect(result.absent).toBe(before);
      expect(slot.absent).toEqual([before]);
      expect(slot.person).not.toBe(before);
      expect(drawn.prizes[2].slots.map((s) => s.person)).not.toContain(slot.person);
      // The other slots are untouched and the absent person never comes back.
      expect(result.session.prizes[2].slots[0]).toEqual(drawn.prizes[2].slots[0]);
      const finished = drawEverything(result.session, random);
      expect(allWinners(finished)).not.toContain(before);
      expect(new Set(allWinners(finished)).size).toBe(6);
    }
  });

  it('remembers every absent winner of a slot in order', () => {
    const random = seeded(11);
    let session = drawWinners(fresh(), 0, 1, random).session;
    const first = session.prizes[0].slots[0].person;
    session = redrawSlot(session, 0, 0, random)!.session;
    const second = session.prizes[0].slots[0].person;
    session = redrawSlot(session, 0, 0, random)!.session;
    expect(session.prizes[0].slots[0].absent).toEqual([first, second]);
    expect(eligible(session, 0)).not.toContain(first);
    expect(eligible(session, 0)).not.toContain(second);
  });

  it('changes nothing when nobody is left to take the prize', () => {
    const session = drawEverything(startSession(['甲', '乙'], [{ name: '獎', quantity: 2 }], true), seeded(1));
    expect(redrawSlot(session, 0, 0, seeded(2))).toBeNull();
  });

  it('returns null for a slot that does not exist', () => {
    expect(redrawSlot(fresh(), 0, 0, seeded(1))).toBeNull();
    expect(redrawSlot(fresh(), 7, 0, seeded(1))).toBeNull();
  });

  it('keeps an absent person out even when repeats are allowed', () => {
    const random = seeded(5);
    let session = drawWinners(fresh(false), 2, 1, random).session;
    const absent = session.prizes[2].slots[0].person;
    session = redrawSlot(session, 2, 0, random)!.session;
    for (let prize = 0; prize < 3; prize++) expect(eligible(session, prize)).not.toContain(absent);
  });
});

describe('addBonusPrize', () => {
  it('adds the prize at the end, selects it and makes it the next to draw', () => {
    const finished = drawEverything(fresh(), seeded(21));
    expect(isFinished(finished)).toBe(true);
    const session = addBonusPrize(finished, '  總經理加碼  ', 2);
    expect(session.prizes).toHaveLength(4);
    expect(session.prizes[3]).toEqual({ name: '總經理加碼', quantity: 2, bonus: true, slots: [] });
    expect(session.current).toBe(3);
    expect(defaultPrize(session)).toBe(3);
    expect(isFinished(session)).toBe(false);
    expect(finished.prizes).toHaveLength(3);
  });

  it('draws the bonus prize from the people who have not won yet', () => {
    const random = seeded(33);
    const finished = drawEverything(fresh(), random);
    const earlier = allWinners(finished);
    const { session, slots } = drawWinners(addBonusPrize(finished, '加碼', 2), 3, 2, random);
    expect(slots).toEqual([0, 1]);
    for (const slot of session.prizes[3].slots) expect(earlier).not.toContain(slot.person);
  });

  it('cleans the quantity', () => {
    expect(addBonusPrize(fresh(), '加碼', 0).prizes[3].quantity).toBe(1);
    expect(addBonusPrize(fresh(), '加碼', 2.9).prizes[3].quantity).toBe(2);
    expect(addBonusPrize(fresh(), '加碼', NaN).prizes[3].quantity).toBe(1);
    expect(addBonusPrize(fresh(), '加碼', 5000).prizes[3].quantity).toBe(LIMITS.quantity);
  });
});

describe('spareCapacity', () => {
  it('counts the people a new prize could still go to', () => {
    // 8 people, 6 winners to draw: 2 are spare.
    expect(spareCapacity(fresh())).toBe(2);
    const finished = drawEverything(fresh(), seeded(4));
    expect(spareCapacity(finished)).toBe(2);
    expect(spareCapacity(addBonusPrize(finished, '加碼', 2))).toBe(0);
  });

  it('loses a place for every absent winner', () => {
    const random = seeded(8);
    const drawn = drawWinners(fresh(), 2, 1, random).session;
    expect(spareCapacity(redrawSlot(drawn, 2, 0, random)!.session)).toBe(1);
  });

  it('is everyone who is not absent when repeats are allowed', () => {
    const random = seeded(8);
    const drawn = drawWinners(fresh(false), 2, 3, random).session;
    expect(spareCapacity(drawn)).toBe(8);
    expect(spareCapacity(redrawSlot(drawn, 2, 0, random)!.session)).toBe(7);
  });
});

describe('results', () => {
  const session: Session = {
    participants: ['小明', '小美', '阿傑', '=SUM(A1)', '王, "大" 明'],
    prizes: [
      { name: '頭獎 現金一萬', quantity: 1, bonus: false, slots: [{ person: 1, absent: [0] }] },
      { name: '二獎', quantity: 2, bonus: false, slots: [{ person: 3, absent: [] }, { person: 4, absent: [] }] },
      { name: '加碼', quantity: 1, bonus: true, slots: [] },
    ],
    noRepeat: true,
    batch: 'one',
    current: 2,
  };

  it('formats one line per prize with the current winners', () => {
    expect(formatResults(session)).toBe('頭獎 現金一萬：小美\n二獎：=SUM(A1)、王, "大" 明\n加碼：尚未抽出');
  });

  it('formats with a caller-supplied line', () => {
    const text = formatResults(session, (prize, names) => `${prize.name} (${names.length}): ${names.join(', ')}`);
    expect(text.split('\n')[0]).toBe('頭獎 現金一萬 (1): 小美');
  });

  it('exports a CSV with a byte order mark, absent winners and CRLF line ends', () => {
    const csv = resultsCsv(session, CSV_LABELS);
    expect(csv.startsWith(CSV_BOM)).toBe(true);
    expect(csv.slice(1).split('\r\n')).toEqual([
      '獎項,序號,姓名,狀態',
      '頭獎 現金一萬,1,小明,不在場',
      '頭獎 現金一萬,1,小美,中獎',
      "二獎,1,'=SUM(A1),中獎",
      '二獎,2,"王, ""大"" 明",中獎',
      '',
    ]);
  });

  it('quotes cells and defuses formulas', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('line\nbreak')).toBe('"line\nbreak"');
    expect(csvCell('+886 912')).toBe("'+886 912");
    expect(csvCell('@home')).toBe("'@home");
    expect(csvCell(-3)).toBe('-3');
    expect(csvCell('普通')).toBe('普通');
  });
});

describe('normalizeSession', () => {
  it('round-trips a draw through JSON at every stage', () => {
    const random = seeded(77);
    let session = fresh();
    expect(normalizeSession(JSON.parse(JSON.stringify(session)))).toEqual(session);
    session = drawWinners(session, 2, 3, random).session;
    session = redrawSlot(session, 2, 0, random)!.session;
    session = addBonusPrize({ ...session, batch: 'all' }, '加碼', 1);
    session = drawWinners(session, 3, 1, random).session;
    expect(normalizeSession(JSON.parse(JSON.stringify(session)))).toEqual(session);
    const finished = drawEverything(session, random);
    expect(normalizeSession(JSON.parse(JSON.stringify(finished)))).toEqual(finished);
  });

  it('round-trips a draw where winners can repeat', () => {
    const session = drawEverything(fresh(false), seeded(12));
    expect(normalizeSession(JSON.parse(JSON.stringify(session)))).toEqual(session);
  });

  it('rejects anything that is not a draw', () => {
    expect(normalizeSession(null)).toBeNull();
    expect(normalizeSession('x')).toBeNull();
    expect(normalizeSession({})).toBeNull();
    expect(normalizeSession({ ...fresh(), participants: [] })).toBeNull();
    expect(normalizeSession({ ...fresh(), participants: ['小明', 3] })).toBeNull();
    expect(normalizeSession({ ...fresh(), prizes: [] })).toBeNull();
    expect(normalizeSession({ ...fresh(), prizes: [{ name: '', quantity: 1, slots: [] }] })).toBeNull();
    expect(normalizeSession({ ...fresh(), prizes: [{ name: '獎', quantity: 0, slots: [] }] })).toBeNull();
  });

  it('rejects impossible winners', () => {
    const base = fresh();
    const withSlots = (slots: unknown) => ({ ...base, prizes: [{ name: '獎', quantity: 2, bonus: false, slots }] });
    expect(normalizeSession(withSlots([{ person: 99, absent: [] }]))).toBeNull();
    expect(normalizeSession(withSlots([{ person: 0, absent: [] }, { person: 0, absent: [] }]))).toBeNull();
    expect(normalizeSession(withSlots([{ person: 0, absent: [] }, { person: 1, absent: [] }, { person: 2, absent: [] }]))).toBeNull();
    expect(normalizeSession(withSlots([{ person: 0, absent: [1] }, { person: 1, absent: [] }]))).toBeNull();
    expect(normalizeSession(withSlots([{ person: 0, absent: 'x' }]))).toBeNull();
    expect(normalizeSession(withSlots([{ person: 0, absent: [1] }]))).not.toBeNull();
  });

  it('rejects a repeat winner only when repeats are not allowed', () => {
    const prizes = [
      { name: 'A', quantity: 1, bonus: false, slots: [{ person: 0, absent: [] }] },
      { name: 'B', quantity: 1, bonus: false, slots: [{ person: 0, absent: [] }] },
    ];
    expect(normalizeSession({ ...fresh(), prizes, noRepeat: true })).toBeNull();
    expect(normalizeSession({ ...fresh(), prizes, noRepeat: false })).not.toBeNull();
  });

  it('repairs the options it can', () => {
    const session = normalizeSession({ ...fresh(), batch: 'weird', current: 42 })!;
    expect(session.batch).toBe('one');
    expect(session.current).toBe(2);
  });
});

describe('normalizeDraft', () => {
  it('keeps what was typed and defaults the options to on', () => {
    expect(normalizeDraft(null)).toEqual({ people: '', prizes: '', noRepeat: true, dedupe: true });
    const draft = { people: '小明\n小美', prizes: '頭獎 x1', noRepeat: false, dedupe: false };
    expect(normalizeDraft(JSON.parse(JSON.stringify(draft)))).toEqual(draft);
    expect(normalizeDraft({ people: 5, prizes: null })).toEqual({ people: '', prizes: '', noRepeat: true, dedupe: true });
  });
});

describe('fitNames', () => {
  const options = { gap: 14, padX: 24, extraY: 60, max: 198, min: 14 };

  it('shows one short name at the largest size', () => {
    expect(fitNames(1, 3, 1300, 460, options)).toEqual({ columns: 1, lines: 1, size: 198 });
  });

  it('keeps a long name on one line while that costs little size', () => {
    const fit = fitNames(1, 7, 1300, 460, options);
    expect(fit).toEqual({ columns: 1, lines: 1, size: 171 });
  });

  it('wraps a very long name when that makes the type much larger', () => {
    const fit = fitNames(1, 20, 1300, 460, options);
    expect(fit.columns).toBe(1);
    expect(fit.lines).toBe(2);
    // Two lines of ten characters fit the width, and both lines fit the height.
    expect(fit.size * 10).toBeLessThanOrEqual(1300 - 24);
    expect(fit.size * 2 * 1.15 + 60).toBeLessThanOrEqual(460);
    expect(fit.size).toBeGreaterThan(90);
  });

  it('fits ten names inside the area', () => {
    const fit = fitNames(10, 3, 1300, 460, options);
    const rows = Math.ceil(10 / fit.columns);
    const cardWidth = (1300 - (fit.columns - 1) * 14) / fit.columns;
    expect(fit.size * 3).toBeLessThanOrEqual(cardWidth - 24);
    expect(rows * (fit.size * fit.lines * 1.15 + 60) + (rows - 1) * 14).toBeLessThanOrEqual(460);
    expect(fit.size).toBeGreaterThan(40);
  });

  it('wraps a long name on a narrow page that can grow', () => {
    const fit = fitNames(1, 20, 330, Infinity, { ...options, max: 64 });
    expect(fit.lines).toBeGreaterThan(1);
    expect(fit.size).toBeGreaterThanOrEqual(24);
  });

  it('keeps rows short and even when the page can grow', () => {
    expect(fitNames(10, 3, 720, Infinity, { gap: 10, padX: 18, extraY: 40, max: 32, min: 14 })).toEqual({ columns: 5, lines: 1, size: 32 });
    expect(fitNames(10, 3, 330, Infinity, { gap: 10, padX: 18, extraY: 40, max: 32, min: 14 }).columns).toBe(2);
  });

  it('does not wrap names for a small gain in size', () => {
    // Five three-character names on an upright phone: three across on one line each, not five columns of stacked characters.
    const fit = fitNames(5, 3, 359, 200, { gap: 12, padX: 24, extraY: 60, max: 170, min: 14 });
    expect(fit.lines).toBe(1);
    expect(fit.columns).toBe(3);
  });

  it('does not wrap a name into lines narrower than its longest word', () => {
    // 「Maximilian Rodriguez」: about 10.5em wide, longest word about 5.5em.
    const loose = fitNames(10, 10.5, 1325, 430, { ...options, max: 198 });
    const fit = fitNames(10, 10.5, 1325, 430, { ...options, max: 198, wordEm: 5.5 });
    const cardWidth = (1325 - (fit.columns - 1) * 14) / fit.columns - 24;
    expect(fit.lines === 1 || fit.size * 5.5 <= cardWidth).toBe(true);
    expect(fit.size).toBeLessThanOrEqual(loose.size);
  });

  it('never goes below the smallest size', () => {
    expect(fitNames(200, 12, 300, 200, options).size).toBe(14);
  });
});

describe('unbreakableParts', () => {
  it('keeps Latin words whole and lets CJK break anywhere', () => {
    expect(unbreakableParts('Maximilian Rodriguez')).toEqual(['Maximilian', 'Rodriguez']);
    expect(unbreakableParts('王小明')).toEqual(['王', '小', '明']);
    expect(unbreakableParts('業務部 Amy王 A123')).toEqual(['業', '務', '部', 'Amy', '王', 'A123']);
    expect(unbreakableParts('  ')).toEqual([]);
  });
});

describe('estimateEm', () => {
  it('counts CJK and full-width characters as one em and Latin letters as less', () => {
    expect(estimateEm('王小明')).toBe(3);
    expect(estimateEm('ＡＢ')).toBe(2);
    expect(estimateEm('Alex')).toBeCloseTo(2.48);
    expect(estimateEm('さとう')).toBe(3);
  });
});

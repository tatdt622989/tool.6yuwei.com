import { describe, expect, it } from 'vitest';
import {
  AGE_OPTIONS,
  ballotsFor,
  ELECTION,
  electionPhase,
  formatRemaining,
  MOUNTAIN_DISTRICTS,
  REFERENDUM,
  RESIDENCE_OPTIONS,
  type VoterInput,
} from './logic';

const tpe = (y: number, m: number, d: number, h = 0, min = 0, s = 0) => Date.UTC(y, m - 1, d, h - 8, min, s);
const voter = (over: Partial<VoterInput> = {}): VoterInput => ({
  residence: 'municipality',
  age: '20plus',
  indigenous: 'none',
  residedFourMonths: true,
  ...over,
});
const titles = (input: VoterInput) => ballotsFor(input).ballots.map((b) => b.title);

describe('投票時間', () => {
  it('polls open 2026-11-28 08:00 and close 16:00 Taiwan time', () => {
    expect(ELECTION.opens).toBe(Date.UTC(2026, 10, 28, 0));
    expect(ELECTION.closes).toBe(Date.UTC(2026, 10, 28, 8));
    expect(new Date(ELECTION.opens + 8 * 3_600_000).getUTCDay()).toBe(6); // 星期六
  });

  it('counts down to the opening before the day', () => {
    const p = electionPhase(tpe(2026, 10, 29, 8));
    expect(p.phase).toBe('before');
    expect(p.daysUntil).toBe(30);
    expect(p.remaining).toBe(30 * 86_400_000);
    expect(formatRemaining(p.remaining)).toBe('30 天 00:00:00');
  });

  it('is still "before" at 07:59:59 on the day', () => {
    const p = electionPhase(tpe(2026, 11, 28, 7, 59, 59));
    expect(p.phase).toBe('before');
    expect(p.daysUntil).toBe(0);
    expect(formatRemaining(p.remaining)).toBe('00:00:01');
  });

  it('counts down to 16:00 while voting', () => {
    const p = electionPhase(tpe(2026, 11, 28, 8));
    expect(p.phase).toBe('voting');
    expect(formatRemaining(p.remaining)).toBe('08:00:00');
    expect(electionPhase(tpe(2026, 11, 28, 15, 59, 59)).phase).toBe('voting');
  });

  it('is closed from 16:00 on, and stays closed afterwards', () => {
    expect(electionPhase(tpe(2026, 11, 28, 16)).phase).toBe('closed');
    const later = electionPhase(tpe(2027, 3, 1));
    expect(later.phase).toBe('closed');
    expect(later.remaining).toBe(0);
  });
});

describe('我可以領幾張票', () => {
  it('直轄市一般區：市長、議員、里長 + 公投 = 4', () => {
    const r = ballotsFor(voter());
    expect(r.ballots.map((b) => b.title)).toEqual(['直轄市長', '直轄市議員', '里長', '全國性公民投票第 22 案']);
    expect(r.electionCount).toBe(3);
    expect(r.referendumCount).toBe(1);
    expect(r.summary).toBe('共 4 張：選舉票 3 張＋公投票 1 張');
  });

  it('直轄市山地原住民區：5 張選舉票 + 公投 = 6', () => {
    const r = ballotsFor(voter({ residence: 'mountain-district' }));
    expect(r.ballots.map((b) => b.title)).toEqual([
      '直轄市長',
      '直轄市議員',
      '山地原住民區長',
      '山地原住民區區民代表',
      '里長',
      '全國性公民投票第 22 案',
    ]);
    expect(r.electionCount).toBe(5);
  });

  it('縣的鄉鎮：縣長、縣議員、鄉鎮長、代表、村里長 + 公投 = 6', () => {
    expect(titles(voter({ residence: 'township' }))).toEqual([
      '縣長',
      '縣議員',
      '鄉（鎮）長',
      '鄉（鎮）民代表',
      '村（里）長',
      '全國性公民投票第 22 案',
    ]);
  });

  it('縣轄市：縣長、縣議員、市長、市民代表、里長 + 公投 = 6', () => {
    expect(titles(voter({ residence: 'county-city' }))).toEqual([
      '縣長',
      '縣議員',
      '縣轄市長',
      '市民代表',
      '里長',
      '全國性公民投票第 22 案',
    ]);
  });

  it('基隆、新竹、嘉義市：市長、市議員、里長 + 公投 = 4', () => {
    expect(titles(voter({ residence: 'city' }))).toEqual(['市長', '市議員', '里長', '全國性公民投票第 22 案']);
  });

  it('18–19 歲只有公投票', () => {
    for (const option of RESIDENCE_OPTIONS) {
      const r = ballotsFor(voter({ residence: option.value, age: '18-19' }));
      expect(r.ballots).toHaveLength(1);
      expect(r.ballots[0].kind).toBe('referendum');
      expect(r.summary).toBe('共 1 張：公投票 1 張');
    }
  });

  it('未滿 18 歲沒有任何選票', () => {
    const r = ballotsFor(voter({ age: 'under18' }));
    expect(r.ballots).toHaveLength(0);
    expect(r.summary).toBe('這次沒有選票');
  });

  it('20 歲以上但遷入未滿 4 個月：只能投公投', () => {
    const r = ballotsFor(voter({ residence: 'township', residedFourMonths: false }));
    expect(r.electionCount).toBe(0);
    expect(r.referendumCount).toBe(1);
    expect(r.notes.join('')).toContain('7 月 29 日');
  });

  it('原住民身分改變議員票的種類，不改變張數', () => {
    for (const option of RESIDENCE_OPTIONS) {
      const plain = ballotsFor(voter({ residence: option.value }));
      for (const indigenous of ['plains', 'mountain'] as const) {
        const r = ballotsFor(voter({ residence: option.value, indigenous }));
        expect(r.ballots.length).toBe(plain.ballots.length);
        const council = r.ballots.find((b) => b.id === 'council')!;
        expect(council.detail).toContain(indigenous === 'plains' ? '平地原住民議員' : '山地原住民議員');
      }
    }
    expect(ballotsFor(voter({ indigenous: 'mountain' })).notes.join('')).toContain('秘密投票');
  });

  it('every ballot has a unique id per voter', () => {
    for (const option of RESIDENCE_OPTIONS) {
      const ids = ballotsFor(voter({ residence: option.value })).ballots.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe('reference data', () => {
  it('quotes the referendum question verbatim', () => {
    expect(REFERENDUM.number).toBe(22);
    expect(REFERENDUM.question).toBe('你是否支持政府使用「核電」振興經濟，以廢除「非核家園」的能源政策？');
  });

  it('lists the six 直轄市山地原住民區', () => {
    expect(MOUNTAIN_DISTRICTS).toHaveLength(6);
  });

  it('age cut-offs are 投票日 minus 20 / 18 years (age counted to the day before)', () => {
    expect(ELECTION.bornBy20).toBe('2006-11-28');
    expect(ELECTION.bornBy18).toBe('2008-11-28');
    expect(AGE_OPTIONS[0].hint).toContain('2006 年 11 月 28 日（含）以前');
  });
});

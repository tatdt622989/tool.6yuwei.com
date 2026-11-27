import { describe, expect, it } from 'vitest';
import {
  clampYears,
  cohortRange,
  elementaryEntryYear,
  eventWord,
  findLastSchool,
  formatDateJa,
  formatYearMonth,
  fromJuniorHighEnd,
  isExpected,
  isSupportedBirth,
  LAST_SCHOOLS,
  resumeLines,
  resumeRows,
  schoolTimeline,
  STAGES,
  targetStage,
  warekiYearOfMonth,
  type LastSchool,
  type SchoolEvent,
} from './logic';

const ymd = (y: number, m: number, d: number) => ({ y, m, d });
/** 「高等学校 入学 2020/4」 */
const brief = (events: SchoolEvent[] | null) => (events ?? []).map((e) => `${STAGES[e.stage].name} ${eventWord(e)} ${e.y}/${e.m}`);
const yearsOf = (events: SchoolEvent[] | null) => (events ?? []).map((e) => e.y);

describe('elementaryEntryYear: 4月1日・4月2日・12月31日・1月1日', () => {
  it('4月2日生まれ is the oldest of its school year (birth year + 7)', () => {
    expect(elementaryEntryYear(ymd(2004, 4, 2))).toBe(2011);
  });

  it('12月31日生まれ enters in birth year + 7', () => {
    expect(elementaryEntryYear(ymd(2004, 12, 31))).toBe(2011);
  });

  it('1月1日生まれ (早生まれ) enters in birth year + 6', () => {
    expect(elementaryEntryYear(ymd(2005, 1, 1))).toBe(2011);
  });

  it('4月1日生まれ counts as 早生まれ (birth year + 6)', () => {
    expect(elementaryEntryYear(ymd(2005, 4, 1))).toBe(2011);
    // one day apart, one school year apart
    expect(elementaryEntryYear(ymd(2005, 4, 2))).toBe(2012);
  });

  it('the days around the boundaries', () => {
    expect(elementaryEntryYear(ymd(2004, 4, 1))).toBe(2010);
    expect(elementaryEntryYear(ymd(2004, 3, 31))).toBe(2010);
    expect(elementaryEntryYear(ymd(2004, 2, 29))).toBe(2010);
    expect(elementaryEntryYear(ymd(2004, 4, 3))).toBe(2011);
    expect(elementaryEntryYear(ymd(2004, 12, 30))).toBe(2011);
    expect(elementaryEntryYear(ymd(2005, 1, 2))).toBe(2011);
  });

  it('matches the example in the wareki-converter copy (2018-04-02 and 2019-04-01 both enter in April 2025)', () => {
    expect(elementaryEntryYear(ymd(2018, 4, 2))).toBe(2025);
    expect(elementaryEntryYear(ymd(2019, 4, 1))).toBe(2025);
  });
});

describe('cohortRange', () => {
  it('runs from 4月2日 to 4月1日 of the next year and contains the birth date', () => {
    const range = { from: ymd(2004, 4, 2), to: ymd(2005, 4, 1) };
    for (const birth of [ymd(2004, 4, 2), ymd(2004, 12, 31), ymd(2005, 1, 1), ymd(2005, 4, 1)]) {
      expect(cohortRange(birth)).toEqual(range);
    }
    expect(cohortRange(ymd(2005, 4, 2))).toEqual({ from: ymd(2005, 4, 2), to: ymd(2006, 4, 1) });
    expect(cohortRange(ymd(2004, 4, 1))).toEqual({ from: ymd(2003, 4, 2), to: ymd(2004, 4, 1) });
  });
});

describe('schoolTimeline: standard path', () => {
  it('小学校6年・中学校3年・高校3年・大学4年, 入学 in April and 卒業 in March', () => {
    expect(brief(schoolTimeline(ymd(2004, 4, 2)))).toEqual([
      '小学校 入学 2011/4',
      '小学校 卒業 2017/3',
      '中学校 入学 2017/4',
      '中学校 卒業 2020/3',
      '高等学校 入学 2020/4',
      '高等学校 卒業 2023/3',
      '大学 入学 2023/4',
      '大学 卒業 2027/3',
    ]);
  });

  it('gives the same years to everyone in the school year', () => {
    const expected = [2011, 2017, 2017, 2020, 2020, 2023, 2023, 2027];
    expect(yearsOf(schoolTimeline(ymd(2004, 4, 2)))).toEqual(expected);
    expect(yearsOf(schoolTimeline(ymd(2004, 12, 31)))).toEqual(expected);
    expect(yearsOf(schoolTimeline(ymd(2005, 1, 1)))).toEqual(expected);
    expect(yearsOf(schoolTimeline(ymd(2005, 4, 1)))).toEqual(expected);
  });

  it('4月1日生まれ is a year ahead of 4月2日生まれ of the same year', () => {
    expect(yearsOf(schoolTimeline(ymd(2004, 4, 1)))).toEqual([2010, 2016, 2016, 2019, 2019, 2022, 2022, 2026]);
  });

  it('defaults to 大学（4年）with no 浪人 or 留年', () => {
    expect(schoolTimeline(ymd(2004, 4, 2))).toEqual(schoolTimeline(ymd(2004, 4, 2), { last: 'university', ronin: 0, extra: 0 }));
  });
});

describe('schoolTimeline: last school', () => {
  const tail = (last: LastSchool, ronin = 0, extra = 0) => brief(schoolTimeline(ymd(2004, 4, 2), { last, ronin, extra })).slice(4);

  it('高校まで', () => {
    expect(tail('high')).toEqual(['高等学校 入学 2020/4', '高等学校 卒業 2023/3']);
  });

  it('短大 2年', () => {
    expect(tail('juniorCollege')).toEqual(['高等学校 入学 2020/4', '高等学校 卒業 2023/3', '短期大学 入学 2023/4', '短期大学 卒業 2025/3']);
  });

  it('専門学校 2年', () => {
    expect(tail('vocational')).toEqual(['高等学校 入学 2020/4', '高等学校 卒業 2023/3', '専門学校 入学 2023/4', '専門学校 卒業 2025/3']);
  });

  it('大学 6年制', () => {
    expect(tail('university6')).toEqual(['高等学校 入学 2020/4', '高等学校 卒業 2023/3', '大学 入学 2023/4', '大学 卒業 2029/3']);
  });

  it('大学院 修士 = 大学4年 + 2年, ending with 修了', () => {
    expect(tail('graduate')).toEqual([
      '高等学校 入学 2020/4',
      '高等学校 卒業 2023/3',
      '大学 入学 2023/4',
      '大学 卒業 2027/3',
      '大学院 修士課程 入学 2027/4',
      '大学院 修士課程 修了 2029/3',
    ]);
  });

  it('高専 5年 replaces 高校', () => {
    expect(tail('kosen')).toEqual(['高等専門学校 入学 2020/4', '高等専門学校 卒業 2025/3']);
  });

  it('an unknown id falls back to 大学（4年）', () => {
    expect(findLastSchool('nope').id).toBe('university');
    expect(schoolTimeline(ymd(2004, 4, 2), { last: 'nope' as LastSchool })).toEqual(schoolTimeline(ymd(2004, 4, 2)));
  });

  it('every menu entry has a target school inside its path and whole-year lengths', () => {
    expect(new Set(LAST_SCHOOLS.map((o) => o.id)).size).toBe(LAST_SCHOOLS.length);
    for (const o of LAST_SCHOOLS) {
      expect(o.path[o.target], o.id).toBeDefined();
      for (const s of o.path) expect(Number.isInteger(s.years) && s.years > 0, o.id).toBe(true);
    }
  });

  it('standard lengths', () => {
    expect(STAGES.elementary.years).toBe(6);
    expect(STAGES.juniorHigh.years).toBe(3);
    expect(STAGES.high.years).toBe(3);
    expect(STAGES.university.years).toBe(4);
    expect(STAGES.juniorCollege.years).toBe(2);
    expect(STAGES.vocational.years).toBe(2);
    expect(STAGES.graduate.years).toBe(2);
    expect(STAGES.kosen.years).toBe(5);
  });
});

describe('schoolTimeline: 浪人 and 留年・休学', () => {
  const birth = ymd(2004, 4, 2);
  const tail = (last: LastSchool, ronin: number, extra: number) => brief(schoolTimeline(birth, { last, ronin, extra })).slice(6);

  it('浪人 delays entering the school after 高校 and everything after it', () => {
    expect(tail('university', 1, 0)).toEqual(['大学 入学 2024/4', '大学 卒業 2028/3']);
    expect(tail('university', 2, 0)).toEqual(['大学 入学 2025/4', '大学 卒業 2029/3']);
  });

  it('留年・休学 delays only the graduation', () => {
    expect(tail('university', 0, 1)).toEqual(['大学 入学 2023/4', '大学 卒業 2028/3']);
  });

  it('both add up', () => {
    expect(tail('university', 1, 2)).toEqual(['大学 入学 2024/4', '大学 卒業 2030/3']);
    expect(tail('vocational', 5, 5)).toEqual(['専門学校 入学 2028/4', '専門学校 卒業 2035/3']);
  });

  it('never moves 小学校・中学校・高校 when a later school is chosen', () => {
    const base = brief(schoolTimeline(birth)).slice(0, 6);
    expect(brief(schoolTimeline(birth, { ronin: 3, extra: 2 })).slice(0, 6)).toEqual(base);
  });

  it('for 大学院 they apply to 大学, and 大学院 follows', () => {
    expect(tail('graduate', 1, 1)).toEqual([
      '大学 入学 2024/4',
      '大学 卒業 2029/3',
      '大学院 修士課程 入学 2029/4',
      '大学院 修士課程 修了 2031/3',
    ]);
    expect(targetStage('graduate').id).toBe('university');
  });

  it('for 高校まで and 高専 they apply to that school', () => {
    expect(brief(schoolTimeline(birth, { last: 'high', ronin: 1, extra: 1 })).slice(4)).toEqual(['高等学校 入学 2021/4', '高等学校 卒業 2025/3']);
    expect(brief(schoolTimeline(birth, { last: 'kosen', ronin: 0, extra: 1 })).slice(4)).toEqual(['高等専門学校 入学 2020/4', '高等専門学校 卒業 2026/3']);
    expect(targetStage('high').id).toBe('high');
    expect(targetStage('kosen').id).toBe('kosen');
    expect(targetStage('juniorCollege').id).toBe('juniorCollege');
  });

  it('clamps to whole years between 0 and 5', () => {
    expect(clampYears(-1)).toBe(0);
    expect(clampYears(2.9)).toBe(2);
    expect(clampYears(9)).toBe(5);
    expect(clampYears(Number.NaN)).toBe(0);
    expect(schoolTimeline(birth, { ronin: 99, extra: -3 })).toEqual(schoolTimeline(birth, { ronin: 5, extra: 0 }));
  });

  it('events stay in chronological order', () => {
    for (const o of LAST_SCHOOLS) {
      for (const ronin of [0, 1, 5]) {
        for (const extra of [0, 2, 5]) {
          const t = (schoolTimeline(birth, { last: o.id, ronin, extra }) ?? []).map((e) => e.y * 12 + e.m);
          expect(t, `${o.id} ${ronin} ${extra}`).toEqual([...t].sort((a, b) => a - b));
        }
      }
    }
  });
});

describe('supported birth dates', () => {
  it('starts with the first school year of the 6・3・3 制 (小学校入学 1947年4月)', () => {
    expect(isSupportedBirth(ymd(1940, 4, 2))).toBe(true);
    expect(elementaryEntryYear(ymd(1940, 4, 2))).toBe(1947);
    expect(isSupportedBirth(ymd(1940, 4, 1))).toBe(false);
    expect(schoolTimeline(ymd(1940, 4, 1))).toBeNull();
    expect(schoolTimeline(ymd(1939, 12, 31))).toBeNull();
  });

  it('rejects impossible dates', () => {
    expect(schoolTimeline(ymd(2005, 2, 29))).toBeNull();
    expect(schoolTimeline(ymd(2004, 2, 30))).toBeNull();
    expect(schoolTimeline(ymd(2004, 13, 1))).toBeNull();
    expect(schoolTimeline(ymd(2004.5, 1, 1))).toBeNull();
    expect(schoolTimeline(ymd(2101, 1, 1))).toBeNull();
  });

  it('accepts a leap day (早生まれ)', () => {
    expect(yearsOf(schoolTimeline(ymd(2004, 2, 29), { last: 'high' }))).toEqual([2010, 2016, 2016, 2019, 2019, 2022]);
  });
});

describe('和暦: era boundaries', () => {
  it('April 2019 is 平成31年, May 2019 is 令和元年, March 2020 is 令和2年', () => {
    expect(warekiYearOfMonth(2019, 3)).toBe('平成31年');
    expect(warekiYearOfMonth(2019, 4)).toBe('平成31年');
    expect(warekiYearOfMonth(2019, 5)).toBe('令和元年');
    expect(warekiYearOfMonth(2020, 3)).toBe('令和2年');
    expect(warekiYearOfMonth(2020, 4)).toBe('令和2年');
  });

  it('March and April 1989 are 平成元年 (the era changed on 1989-01-08), 1988 is 昭和63年', () => {
    expect(warekiYearOfMonth(1988, 4)).toBe('昭和63年');
    expect(warekiYearOfMonth(1989, 3)).toBe('平成元年');
    expect(warekiYearOfMonth(1989, 4)).toBe('平成元年');
    expect(warekiYearOfMonth(1990, 3)).toBe('平成2年');
  });

  it('never writes 令和元年 for a 入学 or 卒業: the class of 2019 entered in 平成31年4月 and left in 平成31年3月', () => {
    // 2012年4月2日生まれ: 小学校入学 2019年4月
    const child = schoolTimeline(ymd(2012, 4, 2), { last: 'high' })!;
    expect(formatYearMonth(child[0].y, child[0].m)).toBe('2019年（平成31年）4月');
    expect(formatYearMonth(child[1].y, child[1].m)).toBe('2025年（令和7年）3月');
    // 2000年4月2日生まれ: 高校卒業 2019年3月、大学入学 2019年4月、1浪なら 2020年4月
    const adult = schoolTimeline(ymd(2000, 4, 2))!;
    expect(resumeLines(adult.slice(5, 7))).toEqual(['2019年（平成31年）3月　○○高等学校 卒業', '2019年（平成31年）4月　○○大学 入学']);
    const ronin = schoolTimeline(ymd(2000, 4, 2), { ronin: 1 })!;
    expect(formatYearMonth(ronin[6].y, ronin[6].m)).toBe('2020年（令和2年）4月');
    // 2001年4月2日生まれ: 高校卒業 2020年3月 = 令和2年3月
    const next = schoolTimeline(ymd(2001, 4, 2), { last: 'high' })!;
    expect(formatYearMonth(next[5].y, next[5].m)).toBe('2020年（令和2年）3月');
    // 4月1日生まれ（早生まれ）の 2013年4月1日生まれも 2019年4月 = 平成31年4月 に小学校入学
    const early = schoolTimeline(ymd(2013, 4, 1), { last: 'high' })!;
    expect(formatYearMonth(early[0].y, early[0].m, 'wareki')).toBe('平成31年（2019年）4月');
    for (const e of [...child, ...adult, ...ronin, ...next, ...early]) expect(warekiYearOfMonth(e.y, e.m)).not.toBe('令和元年');
  });

  it('昭和 to 平成: 1970年4月2日生まれ leaves 高校 in 平成元年3月', () => {
    const t = schoolTimeline(ymd(1970, 4, 2))!;
    expect(resumeLines(t.slice(4, 8), 'wareki')).toEqual([
      '昭和61年（1986年）4月　○○高等学校 入学',
      '平成元年（1989年）3月　○○高等学校 卒業',
      '平成元年（1989年）4月　○○大学 入学',
      '平成5年（1993年）3月　○○大学 卒業',
    ]);
  });
});

describe('formatting', () => {
  it('formatYearMonth in both orders, with one or two calendars', () => {
    expect(formatYearMonth(2015, 4)).toBe('2015年（平成27年）4月');
    expect(formatYearMonth(2015, 4, 'wareki')).toBe('平成27年（2015年）4月');
    expect(formatYearMonth(2015, 4, 'ad', false)).toBe('2015年4月');
    expect(formatYearMonth(2015, 4, 'wareki', false)).toBe('平成27年4月');
    expect(formatYearMonth(2027, 3, 'wareki')).toBe('令和9年（2027年）3月');
  });

  it('fromJuniorHighEnd keeps 中学校卒業 and everything after it', () => {
    const t = fromJuniorHighEnd(schoolTimeline(ymd(2004, 4, 2))!);
    expect(brief(t)).toEqual(['中学校 卒業 2020/3', '高等学校 入学 2020/4', '高等学校 卒業 2023/3', '大学 入学 2023/4', '大学 卒業 2027/3']);
  });

  it('resumeLines writes one line per event with a blank school name', () => {
    const t = fromJuniorHighEnd(schoolTimeline(ymd(2004, 4, 2), { last: 'graduate' })!);
    expect(resumeLines(t)).toEqual([
      '2020年（令和2年）3月　○○中学校 卒業',
      '2020年（令和2年）4月　○○高等学校 入学',
      '2023年（令和5年）3月　○○高等学校 卒業',
      '2023年（令和5年）4月　○○大学 入学',
      '2027年（令和9年）3月　○○大学 卒業',
      '2027年（令和9年）4月　○○大学大学院 修士課程 入学',
      '2029年（令和11年）3月　○○大学大学院 修士課程 修了',
    ]);
    expect(resumeLines(t.slice(0, 2), 'wareki', false)).toEqual(['令和2年3月　○○中学校 卒業', '令和2年4月　○○高等学校 入学']);
    expect(resumeLines(t.slice(0, 1), 'ad', false)).toEqual(['2020年3月　○○中学校 卒業']);
  });

  it('writes 卒業見込み / 修了見込み on the last line while the graduation is still ahead', () => {
    const t = schoolTimeline(ymd(2004, 4, 2))!;
    const last = (today: { y: number; m: number }, events = t) => resumeLines(events, 'ad', true, today).at(-1);
    expect(last({ y: 2026, m: 11 })).toBe('2027年（令和9年）3月　○○大学 卒業見込み');
    expect(last({ y: 2027, m: 3 })).toBe('2027年（令和9年）3月　○○大学 卒業見込み');
    expect(last({ y: 2027, m: 4 })).toBe('2027年（令和9年）3月　○○大学 卒業');
    expect(last({ y: 2030, m: 1 })).toBe('2027年（令和9年）3月　○○大学 卒業');
    const grad = schoolTimeline(ymd(2004, 4, 2), { last: 'graduate' })!;
    expect(last({ y: 2026, m: 11 }, grad)).toBe('2029年（令和11年）3月　○○大学大学院 修士課程 修了見込み');
    // only the last line changes, and nothing changes without a date
    const lines = resumeLines(grad, 'ad', true, { y: 2020, m: 1 });
    expect(lines.filter((l) => l.endsWith('見込み'))).toHaveLength(1);
    expect(resumeLines(grad).some((l) => l.includes('見込み'))).toBe(false);
  });

  it('resumeRows keeps the year-month and the school apart, and resumeLines joins them', () => {
    const t = fromJuniorHighEnd(schoolTimeline(ymd(2004, 4, 2))!);
    const rows = resumeRows(t, 'wareki', true, { y: 2026, m: 11 });
    expect(rows[0]).toEqual({ when: '令和2年（2020年）3月', what: '○○中学校 卒業' });
    expect(rows.at(-1)).toEqual({ when: '令和9年（2027年）3月', what: '○○大学 卒業見込み' });
    expect(resumeLines(t, 'wareki', true, { y: 2026, m: 11 })).toEqual(rows.map((r) => `${r.when}　${r.what}`));
  });

  it('isExpected is false for a 入学 and for a past 卒業', () => {
    const t = schoolTimeline(ymd(2004, 4, 2))!;
    expect(isExpected(t[6], { y: 2020, m: 1 })).toBe(false); // 大学 入学
    expect(isExpected(t[7], { y: 2020, m: 1 })).toBe(true);
    expect(isExpected(t[7], { y: 2027, m: 4 })).toBe(false);
  });

  it('formatDateJa', () => {
    expect(formatDateJa(ymd(2004, 4, 2))).toBe('2004年4月2日');
  });
});

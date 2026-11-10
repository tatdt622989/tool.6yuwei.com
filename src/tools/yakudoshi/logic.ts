// 厄年（前厄・本厄・後厄）の判定と早見表. Pure functions; the year to check is always passed in.
//
// Rules (checked 2026-11-10):
// - 数え年 = 調べる年 − 生まれ年 + 1（生まれた年を1歳とし、元日ごとに1歳加える）。誕生日は関係しない。
// - 本厄: 男性 25・42・61歳、女性 19・33・37・61歳（いずれも数え年）。男性42歳と女性33歳が大厄。
//   神社本庁「厄祓い」の案内（https://www.jinjahoncho.or.jp/omairi/yakubarai/）など広く使われている年齢で、
//   女性の61歳は含めない神社もある。
// - 前厄 = 本厄の前年、後厄 = 本厄の翌年。
// - 立春や旧正月で年を区切る神社・寺院、満年齢で数える寺社、独自の年齢を使う地域もある。
//   このツールは元日区切りの数え年だけを扱い、画面と説明文でその旨を案内する。

import { warekiYearsText } from '../wareki-converter/logic';

export type Sex = 'male' | 'female';
export type YakuKind = 'mae' | 'hon' | 'ato';

/** 本厄の数え年. */
export const HONYAKU_AGES: Readonly<Record<Sex, readonly number[]>> = {
  male: [25, 42, 61],
  female: [19, 33, 37, 61],
};

/** 大厄（本厄のうち特に重いとされる年）の数え年. */
export const TAIYAKU_AGE: Readonly<Record<Sex, number>> = { male: 42, female: 33 };

export const KIND_LABEL: Readonly<Record<YakuKind, string>> = { mae: '前厄', hon: '本厄', ato: '後厄' };
export const SEX_LABEL: Readonly<Record<Sex, string>> = { male: '男性', female: '女性' };

/** Years offered in the 「調べる年」 menu. */
export const YEAR_MIN = 2026;
export const YEAR_MAX = 2035;
export const DEFAULT_YEAR = 2027;

const OFFSET: Readonly<Record<YakuKind, number>> = { mae: -1, hon: 0, ato: 1 };
const KINDS: readonly YakuKind[] = ['mae', 'hon', 'ato'];

/** 数え年 in `year` for someone born in `birthYear` (0 or less = not born yet). */
export function kazoeAge(birthYear: number, year: number): number {
  return year - birthYear + 1;
}

/** Birth year of the people whose 数え年 is `kazoe` in `year`. */
export function birthYearForKazoe(kazoe: number, year: number): number {
  return year - kazoe + 1;
}

/** 満年齢 in `year`: before and after that year's birthday. `before` is null in the birth year itself. */
export function manAge(birthYear: number, year: number): { before: number | null; after: number } {
  const after = year - birthYear;
  return { before: after >= 1 ? after - 1 : null, after };
}

export interface YakuEntry {
  kind: YakuKind;
  /** 数え年 in that year. */
  kazoe: number;
  /** 数え年 of the 本厄 this entry belongs to (前厄 41 → 42). */
  honAge: number;
  /** True when the 本厄 it belongs to is the 大厄 (男性42歳・女性33歳). */
  taiyaku: boolean;
  /** Calendar year. */
  year: number;
}

/** Every 前厄・本厄・後厄 of a lifetime, oldest first (男性 9 entries, 女性 12). */
export function lifetimeYakudoshi(birthYear: number, sex: Sex): YakuEntry[] {
  if (!Number.isInteger(birthYear)) return [];
  return HONYAKU_AGES[sex].flatMap((honAge) =>
    KINDS.map((kind) => {
      const kazoe = honAge + OFFSET[kind];
      return { kind, kazoe, honAge, taiyaku: honAge === TAIYAKU_AGE[sex], year: birthYear + kazoe - 1 };
    }),
  );
}

/** The 厄年 entry for `year`, or null when that year is not a 厄年 (or the inputs are not whole years). */
export function yakuStatus(birthYear: number, sex: Sex, year: number): YakuEntry | null {
  if (!Number.isInteger(year)) return null;
  return lifetimeYakudoshi(birthYear, sex).find((e) => e.year === year) ?? null;
}

/** The first 厄年 after `year`, or null when all of them have passed. */
export function nextYakudoshi(birthYear: number, sex: Sex, year: number): YakuEntry | null {
  return lifetimeYakudoshi(birthYear, sex).find((e) => e.year > year) ?? null;
}

export interface HayamiCell {
  kind: YakuKind;
  kazoe: number;
  birthYear: number;
  /** 「昭和61年」「昭和64年／平成元年」 */
  wareki: string;
}

export interface HayamiRow {
  /** 数え年 of the 本厄 in this row. */
  honAge: number;
  taiyaku: boolean;
  mae: HayamiCell;
  hon: HayamiCell;
  ato: HayamiCell;
}

/** 早見表 for one year and sex: the birth years that are 前厄・本厄・後厄, one row per 本厄 age. */
export function hayamiTable(year: number, sex: Sex): HayamiRow[] {
  const cell = (kind: YakuKind, honAge: number): HayamiCell => {
    const kazoe = honAge + OFFSET[kind];
    const birthYear = birthYearForKazoe(kazoe, year);
    return { kind, kazoe, birthYear, wareki: warekiYearsText(birthYear) };
  };
  return HONYAKU_AGES[sex].map((honAge) => ({
    honAge,
    taiyaku: honAge === TAIYAKU_AGE[sex],
    mae: cell('mae', honAge),
    hon: cell('hon', honAge),
    ato: cell('ato', honAge),
  }));
}

/** 「本厄（大厄）」「前厄」「後厄」: only the 本厄 itself carries the 大厄 mark. */
export function kindText(entry: Pick<YakuEntry, 'kind' | 'taiyaku'>): string {
  return entry.kind === 'hon' && entry.taiyaku ? `${KIND_LABEL.hon}（大厄）` : KIND_LABEL[entry.kind];
}

/** 「2027年（令和9年）」「2019年（平成31年／令和元年）」 */
export function yearLabel(year: number): string {
  return `${year}年（${warekiYearsText(year)}）`;
}

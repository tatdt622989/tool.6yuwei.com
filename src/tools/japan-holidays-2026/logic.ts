// 2026年（令和8年）の祝日・休日. The rule engine is ./calendar.ts (shared with japan-holidays-2027).
//
// Official list: 内閣府「国民の祝日について」https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html (checked 2026-10-29):
// 元日 1/1, 成人の日 1/12, 建国記念の日 2/11, 天皇誕生日 2/23, 春分の日 3/20, 昭和の日 4/29, 憲法記念日 5/3, みどりの日 5/4,
// こどもの日 5/5, 休日 5/6（祝日法第3条第2項）, 海の日 7/20, 山の日 8/11, 敬老の日 9/21, 休日 9/22（第3条第3項）,
// 秋分の日 9/23, スポーツの日 10/12, 文化の日 11/3, 勤労感謝の日 11/23.
// 春分日・秋分日: 国立天文台「令和8年（2026）暦要項」https://eco.mtk.nao.ac.jp/koyomi/yoko/2026/ (3/20, 9/23).
// The tests assert that the rule engine reproduces this list exactly.

import { buildYearData, JapanHolidayCalendar } from './calendar';

export const EQUINOX_2026 = { spring: 20, autumn: 23 } as const;

export const DATA_2026 = buildYearData(2026, EQUINOX_2026);

export const cal2026 = new JapanHolidayCalendar(DATA_2026);

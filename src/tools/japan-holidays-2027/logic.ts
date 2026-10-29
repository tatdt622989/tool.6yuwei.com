// 2027年（令和9年）の祝日・休日. The rule engine is ../japan-holidays-2026/calendar.ts.
//
// Official list: 内閣府「国民の祝日について」https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html (checked 2026-10-29):
// 元日 1/1, 成人の日 1/11, 建国記念の日 2/11, 天皇誕生日 2/23, 春分の日 3/21, 休日 3/22（祝日法第3条第2項）, 昭和の日 4/29,
// 憲法記念日 5/3, みどりの日 5/4, こどもの日 5/5, 海の日 7/19, 山の日 8/11, 敬老の日 9/20, 秋分の日 9/23, スポーツの日 10/11,
// 文化の日 11/3, 勤労感謝の日 11/23.
// 春分日・秋分日: 国立天文台「令和9年（2027）暦要項」（令和8年2月2日発表）
// https://eco.mtk.nao.ac.jp/koyomi/yoko/2027/rekiyou271.html — 春分の日 3/21, 秋分の日 9/23,「3月22日は休日になる」.
// The tests assert that the rule engine reproduces this list exactly.

import { buildYearData, JapanHolidayCalendar } from '../japan-holidays-2026/calendar';

export const EQUINOX_2027 = { spring: 21, autumn: 23 } as const;

export const DATA_2027 = buildYearData(2027, EQUINOX_2027);

export const cal2027 = new JapanHolidayCalendar(DATA_2027);

// 2027（民國 116 年）行事曆資料. The calendar engine is shared with holidays-2026 (../holidays-2026/calendar.ts).

import { HolidayCalendar, type CalendarData } from '../holidays-2026/calendar';

/**
 * 116 年（2027）政府行政機關辦公日曆表 — 行政院核定、人事行政總處 2026-05-21 公布：全年放假日 121 天，
 * 3 日以上連假 9 個，春節 7 天；無調整放假、無補行上班（補班）。
 * Official: 行政院人事行政總處 (https://www.dgpa.gov.tw/) 最新消息「116 年政府行政機關辦公日曆表」.
 * Every date below cross-checked 2026-10-29 against three reproductions of the announcement:
 * - ETtoday 2026-05-21 https://www.ettoday.net/news/20260521/3169805.htm
 * - 自由時報 https://news.ltn.com.tw/news/Taipei/breakingnews/5444819
 *   (2/6–2/7 初一初二逢週末於 2/9–2/10 補假；兒童節 4/4 逢週日於 4/6 補假；117 年元旦逢週六於 116/12/31 補假)
 * - 104 職場力 https://blog.104.com.tw/2027-taiwan-government-calendar/ (full per-holiday list)
 * Weekend-day holidays move to the adjacent workday: Saturday → the Friday before, Sunday → the Monday after
 * (兒童節 4/4 Sunday is followed by 清明 4/5 Monday, so its 補假 is Tuesday 4/6).
 */
export const CALENDAR_2027: CalendarData = {
  year: 2027,
  totalDaysOff: 121,
  holidays: [
    { date: '2027-01-01', name: '開國紀念日（元旦）', kind: 'holiday' },
    { date: '2027-02-04', name: '小年夜', kind: 'holiday' },
    { date: '2027-02-05', name: '除夕', kind: 'holiday' },
    { date: '2027-02-06', name: '春節（初一）', kind: 'holiday' },
    { date: '2027-02-07', name: '春節（初二）', kind: 'holiday' },
    { date: '2027-02-08', name: '春節（初三）', kind: 'holiday' },
    { date: '2027-02-09', name: '初一補假', kind: 'compensatory' },
    { date: '2027-02-10', name: '初二補假', kind: 'compensatory' },
    { date: '2027-02-28', name: '和平紀念日', kind: 'holiday' },
    { date: '2027-03-01', name: '和平紀念日補假', kind: 'compensatory' },
    { date: '2027-04-04', name: '兒童節', kind: 'holiday' },
    { date: '2027-04-05', name: '民族掃墓節（清明節）', kind: 'holiday' },
    { date: '2027-04-06', name: '兒童節補假', kind: 'compensatory' },
    { date: '2027-04-30', name: '勞動節補假', kind: 'compensatory' },
    { date: '2027-05-01', name: '勞動節', kind: 'holiday' },
    { date: '2027-06-09', name: '端午節', kind: 'holiday' },
    { date: '2027-09-15', name: '中秋節', kind: 'holiday' },
    { date: '2027-09-28', name: '教師節（孔子誕辰紀念日）', kind: 'holiday' },
    { date: '2027-10-10', name: '國慶日', kind: 'holiday' },
    { date: '2027-10-11', name: '國慶日補假', kind: 'compensatory' },
    { date: '2027-10-25', name: '臺灣光復暨金門古寧頭大捷紀念日', kind: 'holiday' },
    { date: '2027-12-24', name: '行憲紀念日補假', kind: 'compensatory' },
    { date: '2027-12-25', name: '行憲紀念日', kind: 'holiday' },
    { date: '2027-12-31', name: '2028 元旦補假', kind: 'compensatory' },
  ],
  // 116 年沒有任何補行上班日。
  makeupWorkdays: [],
  // 2028-01-01 (Sat) 開國紀念日; its 補假 is 2027-12-31 above.
  nextYear: [{ date: '2028-01-01', name: '2028 元旦', kind: 'holiday' }],
};

export const cal2027 = new HolidayCalendar(CALENDAR_2027);

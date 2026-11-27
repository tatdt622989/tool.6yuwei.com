// 2026（民國 115 年）行事曆資料. The calendar engine lives in ./calendar.ts and is shared with holidays-2027.

import { HolidayCalendar, type CalendarData } from './calendar';

/**
 * 115 年（2026）政府行政機關辦公日曆表 — 全年放假日 120 天，3 日以上連假 9 個，無調整放假與補行上班（補班）。
 * Source: 行政院人事行政總處「115 年政府行政機關辦公日曆表」(https://www.dgpa.gov.tw/)，依 114 年修正之
 * 「紀念日及節日實施條例」新增小年夜、勞動節、教師節（孔子誕辰紀念日）、臺灣光復暨金門古寧頭大捷紀念日、行憲紀念日。
 * Cross-checked 2026-10-29 against 高雄市政府勞工局「115 年休假日一覽表」（依總處日曆表整理，
 * https://orgws.kcg.gov.tw/001/KcgOrgUploadFiles/420/RelFile/74763/62419/6c02ef80-1757-421c-81a6-16843487b621.pdf）
 * and 遠見《城市學》2026 行事曆整理 (https://city.gvm.com.tw/article/125282).
 */
export const CALENDAR_2026: CalendarData = {
  year: 2026,
  totalDaysOff: 120,
  holidays: [
    { date: '2026-01-01', name: '開國紀念日（元旦）', kind: 'holiday' },
    { date: '2026-02-15', name: '小年夜', kind: 'holiday' },
    { date: '2026-02-16', name: '除夕', kind: 'holiday' },
    { date: '2026-02-17', name: '春節（初一）', kind: 'holiday' },
    { date: '2026-02-18', name: '春節（初二）', kind: 'holiday' },
    { date: '2026-02-19', name: '春節（初三）', kind: 'holiday' },
    { date: '2026-02-20', name: '小年夜補假', kind: 'compensatory' },
    { date: '2026-02-27', name: '和平紀念日補假', kind: 'compensatory' },
    { date: '2026-02-28', name: '和平紀念日', kind: 'holiday' },
    { date: '2026-04-03', name: '兒童節補假', kind: 'compensatory' },
    { date: '2026-04-04', name: '兒童節', kind: 'holiday' },
    { date: '2026-04-05', name: '民族掃墓節（清明節）', kind: 'holiday' },
    { date: '2026-04-06', name: '清明節補假', kind: 'compensatory' },
    { date: '2026-05-01', name: '勞動節', kind: 'holiday' },
    { date: '2026-06-19', name: '端午節', kind: 'holiday' },
    { date: '2026-09-25', name: '中秋節', kind: 'holiday' },
    { date: '2026-09-28', name: '教師節（孔子誕辰紀念日）', kind: 'holiday' },
    { date: '2026-10-09', name: '國慶日補假', kind: 'compensatory' },
    { date: '2026-10-10', name: '國慶日', kind: 'holiday' },
    { date: '2026-10-25', name: '臺灣光復暨金門古寧頭大捷紀念日', kind: 'holiday' },
    { date: '2026-10-26', name: '光復節補假', kind: 'compensatory' },
    { date: '2026-12-25', name: '行憲紀念日', kind: 'holiday' },
  ],
  // 115 年沒有任何補行上班日。
  makeupWorkdays: [],
  // 2027-01-01 (Fri) 開國紀念日, from the 116 年辦公日曆表 (see ../holidays-2027/logic.ts).
  nextYear: [{ date: '2027-01-01', name: '2027 元旦', kind: 'holiday' }],
};

export const cal2026 = new HolidayCalendar(CALENDAR_2026);

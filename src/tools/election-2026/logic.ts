// 2026（民國 115 年）地方公職人員選舉（九合一）＋ 全國性公民投票第 22 案 投票指南. Pure functions only.
// Strictly neutral: no candidates, parties, or opinions on the referendum.
//
// Sources (all checked 2026-10-29):
// - 中央選舉委員會公告 115-08-28 中選務字第 1153150284 號「全國性公民投票案第 22 案」：投票日 115/11/28（六）
//   上午 8 時至下午 4 時；主文原文。https://web.cec.gov.tw/api/file/3ea9497f-7945-49a2-bd4b-375e3d6f1ddf.pdf
// - 公職人員選舉罷免法（115-07-01 修正，全國法規資料庫 https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0020010）
//   §4 年齡及居住期間算至投票日前一日、以戶籍登記為準、自遷入登記之日起算；§5-1 投票日放假；§14 年滿二十歲有選舉權；
//   §15 選舉區繼續居住四個月以上，選舉公告發布後遷入者無選舉投票權；§16 原住民選舉以具原住民身分者為選舉人；
//   §17 戶籍地投票所投票；§18 憑本人國民身分證領票，名冊上簽名或蓋章或按指印；§19 時間內到達者仍可投票、
//   同日多種投票應一次進入投票所；§20 投票日前二十日以後遷出者在原戶籍地投票；§57 原住民秘密投票得單獨設投票所；
//   §63 不得將圈選內容出示他人；§65 不得攜帶行動電話或攝影器材進入投票所（已關閉電源者不在此限）；
//   §105 亮票（違反 §63 第 2 項）處二年以下有期徒刑、拘役或科二十萬元以下罰金；§106 違反 §65 第 3 項處新臺幣
//   三萬元以上三十萬元以下罰鍰；§108 將選舉票攜出場外處一年以下有期徒刑、拘役或科一萬五千元以下罰金。
// - 公民投票法（114-12-03 修正，https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0020050）
//   §7 年滿十八歲、未受監護宣告者有公民投票權；§8 在中華民國繼續居住六個月以上為全國性公投投票權人，算至投票日前一日；
//   §23 公投成立後三至六個月內舉行，期間內有全國性選舉應同日舉行；§29 通過門檻。
// - 九類選舉與各地選票張數、原住民議員選區：經理人 2026「九合一選舉幾張票？」
//   https://www.managertoday.com.tw/articles/view/73181 ；TVBS 2026 公投懶人包 https://news.tvbs.com.tw/politics/4038790
// - 選舉公告 115-08-20 發布：中選會工作進行程序表（僑務電子報 https://ocacnews.net/article/412049）。

const TAIPEI = 8 * 3_600_000;

export const ELECTION = {
  date: '2026-11-28',
  /** 08:00 and 16:00 Taiwan time. */
  opens: Date.UTC(2026, 10, 28, 8) - TAIPEI,
  closes: Date.UTC(2026, 10, 28, 16) - TAIPEI,
  /** 選舉公告 date: moving in after this gives no vote in the new district (選罷法 §15). */
  announced: '2026-08-20',
  /** Latest 戶籍遷入登記 date that still gives 4 months by 11/27. */
  moveInBy: '2026-07-28',
  /** Born on or before these dates: 20 歲 for elections, 18 歲 for the referendum. */
  bornBy20: '2006-11-28',
  bornBy18: '2008-11-28',
} as const;

export const REFERENDUM = {
  number: 22,
  /** 主文 verbatim from 中選會公告 中選務字第 1153150284 號. */
  question: '你是否支持政府使用「核電」振興經濟，以廢除「非核家園」的能源政策？',
} as const;

export type Phase = 'before' | 'voting' | 'closed';

export interface PhaseInfo {
  phase: Phase;
  /** ms until polls open (before) or close (voting); 0 once closed. */
  remaining: number;
  /** Calendar days until 投票日 in Taiwan (0 on the day). */
  daysUntil: number;
}

export function electionPhase(now: number): PhaseInfo {
  const phase: Phase = now < ELECTION.opens ? 'before' : now < ELECTION.closes ? 'voting' : 'closed';
  const remaining = phase === 'before' ? ELECTION.opens - now : phase === 'voting' ? ELECTION.closes - now : 0;
  const todayUtc = Math.floor((now + TAIPEI) / 86_400_000);
  const voteUtc = Math.floor((ELECTION.opens + TAIPEI) / 86_400_000);
  return { phase, remaining, daysUntil: voteUtc - todayUtc };
}

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const d = Math.floor(total / 86_400);
  const h = Math.floor((total % 86_400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const hms = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return d > 0 ? `${d} 天 ${hms}` : hms;
}

/* ---------- 我可以領幾張票 ---------- */

export type Residence = 'municipality' | 'mountain-district' | 'township' | 'county-city' | 'city';
export type AgeGroup = 'under18' | '18-19' | '20plus';
export type Indigenous = 'none' | 'plains' | 'mountain';

export interface Option<T extends string> {
  value: T;
  label: string;
  hint: string;
}

export const MOUNTAIN_DISTRICTS = ['新北市烏來區', '桃園市復興區', '臺中市和平區', '高雄市那瑪夏區', '高雄市桃源區', '高雄市茂林區'];

export const RESIDENCE_OPTIONS: readonly Option<Residence>[] = [
  { value: 'municipality', label: '直轄市（一般區）', hint: '臺北、新北、桃園、臺中、臺南、高雄，山地原住民區以外的區' },
  { value: 'mountain-district', label: '直轄市山地原住民區', hint: MOUNTAIN_DISTRICTS.join('、') },
  { value: 'township', label: '縣的鄉、鎮', hint: '例如宜蘭縣礁溪鄉、彰化縣鹿港鎮、花蓮縣秀林鄉' },
  { value: 'county-city', label: '縣轄市', hint: '例如竹北市、頭份市、彰化市、員林市、斗六市、屏東市、花蓮市' },
  { value: 'city', label: '基隆市、新竹市、嘉義市', hint: '這三個市底下是區，沒有鄉鎮市長與代表選舉' },
];

export const AGE_OPTIONS: readonly Option<AgeGroup>[] = [
  { value: '20plus', label: '20 歲以上', hint: '2006 年 11 月 28 日（含）以前出生' },
  { value: '18-19', label: '18～19 歲', hint: '2006 年 11 月 29 日至 2008 年 11 月 28 日出生' },
  { value: 'under18', label: '未滿 18 歲', hint: '2008 年 11 月 29 日（含）以後出生' },
];

export const INDIGENOUS_OPTIONS: readonly Option<Indigenous>[] = [
  { value: 'none', label: '非原住民', hint: '' },
  { value: 'plains', label: '平地原住民', hint: '' },
  { value: 'mountain', label: '山地原住民', hint: '' },
];

export interface VoterInput {
  residence: Residence;
  age: AgeGroup;
  indigenous: Indigenous;
  /**
   * 戶籍在目前的直轄市／縣（市）已滿 4 個月：2026-07-28（含）以前遷入登記（算至投票日前一日、自遷入登記日起算，
   * 與中選會歷屆「投票日往前推」的公告算法一致，例如 2024-01-13 總統選舉的 6 個月為 2023-07-13 以前設籍）。
   */
  residedFourMonths: boolean;
}

export interface Ballot {
  id: string;
  title: string;
  detail: string;
  kind: 'election' | 'referendum';
}

export interface BallotResult {
  ballots: Ballot[];
  electionCount: number;
  referendumCount: number;
  /** One-line summary, e.g. 「共 4 張：選舉票 3 張＋公投票 1 張」. */
  summary: string;
  notes: string[];
}

const INDIGENOUS_NAME: Record<Exclude<Indigenous, 'none'>, string> = { plains: '平地原住民', mountain: '山地原住民' };

function councilBallot(level: '直轄市' | '縣' | '市', indigenous: Indigenous): Ballot {
  const title = level === '直轄市' ? '直轄市議員' : level === '縣' ? '縣議員' : '市議員';
  const detail =
    indigenous === 'none'
      ? '投你戶籍所在選舉區的區域議員。'
      : `具${INDIGENOUS_NAME[indigenous]}身分，若戶籍地設有${INDIGENOUS_NAME[indigenous]}議員選舉區，改領${INDIGENOUS_NAME[indigenous]}議員選舉票（不是多一張）；沒有設該類名額的縣市則投區域議員。`;
  return { id: 'council', title, detail, kind: 'election' };
}

function repBallot(title: string, indigenous: Indigenous): Ballot {
  const detail =
    indigenous === 'none'
      ? '投你戶籍所在選舉區的代表。'
      : '若當地設有原住民代表選舉區，依身分改投原住民選舉區的代表，仍然只有 1 張。';
  return { id: 'rep', title, detail, kind: 'election' };
}

function electionBallots(input: VoterInput): Ballot[] {
  const { residence, indigenous } = input;
  const villageChief: Ballot = { id: 'chief', title: '村（里）長', detail: '投你戶籍所在村或里的村長、里長。', kind: 'election' };
  switch (residence) {
    case 'municipality':
      return [
        { id: 'mayor', title: '直轄市長', detail: '全市一起選，每人 1 票。', kind: 'election' },
        councilBallot('直轄市', indigenous),
        { ...villageChief, title: '里長', detail: '投你戶籍所在里的里長。' },
      ];
    case 'mountain-district':
      return [
        { id: 'mayor', title: '直轄市長', detail: '全市一起選，每人 1 票。', kind: 'election' },
        councilBallot('直轄市', indigenous),
        { id: 'district-chief', title: '山地原住民區長', detail: '區內所有選舉人都可以投（候選人須具山地原住民身分）。', kind: 'election' },
        repBallot('山地原住民區區民代表', indigenous),
        { ...villageChief, title: '里長', detail: '投你戶籍所在里的里長。' },
      ];
    case 'township':
      return [
        { id: 'mayor', title: '縣長', detail: '全縣一起選，每人 1 票。', kind: 'election' },
        councilBallot('縣', indigenous),
        { id: 'township-chief', title: '鄉（鎮）長', detail: '投你戶籍所在鄉或鎮的首長。', kind: 'election' },
        repBallot('鄉（鎮）民代表', indigenous),
        villageChief,
      ];
    case 'county-city':
      return [
        { id: 'mayor', title: '縣長', detail: '全縣一起選，每人 1 票。', kind: 'election' },
        councilBallot('縣', indigenous),
        { id: 'township-chief', title: '縣轄市長', detail: '例如竹北市長、員林市長，投你戶籍所在的縣轄市。', kind: 'election' },
        repBallot('市民代表', indigenous),
        { ...villageChief, title: '里長', detail: '投你戶籍所在里的里長。' },
      ];
    case 'city':
      return [
        { id: 'mayor', title: '市長', detail: '基隆市長、新竹市長或嘉義市長，全市一起選。', kind: 'election' },
        councilBallot('市', indigenous),
        { ...villageChief, title: '里長', detail: '投你戶籍所在里的里長。' },
      ];
  }
}

const REFERENDUM_BALLOT: Ballot = {
  id: 'referendum',
  title: `全國性公民投票第 ${REFERENDUM.number} 案`,
  detail: `主文：${REFERENDUM.question} 圈選「同意」或「不同意」其中一個。`,
  kind: 'referendum',
};

/** Ballots one voter receives on 2026-11-28. */
export function ballotsFor(input: VoterInput): BallotResult {
  const notes: string[] = [];
  const canVoteReferendum = input.age !== 'under18';
  const canVoteElection = input.age === '20plus' && input.residedFourMonths;

  const ballots: Ballot[] = [];
  if (canVoteElection) ballots.push(...electionBallots(input));
  if (canVoteReferendum) ballots.push(REFERENDUM_BALLOT);

  if (input.age === 'under18') {
    notes.push('未滿 18 歲沒有選舉權也沒有公投投票權，這次不會領到任何選票。');
  } else if (input.age === '18-19') {
    notes.push('選舉權須年滿 20 歲，公投只要年滿 18 歲，所以 18、19 歲這次只會領到 1 張公投票。');
  } else if (!input.residedFourMonths) {
    notes.push(
      '從其他縣市遷入、且在 7 月 29 日以後才完成遷入登記，算到投票日前一天未滿 4 個月，在新戶籍地沒有地方選舉的投票權，原戶籍地的選舉人名冊也不會列入，所以只能投公投。',
    );
    notes.push(
      '例外：在 11 月 8 日以後（投票日前 20 天內）才遷出的人，仍在原戶籍地投票；同一縣市內搬家的居住期間計算較複雜。實際能領哪些票，以戶政機關編造的選舉人名冊與投票通知單為準。',
    );
  }
  if (canVoteReferendum) {
    notes.push('公投投票權另須在中華民國繼續居住（設籍）6 個月以上、未受監護宣告，絕大多數國人都符合。');
  }
  if (canVoteElection && input.indigenous !== 'none') {
    notes.push('為保障原住民秘密投票，部分地區的原住民議員選舉票會改在鄰近村里的投票所投票，可能要跑兩個投票所，請看投票通知單上的地點。');
  }

  const electionCount = ballots.filter((b) => b.kind === 'election').length;
  const referendumCount = ballots.length - electionCount;
  const summary =
    ballots.length === 0
      ? '這次沒有選票'
      : electionCount === 0
        ? `共 ${ballots.length} 張：公投票 ${referendumCount} 張`
        : `共 ${ballots.length} 張：選舉票 ${electionCount} 張＋公投票 ${referendumCount} 張`;
  return { ballots, electionCount, referendumCount, summary, notes };
}

/* ---------- 投票須知 ---------- */

export const BRING = [
  { item: '國民身分證', required: true, note: '必帶，健保卡、駕照、護照都不能代替。' },
  { item: '印章', required: false, note: '可以用簽名或按指印代替。' },
  { item: '投票通知單', required: false, note: '方便查投票所與名冊編號，忘了帶也能投。' },
] as const;

export const RULES = [
  '投票時間是上午 8 點到下午 4 點；4 點前已經到投票所排隊的人仍可以投票。',
  '選舉票和公投票在同一個投票所領，必須一次投完，離開後不能再進去投。',
  '手機、相機等可以拍照的器材不能帶進投票所；已經關機的手機不在此限。違者可處新臺幣 3 萬到 30 萬元罰鍰。',
  '不能把圈選內容給別人看（亮票），也不能在投票所拍攝選票，可處 2 年以下有期徒刑、拘役或 20 萬元以下罰金。',
  '不能把選票帶出投票所，可處 1 年以下有期徒刑、拘役或 1 萬 5 千元以下罰金。',
  '要用投票所準備的圈選章蓋在圈選欄內，每張票只能圈 1 個；蓋到兩格、在選票上簽名或寫字都會變成廢票。',
  '投票日當天不能穿戴或展示候選人、政黨的旗幟、徽章或服飾進入投票所。',
] as const;

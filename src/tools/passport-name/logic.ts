// Romanization of Chinese names for Taiwan passports (護照外文姓名).
//
// Syllable table: 外交部領事事務局「護照外文姓名拼音對照表」
//   https://www.boca.gov.tw/cp-2-4226-c0eff-1.html (retrieved 2026-10-29; page dated 2026-05-28).
//   409 syllables, columns 威妥瑪(WG)／國語注音符號第二式／通用拼音／漢語拼音. Notable conventions of
//   that table, kept verbatim here:
//   - WG is written without apostrophes or umlauts: 邱 ㄑㄧㄡ CHIU (not Ch'iu), 呂 ㄌㄩ LU (not Lü).
//   - 漢語拼音 writes ü as U after l/n (ㄌㄩ LU, ㄋㄩ NU); 通用拼音 uses YU (LYU, NYU).
//   - Some WG cells list two spellings (ㄏㄜ HE 或 HO, ㄧ YI 或 I); the first is the default.
// Format rules: 護照條例施行細則第 14 條第 7 款 (amended 2025-05-09): surname first, then given name,
//   separated by a comma, at most 39 letters including spaces. The hyphen between given-name
//   syllables is optional (領事事務局).
//
// Keys are 漢語拼音 without tones, ü written as "v" (the form pinyin-pro returns with { v: true }).
// Values: [注音, 威妥瑪 WG, 國音第二式, 通用拼音]; the 漢語拼音 spelling is the key in upper case with V → U.

export type System = 'hanyu' | 'wg' | 'mps2' | 'tongyong';

export const SYSTEMS: { id: System; name: string; note: string }[] = [
  { id: 'hanyu', name: '漢語拼音', note: '國際通用，政府自 2009 年起採用的中文譯音標準' },
  { id: 'wg', name: '威妥瑪拼音（WG）', note: '台灣早年最常見的護照拼法，如 CHANG、HSU' },
  { id: 'tongyong', name: '通用拼音', note: '2002–2008 年間的政府譯音標準' },
  { id: 'mps2', name: '國音第二式', note: '注音符號第二式，1986 年公布' },
];

export const SYLLABLES: Record<string, readonly [string, string, string, string]> = {
  ba: ['ㄅㄚ', 'PA', 'BA', 'BA'],
  bo: ['ㄅㄛ', 'PO', 'BO', 'BO'],
  bai: ['ㄅㄞ', 'PAI', 'BAI', 'BAI'],
  bei: ['ㄅㄟ', 'PEI', 'BEI', 'BEI'],
  bao: ['ㄅㄠ', 'PAO', 'BAU', 'BAO'],
  ban: ['ㄅㄢ', 'PAN', 'BAN', 'BAN'],
  ben: ['ㄅㄣ', 'PEN', 'BEN', 'BEN'],
  bang: ['ㄅㄤ', 'PANG', 'BANG', 'BANG'],
  beng: ['ㄅㄥ', 'PENG', 'BENG', 'BENG'],
  bi: ['ㄅㄧ', 'PI', 'BI', 'BI'],
  bie: ['ㄅㄧㄝ', 'PIEH', 'BIE', 'BIE'],
  biao: ['ㄅㄧㄠ', 'PIAO', 'BIAU', 'BIAO'],
  bian: ['ㄅㄧㄢ', 'PIEN', 'BIAN', 'BIAN'],
  bin: ['ㄅㄧㄣ', 'PIN', 'BIN', 'BIN'],
  bing: ['ㄅㄧㄥ', 'PING', 'BING', 'BING'],
  bu: ['ㄅㄨ', 'PU', 'BU', 'BU'],
  pa: ['ㄆㄚ', 'PA', 'PA', 'PA'],
  po: ['ㄆㄛ', 'PO', 'PO', 'PO'],
  pai: ['ㄆㄞ', 'PAI', 'PAI', 'PAI'],
  pei: ['ㄆㄟ', 'PEI', 'PEI', 'PEI'],
  pao: ['ㄆㄠ', 'PAO', 'PAU', 'PAO'],
  pou: ['ㄆㄡ', 'POU', 'POU', 'POU'],
  pan: ['ㄆㄢ', 'PAN', 'PAN', 'PAN'],
  pen: ['ㄆㄣ', 'PEN', 'PEN', 'PEN'],
  pang: ['ㄆㄤ', 'PANG', 'PANG', 'PANG'],
  peng: ['ㄆㄥ', 'PENG', 'PENG', 'PENG'],
  pi: ['ㄆㄧ', 'PI', 'PI', 'PI'],
  pie: ['ㄆㄧㄝ', 'PIEH', 'PIE', 'PIE'],
  piao: ['ㄆㄧㄠ', 'PIAO', 'PIAU', 'PIAO'],
  pian: ['ㄆㄧㄢ', 'PIEN', 'PIAN', 'PIAN'],
  pin: ['ㄆㄧㄣ', 'PIN', 'PIN', 'PIN'],
  ping: ['ㄆㄧㄥ', 'PING', 'PING', 'PING'],
  pu: ['ㄆㄨ', 'PU', 'PU', 'PU'],
  ma: ['ㄇㄚ', 'MA', 'MA', 'MA'],
  mo: ['ㄇㄛ', 'MO', 'MO', 'MO'],
  mai: ['ㄇㄞ', 'MAI', 'MAI', 'MAI'],
  mei: ['ㄇㄟ', 'MEI', 'MEI', 'MEI'],
  mao: ['ㄇㄠ', 'MAO', 'MAU', 'MAO'],
  mou: ['ㄇㄡ', 'MOU', 'MOU', 'MOU'],
  man: ['ㄇㄢ', 'MAN', 'MAN', 'MAN'],
  men: ['ㄇㄣ', 'MEN', 'MEN', 'MEN'],
  mang: ['ㄇㄤ', 'MANG', 'MANG', 'MANG'],
  meng: ['ㄇㄥ', 'MENG', 'MENG', 'MENG'],
  mi: ['ㄇㄧ', 'MI', 'MI', 'MI'],
  mie: ['ㄇㄧㄝ', 'MIEH', 'MIE', 'MIE'],
  miao: ['ㄇㄧㄠ', 'MIAO', 'MIAU', 'MIAO'],
  miu: ['ㄇㄧㄡ', 'MIU', 'MIOU', 'MIOU'],
  mian: ['ㄇㄧㄢ', 'MIEN', 'MIAN', 'MIAN'],
  min: ['ㄇㄧㄣ', 'MIN', 'MIN', 'MIN'],
  ming: ['ㄇㄧㄥ', 'MING', 'MING', 'MING'],
  mu: ['ㄇㄨ', 'MU', 'MU', 'MU'],
  me: ['ㄇㄜ', 'ME', 'ME', 'ME'],
  fa: ['ㄈㄚ', 'FA', 'FA', 'FA'],
  fo: ['ㄈㄛ', 'FO', 'FO', 'FO'],
  fei: ['ㄈㄟ', 'FEI', 'FEI', 'FEI'],
  fou: ['ㄈㄡ', 'FOU', 'FOU', 'FOU'],
  fan: ['ㄈㄢ', 'FAN', 'FAN', 'FAN'],
  fen: ['ㄈㄣ', 'FEN', 'FEN', 'FEN'],
  fang: ['ㄈㄤ', 'FANG', 'FANG', 'FANG'],
  feng: ['ㄈㄥ', 'FENG', 'FENG', 'FONG'],
  fu: ['ㄈㄨ', 'FU', 'FU', 'FU'],
  da: ['ㄉㄚ', 'TA', 'DA', 'DA'],
  de: ['ㄉㄜ', 'TE', 'DE', 'DE'],
  dai: ['ㄉㄞ', 'TAI', 'DAI', 'DAI'],
  dei: ['ㄉㄟ', 'TEI', 'DEI', 'DEI'],
  dao: ['ㄉㄠ', 'TAO', 'DAU', 'DAO'],
  dou: ['ㄉㄡ', 'TOU', 'DOU', 'DOU'],
  dan: ['ㄉㄢ', 'TAN', 'DAN', 'DAN'],
  dang: ['ㄉㄤ', 'TANG', 'DANG', 'DANG'],
  deng: ['ㄉㄥ', 'TENG', 'DENG', 'DENG'],
  di: ['ㄉㄧ', 'TI', 'DI', 'DI'],
  die: ['ㄉㄧㄝ', 'TIEH', 'DIE', 'DIE'],
  diao: ['ㄉㄧㄠ', 'TIAO', 'DIAU', 'DIAO'],
  diu: ['ㄉㄧㄡ', 'TIU', 'DIOU', 'DIOU'],
  dian: ['ㄉㄧㄢ', 'TIEN', 'DIAN', 'DIAN'],
  diang: ['ㄉㄧㄤ', 'TIANG', 'DIANG', 'DIANG'],
  ding: ['ㄉㄧㄥ', 'TING', 'DING', 'DING'],
  du: ['ㄉㄨ', 'TU', 'DU', 'DU'],
  duo: ['ㄉㄨㄛ', 'TO', 'DUO', 'DUO'],
  dui: ['ㄉㄨㄟ', 'TUI', 'DUEI', 'DUEI'],
  duan: ['ㄉㄨㄢ', 'TUAN', 'DUAN', 'DUAN'],
  dun: ['ㄉㄨㄣ', 'TUN', 'DUEN', 'DUN'],
  dong: ['ㄉㄨㄥ', 'TUNG', 'DUNG', 'DONG'],
  ta: ['ㄊㄚ', 'TA', 'TA', 'TA'],
  te: ['ㄊㄜ', 'TE', 'TE', 'TE'],
  tai: ['ㄊㄞ', 'TAI', 'TAI', 'TAI'],
  tao: ['ㄊㄠ', 'TAO', 'TAU', 'TAO'],
  tou: ['ㄊㄡ', 'TOU', 'TOU', 'TOU'],
  tan: ['ㄊㄢ', 'TAN', 'TAN', 'TAN'],
  tang: ['ㄊㄤ', 'TANG', 'TANG', 'TANG'],
  teng: ['ㄊㄥ', 'TENG', 'TENG', 'TENG'],
  ti: ['ㄊㄧ', 'TI', 'TI', 'TI'],
  tie: ['ㄊㄧㄝ', 'TIEH', 'TIE', 'TIE'],
  tiao: ['ㄊㄧㄠ', 'TIAO', 'TIAU', 'TIAO'],
  tian: ['ㄊㄧㄢ', 'TIEN', 'TIAN', 'TIAN'],
  ting: ['ㄊㄧㄥ', 'TING', 'TING', 'TING'],
  tu: ['ㄊㄨ', 'TU', 'TU', 'TU'],
  tuo: ['ㄊㄨㄛ', 'TO', 'TUO', 'TUO'],
  tui: ['ㄊㄨㄟ', 'TUI', 'TUEI', 'TUEI'],
  tuan: ['ㄊㄨㄢ', 'TUAN', 'TUAN', 'TUAN'],
  tun: ['ㄊㄨㄣ', 'TUN', 'TUEN', 'TUN'],
  tong: ['ㄊㄨㄥ', 'TUNG', 'TUNG', 'TONG'],
  na: ['ㄋㄚ', 'NA', 'NA', 'NA'],
  ne: ['ㄋㄜ', 'NE', 'NE', 'NE'],
  nai: ['ㄋㄞ', 'NAI', 'NAI', 'NAI'],
  nei: ['ㄋㄟ', 'NEI', 'NEI', 'NEI'],
  nao: ['ㄋㄠ', 'NAO', 'NAU', 'NAO'],
  nou: ['ㄋㄡ', 'NOU', 'NOU', 'NOU'],
  nan: ['ㄋㄢ', 'NAN', 'NAN', 'NAN'],
  nen: ['ㄋㄣ', 'NEN', 'NEN', 'NEN'],
  nang: ['ㄋㄤ', 'NANG', 'NANG', 'NANG'],
  neng: ['ㄋㄥ', 'NENG', 'NENG', 'NENG'],
  ni: ['ㄋㄧ', 'NI', 'NI', 'NI'],
  nie: ['ㄋㄧㄝ', 'NIEH', 'NIE', 'NIE'],
  niao: ['ㄋㄧㄠ', 'NIAO', 'NIAU', 'NIAO'],
  niu: ['ㄋㄧㄡ', 'NIU', 'NIOU', 'NIOU'],
  nian: ['ㄋㄧㄢ', 'NIEN', 'NIAN', 'NIAN'],
  nin: ['ㄋㄧㄣ', 'NIN', 'NIN', 'NIN'],
  niang: ['ㄋㄧㄤ', 'NIANG', 'NIANG', 'NIANG'],
  ning: ['ㄋㄧㄥ', 'NING', 'NING', 'NING'],
  nu: ['ㄋㄨ', 'NU', 'NU', 'NU'],
  nuo: ['ㄋㄨㄛ', 'NO', 'NUO', 'NUO'],
  nuan: ['ㄋㄨㄢ', 'NUAN', 'NUAN', 'NUAN'],
  nong: ['ㄋㄨㄥ', 'NUNG', 'NUNG', 'NONG'],
  nv: ['ㄋㄩ', 'NU', 'NIU', 'NYU'],
  nve: ['ㄋㄩㄝ', 'NUEH', 'NIUE', 'NYUE'],
  la: ['ㄌㄚ', 'LA', 'LA', 'LA'],
  lo: ['ㄌㄛ', 'LO', 'LO', 'LO'],
  le: ['ㄌㄜ', 'LE', 'LE', 'LE'],
  lai: ['ㄌㄞ', 'LAI', 'LAI', 'LAI'],
  lei: ['ㄌㄟ', 'LEI', 'LEI', 'LEI'],
  lao: ['ㄌㄠ', 'LAO', 'LAU', 'LAO'],
  lou: ['ㄌㄡ', 'LOU', 'LOU', 'LOU'],
  lan: ['ㄌㄢ', 'LAN', 'LAN', 'LAN'],
  lang: ['ㄌㄤ', 'LANG', 'LANG', 'LANG'],
  leng: ['ㄌㄥ', 'LENG', 'LENG', 'LENG'],
  li: ['ㄌㄧ', 'LI', 'LI', 'LI'],
  lia: ['ㄌㄧㄚ', 'LIA', 'LIA', 'LIA'],
  lie: ['ㄌㄧㄝ', 'LIEH', 'LIE', 'LIE'],
  liao: ['ㄌㄧㄠ', 'LIAO', 'LIAU', 'LIAO'],
  liu: ['ㄌㄧㄡ', 'LIU', 'LIOU', 'LIOU'],
  lian: ['ㄌㄧㄢ', 'LIEN', 'LIAN', 'LIAN'],
  lin: ['ㄌㄧㄣ', 'LIN', 'LIN', 'LIN'],
  liang: ['ㄌㄧㄤ', 'LIANG', 'LIANG', 'LIANG'],
  ling: ['ㄌㄧㄥ', 'LING', 'LING', 'LING'],
  lu: ['ㄌㄨ', 'LU', 'LU', 'LU'],
  luo: ['ㄌㄨㄛ', 'LO', 'LUO', 'LUO'],
  luan: ['ㄌㄨㄢ', 'LUAN', 'LUAN', 'LUAN'],
  lun: ['ㄌㄨㄣ', 'LUN', 'LUEN', 'LUN'],
  long: ['ㄌㄨㄥ', 'LUNG', 'LUNG', 'LONG'],
  lv: ['ㄌㄩ', 'LU', 'LIU', 'LYU'],
  lve: ['ㄌㄩㄝ', 'LUEH', 'LIUE', 'LYUE'],
  lvan: ['ㄌㄩㄢ', 'LUAN', 'LIUAN', 'LYUAN'],
  ga: ['ㄍㄚ', 'KA', 'GA', 'GA'],
  ge: ['ㄍㄜ', 'KE/KO', 'GE', 'GE'],
  gai: ['ㄍㄞ', 'KAI', 'GAI', 'GAI'],
  gei: ['ㄍㄟ', 'KEI', 'GEI', 'GEI'],
  gao: ['ㄍㄠ', 'KAO', 'GAU', 'GAO'],
  gou: ['ㄍㄡ', 'KOU', 'GOU', 'GOU'],
  gan: ['ㄍㄢ', 'KAN', 'GAN', 'GAN'],
  gen: ['ㄍㄣ', 'KEN', 'GEN', 'GEN'],
  gang: ['ㄍㄤ', 'KANG', 'GANG', 'GANG'],
  geng: ['ㄍㄥ', 'KENG', 'GENG', 'GENG'],
  gu: ['ㄍㄨ', 'KU', 'GU', 'GU'],
  gua: ['ㄍㄨㄚ', 'KUA', 'GUA', 'GUA'],
  guo: ['ㄍㄨㄛ', 'KUO', 'GUO', 'GUO'],
  guai: ['ㄍㄨㄞ', 'KUAI', 'GUAI', 'GUAI'],
  gui: ['ㄍㄨㄟ', 'KUEI', 'GUEI', 'GUEI'],
  guan: ['ㄍㄨㄢ', 'KUAN', 'GUAN', 'GUAN'],
  gun: ['ㄍㄨㄣ', 'KUN', 'GUEN', 'GUN'],
  guang: ['ㄍㄨㄤ', 'KUANG', 'GUANG', 'GUANG'],
  gong: ['ㄍㄨㄥ', 'KUNG', 'GUNG', 'GONG'],
  ka: ['ㄎㄚ', 'KA', 'KA', 'KA'],
  ke: ['ㄎㄜ', 'KE/KO', 'KE', 'KE'],
  kai: ['ㄎㄞ', 'KAI', 'KAI', 'KAI'],
  kao: ['ㄎㄠ', 'KAO', 'KAU', 'KAO'],
  kou: ['ㄎㄡ', 'KOU', 'KOU', 'KOU'],
  kan: ['ㄎㄢ', 'KAN', 'KAN', 'KAN'],
  ken: ['ㄎㄣ', 'KEN', 'KEN', 'KEN'],
  kang: ['ㄎㄤ', 'KANG', 'KANG', 'KANG'],
  keng: ['ㄎㄥ', 'KENG', 'KENG', 'KENG'],
  ku: ['ㄎㄨ', 'KU', 'KU', 'KU'],
  kua: ['ㄎㄨㄚ', 'KUA', 'KUA', 'KUA'],
  kuo: ['ㄎㄨㄛ', 'KUO', 'KUO', 'KUO'],
  kuai: ['ㄎㄨㄞ', 'KUAI', 'KUAI', 'KUAI'],
  kui: ['ㄎㄨㄟ', 'KUEI', 'KUEI', 'KUEI'],
  kuan: ['ㄎㄨㄢ', 'KUAN', 'KUAN', 'KUAN'],
  kun: ['ㄎㄨㄣ', 'KUN', 'KUEN', 'KUN'],
  kuang: ['ㄎㄨㄤ', 'KUANG', 'KUANG', 'KUANG'],
  kong: ['ㄎㄨㄥ', 'KUNG', 'KUNG', 'KONG'],
  ha: ['ㄏㄚ', 'HA', 'HA', 'HA'],
  he: ['ㄏㄜ', 'HE/HO', 'HE', 'HE'],
  hai: ['ㄏㄞ', 'HAI', 'HAI', 'HAI'],
  hei: ['ㄏㄟ', 'HEI', 'HEI', 'HEI'],
  hao: ['ㄏㄠ', 'HAO', 'HAU', 'HAO'],
  hou: ['ㄏㄡ', 'HOU', 'HOU', 'HOU'],
  han: ['ㄏㄢ', 'HAN', 'HAN', 'HAN'],
  hen: ['ㄏㄣ', 'HEN', 'HEN', 'HEN'],
  hang: ['ㄏㄤ', 'HANG', 'HANG', 'HANG'],
  heng: ['ㄏㄥ', 'HENG', 'HENG', 'HENG'],
  hu: ['ㄏㄨ', 'HU', 'HU', 'HU'],
  hua: ['ㄏㄨㄚ', 'HUA', 'HUA', 'HUA'],
  huo: ['ㄏㄨㄛ', 'HUO', 'HUO', 'HUO'],
  huai: ['ㄏㄨㄞ', 'HUAI', 'HUAI', 'HUAI'],
  hui: ['ㄏㄨㄟ', 'HUI', 'HUEI', 'HUEI'],
  huan: ['ㄏㄨㄢ', 'HUAN', 'HUAN', 'HUAN'],
  hun: ['ㄏㄨㄣ', 'HUN', 'HUEN', 'HUN'],
  huang: ['ㄏㄨㄤ', 'HUANG', 'HUANG', 'HUANG'],
  hong: ['ㄏㄨㄥ', 'HUNG', 'HUNG', 'HONG'],
  ji: ['ㄐㄧ', 'CHI', 'JI', 'JI'],
  jia: ['ㄐㄧㄚ', 'CHIA', 'JIA', 'JIA'],
  jie: ['ㄐㄧㄝ', 'CHIEH', 'JIE', 'JIE'],
  jiao: ['ㄐㄧㄠ', 'CHIAO', 'JIAU', 'JIAO'],
  jiu: ['ㄐㄧㄡ', 'CHIU', 'JIOU', 'JIOU'],
  jian: ['ㄐㄧㄢ', 'CHIEN', 'JIAN', 'JIAN'],
  jin: ['ㄐㄧㄣ', 'CHIN', 'JIN', 'JIN'],
  jiang: ['ㄐㄧㄤ', 'CHIANG', 'JIANG', 'JIANG'],
  jing: ['ㄐㄧㄥ', 'CHING', 'JING', 'JING'],
  ju: ['ㄐㄩ', 'CHU', 'JIU', 'JYU'],
  jue: ['ㄐㄩㄝ', 'CHUEH', 'JIUE', 'JYUE'],
  juan: ['ㄐㄩㄢ', 'CHUAN', 'JIUAN', 'JYUAN'],
  jun: ['ㄐㄩㄣ', 'CHUN', 'JIUN', 'JYUN'],
  jiong: ['ㄐㄩㄥ', 'CHIUNG', 'JIUNG', 'JYONG'],
  qi: ['ㄑㄧ', 'CHI', 'CHI', 'CI'],
  qia: ['ㄑㄧㄚ', 'CHIA', 'CHIA', 'CIA'],
  qie: ['ㄑㄧㄝ', 'CHIEH', 'CHIE', 'CIE'],
  qiao: ['ㄑㄧㄠ', 'CHIAO', 'CHIAU', 'CIAO'],
  qiu: ['ㄑㄧㄡ', 'CHIU', 'CHIOU', 'CIOU'],
  qian: ['ㄑㄧㄢ', 'CHIEN', 'CHIAN', 'CIAN'],
  qin: ['ㄑㄧㄣ', 'CHIN', 'CHIN', 'CIN'],
  qiang: ['ㄑㄧㄤ', 'CHIANG', 'CHIANG', 'CIANG'],
  qing: ['ㄑㄧㄥ', 'CHING', 'CHING', 'CING'],
  qu: ['ㄑㄩ', 'CHU', 'CHIU', 'CYU'],
  que: ['ㄑㄩㄝ', 'CHUEH', 'CHIUE', 'CYUE'],
  quan: ['ㄑㄩㄢ', 'CHUAN', 'CHIUAN', 'CYUAN'],
  qun: ['ㄑㄩㄣ', 'CHUN', 'CHIUN', 'CYUN'],
  qiong: ['ㄑㄩㄥ', 'CHIUNG', 'CHIUNG', 'CYONG'],
  xi: ['ㄒㄧ', 'HSI', 'SHI', 'SI'],
  xia: ['ㄒㄧㄚ', 'HSIA', 'SHIA', 'SIA'],
  xie: ['ㄒㄧㄝ', 'HSIEH', 'SHIE', 'SIE'],
  xiao: ['ㄒㄧㄠ', 'HSIAO', 'SHIAU', 'SIAO'],
  xiu: ['ㄒㄧㄡ', 'HSIU', 'SHIOU', 'SIOU'],
  xian: ['ㄒㄧㄢ', 'HSIEN', 'SHIAN', 'SIAN'],
  xin: ['ㄒㄧㄣ', 'HSIN', 'SHIN', 'SIN'],
  xiang: ['ㄒㄧㄤ', 'HSIANG', 'SHIANG', 'SIANG'],
  xing: ['ㄒㄧㄥ', 'HSING', 'SHING', 'SING'],
  xu: ['ㄒㄩ', 'HSU', 'SHIU', 'SYU'],
  xue: ['ㄒㄩㄝ', 'HSUEH', 'SHIUE', 'SYUE'],
  xuan: ['ㄒㄩㄢ', 'HSUAN', 'SHIUAN', 'SYUAN'],
  xun: ['ㄒㄩㄣ', 'HSUN', 'SHIUN', 'SYUN'],
  xiong: ['ㄒㄩㄥ', 'HSIUNG', 'SHIUNG', 'SYONG'],
  zhi: ['ㄓ', 'CHIH', 'JR', 'JHIH'],
  zha: ['ㄓㄚ', 'CHA', 'JA', 'JHA'],
  zhe: ['ㄓㄜ', 'CHE', 'JE', 'JHE'],
  zhai: ['ㄓㄞ', 'CHAI', 'JAI', 'JHAI'],
  zhei: ['ㄓㄟ', 'CHEI', 'JEI', 'JHEI'],
  zhao: ['ㄓㄠ', 'CHAO', 'JAU', 'JHAO'],
  zhou: ['ㄓㄡ', 'CHOU', 'JOU', 'JHOU'],
  zhan: ['ㄓㄢ', 'CHAN', 'JAN', 'JHAN'],
  zhen: ['ㄓㄣ', 'CHEN', 'JEN', 'JHEN'],
  zhang: ['ㄓㄤ', 'CHANG', 'JANG', 'JHANG'],
  zheng: ['ㄓㄥ', 'CHENG', 'JENG', 'JHENG'],
  zhu: ['ㄓㄨ', 'CHU', 'JU', 'JHU'],
  zhua: ['ㄓㄨㄚ', 'CHUA', 'JUA', 'JHUA'],
  zhuo: ['ㄓㄨㄛ', 'CHO', 'JUO', 'JHUO'],
  zhuai: ['ㄓㄨㄞ', 'CHUAI', 'JUAI', 'JHUAI'],
  zhui: ['ㄓㄨㄟ', 'CHUI', 'JUEI', 'JHUEI'],
  zhuan: ['ㄓㄨㄢ', 'CHUAN', 'JUAN', 'JHUAN'],
  zhun: ['ㄓㄨㄣ', 'CHUN', 'JUEN', 'JHUN'],
  zhuang: ['ㄓㄨㄤ', 'CHUANG', 'JUANG', 'JHUANG'],
  zhong: ['ㄓㄨㄥ', 'CHUNG', 'JUNG', 'JHONG'],
  chi: ['ㄔ', 'CHIH', 'CHR', 'CHIH'],
  cha: ['ㄔㄚ', 'CHA', 'CHA', 'CHA'],
  che: ['ㄔㄜ', 'CHE', 'CHE', 'CHE'],
  chai: ['ㄔㄞ', 'CHAI', 'CHAI', 'CHAI'],
  chao: ['ㄔㄠ', 'CHAO', 'CHAU', 'CHAO'],
  chou: ['ㄔㄡ', 'CHOU', 'CHOU', 'CHOU'],
  chan: ['ㄔㄢ', 'CHAN', 'CHAN', 'CHAN'],
  chen: ['ㄔㄣ', 'CHEN', 'CHEN', 'CHEN'],
  chang: ['ㄔㄤ', 'CHANG', 'CHANG', 'CHANG'],
  cheng: ['ㄔㄥ', 'CHENG', 'CHENG', 'CHENG'],
  chu: ['ㄔㄨ', 'CHU', 'CHU', 'CHU'],
  chua: ['ㄔㄨㄚ', 'CHUA', 'CHUA', 'CHUA'],
  chuo: ['ㄔㄨㄛ', 'CHO', 'CHUO', 'CHUO'],
  chuai: ['ㄔㄨㄞ', 'CHUAI', 'CHUAI', 'CHUAI'],
  chui: ['ㄔㄨㄟ', 'CHUI', 'CHUEI', 'CHUEI'],
  chuan: ['ㄔㄨㄢ', 'CHUAN', 'CHUAN', 'CHUAN'],
  chun: ['ㄔㄨㄣ', 'CHUN', 'CHUEN', 'CHUN'],
  chuang: ['ㄔㄨㄤ', 'CHUANG', 'CHUANG', 'CHUANG'],
  chong: ['ㄔㄨㄥ', 'CHUNG', 'CHUNG', 'CHONG'],
  shi: ['ㄕ', 'SHIH', 'SHR', 'SHIH'],
  sha: ['ㄕㄚ', 'SHA', 'SHA', 'SHA'],
  she: ['ㄕㄜ', 'SHE', 'SHE', 'SHE'],
  shai: ['ㄕㄞ', 'SHAI', 'SHAI', 'SHAI'],
  shei: ['ㄕㄟ', 'SHEI', 'SHEI', 'SHEI'],
  shao: ['ㄕㄠ', 'SHAO', 'SHAU', 'SHAO'],
  shou: ['ㄕㄡ', 'SHOU', 'SHOU', 'SHOU'],
  shan: ['ㄕㄢ', 'SHAN', 'SHAN', 'SHAN'],
  shen: ['ㄕㄣ', 'SHEN', 'SHEN', 'SHEN'],
  shang: ['ㄕㄤ', 'SHANG', 'SHANG', 'SHANG'],
  sheng: ['ㄕㄥ', 'SHENG', 'SHENG', 'SHENG'],
  shu: ['ㄕㄨ', 'SHU', 'SHU', 'SHU'],
  shua: ['ㄕㄨㄚ', 'SHUA', 'SHUA', 'SHUA'],
  shuo: ['ㄕㄨㄛ', 'SHUO', 'SHUO', 'SHUO'],
  shuai: ['ㄕㄨㄞ', 'SHUAI', 'SHUAI', 'SHUAI'],
  shui: ['ㄕㄨㄟ', 'SHUI', 'SHUEI', 'SHUEI'],
  shuan: ['ㄕㄨㄢ', 'SHUAN', 'SHUAN', 'SHUAN'],
  shun: ['ㄕㄨㄣ', 'SHUN', 'SHUEN', 'SHUN'],
  shuang: ['ㄕㄨㄤ', 'SHUANG', 'SHUANG', 'SHUANG'],
  ri: ['ㄖ', 'JIH', 'R', 'RIH'],
  re: ['ㄖㄜ', 'JE', 'RE', 'RE'],
  rao: ['ㄖㄠ', 'JAO', 'RAU', 'RAO'],
  rou: ['ㄖㄡ', 'JOU', 'ROU', 'ROU'],
  ran: ['ㄖㄢ', 'JAN', 'RAN', 'RAN'],
  ren: ['ㄖㄣ', 'JEN', 'REN', 'REN'],
  rang: ['ㄖㄤ', 'JANG', 'RANG', 'RANG'],
  reng: ['ㄖㄥ', 'JENG', 'RENG', 'RENG'],
  ru: ['ㄖㄨ', 'JU', 'RU', 'RU'],
  ruo: ['ㄖㄨㄛ', 'JO', 'RUO', 'RUO'],
  rui: ['ㄖㄨㄟ', 'JUI', 'RUEI', 'RUEI'],
  ruan: ['ㄖㄨㄢ', 'JUAN', 'RUAN', 'RUAN'],
  run: ['ㄖㄨㄣ', 'JUN', 'RUEN', 'RUN'],
  rong: ['ㄖㄨㄥ', 'JUNG', 'RUNG', 'RONG'],
  zi: ['ㄗ', 'TZU', 'TZ', 'ZIH'],
  za: ['ㄗㄚ', 'TSA', 'TZA', 'ZA'],
  ze: ['ㄗㄜ', 'TSE', 'TZE', 'ZE'],
  zai: ['ㄗㄞ', 'TSAI', 'TZAI', 'ZAI'],
  zei: ['ㄗㄟ', 'TSEI', 'TZEI', 'ZEI'],
  zao: ['ㄗㄠ', 'TSAO', 'TZAU', 'ZAO'],
  zou: ['ㄗㄡ', 'TSOU', 'TZOU', 'ZOU'],
  zan: ['ㄗㄢ', 'TSAN', 'TZAN', 'ZAN'],
  zen: ['ㄗㄣ', 'TSEN', 'TZEN', 'ZEN'],
  zang: ['ㄗㄤ', 'TSANG', 'TZANG', 'ZANG'],
  zeng: ['ㄗㄥ', 'TSENG', 'TZENG', 'ZENG'],
  zu: ['ㄗㄨ', 'TSU', 'TZU', 'ZU'],
  zuo: ['ㄗㄨㄛ', 'TSO', 'TZUO', 'ZUO'],
  zui: ['ㄗㄨㄟ', 'TSUI', 'TZUEI', 'ZUEI'],
  zuan: ['ㄗㄨㄢ', 'TSUAN', 'TZUAN', 'ZUAN'],
  zun: ['ㄗㄨㄣ', 'TSUN', 'TZUEN', 'ZUN'],
  zong: ['ㄗㄨㄥ', 'TSUNG', 'TZUNG', 'ZONG'],
  ci: ['ㄘ', 'TZU', 'TSZ', 'CIH'],
  ca: ['ㄘㄚ', 'TSA', 'TSA', 'CA'],
  ce: ['ㄘㄜ', 'TSE', 'TSE', 'CE'],
  cai: ['ㄘㄞ', 'TSAI', 'TSAI', 'CAI'],
  cao: ['ㄘㄠ', 'TSAO', 'TSAU', 'CAO'],
  cou: ['ㄘㄡ', 'TSOU', 'TSOU', 'COU'],
  can: ['ㄘㄢ', 'TSAN', 'TSAN', 'CAN'],
  cen: ['ㄘㄣ', 'TSEN', 'TSEN', 'CEN'],
  cang: ['ㄘㄤ', 'TSANG', 'TSANG', 'CANG'],
  ceng: ['ㄘㄥ', 'TSENG', 'TSENG', 'CENG'],
  cu: ['ㄘㄨ', 'TSU', 'TSU', 'CU'],
  cuo: ['ㄘㄨㄛ', 'TSO', 'TSUO', 'CUO'],
  cui: ['ㄘㄨㄟ', 'TSUI', 'TSUEI', 'CUEI'],
  cuan: ['ㄘㄨㄢ', 'TSUAN', 'TSUAN', 'CUAN'],
  cun: ['ㄘㄨㄣ', 'TSUN', 'TSUEN', 'CUN'],
  cong: ['ㄘㄨㄥ', 'TSUNG', 'TSUNG', 'CONG'],
  si: ['ㄙ', 'SSU', 'SZ', 'SIH'],
  sa: ['ㄙㄚ', 'SA', 'SA', 'SA'],
  se: ['ㄙㄜ', 'SE', 'SE', 'SE'],
  sai: ['ㄙㄞ', 'SAI', 'SAI', 'SAI'],
  sao: ['ㄙㄠ', 'SAO', 'SAU', 'SAO'],
  sou: ['ㄙㄡ', 'SOU', 'SOU', 'SOU'],
  san: ['ㄙㄢ', 'SAN', 'SAN', 'SAN'],
  sen: ['ㄙㄣ', 'SEN', 'SEN', 'SEN'],
  sang: ['ㄙㄤ', 'SANG', 'SANG', 'SANG'],
  seng: ['ㄙㄥ', 'SENG', 'SENG', 'SENG'],
  su: ['ㄙㄨ', 'SU', 'SU', 'SU'],
  suo: ['ㄙㄨㄛ', 'SO', 'SUO', 'SUO'],
  sui: ['ㄙㄨㄟ', 'SUI', 'SUEI', 'SUEI'],
  suan: ['ㄙㄨㄢ', 'SUAN', 'SUAN', 'SUAN'],
  sun: ['ㄙㄨㄣ', 'SUN', 'SUEN', 'SUN'],
  song: ['ㄙㄨㄥ', 'SUNG', 'SUNG', 'SONG'],
  yi: ['ㄧ', 'YI/I', 'YI', 'YI'],
  ya: ['ㄧㄚ', 'YA', 'YA', 'YA'],
  yo: ['ㄧㄛ', 'YO', 'YO', 'YO'],
  ye: ['ㄧㄝ', 'YEH', 'YE', 'YE'],
  yai: ['ㄧㄞ', 'YAI', 'YAI', 'YAI'],
  yao: ['ㄧㄠ', 'YAO', 'YAU', 'YAO'],
  you: ['ㄧㄡ', 'YU', 'YOU', 'YOU'],
  yan: ['ㄧㄢ', 'YEN', 'YAN', 'YAN'],
  yin: ['ㄧㄣ', 'YIN', 'YIN', 'YIN'],
  yang: ['ㄧㄤ', 'YANG', 'YANG', 'YANG'],
  ying: ['ㄧㄥ', 'YING', 'YING', 'YING'],
  wu: ['ㄨ', 'WU', 'WU', 'WU'],
  wa: ['ㄨㄚ', 'WA', 'WA', 'WA'],
  wo: ['ㄨㄛ', 'WO', 'WO', 'WO'],
  wai: ['ㄨㄞ', 'WAI', 'WAI', 'WAI'],
  wei: ['ㄨㄟ', 'WEI', 'WEI', 'WEI'],
  wan: ['ㄨㄢ', 'WAN', 'WAN', 'WAN'],
  wen: ['ㄨㄣ', 'WEN', 'WEN', 'WUN'],
  wang: ['ㄨㄤ', 'WANG', 'WANG', 'WANG'],
  weng: ['ㄨㄥ', 'WENG', 'WENG', 'WONG'],
  yu: ['ㄩ', 'YU', 'YU', 'YU'],
  yue: ['ㄩㄝ', 'YUEH', 'YUE', 'YUE'],
  yuan: ['ㄩㄢ', 'YUAN', 'YUAN', 'YUAN'],
  yun: ['ㄩㄣ', 'YUN', 'YUN', 'YUN'],
  yong: ['ㄩㄥ', 'YUNG', 'YUNG', 'YONG'],
  a: ['ㄚ', 'A', 'A', 'A'],
  o: ['ㄛ', 'O', 'O', 'O'],
  e: ['ㄜ', 'E/O', 'E', 'E'],
  ai: ['ㄞ', 'AI', 'AI', 'AI'],
  ei: ['ㄟ', 'EI', 'EI', 'EI'],
  ao: ['ㄠ', 'AO', 'AU', 'AO'],
  ou: ['ㄡ', 'OU', 'OU', 'OU'],
  an: ['ㄢ', 'AN', 'AN', 'AN'],
  en: ['ㄣ', 'EN', 'EN', 'EN'],
  ang: ['ㄤ', 'ANG', 'ANG', 'ANG'],
  eng: ['ㄥ', 'ENG', 'ENG', 'ENG'],
  er: ['ㄦ', 'ERH', 'ER', 'ER'],
};

const COLUMN: Record<Exclude<System, 'hanyu'>, 1 | 2 | 3> = { wg: 1, mps2: 2, tongyong: 3 };

/**
 * Surname readings commonly used in Taiwan that differ from pinyin-pro's surname mode
 * (e.g. 單 is read shan as a surname, 區 is read ou).
 */
export const TW_SURNAME_READINGS: Record<string, string> = {
  單: 'shan',
  区: 'ou',
  區: 'ou',
  繆: 'miao',
  缪: 'miao',
  樂: 'yue',
  乐: 'yue',
};

/** Converts any pinyin spelling (tone marks, tone numbers, ü / u: / v) to a table key. */
export function normalizePinyin(input: string): string {
  return input
    .normalize('NFC')
    .toLowerCase()
    .replace(/ü|u:|ǖ|ǘ|ǚ|ǜ/g, 'v')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '');
}

export function isKnownSyllable(key: string): boolean {
  return Object.hasOwn(SYLLABLES, key);
}

export function bopomofo(key: string): string {
  return SYLLABLES[key]?.[0] ?? '';
}

/** All official spellings of a syllable in one system (WG sometimes lists two, e.g. HE / HO). */
export function spellings(key: string, system: System): string[] {
  const row = SYLLABLES[key];
  // Unknown syllables (interjections such as hm, ng) fall back to plain upper-case pinyin.
  if (!row || system === 'hanyu') return [key.toUpperCase().replace(/V/g, 'U')];
  return row[COLUMN[system]].split('/');
}

export interface NameSyllable {
  /** Table key (漢語拼音 without tones, ü as v), or the raw upper-case text for non-Chinese input. */
  key: string;
  /** Index into spellings(key, 'wg') when WG offers alternatives. */
  wgVariant?: number;
  /** Latin letters typed directly are kept as-is. */
  literal?: boolean;
}

export function romanizeSyllable(s: NameSyllable, system: System): string {
  if (s.literal) return s.key.toUpperCase();
  const options = spellings(s.key, system);
  return system === 'wg' ? (options[s.wgVariant ?? 0] ?? options[0]) : options[0];
}

export interface FormatOptions {
  /** Join given-name syllables with "-" (YI-HSUAN) or write them together (YIHSUAN). */
  hyphen: boolean;
}

/**
 * Passport order per 護照條例施行細則第 14 條: SURNAME, GIVEN-NAME. Syllables of a compound
 * surname are written together (歐陽 → OUYANG).
 */
export function formatPassportName(surname: NameSyllable[], given: NameSyllable[], system: System, opts: FormatOptions): string {
  const last = surname.map((s) => romanizeSyllable(s, system)).join('');
  const first = given.map((s) => romanizeSyllable(s, system)).join(opts.hyphen ? '-' : '');
  if (!last) return first;
  if (!first) return last;
  return `${last}, ${first}`;
}

/** Letters counted toward the 39-letter limit (第 14 條第 7 款: 含字間在內). */
export function passportLength(name: string): number {
  return name.length;
}

export const MAX_PASSPORT_LETTERS = 39;

export type Segment = { kind: 'han'; char: string } | { kind: 'latin'; text: string };

/** Splits a name into Chinese characters and runs of Latin letters; other characters are dropped. */
export function segmentName(input: string): Segment[] {
  const out: Segment[] = [];
  for (const m of input.matchAll(/(\p{Script=Han})|([A-Za-z]+)/gu)) {
    if (m[1]) out.push({ kind: 'han', char: m[1] });
    else out.push({ kind: 'latin', text: m[2] });
  }
  return out;
}

/**
 * Orders candidate readings for a character: the preferred (context or surname) reading first,
 * then the rest, keeping only syllables in the official table when at least one is known.
 */
export function orderReadings(preferred: string | undefined, all: string[]): string[] {
  const keys = [preferred, ...all].filter((x): x is string => !!x).map(normalizePinyin).filter(Boolean);
  const unique = [...new Set(keys)];
  const known = unique.filter(isKnownSyllable);
  return known.length ? known : unique;
}

/** Returns pinyin (one entry per character) for `text`; `surname` enables surname readings. */
export type PinyinFn = (text: string, surname: boolean) => string[];
/** Traditional → Simplified conversion (opencc-js t2cn). */
export type Simplify = (text: string) => string;

/**
 * Simplified form of `han` used for pinyin lookups. pinyin-pro's word dictionary is keyed on
 * Simplified Chinese, so 重陽 only reads chong yang after becoming 重阳. Names convert 1:1 per
 * character; if the conversion ever changes the length, the original text is used instead.
 */
export function simplifiedForLookup(han: string, simplify?: Simplify): string {
  if (!simplify || !han) return han;
  try {
    const simp = simplify(han);
    return Array.from(simp).length === Array.from(han).length ? simp : han;
  } catch {
    return han;
  }
}

/** Context-aware reading for each character of `han` (Chinese characters only), as table keys. */
export function contextReadings(han: string, surname: boolean, pinyinFn: PinyinFn, simplify?: Simplify): string[] {
  const count = Array.from(han).length;
  if (count === 0) return [];
  const lookup = simplifiedForLookup(han, simplify);
  let result = pinyinFn(lookup, surname);
  if (result.length !== count && lookup !== han) result = pinyinFn(han, surname);
  return result.map(normalizePinyin);
}

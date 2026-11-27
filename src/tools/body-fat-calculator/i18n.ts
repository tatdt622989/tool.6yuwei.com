import { defineToolI18n } from '../../i18n/tool';
import type { BodyFatProblem, FatCategory } from './logic';

export interface Strings {
  sexLabel: string;
  male: string;
  female: string;
  age: string;
  heightCm: string;
  weightKg: string;
  neckCm: string;
  /** Initial waist label (male); the script swaps it for the female wording. */
  waistCm: string;
  hipCm: string;
  /** Present only where a US customary / metric toggle is offered (en). US is the default. */
  units?: {
    legend: string;
    imperial: string;
    metric: string;
    heightFt: string;
    heightIn: string;
    weightLb: string;
    neckIn: string;
    waistIn: string;
    hipIn: string;
  };
  measureHint: string;
  resultLabel: string;
  deuLabel: string;
  fatLabel: string;
  leanLabel: string;
  /** Initial label of the fourth stat (obesity cutoff, or BMI when `fourth` is 'bmi'). */
  fourthLabel: string;
  tableLabel: string;
  thCategory: string;
  thRange: string;
  disclaimer: string;
  client: {
    /** Fourth stat: a national body-fat obesity cutoff, or plain BMI. */
    fourth: 'cutoff' | 'bmi';
    categories: Record<FatCategory['id'], string>;
    belowEssential: string;
    /** Appended to the user's row in the table. */
    you: string;
    /** Last open-ended row: {min} */
    rangeOpen: string;
    waistMale: string;
    waistFemale: string;
    waistMaleIn?: string;
    waistFemaleIn?: string;
    /** {sex} {n}: used when fourth is 'cutoff'. */
    cutoffLabel?: string;
    cutoffSex?: { male: string; female: string };
    obese?: string;
    notObese?: string;
    /** {sex} */
    tableLabel: string;
    tableSex: { male: string; female: string };
    missingMale: string;
    missingFemale: string;
    problems: Record<Exclude<BodyFatProblem, 'missing'>, string>;
    fallback: string;
    kg: string;
    lb: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    sexLabel: '性別',
    male: '男性',
    female: '女性',
    age: '年齡（歲）',
    heightCm: '身高（公分）',
    weightKg: '體重（公斤）',
    neckCm: '頸圍（公分）',
    waistCm: '腰圍（公分，肚臍高度）',
    hipCm: '臀圍（公分，最寬處）',
    measureHint: '用軟尺水平量測、不要憋氣或縮小腹。頸圍量喉結下方最細處；男性腰圍量肚臍高度，女性量腰部最細處；臀圍量臀部最寬處。',
    resultLabel: '體脂率（美國海軍圍度公式）',
    deuLabel: 'BMI 推估體脂率（Deurenberg）',
    fatLabel: '體脂肪重量',
    leanLabel: '去脂體重（肌肉、骨骼、水分等）',
    fourthLabel: '國健署肥胖切點',
    tableLabel: '體脂率分類（ACE 美國運動委員會）',
    thCategory: '分類',
    thRange: '體脂率範圍',
    disclaimer:
      '結果僅供參考，請諮詢醫師。圍度與 BMI 公式都是統計推估，誤差約 3%–4% 以上，不能用於診斷；孕婦、未滿 18 歲與高齡者不適用。資料只在瀏覽器中計算，不會上傳。',
    client: {
      fourth: 'cutoff',
      categories: { essential: '必需脂肪', athlete: '運動員', fitness: '健康良好', average: '一般', obese: '肥胖' },
      belowEssential: '低於必需脂肪',
      you: '（你的位置）',
      rangeOpen: '{min}% 以上',
      waistMale: '腰圍（公分，肚臍高度）',
      waistFemale: '腰圍（公分，腰部最細處）',
      cutoffLabel: '國健署肥胖切點（{sex}性 {n}%）',
      cutoffSex: { male: '男', female: '女' },
      obese: '已達肥胖',
      notObese: '未達肥胖',
      tableLabel: '{sex}體脂率分類（ACE 美國運動委員會）',
      tableSex: { male: '男性', female: '女性' },
      missingMale: '請填寫年齡、身高、體重、頸圍與腰圍。',
      missingFemale: '請填寫年齡、身高、體重、頸圍、腰圍與臀圍。',
      problems: {
        age: '本公式適用 18 歲以上成人，請輸入 18 到 100 歲。',
        height: '身高請以公分輸入，例如 170。',
        weight: '體重請以公斤輸入，例如 65。',
        neck: '頸圍請以公分輸入，一般成人約 30 到 45 公分。',
        waist: '腰圍請以公分輸入，例如 80。',
        hip: '臀圍請以公分輸入，例如 95。',
        waistNeck: '腰圍必須大於頸圍，請確認是否量錯位置。',
      },
      fallback: '量測數值無法計算，請確認腰圍、臀圍與頸圍。',
      kg: 'kg',
      lb: 'lb',
    },
  },
  en: {
    sexLabel: 'Sex',
    male: 'Male',
    female: 'Female',
    age: 'Age (years)',
    heightCm: 'Height (cm)',
    weightKg: 'Weight (kg)',
    neckCm: 'Neck (cm)',
    waistCm: 'Waist (cm, at the navel)',
    hipCm: 'Hips (cm, widest point)',
    units: {
      legend: 'Units',
      imperial: 'US (in, lb)',
      metric: 'Metric (cm, kg)',
      heightFt: 'Height (ft)',
      heightIn: 'Height (in)',
      weightLb: 'Weight (lb)',
      neckIn: 'Neck (in)',
      waistIn: 'Waist (in, at the navel)',
      hipIn: 'Hips (in, widest point)',
    },
    measureHint:
      'Use a soft tape measure held level and snug, without compressing the skin. Breathe out normally; don’t suck in. Neck: just below the Adam’s apple. Waist: men at the navel, women at the narrowest point. Hips: around the widest part of the buttocks.',
    resultLabel: 'Body fat (US Navy method)',
    deuLabel: 'BMI-based estimate (Deurenberg)',
    fatLabel: 'Fat mass',
    leanLabel: 'Lean body mass (muscle, bone, water)',
    fourthLabel: 'BMI',
    tableLabel: 'Body fat categories (American Council on Exercise)',
    thCategory: 'Category',
    thRange: 'Body fat',
    disclaimer:
      'For information only, not medical advice. Tape and BMI formulas are statistical estimates with a typical error of 3 to 4 percentage points or more. They are not meant for pregnant women, people under 18, or older adults. Everything is calculated in your browser and nothing is uploaded.',
    client: {
      fourth: 'bmi',
      categories: { essential: 'Essential fat', athlete: 'Athletes', fitness: 'Fitness', average: 'Average', obese: 'Obese' },
      belowEssential: 'Below essential fat',
      you: ' (you)',
      rangeOpen: '{min}% and up',
      waistMale: 'Waist (cm, at the navel)',
      waistFemale: 'Waist (cm, narrowest point)',
      waistMaleIn: 'Waist (in, at the navel)',
      waistFemaleIn: 'Waist (in, narrowest point)',
      tableLabel: 'Body fat categories for {sex} (American Council on Exercise)',
      tableSex: { male: 'men', female: 'women' },
      missingMale: 'Enter your age, height, weight, neck and waist.',
      missingFemale: 'Enter your age, height, weight, neck, waist and hips.',
      problems: {
        age: 'This formula is for adults. Enter an age from 18 to 100.',
        height: 'Enter a height between 3 ft 11 in and 7 ft 6 in (120 to 230 cm).',
        weight: 'Enter a weight between 66 and 660 lb (30 to 300 kg).',
        neck: 'Check your neck measurement. Most adults measure 12 to 18 in (30 to 45 cm).',
        waist: 'Enter a waist between 16 and 78 in (40 to 200 cm).',
        hip: 'Enter a hip measurement between 20 and 78 in (50 to 200 cm).',
        waistNeck: 'Your waist must be larger than your neck. Check where you measured.',
      },
      fallback: 'These measurements can’t be calculated. Check your neck, waist and hips.',
      kg: 'kg',
      lb: 'lb',
    },
  },
  ja: {
    sexLabel: '性別',
    male: '男性',
    female: '女性',
    age: '年齢（歳）',
    heightCm: '身長（cm）',
    weightKg: '体重（kg）',
    neckCm: '首回り（cm）',
    waistCm: 'ウエスト（cm、へその高さ）',
    hipCm: 'ヒップ（cm、いちばん太い所）',
    measureHint:
      'メジャーを床と水平にして、締めつけすぎずに測ります。息を止めたりお腹をへこませたりせず、軽く息を吐いた状態で測ってください。首回りはのど仏のすぐ下、男性のウエストはへその高さ、女性はいちばん細い所、ヒップはお尻のいちばん出ている所です。',
    resultLabel: '体脂肪率（米海軍式・周囲長法）',
    deuLabel: 'BMI から推定した体脂肪率（Deurenberg 式）',
    fatLabel: '体脂肪量',
    leanLabel: '除脂肪体重（筋肉・骨・水分など）',
    fourthLabel: '肥満の目安',
    tableLabel: '体脂肪率の区分（ACE・米国運動協議会）',
    thCategory: '区分',
    thRange: '体脂肪率',
    disclaimer:
      '結果は目安です。周囲長や BMI から求める式はいずれも統計的な推定で、3〜4% 以上の誤差があり、診断には使えません。妊娠中の方、18 歳未満の方、高齢の方には適しません。計算はすべてブラウザ内で行い、データは送信されません。',
    client: {
      fourth: 'cutoff',
      categories: { essential: '必須脂肪', athlete: 'アスリート', fitness: '健康的', average: '平均的', obese: '肥満' },
      belowEssential: '必須脂肪未満',
      you: '（あなた）',
      rangeOpen: '{min}% 以上',
      waistMale: 'ウエスト（cm、へその高さ）',
      waistFemale: 'ウエスト（cm、いちばん細い所）',
      cutoffLabel: '肥満の目安（{sex} {n}% 以上）',
      cutoffSex: { male: '男性', female: '女性' },
      obese: '目安以上',
      notObese: '目安未満',
      tableLabel: '{sex}の体脂肪率の区分（ACE・米国運動協議会）',
      tableSex: { male: '男性', female: '女性' },
      missingMale: '年齢・身長・体重・首回り・ウエストを入力してください。',
      missingFemale: '年齢・身長・体重・首回り・ウエスト・ヒップを入力してください。',
      problems: {
        age: 'この式は成人向けです。18〜100 歳で入力してください。',
        height: '身長は cm で入力してください（例：165）。',
        weight: '体重は kg で入力してください（例：60）。',
        neck: '首回りは cm で入力してください。成人ではおよそ 30〜45cm です。',
        waist: 'ウエストは cm で入力してください（例：80）。',
        hip: 'ヒップは cm で入力してください（例：92）。',
        waistNeck: 'ウエストは首回りより大きい値になります。測る位置を確認してください。',
      },
      fallback: 'この数値では計算できません。首回り・ウエスト・ヒップを確認してください。',
      kg: 'kg',
      lb: 'lb',
    },
  },
});

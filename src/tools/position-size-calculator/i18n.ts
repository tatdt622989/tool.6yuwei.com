import type { PluralForms } from '../../i18n/format';
import { defineToolI18n } from '../../i18n/tool';
import type { PositionField, Side } from './logic';

interface Field {
  label: string;
  hint?: string;
}

export interface Strings {
  account: Field;
  risk: Field;
  entry: Field;
  stop: Field;
  target: Field;
  lotSize: Field;
  /** Checkbox: round the quantity down to whole lots. */
  wholeLots: string;
  /** Default example, in this locale's market. Pre-filled so the page shows a result on load. */
  defaults: {
    account: string;
    risk: string;
    entry: string;
    stop: string;
    target: string;
    lotSize: string;
    wholeLots: boolean;
    ddLoss: string;
  };
  /** Static labels of the stat tiles (the script rewrites some of them with numbers). */
  stats: { budget: string; rps: string; cost: string; share: string; loss: string; rr: string; profit: string };
  formula: string;
  recoveryTitle: string;
  recoveryIntro: string;
  thLoss: string;
  thGain: string;
  ddLabel: string;
  streakTitle: string;
  streakIntro: string;
  streakAria: string;
  disclaimer: string;
  client: {
    prefKey: string;
    /** {n} */
    money: string;
    /** {n} = quantity */
    units: PluralForms;
    lots: PluralForms;
    /** 'always' when lots are an everyday word (張, 単元); 'wholeLots' = only when rounding to lots. */
    lotBreakdown: 'always' | 'wholeLots';
    /** {units} {lots} */
    qtyWithLots: string;
    /** {lots} {odd} */
    lotsAndOdd: string;
    /** Lot part when the quantity is below one lot. */
    oddOnly: string;
    qtyLabel: Record<Side, string>;
    /** {pct} */
    budgetLabel: string;
    /** {pct} */
    rpsLabel: string;
    /** {pct} */
    lossLabel: string;
    /** {r} */
    rr: string;
    /** {r} */
    rrLabel: string;
    rrEmpty: string;
    profitLabel: string;
    profitEmpty: string;
    errors: Record<PositionField, string>;
    stopAtEntry: string;
    targetSide: Record<Side, string>;
    /** {budget} {step} {stepLoss} */
    zeroQty: string;
    /** {cost} {pct} {cashQty} {cashLoss} {cashPct} */
    leverage: string;
    /** {cost} {pct} {step} */
    leverageNone: string;
    /** {n} */
    ddOut: string;
    ddAll: string;
    ddError: string;
    streakHead: string;
    /** {n} = losses in a row */
    streakRow: PluralForms;
    /** {n} = risk percent */
    streakCol: string;
    streakYours: string;
    /** {pct} {n} {left} {money} */
    streakNote: string;
  };
}

export default defineToolI18n<Strings>({
  'zh-TW': {
    account: { label: '本金（元）', hint: '這個交易帳戶可以動用的資金。' },
    risk: { label: '每筆風險（%）', hint: '碰到停損時，最多願意虧掉本金的幾 %；常見的經驗值是 1% 到 2%。' },
    entry: { label: '進場價（元）' },
    stop: { label: '停損價（元）', hint: '低於進場價視為做多，高於進場價視為做空。' },
    target: { label: '停利價（選填）', hint: '填了才會算風險報酬比與停利時的獲利。' },
    lotSize: { label: '每張股數', hint: '台股 1 張 = 1,000 股；美股、港股或其他商品可以改成自己的交易單位。' },
    wholeLots: '只買整張（不買零股）',
    defaults: { account: '1,000,000', risk: '2', entry: '100', stop: '95', target: '110', lotSize: '1000', wholeLots: false, ddLoss: '25' },
    stats: {
      budget: '風險預算',
      rps: '每股風險',
      cost: '投入金額',
      share: '佔本金比例',
      loss: '觸及停損的虧損',
      rr: '風險報酬比',
      profit: '到停利價的獲利',
    },
    formula:
      '可買股數＝本金 × 每筆風險 % ÷｜進場價 − 停損價｜，無條件捨去；勾選「只買整張」時再捨去到整張。停損時的虧損＝股數 × 每股風險，不會超過風險預算。',
    recoveryTitle: '虧損之後，要賺多少才能回本',
    recoveryIntro: '虧損後是用變小的本金去賺回來，所以回本需要的漲幅＝虧損 ÷（1 − 虧損），虧得越多越難追。',
    thLoss: '本金虧損',
    thGain: '回本需要的漲幅',
    ddLabel: '自己算：虧損（%）',
    streakTitle: '連續停損後，本金還剩多少',
    streakIntro: '假設每次都虧掉「當下本金」的固定比例，剩下的本金＝（1 − 每筆風險）的 N 次方。',
    streakAria: '連續停損後剩餘本金比較表',
    disclaimer:
      '本工具只做數學計算，不是投資建議。結果未計手續費、證交稅與滑價；跳空開低、漲跌停鎖死時可能無法在停損價出場，實際虧損可能超過風險預算。所有計算都在你的瀏覽器內完成。',
    client: {
      prefKey: 'position-size-calculator',
      money: '{n} 元',
      units: { other: '{n} 股' },
      lots: { other: '{n} 張' },
      lotBreakdown: 'always',
      qtyWithLots: '{units}（{lots}）',
      lotsAndOdd: '{lots} {odd}',
      oddOnly: '零股',
      qtyLabel: { long: '可買股數（做多）', short: '可放空股數（做空）' },
      budgetLabel: '風險預算（本金 × {pct}%）',
      rpsLabel: '每股風險（停損距進場 {pct}%）',
      lossLabel: '觸及停損的虧損（本金的 {pct}%）',
      rr: '1 : {r}',
      rrLabel: '風險報酬比（停利 = {r}R）',
      rrEmpty: '風險報酬比（填停利價才會計算）',
      profitLabel: '到停利價的獲利',
      profitEmpty: '到停利價的獲利（填停利價才會計算）',
      errors: {
        account: '請輸入大於 0 的本金，例如 1,000,000。',
        risk: '每筆風險請填大於 0、最多 100 的百分比，常見是 1 或 2。',
        entry: '請輸入大於 0 的進場價。',
        stop: '請輸入大於 0 的停損價。',
        target: '停利價請填大於 0 的數字，不需要可以留空。',
        lotSize: '每張股數請填 1 以上的整數，例如 1,000。',
      },
      stopAtEntry: '停損價不能等於進場價：每股風險是 0，算不出可以買多少。',
      targetSide: {
        long: '停損價低於進場價，視為做多，停利價要高於進場價。',
        short: '停損價高於進場價，視為做空，停利價要低於進場價。',
      },
      zeroQty: '風險預算 {budget}不夠買 {step}：{step}碰到停損就會虧 {stepLoss}。可以提高每筆風險、改買零股，或重新評估停損位置。',
      leverage:
        '投入金額 {cost}是本金的 {pct}%，超過本金，要用融資、融券或其他槓桿才做得到。不用槓桿最多 {cashQty}，停損時虧損 {cashLoss}（本金的 {cashPct}%）。',
      leverageNone: '投入金額 {cost}是本金的 {pct}%，超過本金，要用融資、融券或其他槓桿才做得到；只用現金連 {step}都買不起。',
      ddOut: '要上漲 {n}% 才能回本',
      ddAll: '虧損 100% 代表本金歸零，已經沒有本金可以賺回來。',
      ddError: '請輸入 0 到 100 之間的虧損百分比。',
      streakHead: '連續停損',
      streakRow: { other: '{n} 次' },
      streakCol: '每筆 {n}%',
      streakYours: '你的 {n}%',
      streakNote: '以每筆 {pct}% 計算，連續停損 {n} 次後本金剩 {left}%，約 {money}。',
    },
  },
  en: {
    account: { label: 'Account size ($)', hint: 'The money in the account you are trading from.' },
    risk: { label: 'Risk per trade (%)', hint: 'How much of the account you accept to lose if the stop is hit. 1% to 2% is a common rule of thumb.' },
    entry: { label: 'Entry price ($)' },
    stop: { label: 'Stop-loss price ($)', hint: 'Below the entry for a long trade, above it for a short.' },
    target: { label: 'Target price (optional)', hint: 'Add one to see the reward/risk ratio and the profit at the target.' },
    lotSize: { label: 'Shares per lot', hint: 'A round lot is 100 shares. Change it for other markets or contract sizes.' },
    wholeLots: 'Round down to whole lots',
    defaults: { account: '10,000', risk: '2', entry: '50', stop: '47.50', target: '55', lotSize: '100', wholeLots: false, ddLoss: '25' },
    stats: {
      budget: 'Amount at risk',
      rps: 'Risk per share',
      cost: 'Position cost',
      share: 'Share of account',
      loss: 'Loss if stopped out',
      rr: 'Reward/risk',
      profit: 'Profit at target',
    },
    formula:
      'Shares = account × risk % ÷ |entry − stop|, rounded down (and down to whole lots if you choose). The loss at the stop is shares × risk per share, so it never exceeds the amount at risk.',
    recoveryTitle: 'The gain you need to recover from a loss',
    recoveryIntro: 'After a loss you are growing a smaller account, so the gain needed to break even is loss ÷ (1 − loss). It climbs fast.',
    thLoss: 'Account loss',
    thGain: 'Gain to break even',
    ddLabel: 'Try your own loss (%)',
    streakTitle: 'What a losing streak leaves you',
    streakIntro: 'If every loss takes the same percent of what is left, the account after N losses is (1 − risk)^N.',
    streakAria: 'Account left after a losing streak',
    disclaimer:
      'This is a math tool, not investment advice. It ignores commissions, fees and slippage, and a price that gaps past your stop can make the real loss larger than the amount at risk. Everything is calculated in your browser.',
    client: {
      prefKey: 'position-size-calculator:en',
      money: '${n}',
      units: { one: '{n} share', other: '{n} shares' },
      lots: { one: '{n} lot', other: '{n} lots' },
      lotBreakdown: 'wholeLots',
      qtyWithLots: '{units} ({lots})',
      lotsAndOdd: '{lots} + {odd}',
      oddOnly: 'odd lot',
      qtyLabel: { long: 'Shares to buy (long)', short: 'Shares to sell short' },
      budgetLabel: 'Amount at risk ({pct}% of account)',
      rpsLabel: 'Risk per share (stop {pct}% away)',
      lossLabel: 'Loss if stopped out ({pct}% of account)',
      rr: '1 : {r}',
      rrLabel: 'Reward/risk (target = {r}R)',
      rrEmpty: 'Reward/risk (add a target price)',
      profitLabel: 'Profit at target',
      profitEmpty: 'Profit at target (add a target price)',
      errors: {
        account: 'Enter an account size above 0, such as 10,000.',
        risk: 'Enter a risk per trade above 0% and up to 100%. 1 or 2 is common.',
        entry: 'Enter an entry price above 0.',
        stop: 'Enter a stop-loss price above 0.',
        target: 'Enter a target price above 0, or leave it blank.',
        lotSize: 'Shares per lot must be a whole number of at least 1, such as 100.',
      },
      stopAtEntry: 'The stop can’t equal the entry: with zero risk per share there is no position size to calculate.',
      targetSide: {
        long: 'Your stop is below the entry, so this is a long trade and the target must be above the entry.',
        short: 'Your stop is above the entry, so this is a short trade and the target must be below the entry.',
      },
      zeroQty: 'Your {budget} at risk can’t cover {step}: {step} would lose {stepLoss} at the stop. Raise the risk, allow odd lots or rethink the stop.',
      leverage:
        'The position costs {cost}, {pct}% of your account, so it needs margin or other leverage. Without leverage the most you can trade is {cashQty}, losing {cashLoss} ({cashPct}% of the account) at the stop.',
      leverageNone: 'The position costs {cost}, {pct}% of your account, so it needs margin or other leverage. Without leverage you can’t afford even {step}.',
      ddOut: 'You need a {n}% gain to break even',
      ddAll: 'A 100% loss wipes out the account: there is nothing left to grow back.',
      ddError: 'Enter a loss between 0% and 100%.',
      streakHead: 'Losses in a row',
      streakRow: { one: '{n} loss', other: '{n} losses' },
      streakCol: '{n}% risk',
      streakYours: 'Your {n}%',
      streakNote: 'At {pct}% per trade, {n} losses in a row leave {left}% of the account, about {money}.',
    },
  },
  ja: {
    account: { label: '投資資金（円）', hint: 'この取引に使える口座の資金です。' },
    risk: { label: '1 回の許容損失（%）', hint: '損切りになったとき、資金の何%まで失ってよいか。1% から 2% がよく使われる目安です。' },
    entry: { label: 'エントリー価格（円）' },
    stop: { label: '損切り価格（円）', hint: 'エントリー価格より下なら買い、上なら空売りとして計算します。' },
    target: { label: '利確価格（任意）', hint: '入力するとリスクリワード比と利確時の利益を計算します。' },
    lotSize: { label: '1 単元の株数', hint: '日本株は 100 株で 1 単元です。ほかの市場や商品では取引単位に合わせて変更できます。' },
    wholeLots: '単元株で買う（単元未満は切り捨て）',
    defaults: { account: '1,000,000', risk: '2', entry: '1,000', stop: '950', target: '1,100', lotSize: '100', wholeLots: true, ddLoss: '25' },
    stats: {
      budget: '許容損失額',
      rps: '1 株あたりのリスク',
      cost: '必要資金',
      share: '資金に占める割合',
      loss: '損切り時の損失',
      rr: 'リスクリワード比',
      profit: '利確時の利益',
    },
    formula:
      '株数＝投資資金 × 許容損失% ÷｜エントリー価格 − 損切り価格｜（端数切り捨て）。単元株で買う場合は、さらに単元単位に切り捨てます。損切り時の損失は株数 × 1 株あたりのリスクなので、許容損失額を超えません。',
    recoveryTitle: '損失を取り戻すのに必要な上昇率',
    recoveryIntro: '損失が出たあとは減った資金で取り戻すことになるため、必要な上昇率は「損失 ÷（1 − 損失）」です。損失が大きいほど急に難しくなります。',
    thLoss: '資金の損失',
    thGain: '元に戻すのに必要な上昇率',
    ddLabel: '損失率を入力（%）',
    streakTitle: '連続で損切りしたあとの資金',
    streakIntro: '毎回「その時点の資金」の同じ割合を失うとすると、N 回後に残る資金は（1 − 許容損失）の N 乗です。',
    streakAria: '連続損切り後に残る資金の比較表',
    disclaimer:
      'このツールは計算のためのもので、投資助言ではありません。売買手数料やスリッページは含みません。窓を開けて損切り価格を飛び越えた場合やストップ安で売れない場合は、実際の損失が許容損失額を超えることがあります。計算はすべてブラウザ内で行います。',
    client: {
      prefKey: 'position-size-calculator:ja',
      money: '{n}円',
      units: { other: '{n}株' },
      lots: { other: '{n}単元' },
      lotBreakdown: 'always',
      qtyWithLots: '{units}（{lots}）',
      lotsAndOdd: '{lots}＋{odd}',
      oddOnly: '単元未満株',
      qtyLabel: { long: '買える株数（買い）', short: '空売りできる株数' },
      budgetLabel: '許容損失額（資金の {pct}%）',
      rpsLabel: '1 株あたりのリスク（エントリーから {pct}%）',
      lossLabel: '損切り時の損失（資金の {pct}%）',
      rr: '1 : {r}',
      rrLabel: 'リスクリワード比（利確 = {r}R）',
      rrEmpty: 'リスクリワード比（利確価格を入力すると表示）',
      profitLabel: '利確時の利益',
      profitEmpty: '利確時の利益（利確価格を入力すると表示）',
      errors: {
        account: '投資資金は 0 より大きい数値で入力してください（例：1,000,000）。',
        risk: '許容損失は 0 より大きく 100 以下の % で入力してください。1 か 2 がよく使われます。',
        entry: 'エントリー価格は 0 より大きい数値で入力してください。',
        stop: '損切り価格は 0 より大きい数値で入力してください。',
        target: '利確価格は 0 より大きい数値で入力するか、空欄にしてください。',
        lotSize: '1 単元の株数は 1 以上の整数で入力してください（例：100）。',
      },
      stopAtEntry: '損切り価格がエントリー価格と同じです。1 株あたりのリスクが 0 になるため、株数を計算できません。',
      targetSide: {
        long: '損切り価格がエントリー価格より下なので買いとして計算しています。利確価格はエントリー価格より上にしてください。',
        short: '損切り価格がエントリー価格より上なので空売りとして計算しています。利確価格はエントリー価格より下にしてください。',
      },
      zeroQty:
        '許容損失額 {budget} では {step}も持てません（{step}で損切りになると {stepLoss}の損失）。許容損失を上げる、単元未満株を使う、損切り位置を見直すなどを検討してください。',
      leverage:
        '必要資金 {cost}は資金の {pct}% で、資金を超えています。信用取引などのレバレッジが必要です。現金だけなら最大 {cashQty}で、損切り時の損失は {cashLoss}（資金の {cashPct}%）です。',
      leverageNone: '必要資金 {cost}は資金の {pct}% で、資金を超えています。信用取引などのレバレッジが必要で、現金だけでは {step}も買えません。',
      ddOut: '元に戻すには {n}% の上昇が必要です',
      ddAll: '100% の損失は資金がゼロになることを意味し、取り戻すための元手が残りません。',
      ddError: '損失率は 0 から 100 までの % で入力してください。',
      streakHead: '連続損切り',
      streakRow: { other: '{n} 回' },
      streakCol: '1 回 {n}%',
      streakYours: 'あなたの {n}%',
      streakNote: '1 回 {pct}% の損失で {n} 回続けて損切りすると、資金は {left}%（約 {money}）になります。',
    },
  },
});

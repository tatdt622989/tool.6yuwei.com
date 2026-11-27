import { defineTool } from '../types';

export default defineTool({
  slug: 'position-size-calculator',
  name: 'Position Size Calculator',
  seoTitle: 'Position Size Calculator: Shares to Buy From Your Stop Loss',
  description:
    'Free position size calculator: enter your account size, risk per trade, entry and stop loss to see how many shares to buy, what it costs and your reward/risk ratio.',
  category: 'finance',
  icon: 'Crosshair',
  keywords: [
    'position size calculator',
    'position sizing calculator',
    'stock position size calculator',
    'how many shares should i buy',
    'risk per trade calculator',
    'stop loss calculator',
    '1% rule trading calculator',
    'risk reward ratio calculator',
  ],
  intro:
    'Decide how much you are willing to lose first, then let the distance to your stop decide how many shares to buy. Enter your account, risk, entry and stop to get the share count, the position cost and the loss if the stop is hit.',
  howTo: [
    'Enter your “Account size ($)” and your “Risk per trade (%)”, the share of the account you accept to lose if the trade hits its stop. 1% to 2% is a common rule of thumb.',
    'Enter the “Entry price ($)” and the “Stop-loss price ($)”. A stop below the entry is treated as a long trade, a stop above it as a short. Add a “Target price (optional)” to see the reward/risk ratio.',
    'To trade only in round lots, check “Round down to whole lots”. “Shares per lot” is 100 by default; change it for markets or contracts with a different size.',
    'Read the number of shares at the top, then the amount at risk, risk per share, position cost, share of account, loss if stopped out and reward/risk. Below are the gain needed to recover from a loss and what a losing streak leaves of the account.',
  ],
  sections: [
    {
      heading: 'How position size is calculated',
      body: [
        'Position sizing takes three steps. Amount at risk = account × risk %. Risk per share = |entry − stop|. Shares = amount at risk ÷ risk per share, rounded down. With a $10,000 account and 2% risk you can lose $200 on the trade. Buying at $50 with a stop at $47.50 risks $2.50 per share, so you can buy 200 ÷ 2.50 = 80 shares for $4,000, or 40% of the account. If the stop is hit, you lose $200.',
        'Keep the same 2% risk but move the stop to $45 and each share now risks $5, so the position drops to 40 shares and $2,000. A wider stop means a smaller position: the stop distance decides the size, not how confident you feel. If the stop is above the entry, the calculator treats the trade as a short and the math is the same. With a target of $55, the trade risks $2.50 to make $5, a reward/risk of 1 : 2 (a 2R target), and the profit at the target is $400.',
      ],
    },
    {
      heading: 'The 1% and 2% rules',
      body: [
        '“Never risk more than 1% or 2% of your account on a single trade” is one of the most often cited rules of thumb in trading books and courses. It is not a regulation and it does not make a strategy profitable. What it does is keep a run of losing trades from doing serious damage, so you are still around to trade the next setup.',
        'The difference shows up in a losing streak. At 2% per trade, 10 losses in a row leave about 81.7% of the account. At 10% per trade the same streak leaves about 34.9%, and at 20% about 10.7%. This assumes each loss is a fixed percent of what is left at the time, which is how the losing-streak table under the calculator works.',
      ],
    },
    {
      heading: 'Why big losses are so hard to win back',
      body: [
        'After a loss you are growing a smaller account, so the gain needed to break even is loss ÷ (1 − loss). A 10% loss needs an 11.1% gain, 20% needs 25%, 30% needs 42.9%, 50% needs 100% and 90% needs 900%. Small drawdowns are easy to recover from, large ones are not.',
        'For example, a $10,000 account that falls 50% to $5,000 has to earn $5,000, which is 100% of what is left, to get back to $10,000. Type any loss into the calculator to see the gain it takes to recover.',
      ],
    },
    {
      heading: 'What the calculator leaves out',
      body: [
        'Results ignore commissions, regulatory fees and slippage. Many US brokers charge no commission on online stock trades, but a stop order that becomes a market order can still fill below your stop price in a fast market. A stock that gaps down overnight, for example after an earnings report, can open well past your stop, so the real loss can be larger than the amount at risk.',
        'If the position costs more than your account, the stop is very tight or the risk is high, and you would need margin to take the trade. Under the Federal Reserve’s Regulation T, a margin account can generally borrow up to 50% of the purchase price of a stock. The calculator flags this and shows the largest position you can pay for in cash. For a short, the position cost is the entry price × shares; margin requirements and borrow fees are not included. This is a math tool, not investment advice.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I calculate position size?',
      a: 'Shares = account × risk % ÷ |entry − stop|, rounded down. For a $10,000 account risking 2% with an entry at $50 and a stop at $47.50, that is $200 ÷ $2.50 = 80 shares.',
    },
    {
      q: 'What is the 1% rule in trading?',
      a: 'It is a commonly cited rule of thumb: size every trade so that hitting the stop loses no more than 1% of the account. Some traders use 2%, others less. It limits the damage of a losing streak but does not decide whether a trade is a good one.',
    },
    {
      q: 'Does it work for short selling?',
      a: 'Yes. Enter a stop above the entry and the calculator treats the trade as a short. Risk per share is still the distance between the two prices, and a target has to be below the entry.',
    },
    {
      q: 'What if the position costs more than my account?',
      a: 'Then the trade needs margin or other leverage. The calculator warns you and shows the largest position you can pay for in cash and what it would lose at the stop. You can also lower the risk per trade or rethink the stop.',
    },
    {
      q: 'Can I lose more than the amount I risk?',
      a: 'Yes. The amount at risk assumes you exit exactly at your stop. Fees, slippage and a price that gaps past the stop can all make the actual loss bigger.',
    },
    {
      q: 'Is this investment advice?',
      a: 'No. The calculator only does the math on the numbers you enter and says nothing about whether a trade is a good idea. Everything runs in your browser and nothing is uploaded.',
    },
  ],
  related: ['percentage-calculator', 'compound-interest'],
  priority: 80,
  updated: '2026-11-12',
});

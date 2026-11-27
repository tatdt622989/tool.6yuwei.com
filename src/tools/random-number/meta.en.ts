import { defineTool } from '../types';

export default defineTool({
  slug: 'random-number',
  name: 'Random Number Generator',
  seoTitle: 'Random Number Generator: Pick Numbers 1–10, 1–100 or Any Range',
  description:
    'Free random number generator. Pick one or many numbers in any range, with no repeats, decimals or sorting. Plus Powerball picks, a dice roller and a coin flip.',
  category: 'generator',
  icon: 'Dices',
  keywords: [
    'random number generator',
    'random number generator 1-10',
    'random number generator 1-100',
    'pick a random number',
    'random number picker',
    'random number generator no repeats',
    'random number list generator',
    'random decimal generator',
    'lottery number generator',
    'powerball number generator',
    'mega millions number generator',
    'roll a dice online',
    'dice roller',
    'flip a coin',
    'heads or tails',
    'true random number generator',
  ],
  intro:
    'Set a range and how many numbers you need, then get fair random numbers instantly. You can also roll up to 10 dice or flip a coin, and everything runs in your browser.',
  howTo: [
    'Choose a mode: Numbers, Roll dice or Flip a coin.',
    'In Numbers mode, enter Min, Max and How many. For decimals, choose the number of places under Decimals.',
    'Check No repeats if every number must be different, and choose Sort and Separate by as needed. Quick picks such as 1–100 or Powerball fill in the settings for you.',
    'Press Generate, then Copy results to paste them anywhere. For dice and coins, set the count and press Roll or Flip.',
  ],
  sections: [
    {
      heading: 'How random are these numbers?',
      body: [
        'Most built-in random functions, such as JavaScript’s Math.random(), are pseudo-random: an algorithm produces them from a seed, which is fine for games but predictable in principle. This generator uses crypto.getRandomValues(), which your operating system seeds with unpredictable hardware events. It is the same source browsers use for encryption keys.',
        'Scaling a random value into a range with a simple remainder makes some numbers slightly more likely than others. This tool uses rejection sampling instead: it discards the values that would cause that bias and draws again, so every whole number in your range has exactly the same chance. Ranges larger than about 4.3 billion combine two random words, up to 2^53. Nothing is sent to a server or logged.',
      ],
    },
    {
      heading: 'No repeats, decimals and lists',
      body: [
        'With No repeats checked, no number appears twice in the same draw. That is what you want for raffle tickets, picking students by roll number, assigning random seats or drawing a sample from a numbered list. The range must contain at least as many numbers as you ask for: 1 to 30 can give you at most 30 unique numbers, and the tool tells you if you ask for more.',
        'Decimals go up to 6 places. The range is split into equal steps and both ends are included, so 0 to 1 with 2 decimal places has 101 possible results, from 0.00 to 1.00. When you generate more than one number, the tool also shows the count, lowest, highest and average, which helps when you are building test data or a quick classroom demo.',
      ],
    },
    {
      heading: 'Powerball and Mega Millions quick picks',
      body: [
        'Powerball draws 5 white balls from 1 to 69 plus a red Powerball from 1 to 26, and Mega Millions draws 5 from 1 to 70 plus a gold Mega Ball from 1 to 24. The Powerball and Mega Millions buttons generate a full line in that format, with the main numbers sorted and the extra ball shown on its own line.',
        'The odds of matching every number are 1 in 292,201,338 for Powerball and 1 in 290,472,336 for Mega Millions, and every combination has exactly the same chance. A random pick won’t improve your odds, but it does avoid popular patterns such as birthdays (numbers 31 and under), which means fewer people to split a jackpot with if you do win.',
      ],
    },
    {
      heading: 'Dice rolls and coin flips',
      body: [
        'Dice mode rolls up to 10 six-sided dice and adds them up, which covers board games like Monopoly, Yahtzee or Catan when the dice go missing. With two dice, 7 is the most common total because 6 of the 36 combinations add up to it, a 1 in 6 chance.',
        'Coin mode flips up to 1,000 coins and shows the share of heads and tails. Each flip is independent: after five heads in a row, the next flip is still 50/50. Believing tails is “due” is known as the gambler’s fallacy. Ten heads in a row happens about once in every 1,024 tries, and the split only settles near 50% over many flips.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is this random number generator truly random?',
      a: 'It uses your browser’s cryptographically secure random source and removes modulo bias, so every number in the range is equally likely and the results can’t be predicted in advance.',
    },
    {
      q: 'Are the min and max included?',
      a: 'Yes. The range is inclusive, so 1 to 6 can return 1, 2, 3, 4, 5 or 6.',
    },
    {
      q: 'How do I generate numbers without repeats?',
      a: 'Check No repeats before pressing Generate. Each number in that draw will be different, as long as the range holds at least as many numbers as you ask for.',
    },
    {
      q: 'How many numbers can I generate at once?',
      a: 'Up to 10,000 per draw. With No repeats, the count can’t exceed the number of values in your range.',
    },
    {
      q: 'Can I generate negative numbers or decimals?',
      a: 'Yes. Enter a negative minimum such as -50, and choose 1 to 6 decimal places under Decimals.',
    },
    {
      q: 'Can a random number generator help me win the lottery?',
      a: 'No. Every combination has the same odds. A random pick only saves you from choosing numbers yourself and makes it less likely you share a jackpot with people who play birthdays.',
    },
  ],
  related: ['random-picker', 'spin-wheel', 'password-generator', 'qr-code-generator'],
  priority: 60,
  updated: '2026-10-29',
});

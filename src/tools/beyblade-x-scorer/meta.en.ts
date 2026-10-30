import { defineTool } from '../types';

export default defineTool({
  slug: 'beyblade-x-scorer',
  name: 'Beyblade X Score Tracker',
  seoTitle: 'Beyblade X Score Tracker: Official Points, 3on3 and Combo Win Rates',
  description:
    'Tap to score Beyblade X battles with official points (Spin 1, Over 2, Burst 2, Xtreme 3, first to 4), rotate 3on3 decks and find your best combo by win rate.',
  category: 'calc',
  icon: 'Disc3',
  keywords: [
    'beyblade x score tracker',
    'beyblade x scoring',
    'beyblade x scoring rules',
    'beyblade x points',
    'beyblade x score keeper',
    'beyblade x 3on3 rules',
    'beyblade x win rate',
    'xtreme finish points',
    'beyblade scoreboard',
    'beyblade x tournament scoring',
    'beyblade x scoreboard app',
    'best beyblade x combo',
    'how many points to win beyblade x',
  ],
  intro: 'Turn your phone into a match scoreboard: tap a finish to score, let 3on3 decks rotate on their own, and use real win rates to find your strongest combo.',
  howTo: [
    'Choose the points needed to win (4 is the official standard) and the format: 1on1 or 3on3.',
    'Enter both player names. To track win rates, enter the combo for 1on1 or the three Beys of each 3on3 deck.',
    'After each battle, tap the finish under the winning player: Spin, Over, Burst or Xtreme. Tap Draw when neither side wins.',
    'The match ends when a player reaches the target, and it is saved to the win-rate table below. Tap Undo to take back the last battle.',
  ],
  sections: [
    {
      heading: 'How Beyblade X scoring works',
      body: [
        "Under the standard official rules, the first player to reach 4 points wins. A Spin Finish, when the opponent's Bey stops spinning first, is worth 1 point. An Over Finish, knocking the opponent into an over zone, and a Burst Finish, when the opponent's Bey comes apart, are worth 2 points each. An Xtreme Finish, knocking the opponent into the Xtreme zone, is worth 3 points. When neither side can be called the winner, record a draw: nobody scores.",
        'Because an Xtreme Finish is worth 3, a player on 1 point can win the match with a single Xtreme. A 3-point lead can also vanish after two Over Finishes. Some events use a different target, so this tracker lets you switch between 3, 4, 5 and 7 points. Always follow the rules announced by your event.',
      ],
    },
    {
      heading: 'Scoring a 3on3 battle',
      body: [
        'In 3on3, each player brings three Beys and launches them in a set order: the first Bey in battle 1, the second in battle 2, the third in battle 3, then back to the first until someone reaches the target. Switch to 3on3 and enter each deck, and the Bey in play moves to the next one after every battle.',
        'If the real order differs, tap the button next to the right Bey to correct it. A deck with only two Beys rotates between those two. Undo also moves each player back to the Bey used in the undone battle.',
      ],
    },
    {
      heading: 'Find your strongest combo with win rates',
      body: [
        'Every finished match is saved in this browser. The table groups battles by Bey name and shows battles played, wins, losses and draws, win rate, average points per battle and which finishes won the battles. Names are matched without regard to capital letters, but it helps to always write a combo the same way, for example "DranSword 3-60F".',
        'The 95% range shows where the true win rate probably lies. Winning 7 of 10 battles is a 70% win rate, but the range runs from about 40% to 89%, so ten battles cannot tell you whether a combo is really stronger. Beys with fewer than 10 battles are marked small sample. To compare two combos, play at least 30 battles with each.',
      ],
    },
  ],
  faq: [
    {
      q: 'How many points is an Xtreme Finish in Beyblade X?',
      a: 'Three points, the most for a single battle. Over and Burst Finishes are 2 points each and a Spin Finish is 1 point. The first player to 4 points wins under the standard rules.',
    },
    {
      q: 'Will I lose the score if I refresh the page?',
      a: 'No. The score, player names and decks are saved in this browser, so the match continues where you left off.',
    },
    {
      q: 'Do unfinished matches count toward win rates?',
      a: 'No. Battles are saved only when a player reaches the target and the match ends. Battles cleared with Reset are not recorded.',
    },
    {
      q: 'Can I export my battle history?',
      a: 'Yes. Export CSV downloads every battle with the date, players, Beys, winner, finish and points, ready for Excel or Google Sheets. Nothing is uploaded to a server.',
    },
    {
      q: 'Can I use it full screen during a match?',
      a: 'Yes. Tap Full screen to show only the scores and finish buttons, with bigger buttons that are easy to tap next to the stadium. The screen also stays on while you score. Safari on iPhone does not allow web pages to go full screen, so there the scoreboard fills the screen instead.',
    },
    {
      q: 'Is this an official Beyblade tool?',
      a: 'No. It is an unofficial fan-made tool and is not affiliated with TAKARA TOMY or Hasbro. Scoring follows the standard official rules; check your event rules before you play.',
    },
  ],
  related: ['random-picker', 'spin-wheel', 'stopwatch', 'countdown-timer'],
  priority: 40,
  updated: '2026-10-30',
});

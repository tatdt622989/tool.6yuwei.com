import { defineTool } from '../types';

export default defineTool({
  slug: 'bingo',
  name: 'Bingo Caller',
  seoTitle: 'Bingo Caller: Free Online Number Caller with Printable Cards',
  description:
    'Free online bingo caller for 75-ball, 90-ball or any range. Call random numbers on a big screen with sound and voice, then print numbered bingo cards. No sign-up.',
  category: 'generator',
  icon: 'Grid3x3',
  keywords: [
    'bingo caller',
    'bingo number generator',
    'online bingo caller',
    'bingo number caller',
    'virtual bingo caller',
    'bingo card generator',
    'printable bingo cards',
    'bingo caller 1-75',
    'bingo caller 1-90',
    'free bingo caller',
  ],
  intro:
    'Call bingo numbers one at a time with no repeats, on your phone or full screen on a projector. You can also generate numbered bingo cards and print them.',
  howTo: [
    'Under “Number range”, pick 1–25, 1–50, 1–75 or 1–90, or choose “Custom” and enter the highest number.',
    'Press “Call next number”. The ball shows the call and the board marks every number called so far. Press “Full screen” when you are presenting.',
    'For cards, open “Make and print bingo cards”, set the number of cards and the grid, press “Generate cards”, then “Print” to print them or save a PDF.',
    'When someone shouts bingo, open “Someone shouted bingo? Check their card” and enter the number from the corner of their card to see their completed lines.',
  ],
  sections: [
    {
      heading: 'How to run a bingo game with this caller',
      body: [
        'Standard American bingo uses 75 balls and a 5×5 card with a free space in the middle. Each column has its own range: B is 1–15, I is 16–30, N is 31–45, G is 46–60 and O is 61–75. That is why the call is “B-12” and not just “12”: players only need to look down one column. With the 1–75 range, this caller shows the letter on the ball and reads it aloud if “Read aloud” is on.',
        'Before you start, agree on what wins. A single line (across, down or diagonal) is the classic game. Four corners, two lines, an X or a full-card blackout make a round last longer. Also decide how to split a prize when two people call bingo on the same number.',
        'The 1–90 range calls the numbers of the UK game. Note that the cards made here are square grids, not the 9×3 tickets used in British bingo halls, so use your own tickets if you need that format.',
      ],
    },
    {
      heading: 'How many calls until someone gets bingo?',
      body: [
        'It depends mostly on how many cards are in play. We simulated 20,000 games of 75-ball bingo for each group size, with one line needed to win. A single card needs about 41 calls on average. With 10 cards the first bingo comes after about 26 calls, with 30 cards about 20, with 50 cards about 19, and with 100 cards about 16.',
        'So for a classroom or an office party of 30, expect the first winner somewhere between the 14th and the 27th number. If you have several prizes, keep calling after the first bingo and let the next winners claim the rest.',
      ],
    },
    {
      heading: 'Is the draw fair, and what if I close the page?',
      body: [
        'Each call is picked from the numbers that have not come up yet using crypto.getRandomValues(), the browser’s cryptographic random source, so every remaining number has the same chance. The number is fixed the moment you press the button; the spinning digits are only an animation.',
        'Called numbers are stored in your browser on this device. If you refresh or close the tab by accident, the game picks up where it stopped. “Undo last call” takes back a mistaken press. Nothing is uploaded: the tool has no server, so your game and your cards stay on your device.',
      ],
    },
    {
      heading: 'Printing cards and checking a winner',
      body: [
        'Cards are generated for the range you chose, no two alike, each with a number in the corner. Choose a 3×3, 4×4 or 5×5 grid and print 1, 2, 4 or 6 cards per page. In the print dialog you can pick a printer or “Save as PDF” to email the cards to remote players.',
        'When someone calls bingo, you do not have to read their card back number by number. Enter the card number in the check box and the caller shows that card with the called squares filled in and the number of completed lines. Checking only works for the set of cards last generated on this device, so do not press “Generate cards” again after you have handed the cards out.',
      ],
    },
  ],
  faq: [
    {
      q: 'Does the bingo caller repeat numbers?',
      a: 'No. Each call comes from the numbers that have not been called yet. When every number is out, the button turns off.',
    },
    {
      q: 'Can I use it on a TV or projector?',
      a: 'Yes. Press “Full screen” and the ball and the board scale up to fill the display. In full screen you can also press the space bar or Enter to call the next number. iPhone browsers do not support full screen, so use a laptop or tablet for presenting.',
    },
    {
      q: 'Can I play 90-ball or a custom range?',
      a: 'Yes. Pick 1–90, or choose “Custom” and enter any highest number from 9 to 200. Once a game has started, press “Start over” before changing the range.',
    },
    {
      q: 'Will it call the numbers out loud?',
      a: 'Turn on “Read aloud” and your device’s built-in voice reads each call, with the letter in the 75-ball game. The voice comes from your device, so it sounds different on different phones and computers.',
    },
    {
      q: 'Can I save the bingo cards as a PDF?',
      a: 'Yes. Press “Print” and choose “Save as PDF” as the destination in the print dialog.',
    },
    {
      q: 'Can remote players join over Zoom?',
      a: 'Share your screen with the caller in full screen and send the cards as a PDF beforehand. Each player marks their own printed card; winners tell you their card number so you can check it.',
    },
  ],
  related: ['prize-draw', 'random-picker', 'spin-wheel', 'gift-exchange', 'random-number', 'ichiban-kuji'],
  priority: 82,
  updated: '2026-11-10',
});

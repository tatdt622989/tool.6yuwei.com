import { defineTool } from '../types';

export default defineTool({
  slug: 'prize-draw',
  name: 'Raffle Generator',
  seoTitle: 'Raffle Generator: Big-Screen Prize Draw for Office Parties',
  description:
    'Free raffle generator for office parties. Paste names and prizes, then run a big-screen prize draw with door prizes, redraws for no-shows and a CSV winner list.',
  category: 'generator',
  icon: 'Trophy',
  keywords: [
    'raffle generator',
    'prize draw generator',
    'door prize generator',
    'random raffle picker',
    'raffle winner picker',
    'office party raffle',
    'holiday party prize draw',
    'online raffle drawing',
  ],
  intro:
    'Paste your guest list and prizes, put the page on the big screen and draw winners one prize at a time. The lists and the winners stay in your browser.',
  howTo: [
    'Paste names under “Participants (one per line)” and list the prizes under “Prizes (one per line)”, with the number of winners at the end, like “Wireless earbuds x2”. “Use sample lists” fills both so you can try it first.',
    'Leave “Each person can win only once” checked if nobody should take home two prizes, then press “Start the draw”. On a projector or TV, press “Full screen”.',
    'Pick the prize to draw (the last one on your list is selected first), choose “One at a time” or “All at once”, and press “Draw”. Space and Enter work too.',
    'If a winner has already left, press “Redraw” under their name and confirm. Open “Add a bonus prize” for last-minute extras, then use “Copy results” or “Download CSV” to keep the winner list.',
  ],
  sections: [
    {
      heading: 'How to run a fair raffle draw',
      body: [
        'Nothing sinks a holiday party raffle faster than the feeling that it was rigged. This raffle generator takes its random numbers from crypto.getRandomValues(), the browser’s cryptographic generator, which is far harder to predict than the Math.random() most scripts use. When a number is turned into a position on your list, values that would tilt the odds are thrown away and drawn again, so every name has exactly the same chance. There are no weights and no way to pick a winner by hand.',
        'The winner is decided the moment the host presses “Draw” and is saved right away. The names rolling on screen are only for show, and reloading the page mid-animation doesn’t change who won. Put the page on the projector and press the button where everyone can see it. If two coworkers share a name, add a team or last initial, like “Alex J. (Sales)”. A name pasted twice by mistake is skipped as long as “Ignore duplicate names” stays checked.',
      ],
    },
    {
      heading: 'What order to draw the prizes in',
      body: [
        'Most parties start with the small prizes and finish with the grand prize, so the room stays until the end. List the top prize first: the draw screen opens on the last prize on your list, and once a prize is finished the button changes to “Next prize” and moves one step up. You can also click any prize at the top of the screen to draw it out of order.',
        'For a stack of identical door prizes, “All at once” reveals every winner in one go. For the big ones, “One at a time” lets the names roll before each reveal, and the last winner of every prize gets a longer fanfare. Door prizes are meant for the people who showed up, so paste the check-in list, not the invite list. If the boss adds something on the spot, open “Add a bonus prize” under the winner list, type a name and the number of winners, and it’s ready to draw.',
      ],
    },
    {
      heading: 'When a winner isn’t in the room',
      body: [
        'Sooner or later the name on the screen belongs to someone who left an hour ago. Settle the rule before the first draw and say it out loud: “must be present to win” is the usual one, though some teams let a coworker collect the prize instead.',
        'If the prize is forfeited, press “Redraw” under the winner’s name. The button changes to “Confirm redraw?”, and a second press draws a replacement from the people who can still win. The original winner is marked absent and stays out of every later draw, and both the winner list and the CSV keep a record of it. If nobody is left to take the prize, the page says so and the original result stays as it was.',
      ],
    },
    {
      heading: 'Where your lists are kept',
      body: [
        'The participant list, the prizes and the winners are stored only in this browser on this device. Nothing is uploaded, and there are no accounts and no database behind the page. Even the sound effects are generated in the browser, so no audio files are downloaded. The site’s source code is public on GitHub if you want to check.',
        'Because the draw is saved in the browser, closing the tab or reloading by accident isn’t a disaster: open the page again in the same browser on the same computer and it picks up where it stopped. On a shared computer, press “Start over” after the party to clear the winners, then empty the two list boxes.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is the raffle generator really random?',
      a: 'Yes. Winners come from the browser’s cryptographic random generator, every name has the same chance, and there is no setting for weights or hand-picked winners.',
    },
    {
      q: 'Can the same person win twice?',
      a: 'Not by default. With “Each person can win only once” checked, a winner is left out of every later draw. Uncheck it and a person can win several different prizes, but never the same prize twice.',
    },
    {
      q: 'How do I draw door prizes?',
      a: 'A door prize goes to someone who came to the event, with no ticket to buy. Paste the list of people who checked in, add each prize with its number of winners, and draw them one at a time or all at once.',
    },
    {
      q: 'Can I use it with numbered raffle tickets?',
      a: 'Yes. Enter the ticket numbers instead of names, one per line, and the winning numbers are drawn the same way. If people pay for tickets, check your state’s raffle rules first, since many states only allow nonprofit organizations to run paid raffles.',
    },
    {
      q: 'What happens if I close the tab in the middle of the draw?',
      a: 'Open the page again in the same browser on the same device and the draw resumes with every winner intact. A private or incognito window forgets everything when it closes, so use a normal window for the real thing.',
    },
    {
      q: 'Can I export the list of winners?',
      a: 'Yes. “Copy results” copies plain text for an email or chat, and “Download CSV” saves a file with the prize, number, name and status of every winner that opens in Excel or Google Sheets.',
    },
  ],
  related: ['bingo', 'random-picker', 'spin-wheel', 'gift-exchange', 'ichiban-kuji', 'scratch-card'],
  priority: 80,
  updated: '2026-11-10',
});

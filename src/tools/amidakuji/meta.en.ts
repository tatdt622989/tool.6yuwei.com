import { defineTool } from '../types';

export default defineTool({
  slug: 'amidakuji',
  name: 'Amidakuji (Ladder Lottery)',
  seoTitle: 'Amidakuji Online: Free Ladder Lottery Generator (Ghost Leg)',
  description:
    'Free amidakuji online: a ladder lottery (ghost leg) generator for 2 to 20 names. Tap a name to trace its path, then share the same ladder with a link.',
  category: 'party',
  icon: 'Waypoints',
  keywords: [
    'amidakuji',
    'amidakuji online',
    'amidakuji generator',
    'ladder lottery',
    'ladder lottery generator',
    'ghost leg',
    'ghost leg generator',
    'ladder game online',
  ],
  intro:
    'Enter the names and what you are drawing for, and get a random amidakuji ladder. The rungs stay covered until you start; tap a name to trace its path, or send the same ladder to the group as a link.',
  howTo: [
    'Type one name per line under "Players". The ladder takes 2 to 20 people. Press "Fill in a sample" to try it first.',
    'Under "What you are drawing for", pick "One winner", "Several winners", "Order" or "Custom". You can change what the winner and everyone else get, for example "Buys coffee" and "Free coffee".',
    'Press "Build the ladder". The rungs are covered at this point. Tap a name at the top and its path runs down the ladder in its own color, or press "Reveal all" to show every path at once.',
    'Use "Copy results" to paste the outcome into a chat, or "Copy link" to send everyone the same ladder. Press "Full screen" when you are showing it on a projector or TV.',
  ],
  sections: [
    {
      heading: 'How amidakuji works',
      body: [
        'Amidakuji (あみだくじ) is the Japanese name for a ladder lottery. The same game is called ghost leg in Chinese-speaking regions and sadari tagi, "ladder climbing", in Korea. Each player picks a vertical line and follows it from the top. Every time the path meets a rung it must cross to the neighboring line, then carry on down. Whatever sits at the bottom of the line you end on is yours.',
        'A rung does one thing: it swaps the two players on the lines it joins. That is why a ladder can never send two players to the same place or leave an outcome unclaimed, however the rungs are drawn. In this tool two rungs never meet on the same line at the same height, so there is only ever one way to go.',
      ],
    },
    {
      heading: 'Is a ladder lottery fair?',
      body: [
        'Rungs alone do not make a fair draw. With only a few rungs, each player tends to end up close to where they started. We simulated 200,000 ladders for 8 players using the rung pattern this tool draws (2 to 4 random rungs between each pair of neighboring lines). The leftmost player came back to the leftmost spot about 37% of the time and reached the rightmost spot less than 1% of the time. An even draw would give 12.5% for every spot.',
        'So this tool does one more thing: before it draws any rungs, it shuffles the outcomes along the bottom with a Fisher–Yates shuffle and rejection sampling, which avoids modulo bias. After that, the shape of the ladder no longer matters. Every name has the same chance at every outcome, so with 6 players and one winner each player has a 1 in 6 chance. In the same simulation, every player got every outcome between 12.2% and 12.8% of the time.',
        'The randomness comes from crypto.getRandomValues() in your browser, which produces a 128-bit seed. The position of each outcome and every rung are computed from that seed, and there is no setting that picks a winner. Keep in mind that the whole ladder is decided the moment you press "Build the ladder". Covering the rungs only stops people from tracing the paths early; who goes first, or how often a path is replayed, changes nothing.',
      ],
    },
    {
      heading: 'Ways to use it',
      body: [
        'At the office: decide who buys the coffee, who takes notes or who presents first. Put the question in the title, such as "Who buys the coffee?", so the link makes sense when it lands in the group chat. At home or with roommates: use "Custom" to hand out chores such as dishes, trash and vacuuming.',
        'In a classroom or at a party: use "Order" to set the order of presentations, turns or teams, and "Several winners" for a handful of small prizes. Connect a laptop to the projector and press "Full screen" so the whole room can follow each path. For a raffle with more than 20 people, the Raffle Generator on this site is a better fit.',
        'On a phone, a ladder with many players is wider than the screen. Swipe sideways on the ladder to see everyone; when you tap a name, the view follows the path.',
      ],
    },
    {
      heading: 'What the link contains and where your data stays',
      body: [
        'The address you get from "Copy link" carries the names, the outcomes and the seed after the "#" sign. Anyone who opens it gets exactly the same rungs and results, covered at first, and can tap the names to trace the paths. Browsers do not send the part after "#" to the server, and this page removes it from the address bar as soon as it has read it.',
        'Anyone with the link can press "Reveal all" and see every name and result, so send it only to the people who should see it. If you want the group to know the ladder was not redrawn, send the link first and reveal the paths together.',
        'Your lists and the current ladder are stored only in this browser on this device. Nothing is uploaded, and the site has no accounts or database. Reload the page or come back later and the same ladder is still there. On a shared computer, press "Edit the lists" when you are done and clear the fields.',
      ],
    },
  ],
  faq: [
    {
      q: 'How many players can an amidakuji ladder have?',
      a: 'From 2 to 20. Beyond 20 the lines get too tight to read on a phone. For bigger groups, use the Random Name Picker or the Raffle Generator on this site.',
    },
    {
      q: 'Does every line have the same chance of winning?',
      a: 'Yes. The outcomes are shuffled along the bottom before the rungs are drawn, so every line has the same chance at every outcome. With 5 players and one winner, each player has a 20% chance.',
    },
    {
      q: 'Is ghost leg the same thing as amidakuji?',
      a: 'Yes. Ghost leg is the English rendering of the Chinese name, amidakuji is the Japanese name, and ladder lottery or ladder game describes how it looks. The rules are the same.',
    },
    {
      q: 'Can the result be rigged?',
      a: 'There is no way to choose a result; it comes from the cryptographic random generator in your browser. The host can press "New ladder" to draw again, so build the ladder in front of the group, or send the link before revealing anything.',
    },
    {
      q: 'Can I add my own rungs?',
      a: 'No. The rungs are drawn at random. Because the outcomes are already shuffled along the bottom, extra rungs would not make the draw any fairer.',
    },
    {
      q: 'Why is there no "Full screen" button on my phone?',
      a: 'The button only appears when the browser can show part of a page in full screen. Some phone browsers cannot, Safari on iPhone for example. Use a computer, an Android phone or an iPad for projecting.',
    },
  ],
  related: ['random-picker', 'spin-wheel', 'prize-draw', 'gift-exchange', 'bingo', 'seating-chart', 'lucky-red-envelope'],
  priority: 80,
  updated: '2026-11-25',
});

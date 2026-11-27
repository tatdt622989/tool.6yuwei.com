import { defineTool } from '../types';

export default defineTool({
  slug: 'cps-test',
  name: 'CPS Test',
  seoTitle: 'CPS Test: Click Speed Test in 1, 5, 10, 30 or 60 Seconds',
  description:
    'Free CPS test that measures how many clicks per second you can make. Pick 1, 5, 10, 30 or 60 seconds, see live CPS, get a rank and save your best click speed.',
  category: 'test',
  icon: 'MousePointerClick',
  keywords: [
    'cps test',
    'click speed test',
    'clicks per second test',
    'cps checker',
    'cps tester',
    'click test',
    'mouse click speed test',
    'click counter',
    '5 second cps test',
    '10 second cps test',
    'jitter click test',
    'butterfly click test',
    'drag click test',
    'minecraft cps test',
    'kohi click test',
    'average cps',
  ],
  intro:
    'Click the big pad below as fast as you can to measure your clicks per second. Choose a 1 to 60 second test, then see your rank, a per-second chart and your personal bests for each mode.',
  howTo: [
    'Pick a test length at the top: 1, 5, 10, 30 or 60 seconds. The 5 and 10 second tests are the most common for comparing scores.',
    'Click the “Click here to start” pad with your left mouse button or a finger. The timer starts on your first click. To use the keyboard, click the pad once and then tap the Space bar.',
    'Seconds left, clicks and live CPS update while you click, and the test stops on its own when time runs out.',
    'The result card shows your CPS, your rank and a clicks-per-second bar chart. Wait about a second, then click the pad to go again, or press “Restart” at any time.',
  ],
  sections: [
    {
      heading: 'How CPS is calculated',
      body: [
        'CPS stands for clicks per second. The formula is simple: total clicks divided by the length of the test in seconds. Thirty-five clicks in a 5-second test is 35 ÷ 5 = 7 CPS, and 82 clicks in a 10-second test is 8.2 CPS.',
        'The clock starts on your first click and stops exactly at the chosen length; clicks after that don’t count. Live CPS divides your clicks by the time elapsed so far (the first second counts as a full second so the number doesn’t spike), and the final score always uses the full test length, so every run is directly comparable.',
      ],
    },
    {
      heading: 'What is a good CPS? Average scores and ranks',
      body: [
        'Most people clicking normally with one finger land between 5 and 7 CPS. Regular gamers often hold 8 to 10, jitter clickers reach 10 to 14, butterfly clickers usually score 15 to 25, and drag clicking on a suitable mouse can go past 30.',
        'This test uses eight ranks: Sloth (under 3), Turtle (3 to 5), Rabbit (5 to 7), Cheetah (7 to 9), Falcon (9 to 11), Lightning (11 to 14), Supersonic (14 to 20) and Autoclicker (20 and up). Longer tests produce lower scores because your hand tires, so compare a 10-second score with other 10-second scores. The per-second chart shows exactly when you started to slow down.',
      ],
    },
    {
      heading: 'Jitter clicking vs. butterfly clicking vs. drag clicking',
      body: [
        'Jitter clicking tenses the muscles in your wrist and forearm so they vibrate and drive one finger very quickly. It can reach 10 to 14 CPS but is tiring and tends to shake the cursor. Butterfly clicking alternates your index and middle fingers on the same button, roughly doubling your rate to 15 to 25 CPS; some mouse switches even register one press as two.',
        'Drag clicking slides a finger along the button so friction makes it bounce and fire a rapid burst of clicks. It needs a mouse with a slightly grippy surface and can exceed 30 CPS. All three are common in Minecraft PvP and bridging, but heavy clicking wears out mouse switches faster and can strain your wrist, so take breaks.',
      ],
    },
    {
      heading: 'CPS in Minecraft and how to click faster',
      body: [
        'In Minecraft 1.8 PvP there is no attack cooldown, so higher CPS means more hits and better combos, which is why players compare CPS at all. Since 1.9 an attack cooldown punishes spam clicking, but techniques like bridging still reward fast clicks. Many servers’ anti-cheat plugins flag very high or perfectly regular click patterns as an autoclicker, so check the rules before you rely on butterfly or drag clicking.',
        'To improve, stick to the 5 or 10 second test and try different grips until you find one that takes the least effort. Rest your wrist on the desk, click with your fingertip near the front of the button, warm up first and rest between runs. Pair it with the reaction time test if you also want to train your reflexes.',
      ],
    },
  ],
  faq: [
    {
      q: 'What is the average CPS?',
      a: 'Around 5 to 7 CPS for normal one-finger clicking. Gamers often get 8 to 10, jitter clickers 10 to 14 and butterfly clickers 15 to 25.',
    },
    {
      q: 'Which CPS test length is most accurate?',
      a: 'The 5 and 10 second tests are the usual benchmarks. The 1 second test is noisy because one extra click changes the score by a full CPS, while the 30 and 60 second tests also measure endurance and give lower numbers.',
    },
    {
      q: 'Is 10 CPS good?',
      a: 'Yes. 10 CPS is clearly above average and typical of experienced gamers. Holding it for 10 seconds or more usually takes jitter clicking or a lot of practice.',
    },
    {
      q: 'Can I take the CPS test on a phone or touchpad?',
      a: 'Yes. On a phone, tap the pad with your finger; double-tap zoom is disabled so it won’t interfere. Tap-to-click on a touchpad can lag, so pressing the touchpad down gives more accurate results.',
    },
    {
      q: 'Will butterfly clicking get me banned?',
      a: 'It is a manual technique, but some servers’ anti-cheat systems may still flag very high or very regular clicking. Check the server or tournament rules first.',
    },
    {
      q: 'Are my scores uploaded anywhere?',
      a: 'No. The test runs entirely in your browser and your best scores are saved only on this device. Press “Clear scores” to delete them.',
    },
  ],
  related: ['reaction-test', 'typing-test', 'keyboard-tester', 'stopwatch'],
  priority: 72,
  updated: '2026-10-29',
});

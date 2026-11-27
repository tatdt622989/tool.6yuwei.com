import { defineTool } from '../types';

export default defineTool({
  slug: 'keyboard-tester',
  name: 'Keyboard Tester',
  seoTitle: 'Keyboard Tester: Test Every Key and N-Key Rollover Online',
  description:
    'Free online keyboard tester with a full US layout. Press keys to find dead or stuck keys, check ghosting and n-key rollover, and see event.key and event.code.',
  category: 'test',
  icon: 'Command',
  keywords: [
    'keyboard tester',
    'keyboard test',
    'key tester',
    'online keyboard tester',
    'keyboard checker',
    'test keyboard keys',
    'keyboard ghosting test',
    'n key rollover test',
    'nkro test',
    'laptop keyboard test',
    'mechanical keyboard tester',
    'keyboard not working test',
    'keycode checker',
  ],
  intro:
    'Press any key and watch it light up on a full-size US keyboard. Find keys that don’t register, keys that stick, and how many keys your keyboard can detect at once.',
  howTo: [
    'Click the keyboard diagram so it has focus (the “Click here, then start pressing keys” overlay disappears).',
    'Press each key once. Keys turn orange while held and stay green once tested; “Keys tested” counts your progress.',
    'Hold several keys together, such as A, S, D, F plus J, K, L, to measure the “Max at once” rollover.',
    'Untick “Show numpad” for a laptop or tenkeyless keyboard, and use “Reset” to start over.',
  ],
  sections: [
    {
      heading: 'How to find a dead or sticky key',
      body: [
        'Work through the keyboard row by row. A key that never turns green is not reaching the computer at all: try it in another app, then on another computer. If it fails everywhere, the switch, the membrane or the cable is at fault; if it only fails on one computer, look at drivers, remapping software such as PowerToys Keyboard Manager or Karabiner-Elements, or an accessibility setting like Filter Keys.',
        'A key that stays orange after you let go is physically sticking or bouncing. On laptops this is often crumbs under the keycap; on mechanical keyboards a quick blast of compressed air or reseating a hot-swap switch usually fixes it. Chatter, where one press types a letter twice, shows up as the “Key presses” counter jumping by two.',
      ],
    },
    {
      heading: 'Ghosting, key blocking and n-key rollover',
      body: [
        'Cheap and laptop keyboards share electrical lines between keys, so some combinations of three or more keys can’t all be detected. When the board blocks a key, it simply doesn’t light up here even though you are pressing it. Gamers notice this as a jump that won’t fire while running diagonally (W + A + Space).',
        'Rollover is the number of keys a keyboard can report at once. Standard USB boot protocol carries 6 keys plus modifiers (6KRO); many gaming and mechanical keyboards advertise n-key rollover (NKRO), meaning every key can be held together. If “Max at once” climbs past 6 here, your keyboard is running in NKRO mode.',
      ],
    },
    {
      heading: 'event.key, event.code and keyCode explained',
      body: [
        'event.key is the character or action the key produces with your current layout and modifiers, for example “a”, “A” or “Enter”. event.code names the physical key position on a US keyboard, such as KeyA, so it stays the same on AZERTY or Dvorak layouts. keyCode is the older numeric code that many legacy scripts still read.',
        'Developers can use this page as a quick keycode checker when wiring up shortcuts or games: press the key and copy the exact code string from the panel under the diagram.',
      ],
    },
    {
      heading: 'Keys that a browser can’t see',
      body: [
        'Fn, and many brightness, volume and media keys, are handled by the keyboard firmware or the operating system and never generate a browser event, so they won’t appear even on a perfectly working keyboard. PrintScreen on Windows often sends only a key-up event; this tester still counts it. Shortcuts that use Ctrl or Command are passed through to the browser so you can always switch tabs or close the page.',
      ],
    },
  ],
  faq: [
    {
      q: 'Why does one key not light up?',
      a: 'Click the diagram first so it has focus. If the key still doesn’t register, test it in a text editor and on another computer. A key that fails everywhere is a hardware fault; one that only fails on this machine usually points to remapping software, a driver or Filter Keys.',
    },
    {
      q: 'Does this work with Mac keyboards?',
      a: 'Yes. On a Mac the modifier keys are labeled Control, Option and Cmd, and Delete and Return replace Backspace and Enter. Keys released while Command is held don’t send a key-up on macOS, so the tester releases everything when Command goes up.',
    },
    {
      q: 'How do I test n-key rollover?',
      a: 'Hold down as many keys as you can, for example with all fingers on A, S, D, F and J, K, L, ;. The “Max at once” number shows the most keys detected together. Above 6 means NKRO is active; some keyboards need a key combination or a USB port setting to switch it on.',
    },
    {
      q: 'Can I test a laptop keyboard?',
      a: 'Yes. Untick “Show numpad” to get a tenkeyless layout that matches most laptops. Keys that only exist with Fn, like Home or Page Up on compact laptops, will light up as long as the laptop sends the standard key code.',
    },
    {
      q: 'Why does my keyboard type the wrong characters?',
      a: 'If event.code is correct but event.key is wrong, the hardware is fine and the operating system is using a different input language or layout, such as UK instead of US. Change it under Settings > Time & language > Language & region on Windows, or System Settings > Keyboard > Input Sources on a Mac.',
    },
    {
      q: 'Is anything I type recorded?',
      a: 'No. Key events are handled in your browser only and nothing is sent to a server. Only the “Show numpad” preference is remembered on your device.',
    },
  ],
  related: ['typing-test', 'cps-test', 'screen-test', 'reaction-test'],
  priority: 70,
  updated: '2026-10-29',
});

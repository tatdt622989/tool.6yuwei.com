import { defineTool } from '../types';

export default defineTool({
  slug: 'password-generator',
  name: 'Password Generator',
  seoTitle: 'Password Generator: Create Strong, Random Passwords Online',
  description:
    'Free strong password generator. Create secure random passwords with your choice of length, letters, numbers and symbols. Generated in your browser and never sent.',
  category: 'generator',
  icon: 'KeyRound',
  keywords: [
    'password generator',
    'strong password generator',
    'random password generator',
    'secure password generator',
    'generate password',
    'password creator',
    '16 character password generator',
  ],
  intro:
    'Create a strong, random password in one click. Pick the length and character types and see how strong it is instantly. Passwords are generated on your device only.',
  howTo: [
    'Drag the slider to set the length. Use at least 12 characters, and 16 or more for important accounts.',
    'Choose which character types to include. If you need to type or read the password out, tick “Exclude look-alikes”.',
    'Click “Copy” to use the password, or “Regenerate” for a new one. Use “Generate 10” when you need several.',
  ],
  sections: [
    {
      heading: 'What makes a password strong?',
      body: [
        'Strength comes mainly from length and randomness. A random 16-character password using upper and lowercase letters, numbers and symbols has more than 10^30 possible combinations, far beyond what brute-force attacks can try. Passwords built from names, dates or common words with a number on the end, on the other hand, fall to dictionary attacks in seconds.',
        'NIST’s digital identity guidelines (SP 800-63B) put length first: they recommend allowing long passwords, checking new ones against lists of breached passwords, and no longer forcing regular password changes or arbitrary complexity rules.',
      ],
    },
    {
      heading: 'Password strength and entropy',
      body: [
        'This tool measures strength as entropy: length × log2(number of possible characters). Under 45 bits is weak, 45 to 70 bits is fair, 70 to 100 bits is strong, and over 100 bits is very strong. Adding length raises entropy faster than adding symbols, so when a site rejects symbols, make the password a few characters longer instead.',
      ],
    },
    {
      heading: 'Is this password generator safe?',
      body: [
        'Passwords are created with your browser’s built-in crypto.getRandomValues(), a cryptographically secure random source provided by the operating system, and rejection sampling is used to avoid modulo bias. Everything happens on your device: no password is sent over the network or logged.',
        'The safest habit is to use a different password for every site and store them in a password manager, so a leak at one service can’t be used to break into your other accounts. Turn on two-factor authentication wherever it is offered.',
      ],
    },
  ],
  faq: [
    {
      q: 'How long should my password be?',
      a: 'At least 12 characters for everyday accounts, and 16 or more for email, banking and your password manager. Wi-Fi passwords can easily be 20 characters or longer.',
    },
    {
      q: 'Is it safe to use an online password generator?',
      a: 'It is safe when the password is generated locally, as it is here. This page uses your browser’s cryptographic random generator and never sends the password anywhere. Only your checkbox settings are remembered on your device.',
    },
    {
      q: 'What if a website doesn’t accept symbols?',
      a: 'Untick “Symbols” and add a few characters to the length, for example 20 instead of 16, to keep the same level of strength.',
    },
    {
      q: 'What are look-alike characters?',
      a: 'Characters that are easy to confuse, such as 0 and O, or 1, l and I. Excluding them helps when you have to type a password by hand or read it to someone.',
    },
    {
      q: 'How often should I change my password?',
      a: 'Current NIST guidance says you don’t need to change a strong, unique password on a schedule. Change it right away if the service reports a breach or you suspect someone else knows it.',
    },
  ],
  related: ['word-counter', 'bmi-calculator', 'uuid-generator', 'hash-generator'],
  priority: 90,
  updated: '2026-10-29',
});

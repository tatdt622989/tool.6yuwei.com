import { defineTool } from '../types';

export default defineTool({
  slug: 'number-base-converter',
  name: 'Number Base Converter',
  seoTitle: 'Number Base Converter: Binary, Decimal, Hex and Octal Calculator',
  description:
    'Convert between binary, octal, decimal, hex and any base from 2 to 36 as you type. Free, exact for big numbers, and with a two’s complement view for 8 to 64 bits.',
  category: 'dev',
  icon: 'Binary',
  keywords: [
    'number base converter',
    'binary to decimal',
    'decimal to binary',
    'hex to decimal',
    'decimal to hex',
    'binary to hex',
    'hex to binary',
    'octal converter',
    'base converter',
    'binary converter',
    'hex converter',
    'twos complement calculator',
    'base 36 converter',
    'radix converter',
  ],
  intro:
    'Type a whole number in binary, octal, decimal, hex or any base from 2 to 36 and every other base updates instantly. Big numbers stay exact, and the two’s complement panel shows how the value is stored in 8 to 64 bits.',
  howTo: [
    'Type an integer into any field: Binary, Octal, Decimal, Hexadecimal or Custom base. Prefixes like 0x and 0b, minus signs and grouped digits are accepted.',
    'For other bases, pick one from the menu next to “Custom base (2–36)”.',
    'Use “Group digits” and “Uppercase letters” to change how results look, then click “Copy” next to the one you need.',
    'Under “Two’s complement”, pick 8-bit, 16-bit, 32-bit or 64-bit to see the stored bits and the value read as signed and unsigned.',
  ],
  sections: [
    {
      heading: 'How base conversion works',
      body: [
        'In a positional number system, each digit is worth the base raised to the power of its position. Binary 1101 is 1×8 + 1×4 + 0×2 + 1×1 = 13 in decimal. Going the other way, divide by the base repeatedly and read the remainders from last to first: 13 ÷ 2 gives remainders 1, 0, 1, 1, so 13 is 1101.',
        'Hexadecimal uses 0–9 plus A–F for 10 to 15. Because 16 is 2^4, every hex digit maps to exactly four bits: 0xFF is 1111 1111, which is 255. Octal maps to three bits per digit, so 255 is 377 in octal. That is why programmers read binary data in hex.',
      ],
    },
    {
      heading: 'Where you meet binary, hex and octal',
      body: [
        'Hex appears in web colors (#FF5733 is red 255, green 87, blue 51), memory addresses, MAC addresses, Unicode code points (U+00E9) and hash values. Binary is used for bit flags, subnet masks (255.255.255.0 is 24 ones followed by 8 zeros) and hardware registers.',
        'Octal survives mainly in Unix file permissions: chmod 755 means rwx for the owner and r-x for group and others, because 7 is 111, 5 is 101 in binary. Base 36, using all digits and letters, is popular for short IDs and URL shorteners: 1295 is ZZ in base 36.',
      ],
    },
    {
      heading: 'Two’s complement and signed integers',
      body: [
        'Computers store negative integers in two’s complement: invert every bit of the positive number and add 1. In 8 bits, 42 is 0010 1010, so -42 is 1101 0110 (0xD6). The same bits read as an unsigned number are 214, which is why mixing signed and unsigned types causes bugs.',
        'An n-bit signed integer ranges from -2^(n-1) to 2^(n-1) - 1: -128 to 127 for 8 bits and -2,147,483,648 to 2,147,483,647 for 32 bits. If a value doesn’t fit, the tool keeps only the lowest bits, which is the wraparound you get when a fixed-width integer overflows.',
      ],
    },
    {
      heading: 'Exact results for very large numbers',
      body: [
        'JavaScript numbers lose precision above 2^53 - 1 (9,007,199,254,740,991), so many online converters silently round long hex strings and 64-bit IDs. This tool uses BigInt arithmetic, so a 128-bit hash or a database ID with 20 digits converts exactly.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I convert binary to decimal?',
      a: 'Multiply each bit by its place value (1, 2, 4, 8, 16 and so on from the right) and add them up. 101101 is 32 + 8 + 4 + 1 = 45. Or type it into the Binary field above and read the Decimal field.',
    },
    {
      q: 'How do I convert decimal to hex?',
      a: 'Divide by 16 repeatedly and write the remainders backwards, using A–F for 10–15. 1000 ÷ 16 = 62 r 8, 62 ÷ 16 = 3 r 14 (E), 3 ÷ 16 = 0 r 3, so 1000 is 0x3E8.',
    },
    {
      q: 'Can I convert fractions or decimals like 0.5?',
      a: 'No, this converter handles whole numbers (integers) only, including negative and very large ones. Fractions often don’t have an exact representation in another base, for example 0.1 in binary repeats forever.',
    },
    {
      q: 'What does two’s complement mean for -1?',
      a: 'In two’s complement, -1 is all ones: 0xFF in 8 bits, 0xFFFF in 16 bits and 0xFFFFFFFF in 32 bits. Read as unsigned, those are 255, 65,535 and 4,294,967,295.',
    },
    {
      q: 'Why do some converters give the wrong answer for big hex numbers?',
      a: 'They use regular JavaScript numbers, which are only exact up to 2^53 - 1. This tool uses BigInt, so results stay exact no matter how many digits you enter.',
    },
  ],
  related: ['calculator', 'color-converter', 'base64', 'hash-generator', 'timestamp-converter'],
  priority: 55,
  updated: '2026-10-29',
});

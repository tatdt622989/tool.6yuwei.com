import { defineTool } from '../types';

export default defineTool({
  slug: 'unit-converter',
  name: 'Unit Converter',
  seoTitle: 'Unit Converter: Feet to Meters, Pounds to kg, °F to °C and More',
  description:
    'Unit converter for length, weight, temperature, area, volume, speed and data. Convert inches to cm, lbs to kg, Fahrenheit to Celsius and cups to mL instantly.',
  category: 'calc',
  icon: 'Ruler',
  keywords: [
    'unit converter',
    'measurement converter',
    'metric conversion calculator',
    'inches to cm',
    'cm to inches',
    'feet to meters',
    'lbs to kg',
    'kg to lbs',
    'fahrenheit to celsius',
    'celsius to fahrenheit',
    'cups to ml',
    'gallons to liters',
    'square feet to square meters',
    'mph to km/h',
    'gb vs gib',
  ],
  intro:
    'Convert between US customary and metric units in one place: length, weight, temperature, area, volume, speed and data. Results update as you type, with every unit listed side by side.',
  howTo: [
    'Pick a conversion type at the top, such as Length, Weight or Temperature.',
    'Type a number in Value and choose the unit you are converting from.',
    'Choose the unit you want under Result. Use the swap button to flip the two units.',
    'Check the All units table to see the same value in every unit of that type, with your target unit highlighted.',
  ],
  sections: [
    {
      heading: 'US customary vs. metric at a glance',
      body: [
        'The US is one of the few countries that still uses customary units in daily life, so recipes, road signs and product labels often need converting. The anchors are exact by definition: 1 inch = 2.54 cm, 1 foot = 30.48 cm, 1 mile = 1.609344 km, and 1 pound = 0.45359237 kg.',
        'Some quick examples: a height of 5 ft 10 in (70 inches) is 177.8 cm, a 150 lb person weighs about 68.04 kg, and a 1,000 sq ft apartment is about 92.9 m². A speed limit of 65 mph is roughly 104.6 km/h.',
      ],
    },
    {
      heading: 'Kitchen and liquid measurements',
      body: [
        'US recipes measure by volume. 1 US cup = 8 fluid ounces ≈ 236.6 mL, 1 tablespoon = 3 teaspoons ≈ 14.8 mL, and 1 teaspoon ≈ 4.9 mL. Up the scale, 2 cups = 1 pint, 2 pints = 1 quart, and 4 quarts = 1 gallon (≈ 3.785 L).',
        'British and Canadian recipes may use the imperial gallon, which is about 4.546 L, roughly 20% larger than the US gallon. If a recipe gives flour or sugar in cups, the weight depends on the ingredient, so a volume converter can only tell you the mL, not the grams.',
      ],
    },
    {
      heading: 'Fahrenheit, Celsius and Kelvin',
      body: [
        'Temperature is not a simple multiplication because the scales start at different points. To convert Fahrenheit to Celsius, subtract 32 and multiply by 5/9: 72 °F ≈ 22.2 °C, a typical room. To go the other way, multiply by 9/5 and add 32: 37 °C = 98.6 °F.',
        'Common oven temperatures: 350 °F ≈ 177 °C and 425 °F ≈ 218 °C. The two scales meet at −40, where −40 °F = −40 °C. Kelvin starts at absolute zero (−273.15 °C or −459.67 °F), so the converter rejects anything colder.',
      ],
    },
    {
      heading: 'Why a 1 TB drive shows 931 GB',
      body: [
        'Drive makers use decimal units (1 GB = 1,000,000,000 bytes), while Windows reports capacity in binary units (1 GiB = 1,073,741,824 bytes) but still labels them GB. 1 TB is 1,000,000,000,000 bytes, which is about 931.3 GiB, so nothing is missing.',
        'Internet speeds are quoted in bits, not bytes. A 500 Mbps connection moves at most 62.5 MB of data per second, because 1 byte = 8 bits.',
      ],
    },
  ],
  faq: [
    { q: 'How many centimeters are in an inch?', a: 'Exactly 2.54 cm. So 12 inches (1 foot) is 30.48 cm, and a 27-inch monitor measures about 68.6 cm diagonally.' },
    { q: 'How do I convert pounds to kilograms?', a: 'Multiply pounds by 0.45359237, or divide by about 2.2046. For example, 150 lb ≈ 68.04 kg and 200 lb ≈ 90.72 kg.' },
    { q: 'What is 100 °F in Celsius?', a: '(100 − 32) × 5/9 ≈ 37.8 °C. Choose Temperature, enter 100 and convert from Fahrenheit to Celsius.' },
    { q: 'How many mL are in a cup?', a: 'A US cup is about 236.6 mL. A metric cup used in Australia and elsewhere is 250 mL, and a Japanese cup is 200 mL.' },
    { q: 'How many square feet are in an acre?', a: 'One acre is 43,560 sq ft, about 4,046.9 m² or 0.405 hectares. A square mile is 640 acres.' },
    { q: 'Are the ton and gallon US or UK units?', a: 'Ton means the US short ton (2,000 lb) and gallon means the US gallon (about 3.785 L). The metric ton (1,000 kg) and the imperial UK gallon (about 4.546 L) are listed separately.' },
  ],
  related: ['bmi-calculator', 'percentage-calculator', 'calculator', 'exchange-rate'],
  priority: 60,
  updated: '2026-10-29',
});

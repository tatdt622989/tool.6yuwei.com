import { defineTool } from '../types';

export default defineTool({
  slug: 'uuid-generator',
  name: 'UUID Generator',
  seoTitle: 'UUID Generator: Create v4 and v7 UUIDs/GUIDs Online in Bulk',
  description:
    'Free UUID generator. Create random v4 or time-ordered v7 UUIDs (GUIDs) in bulk, with or without hyphens, and decode any UUID’s version and timestamp.',
  category: 'dev',
  icon: 'Fingerprint',
  keywords: [
    'uuid generator',
    'guid generator',
    'uuid v4 generator',
    'uuid v7 generator',
    'generate uuid',
    'random uuid',
    'online uuid generator',
    'bulk uuid generator',
    'uuid decoder',
    'uuid version check',
    'uuidv7',
    'create guid',
  ],
  intro:
    'Generate up to 100 UUIDs at once, either random version 4 or time-ordered version 7. Paste an existing UUID below to see which version it is and, for v1, v6 and v7, when it was created.',
  howTo: [
    'Choose “v4 random” for general-purpose IDs or “v7 time-ordered” for database primary keys.',
    'Set “How many” (1–100). The list regenerates automatically.',
    'Tick “Uppercase” or “No hyphens” if your system expects that format; the same IDs are reformatted, not replaced.',
    'Click “Copy all” or “Download .txt”. To inspect a UUID, paste it into “Decode a UUID”.',
  ],
  sections: [
    {
      heading: 'UUID v4 vs v7: which one should you use?',
      body: [
        'A version 4 UUID is 122 random bits. It reveals nothing about when or where it was made, which makes it the safe default for API keys, session IDs, file names and anything exposed to users.',
        'Version 7, standardized in RFC 9562 (2024), puts a 48-bit Unix timestamp in milliseconds at the front, followed by random bits. Because new IDs sort after older ones, they insert at the end of a B-tree index instead of at random positions, which keeps PostgreSQL and MySQL primary-key indexes compact and fast. The trade-off is that anyone can read the creation time from a v7 UUID.',
      ],
    },
    {
      heading: 'UUID vs GUID',
      body: [
        'They are the same thing. GUID (globally unique identifier) is Microsoft’s name, used in Windows, .NET (Guid.NewGuid()) and SQL Server (NEWID()), and is often shown in uppercase inside braces, such as {3F2504E0-4F89-41D3-9A0C-0305E82C3301}. UUID is the name used in the RFC and most other languages. Tick “Uppercase” to match the usual GUID style; the decoder accepts braces and the urn:uuid: prefix.',
      ],
    },
    {
      heading: 'Can two UUIDs collide?',
      body: [
        'In practice, no. With 122 random bits, you would need to generate about 2.7 quintillion (2.7 × 10^18) v4 UUIDs to reach a 50% chance of a single duplicate. Generating a billion per second, that would take about 86 years. Real-world duplicates come from broken random number generators or copied IDs, not from chance.',
        'This page uses crypto.randomUUID() and crypto.getRandomValues(), the browser’s cryptographically secure random source, and generates everything locally.',
      ],
    },
    {
      heading: 'Generating UUIDs in code',
      body: [
        'JavaScript: crypto.randomUUID(). Python: uuid.uuid4() (and uuid.uuid7() from Python 3.14). Java: UUID.randomUUID(). C#: Guid.NewGuid() (Guid.CreateVersion7() in .NET 9). PostgreSQL: gen_random_uuid() (uuidv7() in PostgreSQL 18). On macOS and Linux, the uuidgen command prints a v4 UUID.',
      ],
    },
  ],
  faq: [
    {
      q: 'What does a UUID look like?',
      a: 'It is 32 hexadecimal digits written in five groups as 8-4-4-4-12, for example 919108f7-52d1-4320-9bac-f847db4148a8. The first digit of the third group is the version, so this one is a v4.',
    },
    {
      q: 'Are these UUIDs truly unique?',
      a: 'They are unique for every practical purpose. v4 UUIDs contain 122 random bits from a cryptographically secure source, so the chance of a collision is negligible.',
    },
    {
      q: 'Should I use UUIDs as database primary keys?',
      a: 'Yes, but prefer v7. Random v4 keys scatter inserts across the index and cause page splits; v7 keys are time-ordered and behave much like an auto-increment integer while staying globally unique.',
    },
    {
      q: 'Can I get the creation time from a UUID?',
      a: 'Only from time-based versions: v1, v6 and v7. Paste one into the decoder to see the timestamp in your local time. v4 UUIDs contain no time information.',
    },
    {
      q: 'Is a UUID secure enough to use as a password reset token?',
      a: 'A v4 UUID from a secure generator has 122 bits of randomness, which is hard to guess. v7 UUIDs are less suitable because part of them is a predictable timestamp. For secrets, a dedicated random token is still the better choice.',
    },
    {
      q: 'Are the generated UUIDs stored anywhere?',
      a: 'No. They are created in your browser and never sent to a server. Only your format preferences are remembered on your device.',
    },
  ],
  related: ['password-generator', 'hash-generator', 'random-number', 'timestamp-converter'],
  priority: 55,
  updated: '2026-10-29',
});

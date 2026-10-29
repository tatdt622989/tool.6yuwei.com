import { defineTool } from '../types';

export default defineTool({
  slug: 'timestamp-converter',
  name: 'Unix Timestamp Converter',
  seoTitle: 'Unix Timestamp Converter: Epoch Time to Date and Back',
  description:
    'Free epoch converter. Get the current Unix timestamp, convert seconds or milliseconds to a date in your time zone, UTC and ISO 8601, or a date to a timestamp.',
  category: 'dev',
  icon: 'Clock',
  keywords: [
    'unix timestamp converter',
    'epoch converter',
    'timestamp to date',
    'epoch to date',
    'unix time converter',
    'current unix timestamp',
    'date to timestamp',
    'epoch time',
    'unix timestamp milliseconds',
    'convert timestamp to date',
    'iso 8601 converter',
    'utc timestamp',
    'posix time',
  ],
  intro:
    'Check the current Unix timestamp, or convert between epoch time and human-readable dates. Seconds and milliseconds are detected automatically, and every result is shown in your local time, UTC and ISO 8601.',
  howTo: [
    'The live clock at the top shows the current Unix timestamp in seconds and milliseconds. Click “Copy seconds” or “Copy milliseconds” to grab it.',
    'Under “Timestamp to date”, paste a timestamp. “Auto-detect” works out whether it is in seconds or milliseconds, or you can pick the unit yourself.',
    'Read the result as a local date, local time, UTC, ISO 8601 and relative time. Each row has its own “Copy” button.',
    'Under “Date to timestamp”, pick a date and time and say whether it is in your local time or UTC to get the timestamp in seconds and milliseconds.',
  ],
  sections: [
    {
      heading: 'What is a Unix timestamp?',
      body: [
        'A Unix timestamp, also called epoch time or POSIX time, is the number of seconds that have passed since 00:00:00 UTC on January 1, 1970. It does not depend on time zones: the same instant has the same timestamp in New York, London and Tokyo, and only the local wall-clock time differs. That makes it a convenient way to store and exchange times in databases, logs and APIs.',
        'Unix time ignores leap seconds, so every day is exactly 86,400 seconds. Dates before 1970 are negative: -86400 is 00:00:00 UTC on December 31, 1969. Some useful landmarks: 946684800 is January 1, 2000, 1000000000 was September 9, 2001, and 1793232000 is October 29, 2026 at midnight UTC.',
      ],
    },
    {
      heading: 'Seconds or milliseconds?',
      body: [
        'Most back-end languages and databases count seconds: PHP’s time(), Python’s time.time(), MySQL’s UNIX_TIMESTAMP() and the shell command date +%s. Today that is a 10-digit number. JavaScript’s Date.now() and Java’s System.currentTimeMillis() count milliseconds, which is 13 digits.',
        'Mixing them up is the most common bug. Read milliseconds as seconds and you land tens of thousands of years in the future; read seconds as milliseconds and you get a date in January 1970. This converter treats values below 10^11 as seconds, then milliseconds, microseconds and nanoseconds by size. If your value sits on a boundary, choose the unit manually.',
      ],
    },
    {
      heading: 'Time zones, daylight saving time and ISO 8601',
      body: [
        'ISO 8601 is the international date format used by most APIs, for example 2026-10-29T09:30:00-04:00. The T separates date and time, and the suffix is the offset from UTC; a trailing Z means UTC itself. JavaScript’s toISOString() always returns UTC with a Z.',
        'Offsets change with daylight saving time. In 2026, US clocks spring forward on March 8 and fall back on November 1, so New York is UTC-4 (EDT) in summer and UTC-5 (EST) in winter. The UK switches between GMT and BST on March 29 and October 25. This converter applies the offset that was in force at that instant. For a time skipped by the spring-forward jump it moves forward, and for a time that occurs twice in the fall it picks the earlier one.',
      ],
    },
    {
      heading: 'Getting the current timestamp in code',
      body: [
        'JavaScript: Math.floor(Date.now() / 1000). Python: int(time.time()). PHP: time(). Go: time.Now().Unix(). Java: Instant.now().getEpochSecond(). SQL (PostgreSQL): EXTRACT(EPOCH FROM now()). Bash on Linux or macOS: date +%s.',
        'To go the other way: new Date(ts * 1000) in JavaScript, datetime.fromtimestamp(ts, tz=timezone.utc) in Python, and date -d @ts on GNU/Linux (date -r ts on macOS).',
      ],
    },
  ],
  faq: [
    {
      q: 'What is the Year 2038 problem?',
      a: 'Older systems store Unix time as a signed 32-bit integer. Its maximum, 2147483647, is 03:14:07 UTC on January 19, 2038; one second later it overflows to a negative number and the date jumps back to 1901. Modern systems use 64-bit time, but old embedded devices, file formats and database columns can still be affected.',
    },
    {
      q: 'Why is my converted time off by several hours?',
      a: 'Usually a UTC time is being read as local time or the other way round. A timestamp has no time zone of its own, so check whether you are looking at the local time row or the UTC row, and when converting a date to a timestamp, choose the time zone the date was written in.',
    },
    {
      q: 'Is epoch time the same everywhere in the world?',
      a: 'Yes. At any given moment the Unix timestamp is identical in every time zone. Only the conversion to a local date and time depends on where you are.',
    },
    {
      q: 'How do I tell if a timestamp is in seconds or milliseconds?',
      a: 'Count the digits. For current dates, seconds have 10 digits (for example 1761717600) and milliseconds have 13 (1761717600000). Microseconds have 16 and nanoseconds 19.',
    },
    {
      q: 'Does Unix time include leap seconds?',
      a: 'No. Unix time pretends every day has exactly 86,400 seconds, so it does not count leap seconds. That keeps date arithmetic simple at the cost of being a second or so off from atomic time at a leap second.',
    },
    {
      q: 'Does this tool get the time from a server?',
      a: 'No. The current timestamp comes from your device’s clock and all conversions happen in your browser. If the live clock looks wrong, sync your computer’s clock.',
    },
  ],
  related: ['timezone-converter', 'date-diff', 'jwt-decoder', 'countdown-timer'],
  priority: 60,
  updated: '2026-10-29',
});
